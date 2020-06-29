from django.contrib import admin
from django.urls import path
from . import views
from users import views as user_views
from django.contrib.auth import views as auth_views

urlpatterns = [
	path('', views.index, name="home"),
	path('register/', user_views.register, name='register'),
	path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(template_name='users/logout.html'), name='logout'),
    path('profile/', user_views.profile, name='profile'),
    path('admin/', admin.site.urls),
    path('api/profile/', user_views.ProfileListCreate.as_view()),
    path('api/profile/<pk>', user_views.ProfileDetailView.as_view()),
    path('api/favstop/', user_views.FavStopListCreate.as_view()),
]