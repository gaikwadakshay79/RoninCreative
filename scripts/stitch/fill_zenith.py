"""Fill the unphotographed sky at the top of an equirectangular panorama.

The top of the sphere is reprojected to a top-down square (an 'up' cube face
looking straight up), the hole is inpainted there at low resolution (sky is
smooth), and the result is projected back and feathered into the panorama.

usage: python -I fill_zenith.py <pano.jpg> <pano-mask.png> <out.jpg>
"""
import sys, math
import numpy as np, cv2

pano = cv2.imread(sys.argv[1], cv2.IMREAD_COLOR)
mask = cv2.imread(sys.argv[2], cv2.IMREAD_GRAYSCALE)
out = sys.argv[3]
H, W = pano.shape[:2]
FACE = 2048
SMALL = 256
FEATHER = 110  # px on the face

# Face pixel -> direction (a, 1, b), a = east-ish, b = north-ish. Covers latitude > 45 degrees.
t = (np.arange(FACE, dtype=np.float32) + 0.5) / FACE * 2 - 1
a, b = np.meshgrid(t, t)
norm = np.sqrt(a * a + 1 + b * b)
dx, dy, dz = a / norm, 1 / norm, b / norm
lon = np.arctan2(dx, dz)
lat = np.arcsin(dy)
mx = ((lon + math.pi) / (2 * math.pi) * W - 0.5).astype(np.float32)
my = ((math.pi / 2 - lat) / math.pi * H - 0.5).astype(np.float32)
face = cv2.remap(pano, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)
fmask = cv2.remap(mask, mx, my, cv2.INTER_NEAREST, borderMode=cv2.BORDER_WRAP)
known = fmask > 127
# Stay off the last few pixels of the photographed edge (blending fades there).
known = cv2.erode(known.astype(np.uint8), np.ones((9, 9), np.uint8)) > 0

# Fill small, then scale up. Push-pull (fill each level from the coarser one) followed by
# relaxation inside the hole gives a smooth membrane: no streaks, just the surrounding sky
# gradient carried across.
small = cv2.resize(face, (SMALL, SMALL), interpolation=cv2.INTER_AREA).astype(np.float32)
wsmall = cv2.resize(known.astype(np.float32), (SMALL, SMALL), interpolation=cv2.INTER_AREA)
wsmall = (wsmall > 0.999).astype(np.float32)
levels = [(small * wsmall[..., None], wsmall)]
while levels[-1][1].shape[0] > 4:
    img, w = levels[-1]
    levels.append((cv2.pyrDown(img), cv2.pyrDown(w)))
img, w = levels[-1]
cur = img / np.maximum(w, 1e-6)[..., None]
for img, w in reversed(levels[:-1]):
    up = cv2.pyrUp(cur, dstsize=(w.shape[1], w.shape[0]))
    own = img / np.maximum(w, 1e-6)[..., None]
    wc = np.clip(w * 4, 0, 1)[..., None]
    cur = own * wc + up * (1 - wc)
hole = wsmall < 0.5
for _ in range(400):  # relax: each hole pixel becomes the mean of its neighbours
    blurred = cv2.blur(cur, (3, 3))
    cur[hole] = blurred[hole]
cur[~hole] = small[~hole]
filled = cv2.resize(cur, (FACE, FACE), interpolation=cv2.INTER_CUBIC).astype(np.float32)
# Faint noise so the smooth fill matches the grain of the photographed sky.
filled += np.random.default_rng(1).normal(0, 1.2, filled.shape).astype(np.float32)

# Weight of the original: 1 inside the photographed sky, fading to 0 across FEATHER px into the hole.
dist = cv2.distanceTransform(known.astype(np.uint8), cv2.DIST_L2, 5)
wface = np.clip(dist / FEATHER, 0, 1)[..., None]
face_out = face.astype(np.float32) * wface + filled * (1 - wface)

# Back to the panorama: rows above 45 degrees only.
rows = H // 4
ys = (np.arange(rows, dtype=np.float32) + 0.5)
xs = (np.arange(W, dtype=np.float32) + 0.5)
lonp = xs / W * 2 * math.pi - math.pi
latp = math.pi / 2 - ys / H * math.pi
LON, LAT = np.meshgrid(lonp, latp)
cl = np.cos(LAT)
ex, ey, ez = np.sin(LON) * cl, np.sin(LAT), np.cos(LON) * cl
fa = ex / ey
fb = ez / ey
u = ((fa + 1) / 2 * FACE - 0.5).astype(np.float32)
v = ((fb + 1) / 2 * FACE - 0.5).astype(np.float32)
back = cv2.remap(face_out, u, v, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
wback = cv2.remap(wface[..., 0], u, v, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)[..., None]
top = pano[:rows].astype(np.float32)
# Where the face says "original", keep the panorama's own pixels (sharper than the round trip).
merged = top * wback + back * (1 - wback)
pano[:rows] = np.clip(merged, 0, 255).astype(np.uint8)
# Any other pixel no photo covered (a stray column at the very bottom): patch from its neighbours.
holes = mask < 128
holes[:rows] = False
if holes.any():
    ys_, xs_ = np.nonzero(holes)
    y0, y1 = max(0, ys_.min() - 8), min(H, ys_.max() + 9)
    band = pano[y0:y1]
    pano[y0:y1] = cv2.inpaint(band, holes[y0:y1].astype(np.uint8) * 255, 5, cv2.INPAINT_TELEA)
    print('patched', int(holes.sum()), 'uncovered pixels')
cv2.imwrite(out, pano, [cv2.IMWRITE_JPEG_QUALITY, 92])
cv2.imwrite(out.replace('.jpg', '-zenith-face.jpg'), np.clip(face_out, 0, 255).astype(np.uint8)[::4, ::4])
print('wrote', out)
