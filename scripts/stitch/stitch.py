"""Stitch a DJI drone sphere (the PANORAMA folder of one shot) into a scene of a
site tour, with no PTGui or Hugin.

  1. align.py        place each photo from its gimbal angles, refine by matching features
  2. render.py       project onto a 16384 x 8192 equirectangular panorama, graph-cut seams, multiband blend
  3. fill_zenith.py  fill the sky the drone never photographs, patch stray gaps
  4. tiles.py        cut Marzipano cube tiles into public/tours/<tour>/tiles/<scene id>/

The panorama's centre is true north (from the drone's compass), so the scene's
`north` in src/data/panoramas.ts is 0.

Needs Python 3.10+ with opencv-python, numpy, scipy and pillow.

usage: python -I scripts/stitch/stitch.py <photo folder> <tour name> <scene id> [work folder] [--lens <file>]
  e.g. python -I scripts/stitch/stitch.py Rohan/001_0134/001_0134 panshet 0-panshet-1

If align.py reports QUALITY: CHECK THE RESULT, run again with
  --lens scripts/stitch/lens-FC9113.json
(the lens solved on a good set from this drone's camera); only rotations are then solved.

Writes the full panorama to <work folder>/<scene id>.jpg (default: stitch-work/,
which git ignores). Then add or update the scene in public/tours/<tour>/data.js
(same `levels` as the other scenes, faceSize 4096) and run
`npm run tour-images -- <tour> <panorama id>` and `npm run media`.
"""
import os, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__))
root = os.path.dirname(os.path.dirname(here))
args = sys.argv[1:]
lens = []
if '--lens' in args:
    k = args.index('--lens')
    lens = ['--lens', os.path.abspath(args[k + 1])]
    del args[k:k + 2]
photos, tour, scene = args[:3]
work = os.path.abspath(args[3]) if len(args) > 3 else os.path.join(root, 'stitch-work')
os.makedirs(work, exist_ok=True)

def run(script, *args):
    print(f'\n== {script}', flush=True)
    subprocess.run([sys.executable, '-I', os.path.join(here, script), *map(str, args)], check=True)

align = os.path.join(work, f'{scene}-align.json')
raw = os.path.join(work, f'{scene}-raw.jpg')
final = os.path.join(work, f'{scene}.jpg')
run('align.py', os.path.abspath(photos), align, *lens)
run('render.py', align, raw, 16384)
run('fill_zenith.py', raw, raw.replace('.jpg', '-mask.png'), final)
run('tiles.py', final, os.path.join(root, 'public', 'tours', tour, 'tiles'), scene, 4096)
print(f'\nDone: {final}\nTiles: public/tours/{tour}/tiles/{scene}/')
