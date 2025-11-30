
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Zap, Share2, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Logo from "@/components/Logo";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              {user ? (
                <Button asChild>
                  <Link to="/dashboard">לוח בקרה</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">התחברות</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">התחל עכשיו</Link>
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
              צור טפסים יפים תוך דקות
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              בנה טפסים חזקים עם פשטות גרירה ושחרור. אסוף הגשות, צפה בניתוחים והתחבר ל-webhooks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" asChild className="group">
                  <Link to="/dashboard">
                    עבור ללוח הבקרה
                    <ArrowLeft className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform rotate-180" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="group">
                  <Link to="/signup">
                    התחל בחינם
                    <ArrowLeft className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform rotate-180" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">התחברות</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-accent/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">כל מה שאתה צריך</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              בונה טפסים חזק עם כל התכונות שאתה צריך לאסוף נתונים ביעילות.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <FileText className="h-8 w-8 text-primary" />,
                title: "בונה גרירה ושחרור",
                description: "בונה טפסים אינטואיטיבי עם פונקציונליות גרירה ושחרור. הוסף שדות, התאם אישית פריסות ועיצוב את הטופס המושלם שלך."
              },
              {
                icon: <Zap className="h-8 w-8 text-primary" />,
                title: "סוגי שדות מרובים",
                description: "טקסט, אימייל, מספר, בחירה, תיבת סימון, רדיו, העלאת קבצים, תאריך/שעה ועוד. בנוסף כותרות, פסקאות וקישורים."
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-primary" />,
                title: "צפה בהגשות",
                description: "ראה את כל הגשות הטופס שלך במקום אחד. ייצא נתונים כ-CSV ונתח תגובות בקלות."
              },
              {
                icon: <Share2 className="h-8 w-8 text-primary" />,
                title: "אינטגרציית Webhook",
                description: "שלח אוטומטית הגשות טופס לנקודות קצה webhook שלך. מושלם לאינטגרציות ואוטומציה."
              },
              {
                icon: <Zap className="h-8 w-8 text-primary" />,
                title: "פריסות מותאמות אישית",
                description: "שלוט ברוחב השדות ובסדר. עיצוב טפסים התואמים למותג שלך ולצרכי חוויית המשתמש."
              },
              {
                icon: <FileText className="h-8 w-8 text-primary" />,
                title: "שיתוף פשוט",
                description: "שתף את הטפסים שלך עם כתובות URL ייחודיות. פרסם ובטל פרסום טפסים בלחיצה אחת."
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
