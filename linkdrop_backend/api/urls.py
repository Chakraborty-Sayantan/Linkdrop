from django.urls import path
from .views import MediaView, MediaDownloadView

urlpatterns = [
    path('media/', MediaView.as_view(), name='media_info'),
    path('download/', MediaDownloadView.as_view(), name='media_download'), 
]