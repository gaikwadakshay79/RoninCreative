"""Align a DJI sphere panorama: start from the gimbal angles in each photo's XMP,
match SIFT features between neighbouring photos, then refine every camera's
rotation, a shared focal length and radial distortion by least squares.

World frame: x east, y up, z north. Yaw = compass heading (clockwise from north),
pitch = up positive. Camera frame: x right, y down, z forward.

usage: python -I align.py <photo dir> <out.json> [work width] [--lens <good align.json>]

--lens reuses the focal length and distortion solved on a good set from the same
camera, and solves only the rotations. Use it for sets that drifted or were shot
close to the ground, where solving the lens as well goes wrong.
"""
import json, os, re, sys, math, itertools
import numpy as np, cv2
from scipy.optimize import least_squares
from scipy.spatial.transform import Rotation as Rot

args = sys.argv[1:]
LENS = None
if '--lens' in args:
    k = args.index('--lens')
    LENS = json.load(open(args[k + 1]))
    del args[k:k + 2]
src, out = args[0], args[1]
WORK = int(args[2]) if len(args) > 2 else 1600

def xmp(path):
    raw = open(path, 'rb').read(300000)
    get = lambda k: float(re.search(rb'drone-dji:' + k + rb'="([^"]+)"', raw).group(1))
    return get(b'GimbalYawDegree'), get(b'GimbalPitchDegree'), get(b'GimbalRollDegree')

def base_rotation(yaw, pitch, roll):
    a, p = math.radians(yaw), math.radians(pitch)
    fwd = np.array([math.sin(a) * math.cos(p), math.sin(p), math.cos(a) * math.cos(p)])
    right = np.array([math.cos(a), 0.0, -math.sin(a)])
    up = np.cross(fwd, right)  # camera up in world
    R = np.stack([right, -up, fwd], axis=1)  # columns: camera x, y, z in world
    if roll:
        R = R @ Rot.from_rotvec([0, 0, math.radians(roll)]).as_matrix()
    return R

def is_drone_photo(path):
    """A DJI frame with gimbal angles. Skips stitched panoramas (PTGui output etc.) left in the folder."""
    raw = open(path, 'rb').read(300000)
    return b'drone-dji:GimbalYawDegree' in raw and b'drone-dji:GimbalPitchDegree' in raw

files, skipped = [], []
for f in sorted(os.listdir(src)):
    if f.lower().endswith(('.jpg', '.jpeg')):
        (files if is_drone_photo(os.path.join(src, f)) else skipped).append(f)
if skipped:
    print('skipped (no DJI gimbal data, not a drone frame):', skipped, flush=True)
n = len(files)
if n < 6:
    sys.exit(f'Only {n} drone photos with gimbal data in {src}; a sphere needs 25 or more.')
R0, imgs = [], []
sift = cv2.SIFT_create(nfeatures=6000)
kps, descs = [], []
for f in files:
    R0.append(base_rotation(*xmp(os.path.join(src, f))))
    im = cv2.imread(os.path.join(src, f), cv2.IMREAD_GRAYSCALE)
    H, W = im.shape
    s = WORK / W
    small = cv2.resize(im, (WORK, round(H * s)), interpolation=cv2.INTER_AREA)
    small = cv2.createCLAHE(2.0, (8, 8)).apply(small)
    k, d = sift.detectAndCompute(small, None)
    kps.append(np.array([p.pt for p in k], np.float32) / s)  # full-res pixels
    descs.append(d)
    print(f'{f}: {len(k)} features', flush=True)

FULL_W, FULL_H = W, H
cx, cy = FULL_W / 2, FULL_H / 2
f0 = 24 / 43.2666 * math.hypot(FULL_W, FULL_H)  # 24 mm equivalent

R0 = np.array(R0)
# Candidate pairs: optical axes within 75 degrees.
axes = [r[:, 2] for r in R0]
pairs = [(i, j) for i, j in itertools.combinations(range(n), 2)
         if math.degrees(math.acos(np.clip(axes[i] @ axes[j], -1, 1))) < 75]
matcher = cv2.BFMatcher(cv2.NORM_L2)
matches = []
for i, j in pairs:
    if descs[i] is None or descs[j] is None or len(descs[i]) < 10 or len(descs[j]) < 10:
        continue
    raw = matcher.knnMatch(descs[i], descs[j], k=2)
    good = [m for m, nn in (x for x in raw if len(x) == 2) if m.distance < 0.75 * nn.distance]
    if len(good) < 20:
        continue
    p = kps[i][[m.queryIdx for m in good]]
    q = kps[j][[m.trainIdx for m in good]]
    Hm, inl = cv2.findHomography(p, q, cv2.RANSAC, 6.0)
    if Hm is None:
        continue
    inl = inl.ravel().astype(bool)
    if inl.sum() < 15:
        continue
    p, q = p[inl], q[inl]
    # Keep only matches the gimbal angles roughly agree with (within ~5 degrees).
    def ray(pts, R):
        v = np.stack([(pts[:, 0] - cx) / f0, (pts[:, 1] - cy) / f0, np.ones(len(pts))], 1)
        v /= np.linalg.norm(v, axis=1, keepdims=True)
        return v @ R.T
    ang = np.degrees(np.arccos(np.clip(np.sum(ray(p, R0[i]) * ray(q, R0[j]), 1), -1, 1)))
    ok = ang < 5.0
    if ok.sum() < 15:
        print(f'pair {files[i]}-{files[j]}: rejected, matches disagree with gimbal (median {np.median(ang):.1f} deg)', flush=True)
        continue
    p, q = p[ok], q[ok]
    if len(p) > 400:
        sel = np.random.default_rng(0).choice(len(p), 400, replace=False)
        p, q = p[sel], q[sel]
    matches.append((i, j, p, q))
    print(f'pair {files[i]}-{files[j]}: {len(p)} inliers', flush=True)

I = np.concatenate([np.full(len(m[2]), m[0]) for m in matches])
J = np.concatenate([np.full(len(m[2]), m[1]) for m in matches])
P = np.concatenate([m[2] for m in matches])
Q = np.concatenate([m[3] for m in matches])

def rays(pts, f, k1, k2, dx=0.0, dy=0.0):
    x = (pts[:, 0] - cx - dx) / f
    y = (pts[:, 1] - cy - dy) / f
    r2 = x * x + y * y
    d = 1 + k1 * r2 + k2 * r2 * r2  # distorted -> ideal (approximate inverse model)
    v = np.stack([x * d, y * d, np.ones_like(x)], 1)
    return v / np.linalg.norm(v, axis=1, keepdims=True)

def unpack(x):
    w = x[:3 * n].reshape(n, 3)
    if LENS:
        f, k1, k2 = LENS['f'], LENS['k1'], LENS['k2']
        dx, dy = LENS['cx'] - cx, LENS['cy'] - cy
    else:
        f, k1, k2, dx, dy = x[3 * n:]
    Rs = R0 @ Rot.from_rotvec(w).as_matrix()
    return Rs, f, k1, k2, w, dx, dy

PRIOR = 0.02
def residuals(x):
    Rs, f, k1, k2, w, dx, dy = unpack(x)
    a = np.einsum('nij,nj->ni', Rs[I], rays(P, f, k1, k2, dx, dy))
    b = np.einsum('nij,nj->ni', Rs[J], rays(Q, f, k1, k2, dx, dy))
    return np.concatenate([(a - b).ravel() * f, w.ravel() * PRIOR * f, [dx * 2.0, dy * 2.0, (f - f0) * 0.5]])

x0 = np.zeros(3 * n) if LENS else np.concatenate([np.zeros(3 * n), [f0, 0.0, 0.0, 0.0, 0.0]])
if LENS:
    print(f"lens fixed from a good set: focal {LENS['f']:.1f}px, k1 {LENS['k1']:.4f}, k2 {LENS['k2']:.4f}", flush=True)
def report(x, label):
    r = residuals(x)[: 3 * len(P)].reshape(-1, 3)
    e = np.linalg.norm(r, axis=1)
    print(f'{label}: {len(e)} matches, median {np.median(e):.2f}px, 95% {np.percentile(e, 95):.2f}px', flush=True)
    return e
report(x0, 'gimbal angles only')
res = least_squares(residuals, x0, loss='huber', f_scale=3.0, x_scale='jac', max_nfev=600)
e = report(res.x, 'refined')
# Drop gross outliers and refine again.
keep = e < max(6.0, np.percentile(e, 98))
I, J, P, Q = I[keep], J[keep], P[keep], Q[keep]
res = least_squares(residuals, res.x, loss='huber', f_scale=2.0, x_scale='jac', max_nfev=600)
report(res.x, 'refined, outliers removed')
Rs, f, k1, k2, w, dx, dy = unpack(res.x)
# The matches only fix the photos relative to each other; the solve can turn the whole
# sphere a few (or, on hard sets, twenty) degrees. The gimbal holds the horizon level and
# reads true north, so turn the solved sphere as one piece back onto the gimbal angles.
_a = np.concatenate([R0[:, :, k] for k in range(3)])
_b = np.concatenate([Rs[:, :, k] for k in range(3)])
G, _ = Rot.align_vectors(_a, _b)
print(f'levelled: turned the whole sphere {np.degrees(G.magnitude()):.2f} deg back onto the gimbal horizon and north', flush=True)
Rs = np.einsum('ij,njk->nik', G.as_matrix(), Rs)
print(f'focal {f:.1f}px (start {f0:.1f}), k1 {k1:.4f}, k2 {k2:.4f}, centre offset {dx:.1f},{dy:.1f}px')
print('largest corrections (deg):', sorted(((round(float(np.degrees(np.linalg.norm(v))), 2), files[i]) for i, v in enumerate(w)), reverse=True)[:6])
linked = set(I.tolist()) | set(J.tolist())
print('photos with no matches (placed by gimbal angles only):', [files[i] for i in range(n) if i not in linked])
json.dump({'src': src, 'files': files, 'width': FULL_W, 'height': FULL_H, 'f': f, 'k1': k1, 'k2': k2,
           'cx': cx + dx, 'cy': cy + dy, 'R': [r.tolist() for r in Rs]}, open(out, 'w'), indent=1)
E = np.linalg.norm(residuals(res.x)[: 3 * len(P)].reshape(-1, 3), axis=1)
worst = sorted(((float(np.median(E[(I == a) & (J == b)])), files[a], files[b], int(((I == a) & (J == b)).sum())) for a, b in set(zip(I.tolist(), J.tolist()))), reverse=True)[:10]
print('worst pairs (median px, a, b, n):', worst)
# Plain verdict. On the Panshet 1 set (33 photos, hovering): median ~4 px, 2 sky photos unmatched.
unmatched = [files[i] for i in range(n) if i not in linked]
med = float(np.median(E))
problems = []
if med > 8:
    problems.append(f'photos line up loosely (median {med:.1f} px; good sets are under 5). The drone may have drifted in wind, or something close to it moved.')
if len(unmatched) > n // 4:
    problems.append(f'{len(unmatched)} of {n} photos matched nothing (normal for a few sky shots). They are placed by gimbal angles only, so check their seams.')
print('QUALITY: ' + ('good' if not problems else 'CHECK THE RESULT: ' + ' '.join(problems)), flush=True)
gap = np.abs(I - J)
for lo, hi, label in [(1, 1, 'shot back to back'), (2, 8, 'a few shots apart'), (9, 40, 'far apart in time')]:
    m = (gap >= lo) & (gap <= hi)
    if m.any(): print(f'{label}: {m.sum()} matches, median {np.median(E[m]):.2f}px')
pitch = np.degrees(np.arcsin(np.clip(R0[:, 1, 2], -1, 1)))
for lo, hi in [(-91, -75), (-75, -40), (-40, 0), (0, 30), (30, 60)]:
    m = (pitch[I] >= lo) & (pitch[I] < hi) & (pitch[J] >= lo - 40)
    if m.any(): print(f'first photo pitch {lo}..{hi}: {m.sum()} matches, median {np.median(E[m]):.2f}px')
r = np.hypot(P[:, 0] - cx, P[:, 1] - cy) / np.hypot(cx, cy)
for lo, hi in [(0, .4), (.4, .7), (.7, 1.01)]:
    m = (r >= lo) & (r < hi)
    print(f'radius {lo}-{hi}: median {np.median(E[m]):.2f}px')
print('wrote', out)
