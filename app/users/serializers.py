from rest_framework import serializers
from .models import Profile, FavStop

class ProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = Profile
		fields = ('user','co2points')

class FavStopSerializer(serializers.ModelSerializer):
	
	current_user = serializers.SerializerMethodField('_user')

    # Use this method for the custom field
	def _user(self, obj):
		request = getattr(self.context, 'request', None)
		if request:
			return request.user

	class Meta:
		model = FavStop
		fields = ('name','stopid','user','current_user')

