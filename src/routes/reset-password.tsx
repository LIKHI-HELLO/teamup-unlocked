import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — UNSTUCK" },
      {
        name: "description",
        content: "Create a new password for your UNSTUCK account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Verify that the user has a genuine password recovery session.
  useEffect(() => {
    let mounted = true;
    let recoveryFound = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        recoveryFound = true;
        setRecoveryVerified(true);
        setCheckingSession(false);
      }

      if (event === "SIGNED_OUT") {
        recoveryFound = false;
        setRecoveryVerified(false);
      }
    });

    async function checkSession() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!mounted) return;

        // A normal login session is not enough.
        // Only PASSWORD_RECOVERY authorizes this page.
        if (!recoveryFound) {
          setRecoveryVerified(false);
        }
      } catch (error) {
        if (mounted) {
          setRecoveryVerified(false);
          console.error("Session verification error:", error);
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Update the password.
  async function handleUpdatePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!recoveryVerified) {
      toast.error("Please request a new password reset link.");
      return;
    }

    setUpdating(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!session) {
        throw new Error(
          "Your reset session has expired. Please request a new link."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");

      setPassword("");
      setConfirmPassword("");

      await navigate({ to: "/login" });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update your password. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  }

  // Loading screen.
  if (checkingSession) {
    return (
      <section className="surface-glow flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <Card className="glass w-full max-w-md rounded-3xl shadow-soft">
          <CardContent className="p-8 text-center">
            <LockKeyhole className="mx-auto mb-4 size-10 text-primary" />

            <h1 className="text-xl font-bold">
              Verifying your link
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we verify your password reset link.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Invalid or expired link.
  if (!recoveryVerified) {
    return (
      <section className="surface-glow flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <Card className="glass w-full max-w-md rounded-3xl shadow-soft">
          <CardContent className="p-8 text-center">
            <LockKeyhole className="mx-auto mb-4 size-10 text-destructive" />

            <h1 className="text-xl font-bold">
              Invalid or expired link
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Your password reset link is invalid or has expired.
              Please request a new password reset link.
            </p>

            <Button
              className="mt-6 w-full rounded-xl"
              onClick={() => navigate({ to: "/login" })}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Password reset form.
  return (
    <section className="surface-glow flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="glass w-full max-w-md rounded-3xl shadow-soft">
        <CardContent className="p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <LockKeyhole className="size-7 text-primary" />
            </div>

            <h1 className="text-2xl font-bold">
              Create New Password
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Enter your new password below to secure your account.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-12"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Password must contain at least 8 characters.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm New Password
              </Label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-12"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={updating}
              className="w-full rounded-xl"
            >
              {updating ? (
                "Updating Password..."
              ) : (
                <>
                  <CheckCircle2 className="mr-2 size-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/login" })}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
