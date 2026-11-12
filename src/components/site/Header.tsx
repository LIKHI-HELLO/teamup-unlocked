import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/events" },
  { label: "Teams", to: "/teams" },
  { label: "Projects", to: "/projects" },
  { label: "Community", to: "/community" },
  { label: "FAQs", to: "/faqs" },
] as const;

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle colour theme"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
      }}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setAuthLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session check failed:", error.message);
      }

      setIsAuthenticated(!!session);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {!authLoading && (
              <>
                {isAuthenticated ? (
                  <>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>

                    <Button
                      size="sm"
                      className="rounded-full"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      <Link to="/login">Login</Link>
                    </Button>

                    <Button
                      asChild
                      size="sm"
                      className="hidden rounded-full sm:inline-flex"
                    >
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72">
                <SheetTitle className="px-4 pt-4">Menu</SheetTitle>

                <nav className="mt-4 flex flex-col gap-1 px-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                      activeProps={{ className: "bg-secondary text-foreground" }}
                      activeOptions={{ exact: item.to === "/" }}
                    >
                      {item.label}
                    </Link>
                  ))}

                  {!authLoading && (
                    <div className="mt-4 flex flex-col gap-2 px-1">
                      {isAuthenticated ? (
                        <>
                          <Button asChild variant="outline">
                            <Link to="/dashboard">Dashboard</Link>
                          </Button>

                          <Button onClick={handleLogout}>
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild variant="outline">
                            <Link to="/login">Login</Link>
                          </Button>

                          <Button asChild>
                            <Link to="/signup">Sign Up</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}