from django.shortcuts import render
from rest_framework import generics
from rest_framework.views import APIView
from . import forms as route_forms
import os
import os.path
import json
from rest_framework import status
from rest_framework.response import Response
from django.contrib.staticfiles.storage import staticfiles_storage
from django.conf import settings
import pandas as pd
import joblib 
from predict_route import get_prediction
import sys
import requests



class RouteMapView(generics.RetrieveAPIView):
    def get(self, request):
        url = staticfiles_storage.url('json/routemaps/{}_routemap.json'.format(
            request.query_params.get('lineid')))
        with open(settings.BASE_DIR + url) as f:
                data = json.loads(f.read())
        return Response(data, status=status.HTTP_200_OK)


class RoutePredictView(generics.RetrieveAPIView):

    def get(self, request):
        data_dir = settings.BASE_DIR + staticfiles_storage.url('models/model_applying')
        model_pickle = os.path.join(data_dir, 'LR_{}_model.pkl'.format(request.query_params.get('lineid')))
        model = joblib.load(open(model_pickle, 'rb'))
        m_args = {
            'lineid': request.query_params.get('lineid'),
            'start_stop': "3400",
            'end_stop': "3412",
            'direction': "2",
            'time_secs': "60000",
            'dow': "4",
            'holiday': "0",
            'rain': "0.0",
            'temp': "9.5",
            'vp': "10.6",
            'rh': "89.0"
        }

        data = {}
        data["journey_info"] = get_prediction(model, m_args, data_dir)

        return Response(data, status=status.HTTP_200_OK)


class RouteFindView(generics.RetrieveAPIView):
    def get(self, request):
        
        data = {}
        addr_suffix = ",Dublin,Ireland"
        start_addr = request.query_params.get('start_addr') + addr_suffix
        end_addr = request.query_params.get('end_addr') + addr_suffix
        api_url = "https://maps.googleapis.com/maps/api/directions/" + \
            "json?origin={0}&destination={1}&alternatives=true&mode=transit&key={2}".format(
                start_addr, end_addr, os.environ.get('DIR_API_KEY'))

        try:
            res = requests.get(api_url)
        except Exception as e:
            print("ERROR, problem with google API request")

        json_resp = json.loads(res.text)

        try:
            routes = json_resp['routes']
            x = routes[0]
        except IndexError:
            print("ERROR, no routes available")
       
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
                except Exception as e:
                    data[route_key][step_key].append({"Instructions": step['html_instructions']})     
                finally:
                    count_step += 1
            count_route += 1

            

        return Response(data, status=status.HTTP_200_OK)