from route_validator import validate_route

def process_resp(routes, dt, option):        
    data = {}
    count_route = 1

    for route in routes:
        if count_route > 3:
            break
            
        route_key = "Route_" + str(count_route)
        data[route_key] = {}
        other_transit = False

        count_step = 1
        steps = route['legs'][0]['steps']
        bus_journeys = 0
        valid_routes = 0
        for step in steps:
            step_key = "Step_" + str(count_step)
            data[route_key][step_key] = {}
            try:
                transit_details = step['transit_details']
                if transit_details['line']['vehicle']['type'] == 'BUS':
                    bus_journeys += 1
                    dep_name = str(transit_details['departure_stop']["name"])
                    arr_name = str(transit_details['arrival_stop']["name"])
                    data[route_key][step_key]["Instructions"] = step['html_instructions']
                    data[route_key][step_key]["Departure Stop"] = transit_details['departure_stop']
                    data[route_key][step_key]["Arrival Stop"] = transit_details['arrival_stop']
                    data[route_key][step_key]["Departure Stop Name"] = dep_name
                    data[route_key][step_key]["Arrival Stop Name"] = arr_name
                    data[route_key][step_key]["Line"] = transit_details['line']['short_name'].upper()
                    data[route_key][step_key]["Num Stops"] = transit_details['num_stops']
                    data[route_key][step_key]["Departure Time"] = transit_details['departure_time']["text"]
                    data[route_key][step_key]["Arrival Time"] = transit_details['arrival_time']["text"]
                    route_validation = validate_route(
                        transit_details['departure_stop'],
                        transit_details['arrival_stop'],
                        transit_details['line']["short_name"].upper())
                    data[route_key][step_key]["Route Validation"] = route_validation

                    if route_validation["Status code"] == 0:
                        valid_routes += 1
                else:
                    other_transit = True

            except Exception as e:
                data[route_key][step_key]["Instructions"] = step['html_instructions']   
            finally:
                count_step += 1

        data[route_key]["routable"] = "b" if valid_routes == bus_journeys and bus_journeys != 0 \
            and not other_transit else "w" if valid_routes > 0 and bus_journeys == 0 and not other_transit \
            else "n"
        
        data[route_key]["schedule"] = {"datetime": dt, "option": option}
            
        count_route += 1

    return data