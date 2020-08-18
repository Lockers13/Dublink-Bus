import pandas as pd
import os
import json
import argparse
import os.path
import sys

def parse_clargs():
    ap = argparse.ArgumentParser() 
    ap.add_argument("-l", "--lineID", type=str, required=True,
                help="lineID whose routes are to be mapped")
    ap.add_argument("-n", action='store_true')
    return vars(ap.parse_args())

def map_routes(args, data_dir, outfile):
    
    def quick_group(df, key):
        group_obj = df.groupby(key)
        unique_list = df[key].unique()
        group_list = []
    
        for item in unique_list:
            group_list.append(group_obj.get_group(item))
        
        return group_list

    def get_stop_dict():
        stops = {}
        with open(os.path.join(data_dir, 'static_stops/static_stops.json'), 'r') as f:
            static_stops = json.loads(f.read())
            for stop in static_stops['stops']:
                stops[stop['id']] = stop['name']
        return stops
    
    def get_ms_trip(df):
        trip_groups = quick_group(df, 'TRIPID')

        ms_trip = ""
        most_stops = 0

        for i in trip_groups:
            len_stops = len(i['STOPPOINTID'].unique()) 
            if len_stops > most_stops:
                most_stops = len_stops
                ms_trip = i['TRIPID'].unique()[0]
        
        return ms_trip


    df_line = pd.read_csv(os.path.join(data_dir,
        'leavetimes_by_line/{0}.txt'.format(args["lineID"])),
         sep=";")
    
    route_groups = quick_group(df_line, 'ROUTEID')
    
    if args["n"]:
        stops = get_stop_dict()

    json_dict = {}

    for route in route_groups:
        x = route.sort_values(by=['TRIPID', 'PROGRNUMBER'], ascending=True)

        ### get trip with most stops for each route ###
        ms_trip = get_ms_trip(x)

        route_id = x['ROUTEID'].unique()[0]
        json_dict[route_id] = []
        stop_ids = x[x["TRIPID"] == ms_trip]['STOPPOINTID'].unique()

        for sid in stop_ids:
            try:
                if args["n"]:
                    json_dict[route_id].append((str(sid), stops[sid]))
                else:
                    json_dict[route_id].append(str(sid))
            except Exception as e:
                json_dict[route_id].append(None)

    with open(outfile, 'w') as f:
        f.write(json.dumps(json_dict))

args = parse_clargs()
data_dir = '/home/student/dublink_bus/text_data/'
outfile = os.path.join(data_dir , 'routemaps/' + args["lineID"] + '_routemap.json')

if os.path.exists(outfile):
    resp = input("WARNING: A routemap for the specified line already exists - do you want to overwrite it? (y/n): ")
    if resp not in ['Y', 'y']:
        print("Exiting...")
        sys.exit(0)

map_routes(args, data_dir, outfile)
