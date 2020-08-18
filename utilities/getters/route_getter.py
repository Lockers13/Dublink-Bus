import json
import os 
import sys
import os.path

def find_routes(start_stop, end_stop, routemap):
    valid_routes = {}

    for route in routemap:
        start_found = False
        end_found = False
        stop_list = routemap[route]
        idx1 = 0
        for stop in stop_list:
            if stop == start_stop:
                start_found = True
                break
            idx1 += 1
        for idx2 in range(idx1+1, len(stop_list)):
            if stop_list[idx2] == end_stop:
                end_found = True
                break

        if start_found and end_found:
            valid_routes[route] = ""
    return valid_routes

line_id = str(input("Please enter desired lineID: "))
start_stop = str(input("Please enter start stop: "))
end_stop = str(input("Please enter end stop: "))

json_file = '/home/student/dublink_bus/text_data/routemaps/{0}_routemap.json'.format(line_id)

if not os.path.exists(json_file):
    print("Oops! Could not locate a corresponding routemap: exiting...")
    sys.exit(1)

with open(json_file, 'r') as f:
    routemap = json.loads(f.read())

valid_routes = find_routes(start_stop, end_stop, routemap)

start_stop, end_stop = end_stop, start_stop

valid_routes_rev = find_routes(start_stop, end_stop, routemap)

if valid_routes.keys() or valid_routes_rev.keys():
    if valid_routes.keys():
        print("The following routes can be used to make this journey on line {0}:\n{1}\n".
            format(line_id, list(valid_routes.keys())))
    if valid_routes_rev.keys():
        print("The following routes can be used to make this journey on line {0}...but in reverse:\n{1}".
            format(line_id, list(valid_routes_rev.keys())))
else:
    print("Sorry, there is no route on this line serving the two provided stops.")
