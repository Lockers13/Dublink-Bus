from django.shortcuts import render
from users.models import FavStop

def index(request):

	current_user = request.user.id

	context = {'component': 'app', 'title': 'Dublin Bus | Home', 'current_user': current_user}

	return render(request, 'index.html', context)