"""Cut an equirectangular panorama into Marzipano cube tiles, laid out exactly
as the Marzipano Tool exports them:

  <out>/<scene id>/preview.jpg          six 256px faces stacked, order b d f l r u
  <out>/<scene id>/<z>/<face>/<y>/<x>.jpg  512px tiles; z = 1..4 for 512..4096px faces

Yaw 0 (face f) is the panorama's centre column. Prints the scene's `levels`.

usage: python -I tiles.py <pano.jpg> <tiles dir> <scene id> [face size]
"""
import json, math, os, sys
import numpy as np, cv2

pano = cv2.imread(sys.argv[1], cv2.IMREAD_COLOR)
root, scene = sys.argv[2], sys.argv[3]
FACE = int(sys.argv[4]) if len(sys.argv) > 4 else 4096
TILE = 512
H, W = pano.shape[:2]
out = os.path.join(root, scene)

# World: x east, y up, z north. (centre, right, up) of each face, seen from inside.
FACES = {
    'f': ((0, 0, 1), (1, 0, 0), (0, 1, 0)),
    'r': ((1, 0, 0), (0, 0, -1), (0, 1, 0)),
    'b': ((0, 0, -1), (-1, 0, 0), (0, 1, 0)),
    'l': ((-1, 0, 0), (0, 0, 1), (0, 1, 0)),
    'u': ((0, 1, 0), (1, 0, 0), (0, 0, -1)),
    'd': ((0, -1, 0), (1, 0, 0), (0, 0, 1)),
}

def render_face(name, size):
    c, r, u = (np.array(v, np.float64) for v in FACES[name])
    t = (np.arange(size) + 0.5) / size * 2 - 1
    a, b = np.meshgrid(t, t)  # a right, b down
    d = c[None, None] + a[..., None] * r[None, None] - b[..., None] * u[None, None]
    d /= np.linalg.norm(d, axis=-1, keepdims=True)
    lon = np.arctan2(d[..., 0], d[..., 2])
    lat = np.arcsin(np.clip(d[..., 1], -1, 1))
    mx = ((lon + math.pi) / (2 * math.pi) * W - 0.5).astype(np.float32)
    my = ((math.pi / 2 - lat) / math.pi * H - 0.5).astype(np.float32)
    return cv2.remap(pano, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_WRAP)

levels = [{'tileSize': 256, 'size': 256, 'fallbackOnly': True}]
sizes = []
s = TILE
while s <= FACE:
    sizes.append(s)
    levels.append({'tileSize': TILE, 'size': s})
    s *= 2

os.makedirs(out, exist_ok=True)
previews = {}
for name in FACES:
    face = render_face(name, FACE)
    for z, size in enumerate(sizes, start=1):
        img = face if size == FACE else cv2.resize(face, (size, size), interpolation=cv2.INTER_AREA)
        n = size // TILE
        for y in range(n):
            for x in range(n):
                d = os.path.join(out, str(z), name, str(y))
                os.makedirs(d, exist_ok=True)
                cv2.imwrite(os.path.join(d, f'{x}.jpg'), img[y * TILE:(y + 1) * TILE, x * TILE:(x + 1) * TILE],
                            [cv2.IMWRITE_JPEG_QUALITY, 85, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
    previews[name] = cv2.resize(face, (256, 256), interpolation=cv2.INTER_AREA)
    print('face', name, flush=True)
cv2.imwrite(os.path.join(out, 'preview.jpg'), np.vstack([previews[k] for k in 'bdflru']), [cv2.IMWRITE_JPEG_QUALITY, 85])
print(json.dumps({'levels': levels, 'faceSize': FACE}))
