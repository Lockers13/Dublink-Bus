from django.shortcuts import render
from users.models import FavStop
from routes.forms import RouteForm
import datetime
import requests
import json
import os

def index(request):
	schedule_times = []
	api_key = os.environ.get('DIR_API_KEY')

	if request.user.id:
		current_user = request.user.id
	else:
		current_user = 00

	# if request.method == "POST":
	# 	form = RouteForm(request.POST)
	# 	if form.is_valid():
	# 		start_stop = form.cleaned_data['origin']
	# 		end_stop = form.cleaned_data['destination']
	# 		date = form.cleaned_data['date'] 
	# 		hour = form.cleaned_data['time'].split(":")[0]
	# 		date_time = datetime.datetime.strptime(date, '%Y-%m-%d')
	# 		route = "16"
	# 		start_stop = "12"
			

	# 		r = requests.get(
	# 			'https://data.smartdublin.ie/cgi-bin/rtpi/timetableinformation?type=day&stopid={0}&routeid={1}&datetime={2}'.
	# 			format(start_stop, route, date_time))

	# 		json_resp = json.loads(r.text)
	# 		for i in json_resp['results']:
	# 			if i['arrivaldatetime'].split(" ")[1].startswith(hour):
	# 				schedule_times.append(i['arrivaldatetime'].split(" ")[1])

	form = RouteForm(initial={'origin': 'Newcastle Manor',
								'destination': 'Clutterland',
								'date': '2020-07-09',
								'time': '17:00',
								'line': '68'})
	
	context = {'component': 'app',
				'title': 'Dublin Bus | Home',
				'current_user': current_user,
				'form': form,
				'schedule_times': schedule_times,
				'key': api_key}


	return render(request, 'index.html', context)