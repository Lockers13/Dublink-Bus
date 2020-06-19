from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import UserRegisterForm, UserUpdateForm
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User


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

