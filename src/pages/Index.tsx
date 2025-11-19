
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Zap, Share2, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              Easy Forms
            </Link>
            <div className="flex items-center gap-2">
              {user ? (
                <Button asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Create Beautiful Forms in Minutes
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Build powerful forms with drag-and-drop simplicity. Collect submissions, view analytics, and integrate with webhooks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="group">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="group">
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-accent/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful form builder with all the features you need to collect data efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-8 w-8 text-primary" />,
                title: "Drag & Drop Builder",
                description: "Intuitive form builder with drag-and-drop functionality. Add fields, customize layouts, and design your perfect form."
              },
              {
                icon: <Zap className="h-8 w-8 text-primary" />,
                title: "Multiple Field Types",
                description: "Text, email, number, select, checkbox, radio, file upload, date/time, and more. Plus headers, paragraphs, and links."
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-primary" />,
                title: "View Submissions",
                description: "See all your form submissions in one place. Export data as CSV and analyze responses easily."
              },
              {
                icon: <Share2 className="h-8 w-8 text-primary" />,
                title: "Webhook Integration",
                description: "Automatically send form submissions to your webhook endpoints. Perfect for integrations and automation."
              },
              {
                icon: <Zap className="h-8 w-8 text-primary" />,
                title: "Customizable Layouts",
                description: "Control field widths and order. Design forms that match your brand and user experience needs."
              },
              {
                icon: <FileText className="h-8 w-8 text-primary" />,
                title: "Simple Sharing",
                description: "Share your forms with unique URLs. Publish and unpublish forms with a single click."
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-8 pb-6">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
