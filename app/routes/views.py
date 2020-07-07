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
