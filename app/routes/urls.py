from django.urls import path, include
from app import views as index_views
from . import views as route_views

urlpatterns = [
	path('api/routemaps/<line_id>/', route_views.RouteMapView.as_view(), name="routemap"),
]