import { useState } from "react";
import { ArrowLeft, Download as DownloadIcon, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MediaProcessor } from "@/components/MediaProcessor";
import { useToast } from "@/components/ui/use-toast"; // Import the toast hook for notifications

const Download = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaData, setMediaData] = useState(null);

  const handleDownload = async () => {
    if (!url.trim()) return;
    
    setIsProcessing(true);
    setMediaData(null); // Clear previous data

    try {
      // This is the new API call to your Django backend
      const response = await fetch("/api/media/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMediaData(data);

    } catch (error) {
      console.error("Failed to fetch media data:", error);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description: "Could not connect to the backend. Please ensure it's running.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (mediaData) {
    return <MediaProcessor mediaData={mediaData} onBack={() => setMediaData(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">Download Media</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Paste Your Link</h2>
            <p className="text-muted-foreground">
              Enter the URL of the video or audio you want to download
            </p>
          </div>

          <Card className="p-6 glass animate-scale-in">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">
                  Media URL
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/video-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              <Button
                onClick={handleDownload}
                disabled={!url.trim() || isProcessing}
                variant="hero"
                size="lg"
                className="w-full h-14 text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="h-5 w-5" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Download;