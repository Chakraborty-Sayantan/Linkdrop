import { useNavigate } from "react-router-dom";
import { Download, Play, Music, Video, Zap, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Download,
      title: "High-Quality Downloads",
      description: "Download videos and audio in their original quality or choose from multiple formats and resolutions."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Our optimized servers ensure quick processing and downloads, no matter the file size."
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your privacy is our priority. No data is stored and all processing is done securely."
    },
    {
      icon: Globe,
      title: "Universal Support",
      description: "Works with hundreds of popular platforms including YouTube, TikTok, Instagram, and more."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">LinkDrop</span>
          </div>
          <Button 
            variant="hero" 
            onClick={() => navigate("/download")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Start Download
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-surface-elevated opacity-90" />
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              Download Any
              <span className="text-gradient block">Media Content</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in-up">
              The fastest and most reliable way to download videos and audio from your favorite platforms. 
              High quality, multiple formats, instant processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={() => navigate("/download")}
                className="gap-3 h-14 px-8 text-lg"
              >
                <Download className="h-6 w-6" />
                Start Downloading
              </Button>
              <Button 
                variant="glass" 
                size="lg"
                className="gap-3 h-14 px-8 text-lg"
              >
                <Play className="h-6 w-6" />
                How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose LinkDrop?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern technology and user experience in mind, offering the best downloading experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 glass hover:shadow-glow transition-spring hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Downloading?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who trust LinkDrop for their media downloading needs.
            </p>
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/download")}
              className="gap-3 h-14 px-8 text-lg animate-glow-pulse"
            >
              <Download className="h-6 w-6" />
              Get Started Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
              <Download className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">LinkDrop</span>
          </div>
          <p className="text-muted-foreground">
            Fast, reliable, and secure media downloading for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
