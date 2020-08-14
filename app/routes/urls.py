from django.urls import path, include
from app import views as index_views
from . import views as route_views

urlpatterns = [
	path('api/routemaps/', route_views.RouteMapView.as_view(), name="routemap"),
	path('api/predict/', route_views.RoutePredictView.as_view(), name="routes"),
	path('api/find_route/', route_views.RouteFindView.as_view(), name="find_route"),
	path('api/get_weather/', route_views.WeatherRetrieveView.as_view(), name="get_weather"),
	path('api/realtime/', route_views.RealTimeInfoView.as_view(), name="realTime"),
	path('api/find_nearest/', route_views.NearestStopView.as_view(), name='find_nearest')
]