from PIL import Image, ImageDraw, ImageFont
import sys
import os
import platform
import time

"""
Image compress script for Markdown X

Version 1.0 Written by [LILPIG](http://lilpig.site)

Require: python3.7 or higher version


To make sure you install the pillow before you use it.

Run on linux:
    pip3 install pillow
Run on Windows:
    python -m install pillow
"""

#################################################################


"""
A file to collect the log info when it's not None.

default to None, Change it if you wanna collect log.

Such as:
    log_file = open('/home/ns/log_file','a+')

Note that you must use the absolute path.

"""
log_file = None

def write_log(msg):
    if log_file != None:
        log_file.write(('[%s]--'%time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))+msg)


if(len(sys.argv)<4):
    print('201:Params missing...the script need 3 params , given '+len(sys.argv)-1)
    write_log('201:Params missing...the script need 3 params , given '+len(sys.argv)-1);
    sys.exit(0)

source_path = sys.argv[1]
try:
    compress_level = int(sys.argv[2])
    if(compress_level<0 or compress_level>100):
        raise RuntimeError()
except Exception as e:
    print('203:Wrong compress level,it must be a integer and in 0-100, given '+ sys.argv[2])
    write_log('203:Wrong compress level,it must be a integer and in 0-100, given '+ sys.argv[2]);
    sys.exit(0)

target_path = sys.argv[3]

'''
vscode.showOpenDialog return a path startwith '/'. But it's not a correct path in Windows, so I remove it.

I'm not sure the code below can't cause some problem, but at least it runs on my Windows10 and Ubuntu18.04 correctly.
'''
if platform.system() == 'Windows' and source_path[0] == '/':
    source_path = source_path[1:]


write_log(source_path+' => '+target_path+' [cmplv:'+str(compress_level)+']\n')

if not os.path.exists(source_path):
    print('202:No such file '+ source_path)
    write_log('202:No such file '+ source_path);
    sys.exit(0)
try:
    image = Image.open(source_path)
    image = image.convert('RGB')
    image.save(target_path, quality=compress_level)
    print('200:' + source_path)
    write_log('200:' + source_path)
except Exception as e:
    print('204:compress exception => ',e)
    write_log('204:compress exception => %s'%e)
