# This sript will only run correctly if called inside www dir

import os
import sys
import argparse
import json
# from argparse import ArgumentParser

parser = argparse.ArgumentParser(description='Modifies load_frames.js file and loads formatted svgs for app to read. \
                                            Requires files "www/svg/id_frame_sauna" and "www/svg/id_frame_spa"')
parser.add_argument('type', choices=['sauna', 'spa'])
parser.add_argument('--dry-run', action='store_true')
args = parser.parse_args()

# svgrelpath = '../www/svg/id_frame_' + args.type + '.svg' # USE THIS IF YOU WANT IDS PREFIXES ACCORDING TO TYPES IN SVGS (UPDATE FIRST WITH ID SCRIPT)

cwd = os.path.abspath(os.path.dirname(__file__))

svgrelpath = '../www/svg/frame_' + args.type + '.svg'
loadframespath = '../www/js/load_frames.js'

svgfile = os.path.join(cwd, svgrelpath)
loadframesfile = os.path.join(cwd, loadframespath)

fs = open(svgfile, "r")
# svgraw = json.dumps(fs.read())
svgraw = fs.read()
fs.close()

fj = open(loadframesfile, "r")
frames_json_raw = fj.read()
frames_dict = json.loads(frames_json_raw.split(" = ",1)[1])
frames_dict[args.type] = svgraw
fj.close()

#save into file
if not args.dry_run:
    fj = open(loadframesfile, "w")
    fj.write("window.frames = " + json.dumps(frames_dict))
    fj.close()


print ("load_frames.js updated")

