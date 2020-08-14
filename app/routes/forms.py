from django import forms

class RouteForm(forms.Form):
    origin = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Origin'}))
    destination = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Destination'}))
    date = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Date'}))
    time = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Time'}))
    line = forms.CharField(widget=forms.TextInput(attrs={'placeholder': 'Line'}))
    