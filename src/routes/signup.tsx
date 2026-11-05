import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Join UNSTUCK Free" },
      {
        name: "description",
        content:
          "Create a free UNSTUCK student profile to find teammates, join hackathons and showcase your projects.",
      },
    ],
  }),
  component: SignUpPage,
});

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function SignUpPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const strong = rules.every((r) => r.test(password));
  const matches = confirm.length > 0 && confirm === password;

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!strong) {
      toast.error("Please choose a stronger password.");
      return;
    }

    if (!matches) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        toast.success("Your UNSTUCK account has been created!");
        await navigate({ to: "/dashboard" });
      } else {
        toast.success(
          "Account created! Please check your email to confirm your account before logging in."
        );
        await navigate({ to: "/login" });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create your account.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface-glow flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="glass w-full max-w-md rounded-3xl shadow-soft">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join 10,000+ students building together.
          </p>

          <Button
            variant="outline"
            className="mt-6 w-full rounded-full"
            type="button"
            onClick={() =>
              toast("Google sign-up will be enabled after Google authentication setup.")
            }
          >
            Sign Up With Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                required
                placeholder="Your full name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@college.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <ul className="mt-2 grid grid-cols-2 gap-1 text-xs">
                {rules.map((r) => (
                  <li
                    key={r.label}
                    className={r.test(password) ? "text-success" : "text-muted-foreground"}
                  >
                    {r.test(password) ? "✓" : "•"} {r.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              {confirm && !matches && (
                <p className="text-xs text-destructive">
                  Passwords do not match.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full shadow-glow"
            >
              {loading ? "Creating account..." : "Sign Up With Email"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}