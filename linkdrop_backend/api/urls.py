from django.urls import path
from .views import MediaView, MediaDownloadView, health_check

urlpatterns = [
    path('', health_check, name='health_check'),
    path('media/', MediaView.as_view(), name='media_info'),
    path('download/', MediaDownloadView.as_view(), name='media_download'), 
]