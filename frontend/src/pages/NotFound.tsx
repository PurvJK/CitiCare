import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, Home, LayoutDashboard, ArrowLeft, MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const getDashboardLink = () => {
    if (!isAuthenticated) return "/login";
    return "/dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card py-4">
        <div className="container mx-auto px-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">CitiCare</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Surat Municipal Corporation
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-[150px] font-bold text-muted/20 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-destructive" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Page Not Found
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              The page you are looking for does not exist or has been moved. 
              Please check the URL or navigate back to a valid section.
            </p>
            <div className="rounded-lg bg-secondary/50 border border-border p-4 text-sm text-muted-foreground">
              <span className="font-mono bg-muted px-2 py-1 rounded">
                {location.pathname}
              </span>
              <span className="ml-2">is not a valid route</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link to={getDashboardLink()} className="w-full sm:w-auto">
              <Button variant="accent" className="w-full">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                {isAuthenticated ? "Go to Dashboard" : "Login"}
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-8 text-xs text-muted-foreground">
            If you believe this is an error, please contact{" "}
            <a href="mailto:support@suratmunicipal.gov.in" className="text-accent hover:underline">
              support@suratmunicipal.gov.in
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2024 Surat Municipal Corporation. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
