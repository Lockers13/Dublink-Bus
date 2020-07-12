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
from dir_api_resp import process_resp


class RouteMapView(generics.RetrieveAPIView):
    def get(self, request):
        lineid = request.query_params.get('lineid')
        start_stop = int(request.query_params.get('start'))
        end_stop = int(request.query_params.get('end'))
        routeID = request.query_params.get('routeid')
        url = staticfiles_storage.url('json/routemaps/{}_routemap.json'.format(lineid))
        with open(settings.BASE_DIR + url) as f:
                linemap = json.loads(f.read())
        routemap = linemap[routeID]
        on_route = False
        data = []

        for stop in routemap:
            try:
                if stop["id"] == start_stop:
                    on_route = True
                if on_route:
                    data.append(stop) 
                if stop["id"] == end_stop:
                    on_route = False
            except:
                pass

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

        addr_suffix = ",Dublin,Ireland"
        start_addr = request.query_params.get('start_addr') + addr_suffix
        end_addr = request.query_params.get('end_addr') + addr_suffix
        api_url = "https://maps.googleapis.com/maps/api/directions/" + \
            "json?origin={0}&destination={1}&alternatives=true&mode=transit&key={2}".format(
                start_addr, end_addr, os.environ.get('DIR_API_KEY'))

        try:
            res = requests.get(api_url)
        except Exception as e:
            error_data = "ERROR, problem with google API"
            return Response(error_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        json_resp = json.loads(res.text)

        try:
            routes = json_resp['routes']
            x = routes[0]
        except IndexError:
            error_data = "ERROR, no routes found"
            return Response(error_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        data = process_resp(routes)

        return Response(data, status=status.HTTP_200_OK)