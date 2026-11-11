"""Render an aligned photo set (align.json) to an equirectangular panorama.

Column 0 is due south, the centre column is due north (compass heading 0),
heading grows to the right. Top row is straight up.

Seams: graph cut on a small copy, so seams run where neighbouring photos agree.
Blending: OpenCV multiband across the seams.

usage: python -I render.py <align.json> <out.jpg> <width> [--no-seams]
"""
import json, os, sys, math
import numpy as np, cv2

cfg = json.load(open(sys.argv[1]))
out, W = sys.argv[2], int(sys.argv[3])
use_seams = '--no-seams' not in sys.argv
H = W // 2
Rs = [np.array(r) for r in cfg['R']]
f, k1, k2, cx, cy = cfg['f'], cfg['k1'], cfg['k2'], cfg['cx'], cfg['cy']
IW, IH = cfg['width'], cfg['height']
files = cfg['files']
n = len(files)
SEAM_W = 2048

def directions(x0, y0, w, h, width):
    """World unit vectors for equirect pixels in a block of a `width`-wide panorama."""
    hgt = width // 2
    xs = (np.arange(x0, x0 + w, dtype=np.float64) + 0.5) % width
    ys = np.arange(y0, y0 + h, dtype=np.float64) + 0.5
    lon = xs / width * 2 * math.pi - math.pi          # heading, 0 = north at centre
    lat = math.pi / 2 - ys / hgt * math.pi
    lon, lat = np.meshgrid(lon, lat)
    cl = np.cos(lat)
    return np.stack([np.sin(lon) * cl, np.sin(lat), np.cos(lon) * cl], -1)

def project(d, R):
    """Pixel coordinates in the source photo for world directions d (..., 3)."""
    c = d @ R  # world -> camera (R columns are camera axes in world)
    z = c[..., 2]
    front = z > 1e-6
    zs = np.where(front, z, 1.0)
    xu, yu = c[..., 0] / zs, c[..., 1] / zs
    # Invert the ideal = distorted * (1 + k1 r^2 + k2 r^4) model by fixed point.
    xd, yd = xu.copy(), yu.copy()
    for _ in range(6):
        r2 = xd * xd + yd * yd
        s = 1 + k1 * r2 + k2 * r2 * r2
        xd, yd = xu / s, yu / s
    u = xd * f + cx
    v = yd * f + cy
    valid = front & (u >= 0) & (u <= IW - 1) & (v >= 0) & (v <= IH - 1)
    return u.astype(np.float32), v.astype(np.float32), valid

def footprint(R, width):
    """Bounding block (x0, y0, w, h) of a photo in the panorama; full width if it wraps or holds a pole."""
    hgt = width // 2
    t = np.linspace(0, 1, 60)
    border = np.concatenate([
        np.stack([t * (IW - 1), np.zeros_like(t)], 1), np.stack([t * (IW - 1), np.full_like(t, IH - 1)], 1),
        np.stack([np.zeros_like(t), t * (IH - 1)], 1), np.stack([np.full_like(t, IW - 1), t * (IH - 1)], 1)])
    x = (border[:, 0] - cx) / f
    y = (border[:, 1] - cy) / f
    r2 = x * x + y * y
    s = 1 + k1 * r2 + k2 * r2 * r2
    v = np.stack([x * s, y * s, np.ones_like(x)], 1)
    d = (R @ v.T).T
    d /= np.linalg.norm(d, axis=1, keepdims=True)
    lon = np.arctan2(d[:, 0], d[:, 2])
    lat = np.arcsin(np.clip(d[:, 1], -1, 1))
    px = (lon + math.pi) / (2 * math.pi) * width
    py = (math.pi / 2 - lat) / math.pi * hgt
    up, down = np.array([0, 1.0, 0]), np.array([0, -1.0, 0])
    sees_up = project(up[None], R)[2][0]
    sees_down = project(down[None], R)[2][0]
    y0 = 0 if sees_up else max(0, int(py.min()) - 2)
    y1 = hgt if sees_down else min(hgt, int(math.ceil(py.max())) + 2)
    span = np.ptp(np.unwrap(lon))
    if sees_up or sees_down or span > math.pi:
        return 0, y0, width, y1 - y0
    # Continuous range of headings, possibly across the south seam: start from the unwrapped minimum.
    ul = np.unwrap(lon)
    a0 = (ul.min() + math.pi) / (2 * math.pi) * width
    a1 = (ul.max() + math.pi) / (2 * math.pi) * width
    x0 = int(math.floor(a0)) - 2
    return x0, y0, int(math.ceil(a1)) + 2 - x0, y1 - y0

def warp(img, R, width):
    x0, y0, w, h = footprint(R, width)
    d = directions(x0, y0, w, h, width)
    u, v, valid = project(d, R)
    warped = cv2.remap(img, u, v, cv2.INTER_LINEAR if width <= SEAM_W else cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    mask = (valid * 255).astype(np.uint8)
    # Pull the mask in by a pixel so no edge pixel blends in.
    mask = cv2.erode(mask, np.ones((3, 3), np.uint8))
    return (x0, y0), warped, mask

def place(corner, block, width):
    """Split a block that runs past either side of the panorama into pieces inside it.
    Returns ((x, y) in the panorama, piece, column offset of the piece in the block)."""
    x0, y0 = corner
    w = block.shape[1]
    pieces = []
    start = x0
    while start < x0 + w:
        col = start % width
        take = min(width - col, x0 + w - start)
        pieces.append(((col, y0), block[:, start - x0:start - x0 + take], start - x0))
        start += take
    return pieces

GAINS = None  # per photo, per channel, in linear light; set after the small pass

def apply_gain(img, g):
    """Scale an sRGB-ish image by per-channel gains in linear light (gamma 2.2), via lookup tables."""
    x = np.arange(256, dtype=np.float64) / 255
    out = np.empty_like(img)
    for c in range(3):
        lut = np.clip(((x ** 2.2) * g[c]) ** (1 / 2.2) * 255 + 0.5, 0, 255).astype(np.uint8)
        out[..., c] = cv2.LUT(img[..., c], lut)
    return out

def load(i, scale_w=None):
    img = cv2.imread(os.path.join(cfg['src'], files[i]), cv2.IMREAD_COLOR)
    return img if GAINS is None else apply_gain(img, GAINS[i])

# 1. Seams on a small panorama.
print('seams...', flush=True)
small = []
for i in range(n):
    img = cv2.resize(load(i), (IW // 4, IH // 4), interpolation=cv2.INTER_AREA)
    # The small copy has its own pixel scale; scale the camera to match.
    global_f = f
    f, cx, cy, IW, IH = global_f / 4, cfg['cx'] / 4, cfg['cy'] / 4, cfg['width'] // 4, cfg['height'] // 4
    corner, warped, mask = warp(img, Rs[i], SEAM_W)
    f, cx, cy, IW, IH = global_f, cfg['cx'], cfg['cy'], cfg['width'], cfg['height']
    small.append((corner, warped, mask))

# Exposure: drones often change exposure between frames. Solve one gain per photo and channel
# (linear light) so overlapping photos agree, pulled gently towards 1 (Brown & Lowe).
def canvas(corner, block, width):
    full = np.zeros((width // 2, width) + block.shape[2:], block.dtype)
    for (px, py), piece, _ in place(corner, block, width):
        full[py:py + piece.shape[0], px:px + piece.shape[1]] = piece
    return full
lin = [canvas(c, (w.astype(np.float32) / 255) ** 2.2, SEAM_W)[::2, ::2] for c, w, m in small]
msk = [canvas(c, m, SEAM_W)[::2, ::2] > 0 for c, w, m in small]
SIG_N, SIG_G = 10 / 255, 0.1
GAINS = np.ones((n, 3))
for ch in range(3):
    A = np.zeros((n, n)); b = np.zeros(n)
    for i in range(n):
        for j in range(i + 1, n):
            both = msk[i] & msk[j]
            N = int(both.sum())
            if N < 50:
                continue
            mi, mj = lin[i][..., ch][both].mean(), lin[j][..., ch][both].mean()
            for a, ma, c_, mc in ((i, mi, j, mj), (j, mj, i, mi)):
                A[a, a] += N * ma * ma / SIG_N ** 2 + N / SIG_G ** 2
                A[a, c_] -= N * ma * mc / SIG_N ** 2
                b[a] += N / SIG_G ** 2
    for i in range(n):
        if A[i, i] == 0:
            A[i, i] = 1; b[i] = 1
    GAINS[:, ch] = np.linalg.solve(A, b)
print('exposure gains (min..max):', np.round(GAINS.min(0), 3), np.round(GAINS.max(0), 3), flush=True)
small = [(c, apply_gain(w, GAINS[i]), m) for i, (c, w, m) in enumerate(small)]
del lin, msk

# Seam masks: start from "closest to the photo's centre wins", then let graph cut move the seams.
centre_score = np.full((SEAM_W // 2, SEAM_W), -1.0, np.float32)
owner = np.full((SEAM_W // 2, SEAM_W), -1, np.int16)
dirs_small = directions(0, 0, SEAM_W, SEAM_W // 2, SEAM_W)
for i in range(n):
    score = dirs_small @ Rs[i][:, 2]
    (x0, y0), _, m = small[i]
    full = np.zeros((SEAM_W // 2, SEAM_W), bool)
    for (cxp, cyp), piece, _ in place((x0, y0), m, SEAM_W):
        full[cyp:cyp + piece.shape[0], cxp:cxp + piece.shape[1]] |= piece > 0
    better = full & (score > centre_score)
    centre_score[better] = score[better]
    owner[better] = i

seam_masks = []
if use_seams:
    finder = cv2.detail_GraphCutSeamFinder('COST_COLOR_GRAD')
    imgs = [cv2.UMat(s[1].astype(np.float32)) for s in small]
    corners = [s[0] for s in small]
    # Give graph cut the Voronoi masks dilated, so each photo can claim a band past its Voronoi edge.
    masks = []
    for i, ((x0, y0), w_, m) in enumerate(small):
        own = (owner == i).astype(np.uint8) * 255
        own = cv2.dilate(own, np.ones((41, 41), np.uint8))
        block = np.zeros_like(m)
        h, w = m.shape
        for k in range(w):
            pass
        cols = (np.arange(x0, x0 + w) % SEAM_W)
        block = own[y0:y0 + h][:, cols] & m
        masks.append(cv2.UMat(block))
    masks = finder.find(imgs, corners, masks)
    seam_masks = [m.get() if isinstance(m, cv2.UMat) else m for m in masks]
else:
    for i, ((x0, y0), w_, m) in enumerate(small):
        h, w = m.shape
        cols = (np.arange(x0, x0 + w) % SEAM_W)
        seam_masks.append(((owner == i).astype(np.uint8) * 255)[y0:y0 + h][:, cols] & m)

# 2. Full size: warp each photo, scale its seam mask up, feed the blender.
print('blending...', flush=True)
# The canvas runs PAD columns past both sides, filled with the wrapped-around content, so the
# blender sees the panorama as a closed ring and its left and right edges meet without a seam.
PAD = W // 16
CW = W + 2 * PAD
# Many bands: smooth areas (sky) blend over ~W/16 px, so exposure and vignetting steps vanish.
BANDS = max(5, min(10, int(math.log2(W / 16))))
blender = cv2.detail_MultiBandBlender(0, BANDS)
blender.prepare((0, 0, CW, H))
scale = W / SEAM_W
for i in range(n):
    corner, warped, mask = warp(load(i), Rs[i], W)
    (sx0, sy0), _, _ = small[i]
    sm = seam_masks[i]
    # Map the small seam mask onto this block.
    h, w = mask.shape
    xs = ((np.arange(w) + corner[0] + 0.5) / scale - sx0).astype(np.float32)
    ys = ((np.arange(h) + corner[1] + 0.5) / scale - sy0).astype(np.float32)
    mx, my = np.meshgrid(xs, ys)
    big = cv2.remap(sm, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    big = ((big > 127) & (mask > 0)).astype(np.uint8) * 255
    # Normalise the block start into [0, W), then feed it once per copy of the ring that touches the canvas.
    x0 = corner[0] % W
    for k in (-1, 0, 1):
        start = x0 + PAD + k * W
        a, b = max(0, start), min(CW, start + w)
        if b <= a:
            continue
        piece = np.ascontiguousarray(warped[:, a - start:b - start]).astype(np.int16)
        mpiece = np.ascontiguousarray(big[:, a - start:b - start])
        if mpiece.any():
            blender.feed(piece, mpiece, (int(a), int(corner[1])))
    print(f'  {files[i]}', flush=True)
pano, pmask = blender.blend(None, None)
pano = np.clip(pano[:, PAD:PAD + W], 0, 255).astype(np.uint8)
pmask = pmask[:, PAD:PAD + W]
cv2.imwrite(out, pano, [cv2.IMWRITE_JPEG_QUALITY, 92])
cv2.imwrite(os.path.splitext(out)[0] + '-mask.png', pmask)
print('wrote', out, pano.shape)
