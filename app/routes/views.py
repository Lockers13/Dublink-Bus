from django.shortcuts import render
from rest_framework import generics
from rest_framework.views import APIView
from . import forms as route_forms
import os
import os.path
import json
from rest_framework import status
from rest_framework.response import Response

# Create your views here.

class RouteMapView(generics.RetrieveAPIView):
    def get(self, request, line_id):
        with open(os.path.join(
            os.environ.get('HOME'),
             'comp_msc/dublink_bus/routemaps/46A_routemap.json')) as f:
                data = json.loads(f.read())
        return Response(data, status=status.HTTP_200_OK)

#Will be used to unfavorite a stops
#class RouteCoords(generics.DestroyAPIView):
    

