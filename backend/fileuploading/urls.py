from django.urls import path
from . import views
from .views import upload_file

urlpatterns = [
    path('', views.upload_file, name='upload_home'),  # Adjusted to use upload_file view for the root URL
    path('upload/', views.upload_file, name='upload_file'),
    path('success-url/', views.upload_success, name='upload_success'),  # New success URL
    path('api/upload/', upload_file, name='file-upload'),
]
