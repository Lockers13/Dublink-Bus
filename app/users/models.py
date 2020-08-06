from django.db import models
from django.db import models
from django.contrib.auth.models import User


class Profile (models.Model):
	user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
	co2points = models.IntegerField(default=0)

	def __str__(self):
		return f'{self.user.username} profile'

class FavStop (models.Model):
	name = models.CharField(max_length = 100)
	stopid = models.IntegerField(primary_key=True)
	user = models.ForeignKey(User, on_delete=models.CASCADE)

	def __str__(self):
		return self.name

class FavAddress (models.Model):
	name = models.CharField(max_length = 100)
	address = models.TextField()
	user = models.ForeignKey(User, on_delete=models.CASCADE)

	def __str__(self):
		return self.name

class PlannedJourney (models.Model):
	name = models.CharField(max_length = 100)
	routeObject = models.TextField()
	user = models.ForeignKey(User, on_delete=models.CASCADE)

	def __str__(self):
		return self.name

