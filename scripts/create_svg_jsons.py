# TODO: Use os.path.abspath(os.path.dirname(__file__)) to run scripts from anywhere insted of requiring run in scripts dir
# TODO: Write the dictionary AND the window.frames assignation all at once and not in two steps. 


# This sript will only run correctly if called inside www dir

import os
import sys
import argparse
import json
# from argparse import ArgumentParser

parser = argparse.ArgumentParser(description='Modifies load_frames.js file and loads formatted svgs for app to read. \
                                            Requires files "www/svg/id_frame_sauna" and "www/svg/id_frame_spa"')
parser.add_argument('type', choices=['sauna', 'spa'])
args = parser.parse_args()

# svgrelpath = '../www/svg/id_frame_' + args.type + '.svg' # USE THIS IF YOU WANT IDS PREFIXES ACCORDING TO TYPES IN SVGS (UPDATE FIRST WITH ID SCRIPT)
svgrelpath = '../www/svg/frame_' + args.type + '.svg'
loadframespath = '../www/js/load_frames.js'

cwd = os.path.abspath(os.getcwd())

if not cwd[-7:] == "scripts":
	print "\033[1;31 FATAL: This script MUST run in the scripts directory ( ..../AccRemote/scripts )"
	exit(-1)

svgfile = os.path.join(cwd, svgrelpath)
loadframesfile = os.path.join(cwd, loadframespath)

fs = open (svgfile, "r")
# svgraw = json.dumps(fs.read())
svgraw = fs.read()
fs.close()

fj = open(loadframesfile, "r")
frames_json_raw = fj.read()
frames_dict = json.loads(frames_json_raw.split(" = ",1)[1])
frames_dict[args.type] = svgraw
fj.close()

#save into file
fj = open(loadframesfile, "w")
json.dump(frames_dict, fj)
fj.close()

#append window.frames assign
fj = open(loadframesfile, 'r')
rawfile = fj.read()
fj.close()

fj = open(loadframesfile, "w")
fj.write("window.frames = " + rawfile)
fj.close()

print "load_frames.js modified"

