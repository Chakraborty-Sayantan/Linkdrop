from django.urls import path
from .views import MediaView, MediaDownloadView # Import the new view

urlpatterns = [
    path('media/', MediaView.as_view(), name='media_info'),
    path('download/', MediaDownloadView.as_view(), name='media_download'), # Add this new line
]