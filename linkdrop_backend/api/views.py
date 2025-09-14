from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import FileResponse
from django.http import JsonResponse
import yt_dlp
import re
import traceback
import tempfile
import os
import shutil

def health_check(request):
    return JsonResponse({"status": "ok", "message": "Backend is running!"})

class MediaView(APIView):
    def post(self, request, *args, **kwargs):
        url = request.data.get('url')
        if not url:
            return Response({'error': 'URL is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # UPDATED YDL OPTIONS
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'noplaylist': True,
                'age_limit': 99,
                'force_ip': '4',
                # Add a common User-Agent to mimic a browser request
                'http_headers': {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.5',
                },
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info_dict = ydl.extract_info(url, download=False)

            
            formats = info_dict.get('formats', [])
            preview_url = next((f.get('url') for f in formats if f.get('vcodec') != 'none' and f.get('acodec') != 'none'), None)
            
            audio_formats = sorted([f for f in formats if f.get('vcodec') == 'none' and f.get('acodec') != 'none'], key=lambda x: x.get('abr', 0) if x.get('abr') is not None else 0, reverse=True)
            preview_audio_url = audio_formats[0].get('url') if audio_formats else None
            
            best_audio_id = audio_formats[0].get('format_id') if audio_formats else None

            media_data = {
                "title": info_dict.get('title', 'No Title'),
                "duration": self.format_duration(info_dict.get('duration')),
                "thumbnail": info_dict.get('thumbnail', ''),
                "original_url": url,
                "preview_url": preview_url,
                "preview_audio_url": preview_audio_url,
                "formats": self.extract_formats(formats),
                "best_audio_id": best_audio_id,
            }
            return Response(media_data, status=status.HTTP_200_OK)

        except yt_dlp.utils.DownloadError as e:
            error_message = self.clean_error_message(str(e))
            print(f"yt-dlp download error: {error_message}")
            return Response({'error': f'Could not process the URL: {error_message}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            traceback.print_exc()
            return Response({'error': 'An unexpected server error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

   
    def format_duration(self, seconds):
        if not seconds: return "N/A"
        try:
            seconds = int(seconds)
            minutes, seconds = divmod(seconds, 60)
            hours, minutes = divmod(minutes, 60)
            return f"{hours:d}:{minutes:02d}:{seconds:02d}" if hours > 0 else f"{minutes:02d}:{seconds:02d}"
        except (ValueError, TypeError):
            return "N/A"

    def get_resolution_sort_key(self, f):
        quality = f.get('quality') or f.get('format_note', '')
        if isinstance(quality, str):
            match = re.search(r'(\d+)p', quality)
            if match:
                return int(match.group(1))
        return 0

    def format_filesize(self, size_in_bytes):
        if not size_in_bytes: return "N/A"
        try:
            size_in_bytes = int(size_in_bytes)
            if size_in_bytes < 1024 * 1024: return f"{size_in_bytes / 1024:.2f} KB"
            if size_in_bytes < 1024 * 1024 * 1024: return f"{size_in_bytes / (1024 * 1024):.2f} MB"
            return f"{size_in_bytes / (1024 * 1024 * 1024):.2f} GB"
        except (ValueError, TypeError):
            return "N/A"

    def extract_formats(self, formats):
        video_formats, audio_formats = [], []
        for f in formats:
            filesize = self.format_filesize(f.get('filesize') or f.get('filesize_approx'))
            
            if f.get('vcodec') != 'none' and f.get('ext') == 'mp4' and f.get('url'):
                video_formats.append({
                    "format_id": f.get('format_id'), "format": f.get('ext'), "quality": f.get('format_note', f.get('resolution')),
                    "size": filesize, "url": f.get('url'), "aspect": f"{f.get('width')}:{f.get('height')}" if f.get('width') and f.get('height') else "N/A",
                })
            elif f.get('vcodec') == 'none' and f.get('acodec') != 'none' and f.get('ext') in ['m4a', 'mp3'] and f.get('url'):
                 audio_formats.append({
                    "format_id": f.get('format_id'), "format": f.get('ext'), "quality": f.get('format_note') or f"{f.get('abr', 0)}k",
                    "size": filesize, "url": f.get('url'), "abr": f.get('abr')
                 })

        seen_qualities = set()
        unique_video_formats = []
        video_formats.sort(key=self.get_resolution_sort_key, reverse=True)
        for f in video_formats:
            quality = f.get('quality')
            if quality and quality not in seen_qualities:
                unique_video_formats.append(f)
                seen_qualities.add(quality)
        
        audio_formats.sort(key=lambda x: x.get('abr', 0) if x.get('abr') is not None else 0, reverse=True)
        return {"audio": audio_formats, "video": unique_video_formats}
    
    def clean_error_message(self, error_text):
        match = re.search(r'ERROR: (.*)', error_text)
        return match.group(1).strip().split(';')[0] if match else "Could not process this URL."


class MediaDownloadView(APIView):
    def post(self, request, *args, **kwargs):
        original_url = request.data.get('original_url')
        video_format_id = request.data.get('video_format_id')
        audio_format_id = request.data.get('audio_format_id')
        filename = request.data.get('filename', 'download.mp4')

        if not all([original_url, video_format_id, audio_format_id]):
            return Response({'error': 'Missing required parameters'}, status=status.HTTP_400_BAD_REQUEST)

        temp_dir = tempfile.mkdtemp()
        temp_file_path = os.path.join(temp_dir, "media")

        
        ydl_opts = {
            'format': f'{video_format_id}+{audio_format_id}',
            'outtmpl': temp_file_path,
            'merge_output_format': 'mp4',
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([original_url])
            
            final_filepath = temp_file_path + ".mp4"

            if os.path.exists(final_filepath):
                response = FileResponse(open(final_filepath, 'rb'), as_attachment=True, filename=filename)
                response.closed = lambda: shutil.rmtree(temp_dir)
                return response
            else:
                shutil.rmtree(temp_dir)
                return Response({'error': 'File could not be created on the server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            shutil.rmtree(temp_dir)
            traceback.print_exc()
            return Response({'error': 'Failed to download or process the media.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)