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



class RouteMapView(generics.RetrieveAPIView):
    def get(self, request):
        url = staticfiles_storage.url('json/routemaps/{}_routemap.json'.format(
            request.query_params.get('lineid')))
        with open(settings.BASE_DIR + url) as f:
                data = json.loads(f.read())
        return Response(data, status=status.HTTP_200_OK)


    

