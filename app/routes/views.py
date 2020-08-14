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
from predictor import get_prediction
import sys
import requests
from dir_api_resp import process_resp
from sqlalchemy import create_engine, event
import pymysql
from sqlalchemy.sql import text
#import datetime
from datetime import datetime
from ast import literal_eval
from euclidean_dist import lat_long_prox
from app import settings

class NearestStopView(generics.RetrieveAPIView):
    queryset = ''

    def get(self, request):
 
        latitude = round(float(request.query_params.get('lat')), 10)
        longitude = round(float(request.query_params.get('long')), 10)
     
        #path = "/Users/lconroy/comp_msc/dublink_bus/clusters/backend_cluster_dict.json"
        #path = "C:\\Users\\rbyrn\\Desktop\\clusters\\backend_cluster_dict.json"
        path = os.path.join(settings.BASE_DIR, 'backend_data_store', 'clusters', 'backend_cluster_dict.json')

        with open(path, 'r') as f:
            cluster_dict = json.loads(f.read())

        cluster_keys = [literal_eval(s) for s in cluster_dict.keys()]
        cluster_dists = {}

        for i in cluster_keys:
            cluster_dists[str(i)] = lat_long_prox(latitude, longitude, i[0], i[1])

        cluster_dists = {k: v for k, v in sorted(cluster_dists.items(), key=lambda item: item[1])}

        nearest_stops = {}

        for i in cluster_dict[list(cluster_dists.keys())[0]]:
            nearest_stops[str(i)] = lat_long_prox(latitude, longitude, i[0], i[1])

        nearest_stops = {k: v for k, v in sorted(nearest_stops.items(), key=lambda item: item[1])}
        nearest_stop_keys = list(nearest_stops.keys())

        with open(os.path.join(settings.BASE_DIR, 'backend_data_store', 'clusters', 'stops_latlong.json'), 'r') as g:
        #with open('C:\\Users\\rbyrn\\Desktop\\clusters\\stops_latlong.json', 'r') as g:
            stops_latlong = json.loads(g.read())

        nearest_stop_list = []
        for i in nearest_stop_keys[:10]:
            nearest_stop_list.append(stops_latlong[i])

        return Response(nearest_stop_list, status=status.HTTP_200_OK)

class RouteMapView(generics.RetrieveAPIView):
    queryset = ''

    def get(self, request):
        lineid = request.query_params.get('lineid')
        start_stop = int(request.query_params.get('start'))
        end_stop = int(request.query_params.get('end'))
        routeID = request.query_params.get('routeid')
        url = os.path.join('backend_data_store', 'routemaps', '{}_routemap.json'.format(lineid))
        with open(os.path.join(settings.BASE_DIR, url), 'r') as f:
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
        #data_dir = '/Users/lconroy/comp_msc/dublink_bus/final_models'
        #data_dir = 'C:\\Users\\rbyrn\\Desktop\\dublinbus\\app\\model_integration'
        data_dir = os.path.join(settings.BASE_DIR, 'backend_data_store', 'final_models')

        lineid = request.query_params.get('lineid').upper()
        routeid = request.query_params.get('routeid')
        start_stop = request.query_params.get('start_stop')
        end_stop = request.query_params.get('end_stop')
        time_secs = request.query_params.get('time_secs')
        dow = request.query_params.get('dow')
        rain = request.query_params.get('rain')
        temp = request.query_params.get('temp')
        clouds = request.query_params.get('clouds')
        feels_like = request.query_params.get('feels_like')
        main = request.query_params.get('main')

        try:
            model_pickle = os.path.join(data_dir, 'pickle_file_XG_03082020', 'XG_{}.pkl'.format(lineid))
            #model_pickle = os.path.join(data_dir, 'pickle_file\\XG_{}.pkl'.format(lineid))
            model = joblib.load(open(model_pickle, 'rb'))
        except Exception as e:
            print(e)
            return Response("ERROR: incorrect file structure", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        #direction = 0
        #with open(os.path.join(data_dir,'stop_sequence/stop_{0}.csv'.format(lineid)), 'r') as f:
         #   for line in f:
          #      if line.split(",")[1] == routeid:
           #         direction = line.split(",")[2]
            #        break
        #if direction == 0:
         #   return Response("ERROR: cannot get direction", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        m_args = {
            'lineid': lineid,
            'start_stop': start_stop,
            'end_stop': end_stop,
            'time_secs': time_secs,
            'dow': dow,
            'holiday': "0",
            'temp': temp,
            'feels_like': feels_like,
            'clouds_all': clouds,
            'weather_main': main
        }

        data = {}
        data["journey_info"] = get_prediction(model, m_args, data_dir)

        if "error" in data["journey_info"].keys():
            if data["journey_info"]["error"] == "file structure error":
                return Response("ERROR IN FILE STRUCTURE", status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response("ERROR IN MODEL", status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(data, status=status.HTTP_200_OK)


class RouteFindView(generics.RetrieveAPIView):
    def get(self, request):   
        def bin_duplicates(data):
            route_bin = []
            seen_routes = []

            for route in data:
                sorted_route_string = sorted(json.dumps(data[route]))
                if sorted_route_string in seen_routes:
                    route_bin.append(route)
                seen_routes.append(sorted_route_string)

            for route in route_bin:
                del data[route]
            
            return data

        addr_suffix = ",Dublin,Ireland"
        start_addr = request.query_params.get('start_addr') + addr_suffix
        end_addr = request.query_params.get('end_addr') + addr_suffix
        dt = request.query_params.get('dt')
        option = request.query_params.get('option')
        option = "departure_time" if option == "depart_at" else "arrival_time"

        dt_epoch = int(datetime.timestamp(datetime.strptime(dt, "%d/%m/%Y %H:%M:%S")))

        api_url = "https://maps.googleapis.com/maps/api/directions/json?origin={0}&destination={1}&{2}={3}&alternatives=true&mode=transit&key=AIzaSyBTqQ5XI6Z3N5j26PNXbFKUxUFfq8dnGV8".format(start_addr, end_addr, option, dt_epoch)

        

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

        data = process_resp(routes, dt, option)

        data = bin_duplicates(data)

        return Response(data, status=status.HTTP_200_OK)


class RealTimeInfoView(generics.RetrieveAPIView):
    def get(self, request):

        stopid = request.query_params.get('stopid')

        print("StopID searched for is:", stopid)

        api_url = "https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation?stopid=" + stopid + "&format=json"

        try:
            res = requests.get(api_url)
        except Exception as e:
            error_data = "ERROR, problem with Real Time API"
            return Response(error_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        json_resp = json.loads(res.text)

        return Response(json_resp, status=status.HTTP_200_OK)

class WeatherRetrieveView(generics.RetrieveAPIView):
    def get(self, request):

        datetimestr = request.query_params.get('datetime')
        datetimestr1 = datetimestr.split(" ")[0]
        datetimestr2 = datetimestr.split(" ")[1]
        try:
            datetimestr = datetime.strptime(datetimestr1, '%d/%m/%Y').strftime('%Y-%m-%d') + " " + datetimestr2
        except ValueError:
            pass
         # change os.environ.get('DB_PWD') if API returns "error problem with DB cnx"
        try:
            cnx = create_engine('mysql+pymysql://root:' + os.environ.get('DB_PWD') + '@localhost:3307/dublin_bus') 
        except:
            error_data = "ERROR, problem with DB cnx"
            return Response(error_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        with cnx.connect() as connection:
            try:
                stmt1 = text("SELECT * FROM hourly_weather WHERE datetime = :dt")
                stmt1 = stmt1.bindparams(dt=str(datetimestr))
                hourly_weather = connection.execute(stmt1).fetchall()
            except Exception as e:
                print("Hourly error:", str(e))
            try:
                stmt2 = text("SELECT * FROM daily_weather WHERE datetime = :dt")
                stmt2 = stmt2.bindparams(dt=str(datetimestr.split(" ")[0] + " 12:00:00"))
                daily_weather = connection.execute(stmt2).fetchall()
            except Exception as e:
                print("Daily error:", str(e))
        
        return Response({"hourly_weather": hourly_weather, "daily_weather": daily_weather}, status=status.HTTP_200_OK)
















