from route_validator import validate_route

def process_resp(routes):        
    data = {}
    count_route = 1

    for route in routes:
        if count_route > 3:
            break
            
        route_key = "Route_" + str(count_route)
        data[route_key] = {}

        count_step = 1
        steps = route['legs'][0]['steps']

        for step in steps:
            step_key = "Step_" + str(count_step)
            data[route_key][step_key] = []
            try:
                transit_details = step['transit_details']
                if transit_details['line']['vehicle']['type'] == 'BUS':
                    data[route_key][step_key].append({"Instructions": step['html_instructions']})
                    data[route_key][step_key].append({"Departure Stop": transit_details['departure_stop']})
                    data[route_key][step_key].append({"Arrival Stop": transit_details['arrival_stop']})
                    data[route_key][step_key].append({"Line": transit_details['line']['short_name']})
                    data[route_key][step_key].append({"Num Stops": transit_details['num_stops']})
                    data[route_key][step_key].append({"Route validation": validate_route(
                        transit_details['departure_stop'],
                        transit_details['arrival_stop'],
                        transit_details['line']["short_name"].upper())})
            except Exception as e:
                data[route_key][step_key].append({"Instructions": step['html_instructions']})
                print(str(e))     
            finally:
                count_step += 1
        count_route += 1

    return data