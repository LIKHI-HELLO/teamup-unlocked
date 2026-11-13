import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Award,
  Bell,
  CalendarDays,
  CheckCircle2,
  Github,
  Linkedin,
  Share2,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { events, teams } from "@/data/mock";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Your UNSTUCK Profile" },
      {
        name: "description",
        content:
          "Your student dashboard: profile, upcoming events, teams, achievements, notifications and activity.",
      },
      { property: "og:title", content: "Dashboard — Your UNSTUCK Profile" },
      {
        property: "og:description",
        content:
          "Track your teams, registered events, badges and reputation on UNSTUCK.",
      },
    ],
  }),
  component: Dashboard,
});

type StudentProfile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
  college: string | null;
  bio: string | null;
  skills: string[] | null;
};

const notifications = [
  { text: "Welcome to UNSTUCK! Complete your student profile.", time: "Just now" },
  { text: "Explore upcoming hackathons and workshops.", time: "Today" },
];

const achievements = [
  "Problem Solver",
  "Team Builder",
  "Hackathon Champion",
  "Mentor",
];

const timeline = [
  { text: "Created your UNSTUCK account", time: "Today" },
  { text: "Joined the UNSTUCK community", time: "Today" },
];

function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: "",
    college: "",
    bio: "",
    skills: "",
  });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          if (active) {
            await navigate({ to: "/login" });
          }
          return;
        }

        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("full_name, email, phone, college, bio, skills")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Profile loading error:", error.message);
          toast.error("Could not load your profile.");
          return;
        }

        if (active) {
          setProfile(data as StudentProfile);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        toast.error("Something went wrong while loading your dashboard.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      toast.error("Please log in again to update your profile.");
      await navigate({ to: "/login" });
      return;
    }

    const updatedProfile = {
      full_name: editForm.full_name.trim() || null,
      phone: editForm.phone.trim() || null,
      college: editForm.college.trim() || null,
      bio: editForm.bio.trim() || null,
      skills: editForm.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };

    setSaving(true);
    try {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .update(updatedProfile)
        .eq("id", user.id)
        .select("full_name, email, phone, college, bio, skills")
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error(
          "No profile row was updated. Please check that your profiles table has a row with your authenticated user ID and that its UPDATE policy allows users to update their own row."
        );
      }

      setProfile(data as StudentProfile);
      setIsEditing(false);
      toast.success("Your profile has been updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleShareProfile() {
    if (!profile) return;

    const shareText = [
      `Check out my UNSTUCK student profile!`,
      `Name: ${profile.full_name || "Student"}`,
      profile.college ? `College: ${profile.college}` : "",
      profile.bio ? `About me: ${profile.bio}` : "",
      profile.skills?.length ? `Skills: ${profile.skills.join(", ")}` : "",
      "I'm using UNSTUCK to find teammates, explore events and build projects.",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title: "My UNSTUCK Profile",
          text: shareText,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        toast.success("Your profile details have been copied. You can paste and share them!");
      } else {
        window.prompt("Copy your profile details and share them:", shareText);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Your profile details have been copied!");
      } catch {
        toast.error("Sharing is not available in this browser.");
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">
          Loading your UNSTUCK profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">
          Your profile could not be found.
        </p>
        <Button onClick={() => navigate({ to: "/login" })}>
          Go to Login
        </Button>
      </div>
    );
  }

  const displayName = profile.full_name || "Student";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="surface-glow min-h-[calc(100vh-4rem)]">
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 px-4 py-8 backdrop-blur-sm">
          <Card className="glass w-full max-w-lg rounded-3xl shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Edit your profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update your student information. Your changes will be saved to your account.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSaveProfile}>
                <div className="space-y-2">
                  <label htmlFor="profile-name" className="text-sm font-medium">Full name</label>
                  <input
                    id="profile-name"
                    required
                    value={editForm.full_name}
                    onChange={(event) => setEditForm({ ...editForm, full_name: event.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-email" className="text-sm font-medium">Email</label>
                  <input
                    id="profile-email"
                    value={profile.email || ""}
                    readOnly
                    className="flex h-10 w-full cursor-not-allowed rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Email is managed by your login account and cannot be changed here.</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-phone" className="text-sm font-medium">Phone number</label>
                  <input
                    id="profile-phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-college" className="text-sm font-medium">College</label>
                  <input
                    id="profile-college"
                    value={editForm.college}
                    onChange={(event) => setEditForm({ ...editForm, college: event.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Enter your college name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-bio" className="text-sm font-medium">Bio</label>
                  <textarea
                    id="profile-bio"
                    rows={3}
                    value={editForm.bio}
                    onChange={(event) => setEditForm({ ...editForm, bio: event.target.value })}
                    className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Write a short introduction about yourself"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="profile-skills" className="text-sm font-medium">Skills</label>
                  <input
                    id="profile-skills"
                    value={editForm.skills}
                    onChange={(event) => setEditForm({ ...editForm, skills: event.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Example: HTML, CSS, Python"
                  />
                  <p className="text-xs text-muted-foreground">Separate each skill with a comma.</p>
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="outline" className="rounded-full" disabled={saving} onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-full" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-12 lg:grid-cols-[1fr_1.6fr]">
        <div className="space-y-6">
          <Card className="glass rounded-3xl shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <span className="gradient-brand flex size-16 items-center justify-center rounded-2xl text-xl font-bold text-primary-foreground shadow-glow">
                  {initials}
                </span>

                <div className="min-w-0">
                  <h1 className="text-xl font-bold">
                    {displayName}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {profile.college || "College not added yet"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {profile.bio || "Add a short introduction to your profile."}
              </p>

              {profile.phone && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Phone: {profile.phone}
                </p>
              )}

              <Badge className="mt-4 rounded-full bg-success text-primary-foreground">
                <CheckCircle2 className="mr-1 size-3.5" />
                Welcome to UNSTUCK
              </Badge>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Skills
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(profile.skills || []).length > 0 ? (
                      profile.skills!.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-5" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Account status
                </span>
                <span className="font-semibold text-success">
                  Active
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <Button
                  className="flex-1 rounded-full"
                  onClick={() => {
                    setEditForm({
                      full_name: profile.full_name || "",
                      phone: profile.phone || "",
                      college: profile.college || "",
                      bio: profile.bio || "",
                      skills: (profile.skills || []).join(", "),
                    });
                    setIsEditing(true);
                  }}
                >
                  Edit Profile
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  aria-label="Share profile"
                  title="Share profile"
                  onClick={handleShareProfile}
                >
                  <Share2 className="size-4" />
                </Button>
              </div>

              <div className="mt-4 flex gap-3 text-muted-foreground">
                <Github className="size-4" />
                <Linkedin className="size-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Award className="size-4 text-warning" />
                Achievements
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {achievements.map((achievement) => (
                  <Badge
                    key={achievement}
                    variant="secondary"
                    className="rounded-full"
                  >
                    {achievement}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Demo achievements — real achievements will be connected later.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <CalendarDays className="size-4 text-primary" />
                  Upcoming events
                </h2>

                <ul className="mt-4 space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <li key={event.id}>
                      <p className="text-sm font-medium">
                        {event.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.date} · {event.location}
                      </p>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-4 rounded-full px-0"
                >
                  <Link to="/events">Browse all events</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Bell className="size-4 text-primary" />
                  Notifications
                  <Badge className="ml-auto rounded-full">
                    {notifications.length}
                  </Badge>
                </h2>

                <ul className="mt-4 space-y-3">
                  {notifications.map((notification) => (
                    <li key={notification.text} className="text-sm">
                      {notification.text}
                      <span className="ml-1 text-xs text-muted-foreground">
                        · {notification.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Sparkles className="size-4 text-primary" />
                  Suggested teams
                </h2>

                <ul className="mt-4 space-y-4">
                  {teams.slice(0, 2).map((team) => (
                    <li key={team.id}>
                      <p className="text-sm font-medium">
                        {team.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Needs {team.skills.join(", ")}
                      </p>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-4 rounded-full px-0"
                >
                  <Link to="/teams">Find a team</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <Users className="size-4 text-primary" />
                  My teams
                </h2>

                <ul className="mt-4 space-y-4">
                  {teams.slice(2).map((team) => (
                    <li key={team.id}>
                      <p className="text-sm font-medium">
                        {team.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {team.members}/{team.maxMembers} members · {team.event}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold">
                Activity timeline
              </h2>

              <ol className="mt-5 space-y-5 border-l pl-5">
                {timeline.map((item) => (
                  <li key={item.text} className="relative">
                    <span className="gradient-brand absolute -left-[26px] top-1.5 size-2.5 rounded-full" />
                    <p className="text-sm">{item.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}