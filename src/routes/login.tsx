import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — UNSTUCK" },
      {
        name: "description",
        content:
          "Log in to UNSTUCK to manage your teams, events, projects and community answers.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Unable to verify your account.");
      }

      toast.success("Welcome back to UNSTUCK!");

      await navigate({ to: "/dashboard" });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      toast.error("Enter your email address first.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/login`,
        }
      );

      if (error) throw error;

      toast.success("Password reset instructions sent to your email.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send password reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface-glow flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="glass w-full max-w-md rounded-3xl shadow-soft">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Pick up where your team left off.
          </p>

          <Button
            variant="outline"
            type="button"
            className="mt-6 w-full rounded-full"
            onClick={() =>
              toast("Google login will be enabled after Google authentication setup.")
            }
          >
            Login With Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="identifier">Email</Label>
              <Input
                id="identifier"
                type="email"
                required
                placeholder="you@college.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={remember}
                  onCheckedChange={(checked) =>
                    setRemember(checked === true)
                  }
                />
                Remember me
              </label>

              <button
                type="button"
                disabled={loading}
                className="text-sm font-medium text-primary hover:underline"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full shadow-glow"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}