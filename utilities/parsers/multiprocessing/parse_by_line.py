import os
import sys
import time
import os.path
import multiprocessing
import argparse

def parse_clargs():
    ap = argparse.ArgumentParser()
    ap.add_argument("-l", "--line", type=str, required=True,
                help="lineID to filter by")
    ap.add_argument("-s", "--file_suffix", type=str, required=True,
                help="filename_suffix")
    return vars(ap.parse_args())


def checkdir_makeifnot(dir_file):
    try:
        os.makedirs(dir_file)
    except FileExistsError:
        pass

def get_trip_ids(trip_file, line_id):
    trip_ids = {}

    with open(trip_file, 'r') as f1:

        try:   
            for line in f1:
                if line.split(';')[3] == line_id:
                    trip_ids[line.split(';')[2]] = line.split(";")[4]
        
        except Exception as e:
            print(str(e))
            sys.exit(1)

    return trip_ids

def write_line_file(leavetimes_file, save_file, trip_ids):

    with open(leavetimes_file, 'r') as f2:
        try:
            for line in f2:
                trip_id = str(line.split(';')[2])

                if trip_id in trip_ids:
                    with open(save_file, 'a') as f3:
                        f3.write(line.strip('\n') + ';' + trip_ids[trip_id] + '\n')
 
        except Exception as e:
            print(str(e))
            sys.exit(1)


args = parse_clargs()
line_id = args["line"]

### file setup ###

trip_file = os.path.join(os.environ.get('HOME'), 'dublink_bus/text_data/rt_trips_DB_2018.txt')         # replace with paths to file 'rt_trips...' on your machine
leavetimes_file = os.path.join(os.environ.get('HOME'), 'dublink_bus/text_data/lt' + args["file_suffix"])    # replace with path to file 'rt_leavetimes...' on your machine
save_dir = os.path.join(os.environ.get('HOME'), 'dublink_bus/text_data/line_trips/')        # replace with directory you want to save output file to

save_file = save_dir + line_id +  args["file_suffix"] + '.txt'

checkdir_makeifnot(save_dir)

### end of file setup ###

trip_ids = get_trip_ids(trip_file, line_id)

write_line_file(leavetimes_file, save_file, trip_ids)

with open('finished.txt', 'a') as f:
    f.write('F\n')






