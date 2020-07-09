# Note - return code meaning: 0 signifies sucess; 1 signifies that no matching route could be found;
# and 2 signifies that we have no route data for the provided line

import json
import os 
import sys
import os.path

def validate_route(start_stop, end_stop, line_id):
    
    def check_stop(stop, stoppoint, interpolate):
        if interpolate:
            for i in stoppoint:
                if stop["name"].find(i) == 0:
                    return True, stop["id"]
        else:
            if stop["id"] == stoppoint:
                return True, stoppoint
            

    def validate(start_stop, end_stop, line_id, interpolate1, interpolate2):
        json_file = '/Users/lconroy/comp_msc/dublink_bus/DB_webapp/app/static/json/routemaps/{0}_routemap.json'.format(line_id)
    
        if not os.path.exists(json_file):
            return 2, None, None

        valid_routes = {}

        with open(json_file, 'r') as f:
            routemap = json.loads(f.read())

        for route in routemap:
            start_found = False
            end_found = False
            stop_list = routemap[route]
            idx1 = 0
            for stop in stop_list:
                try: 
                    start_found, start_stop = check_stop(stop, start_stop, interpolate1)
                    if start_found:
                        break
                except:
                    pass
                finally:
                    idx1 += 1

            for idx2 in range(idx1+1, len(stop_list)):
                try:
                    end_found, end_stop = check_stop(stop_list[idx2], end_stop, interpolate2)
                    if end_found:
                        break
                except:
                    pass

            if start_found and end_found:
                return 0, start_stop, end_stop

        return 1, None, None

    interpolate1=False
    interpolate2=False

    try:
        start_stop = [int(x) for x in start_stop.split() if x.isdigit()][0]
    except:
        start_stop = start_stop.split(" ")
        interpolate1 = True
        
    try:
        end_stop = [int(x) for x in end_stop.split() if x.isdigit()][0]
    except:
        end_stop = end_stop.split(" ")
        interpolate2 = True
        
    return validate(start_stop, end_stop, line_id, interpolate1, interpolate2)
