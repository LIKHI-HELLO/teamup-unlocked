import { createFileRoute } from "@tanstack/react-router";
import { Search, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { teams } from "@/data/mock";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Teams — Find Your Hackathon Squad | UNSTUCK" },
      {
        name: "description",
        content:
          "Browse open student teams, filter by skill or event, and create your own team for the next hackathon.",
      },
      { property: "og:title", content: "Teams — Find Your Hackathon Squad | UNSTUCK" },
      {
        property: "og:description",
        content: "Create a team, list the skills you need and review join requests in one place.",
      },
    ],
  }),
  component: TeamsPage,
});

function CreateTeamDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-glow">
          <UserPlus className="mr-2 size-4" /> Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a team</DialogTitle>
          <DialogDescription>
            Tell students what you&apos;re building and which skills you still need.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Team created — you can invite members from your dashboard.");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="team-name">Team name</Label>
            <Input id="team-name" required placeholder="Neural Nomads" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-desc">Description</Label>
            <Textarea id="team-desc" required placeholder="What are you building?" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="team-skills">Required skills</Label>
              <Input id="team-skills" placeholder="React, Python" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-max">Maximum members</Label>
              <Input id="team-max" type="number" min={2} max={10} defaultValue={4} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-event">Event</Label>
            <Input id="team-event" placeholder="Smart India Hackathon 2026" />
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-full">
              Create team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TeamsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.event.toLowerCase().includes(q) ||
        t.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <>
      <PageHeader
        eyebrow="Teams"
        title="Find a team that needs exactly what you do"
        subtitle="Search by skill, event or technology — then send a join request in one click."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by skill, event or technology"
              className="h-11 rounded-full pl-9"
              aria-label="Search teams"
            />
          </div>
          <CreateTeamDialog />
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-14 text-center">
            <h2 className="text-lg font-semibold">No open teams match that search</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start your own team and let others find you instead.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filtered.map((t) => (
              <Card key={t.id} className="card-hover rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{t.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 rounded-full">
                      <Users className="mr-1 size-3.5" />
                      {t.members}/{t.maxMembers}
                    </Badge>
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-wide text-muted-foreground">
                    {t.event}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {t.skills.map((s) => (
                      <Badge key={s} variant="outline" className="rounded-full">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <Progress value={(t.members / t.maxMembers) * 100} className="mt-5 h-2" />
                  <div className="mt-5 flex gap-2">
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => toast.success(`Join request sent to ${t.name}`)}
                    >
                      Request to join
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => toast(`${t.name} saved for later`)}
                    >
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
