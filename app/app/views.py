from django.shortcuts import render

names = ["Ronan", "Lorcan", "Xi", "Aji"]

def index(request):

	context = {'component': 'app', 'title': 'Dublin Bus | Home', 'names': names}

	return render(request, 'index.html', context)