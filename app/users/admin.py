from django.contrib import admin
from .models import Profile, FavStop, FavAddress, PlannedJourney

admin.site.register(Profile)
admin.site.register(FavStop)
admin.site.register(FavAddress)
admin.site.register(PlannedJourney)
