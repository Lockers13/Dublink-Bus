from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import UserRegisterForm, UserUpdateForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Profile, FavStop, FavAddress, PlannedJourney
from .serializers import ProfileSerializer, FavStopSerializer, FavAddressSerializer, PlannedJourneySerializer
from rest_framework import generics
from rest_framework.views import APIView


def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}!')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'users/register.html', {'form': form})


@login_required
def profile(request):
    if request.method == 'POST':
        u_form = UserUpdateForm(request.POST, instance=request.user)
        if u_form.is_valid():
            u_form.save()    
            messages.success(request, 'User profile has been updated!')
            return redirect('profile')
        else:
            messages.warning(request, 'Error: Username already exists, please use another username')
            return redirect('profile')
    else:
        #Need to instantiate the forms
        u_form = UserUpdateForm(instance=request.user)

        #Then add the forms to the context
        context = {
                'u_form' : u_form
        }
        return render(request, 'users/profile.html', context)

class ProfileListCreate(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

#Used with primary key to retrieve individual profile details
class ProfileDetailView(generics.RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

class FavStopListCreate(generics.ListAPIView):
    #This view has been modified so no primary key is necessary in the url
    #Only want to ever get stops for current user
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return FavStop.objects.filter(user=user)
    serializer_class = FavStopSerializer

class FavStopDetailView(generics.RetrieveAPIView):
    queryset = FavStop.objects.all()
    serializer_class = FavStopSerializer

#Allows us to create new favourite stops
class FavStopCreateView(generics.CreateAPIView):
    queryset = FavStop.objects.all()
    serializer_class = FavStopSerializer

#Will be used to unfavorite a stops
class FavStopDeleteView(generics.DestroyAPIView):
    queryset = FavStop.objects.all()
    serializer_class = FavStopSerializer


#Same technique for favouriteAddresses as favouriteStops

class FavAddressListCreate(generics.ListAPIView):
    #This view has been modified so no primary key is necessary in the url
    #Only want to ever get stops for current user
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return FavAddress.objects.filter(user=user)
    serializer_class = FavAddressSerializer

class FavAddressDetailView(generics.RetrieveAPIView):
    queryset = FavAddress.objects.all()
    serializer_class = FavAddressSerializer

#Allows us to create new favourite stops
class FavAddressCreateView(generics.CreateAPIView):
    queryset = FavAddress.objects.all()
    serializer_class = FavAddressSerializer

#Will be used to unfavorite a stops
class FavAddressDeleteView(generics.DestroyAPIView):
    queryset = FavAddress.objects.all()
    serializer_class = FavAddressSerializer


#Same technique for plannedJourneys as FavAddresses

class PlannedJourneyListCreate(generics.ListAPIView):
    #This view has been modified so no primary key is necessary in the url
    #Only want to ever get stops for current user
    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            return PlannedJourney.objects.filter(user=user)
    serializer_class = PlannedJourneySerializer

class PlannedJourneyDetailView(generics.RetrieveAPIView):
    queryset = PlannedJourney.objects.all()
    serializer_class = PlannedJourneySerializer

class PlannedJourneyCreateView(generics.CreateAPIView):
    queryset = PlannedJourney.objects.all()
    serializer_class = PlannedJourneySerializer

class PlannedJourneyDeleteView(generics.DestroyAPIView):
    queryset = PlannedJourney.objects.all()
    serializer_class = PlannedJourneySerializer