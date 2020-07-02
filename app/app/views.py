from django.shortcuts import render
from users.models import FavStop

def index(request):

	if request.user.id:
		current_user = request.user.id
	else:
		current_user = 00

	context = {'component': 'app', 'title': 'Dublin Bus | Home', 'current_user': current_user}

	return render(request, 'index.html', context)