import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Edit, Play, Music, Volume2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import type { MediaData, MediaFormat, MediaProcessorProps, Metadata, TimeRange } from "@/lib/types";

// --- Sub-component for Editing Forms ---
const MediaEditor: React.FC<{
  filename: string; setFilename: (value: string) => void;
  metadata: Metadata; setMetadata: React.Dispatch<React.SetStateAction<Metadata>>;
  timeRange: TimeRange; setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
}> = ({ filename, setFilename, metadata, setMetadata, timeRange, setTimeRange }) => (
  <div className="space-y-6">
    <Card className="glass">
      <CardHeader><CardTitle className="flex items-center gap-2 truncate"><Edit className="h-5 w-5 flex-shrink-0" /> <span className="truncate">{metadata.title}</span></CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="filename">Filename</Label>
          <Input id="filename" value={filename} onChange={(e) => setFilename(e.target.value)} className="mt-1"/>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label htmlFor="start-time">Start Time</Label><Input id="start-time" value={timeRange.start} onChange={(e) => setTimeRange((prev) => ({ ...prev, start: e.target.value }))} className="mt-1"/></div>
          <div><Label htmlFor="end-time">End Time</Label><Input id="end-time" value={timeRange.end} onChange={(e) => setTimeRange((prev) => ({ ...prev, end: e.target.value }))} className="mt-1"/></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// --- Sub-component for Media Previews ---
const MediaPreview: React.FC<{ mediaData: MediaData }> = ({ mediaData }) => (
    <Card className="glass">
      <CardHeader><CardTitle className="truncate">Preview: {mediaData.title}</CardTitle></CardHeader>
      <CardContent>
        {mediaData.preview_url && <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4"><video src={mediaData.preview_url} poster={mediaData.thumbnail} className="w-full h-full object-contain" controls/></div>}
        {mediaData.preview_audio_url && <div className="flex items-center gap-4 p-3 rounded-lg bg-surface-elevated"><Music className="h-5 w-5 text-muted-foreground" /><div className="flex-grow"><p className="font-medium text-sm truncate">{mediaData.title} (Audio Preview)</p></div><audio src={mediaData.preview_audio_url} controls className="max-w-[200px]"/></div>}
      </CardContent>
    </Card>
);

// --- Sub-component for Download Options ---
const DownloadOptions: React.FC<{
  mediaData: MediaData;
  onDownload: (format: MediaFormat) => void;
  downloadingId: string | null;
  downloadProgress: number;
}> = ({ mediaData, onDownload, downloadingId, downloadProgress }) => (
  <Card className="glass">
    <CardHeader><CardTitle>Download Options</CardTitle></CardHeader>
    <CardContent>
      <Tabs defaultValue="video" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audio" className="gap-2"><Volume2 className="h-4 w-4" /> Audio</TabsTrigger>
          <TabsTrigger value="video" className="gap-2"><Play className="h-4 w-4" /> Video</TabsTrigger>
        </TabsList>
        <TabsContent value="audio" className="space-y-3 pt-4">
          {mediaData.formats.audio.map((format) => (
            <div key={format.format_id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-surface-elevated transition-smooth">
              <div className="truncate"><div className="font-medium truncate">{format.format} - {format.quality}</div><div className="text-sm text-muted-foreground">{format.size}</div></div>
              <a href={format.url} download target="_blank" rel="noopener noreferrer">
                <Button variant="success" size="sm"><Download className="h-4 w-4" /></Button>
              </a>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="video" className="space-y-3 pt-4">
          {mediaData.formats.video.map((format) => (
            <div key={format.format_id}>
              <div className="flex items-center justify-between p-3 border-b-0 border border-border rounded-t-lg hover:bg-surface-elevated transition-smooth">
                <div className="truncate"><div className="font-medium truncate">{format.format} - {format.quality}</div><div className="text-sm text-muted-foreground">{format.size} • {format.aspect}</div></div>
                <Button variant="success" size="sm" onClick={() => onDownload(format)} disabled={!!downloadingId}>
                  {downloadingId === format.format_id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                </Button>
              </div>
              {downloadingId === format.format_id && (
                <div className="p-2 border-t-0 border rounded-b-lg border-border">
                  <Progress value={downloadProgress} className="w-full h-2" />
                  <p className="text-xs text-center mt-1 text-muted-foreground">Downloading... {Math.round(downloadProgress)}%</p>
                </div>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

// --- Main MediaProcessor Component ---
export const MediaProcessor = ({ mediaData, onBack }: MediaProcessorProps) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [filename, setFilename] = useState(`${mediaData.title}.mp4`);
  
  const [metadata, setMetadata] = useState<Metadata>({
    title: mediaData.title || "Sample Video Title", artist: "Artist Name", album: "Album Name",
    genre: "Pop", year: new Date().getFullYear().toString(), track: "1", comment: ""
  });
  const [timeRange, setTimeRange] = useState<TimeRange>({ start: "00:00", end: mediaData.duration || "00:00" });

  // Use environment variable for the API URL
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
  useEffect(() => {
    setFilename(`${mediaData.title}.mp4`);
    setMetadata(prev => ({ ...prev, title: mediaData.title }));
    setTimeRange(prev => ({ ...prev, end: mediaData.duration }));
  }, [mediaData]);

  const handleDownload = async (format: MediaFormat) => {
    if (!mediaData.best_audio_id) {
      toast({ variant: "destructive", title: "Audio not available for merging" });
      return;
    }
    setDownloading(format.format_id);
    setDownloadProgress(0);

    try {
      const response = await fetch(`${API_BASE_URL}/download/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_url: mediaData.original_url, video_format_id: format.format_id,
          audio_format_id: mediaData.best_audio_id, filename: filename,
        }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }


      const contentLength = response.headers.get('Content-Length');
      const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
      let loadedSize = 0;

      const reader = response.body.getReader();
      const stream = new ReadableStream({
        start(controller) {
          const push = () => {
            reader.read().then(({ done, value }) => {
              if (done) { 
                setDownloadProgress(100);
                controller.close(); 
                return; 
              }
              if (value) {
                loadedSize += value.length;
                if (totalSize > 0) setDownloadProgress((loadedSize / totalSize) * 100);
                controller.enqueue(value);
              }
              push();
            }).catch(error => {
              console.error('Stream reading error:', error);
              controller.error(error);
            });
          };
          push();
        },
      });
      
      const blob = await new Response(stream).blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "download.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete!",
        description: `${filename} has been saved.`,
      });

    } catch (error) {
      console.error("Download failed:", error);
      toast({ 
        variant: "destructive", 
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-xl font-semibold truncate">{mediaData.title}</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <MediaEditor 
            filename={filename} setFilename={setFilename}
            metadata={metadata} setMetadata={setMetadata}
            timeRange={timeRange} setTimeRange={setTimeRange}
          />
          <div className="space-y-6">
            <MediaPreview mediaData={mediaData} />
            <DownloadOptions 
              mediaData={mediaData} 
              onDownload={handleDownload}
              downloadingId={downloading}
              downloadProgress={downloadProgress}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
