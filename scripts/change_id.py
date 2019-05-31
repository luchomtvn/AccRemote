# This sript will only run correctly if called inside www dir


# 31/05/19 This script is no longer being used as ids do not need to be changed. 

import os
import sys
import argparse
# from argparse import ArgumentParser

parser = argparse.ArgumentParser(description='SVG Handler to modify inkscape frames and also load them into index before running app')
parser.add_argument('type', choices=['sauna', 'spa'])
args = parser.parse_args()

filepath = '../www/svg/frame_' + args.type + '.svg'

dirname = os.path.abspath(os.getcwd())

if not dirname[-7:] == "scripts":
	print "RUN THIS SCRIPT IN SCRIPTS DIRECTORY"
	exit(-1)

filename = os.path.join(dirname, filepath)

modified = ""
f = open (filename, "r")
# digits = 0
ids = 0
for line in f:
	if 'id=' in line and 'id="' + args.type not in line:
		separated = line.split('="')
		modified += separated[0] + '="' + args.type + '-' + separated[1]
		ids += 1
	else:
		modified += line
		# print line
		# digits += 1

print "modified " + str(ids) + " lines"
if ids == 0:
	print "Script already ran"

filename = os.path.join(dirname, '../www/svg/id_frame_' + args.type + '.svg')

with open (filename, "w") as f:
	f.write(modified)

# print sys.argv[1]
print "new svg files with new ids for type " + args.type + " saved in '" + filename + "'"