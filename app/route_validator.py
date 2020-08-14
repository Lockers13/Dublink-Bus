# Note - return code meaning: 0 signifies sucess; 1 signifies that no matching route could be found;
# and 2 signifies that we have no route data for the provided line

import json
import os 
import sys
import os.path
from app import settings

def validate_route(start_stop, end_stop, line_id):
    def measure_coord_prox(stop, stoppoint):
        lat_diff = abs(stop["lat"] - stoppoint["location"]["lat"])
        long_diff = abs(stop["long"] - stoppoint["location"]["lng"])
        #print(lat_diff, long_diff)
        if lat_diff < .001 and long_diff < .001:
            return True
        return False

    
    def check_stop(stop, stoppoint, interpolate):
        if interpolate:
            if measure_coord_prox(stop, stoppoint):
                return True, stop["id"]
            return False, stoppoint
        else:
            #print(stop["id"], stoppoint["name"])
            if stop["id"] == stoppoint["name"]:
                return True, stoppoint["name"]
            return False, stoppoint
            

    def validate(start_stop, end_stop, line_id, interpolate1, interpolate2):
        #json_file = '/Users/lconroy/comp_msc/dublink_bus/DB_webapp/app/static/json/routemaps/{0}_routemap.json'.format(line_id)
        #json_file = 'C:\\Users\\rbyrn\\Desktop\\dublinbus\\app\\static\\json\\routemaps\\{0}_routemap.json'.format(line_id)
        json_file = os.path.join(settings.BASE_DIR, 'backend_data_store', 'routemaps', '{0}_routemap.json'.format(line_id))
        if not os.path.exists(json_file):
            return {"Status code": 2, "Start_stop": None,
                        "End stop": None, "Route ID": None}

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
                    start_found, new_start_stop = check_stop(stop, start_stop, interpolate1)
                    if start_found:
                        break
                except:
                    pass
                finally:
                    idx1 += 1

            for idx2 in range(idx1+1, len(stop_list)):
                try:
                    end_found, new_end_stop = check_stop(stop_list[idx2], end_stop, interpolate2)
                    if end_found:
                        break
                except:
                    pass

            if start_found and end_found:
                return {"Status code": 0, "Start_stop": new_start_stop,
                        "End stop": new_end_stop, "Route ID": route}

        return {"Status code": 1, "Start_stop": None,
                        "End stop": None, "Route ID": None}

    interpolate1=False
    interpolate2=False

    try:
        start_stop["name"] = [int(x) for x in start_stop["name"].split() if x.isdigit()][0]
    except:
        interpolate1 = True
        
    try:
        end_stop["name"] = [int(x) for x in end_stop["name"].split() if x.isdigit()][0]
    except:
        interpolate2 = True

    return validate(start_stop, end_stop, line_id, interpolate1, interpolate2)