import { createFileRoute } from "@tanstack/react-router";
import { ArrowBigUp, CheckCircle2, MessageSquare, Search, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { leaderboard, questions } from "@/data/mock";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community & I'm Stuck — Student Q&A | UNSTUCK" },
      {
        name: "description",
        content:
          "Ask what you're stuck on, answer other students, earn reputation points and climb the weekly leaderboard.",
      },
      { property: "og:title", content: "Community & I'm Stuck — Student Q&A | UNSTUCK" },
      {
        property: "og:description",
        content: "A Stack Overflow style Q&A built for hackathon and college project problems.",
      },
    ],
  }),
  component: CommunityPage,
});

function AskDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-glow">I&apos;m Stuck — Post a problem</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Post your problem</DialogTitle>
          <DialogDescription>
            Be specific — what you tried, what broke, and what you expected.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Question posted to the community.");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="q-title">Title</Label>
            <Input id="q-title" required placeholder="Why does my build fail on deploy?" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-body">Description</Label>
            <Textarea id="q-body" required rows={5} placeholder="Describe the problem in detail" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="q-tags">Tags</Label>
            <Input id="q-tags" placeholder="react, deployment" />
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-full">
              Post question
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CommunityPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return questions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) || item.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Stuck at 2 AM? Someone here has solved it."
        subtitle="Ask questions, answer others, mark accepted solutions and earn reputation points."
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search problems and tags"
              className="h-11 rounded-full pl-9"
              aria-label="Search problems"
            />
          </div>
          <AskDialog />
        </div>
      </PageHeader>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-[1.7fr_1fr]">
        <Tabs defaultValue="recent">
          <TabsList className="rounded-full">
            <TabsTrigger value="recent" className="rounded-full">
              Recent
            </TabsTrigger>
            <TabsTrigger value="trending" className="rounded-full">
              Trending
            </TabsTrigger>
            <TabsTrigger value="unsolved" className="rounded-full">
              Unsolved
            </TabsTrigger>
          </TabsList>

          {(["recent", "trending", "unsolved"] as const).map((tab) => {
            const list =
              tab === "trending"
                ? [...filtered].sort((a, b) => b.votes - a.votes)
                : tab === "unsolved"
                  ? filtered.filter((q) => !q.solved)
                  : filtered;
            return (
              <TabsContent key={tab} value={tab} className="mt-5 space-y-4">
                {list.length === 0 ? (
                  <div className="rounded-3xl border border-dashed p-12 text-center text-sm text-muted-foreground">
                    Nothing here yet — be the first to post.
                  </div>
                ) : (
                  list.map((q) => (
                    <Card key={q.id} className="card-hover rounded-2xl">
                      <CardContent className="flex gap-4 p-5">
                        <div className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-xl bg-secondary py-3">
                          <ArrowBigUp className="size-5 text-primary" />
                          <span className="text-sm font-semibold">{q.votes}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold">{q.title}</h2>
                            {q.solved ? (
                              <Badge className="rounded-full bg-success text-primary-foreground">
                                <CheckCircle2 className="mr-1 size-3.5" /> Solved
                              </Badge>
                            ) : null}
                          </div>
                          <p className="mt-1.5 text-sm text-muted-foreground">{q.excerpt}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {q.tags.map((t) => (
                              <Badge key={t} variant="outline" className="rounded-full">
                                {t}
                              </Badge>
                            ))}
                            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                              <MessageSquare className="size-3.5" /> {q.answers} answers · {q.author}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>

        <aside className="space-y-6">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <Trophy className="size-4 text-warning" /> Weekly leaderboard
              </h2>
              <ul className="mt-4 space-y-4">
                {leaderboard.map((u) => (
                  <li key={u.rank} className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                      {u.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{u.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{u.college}</div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{u.points}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold">Badges you can earn</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Problem Solver",
                  "Team Builder",
                  "Hackathon Champion",
                  "Mentor",
                  "Top Contributor",
                ].map((b) => (
                  <Badge key={b} variant="secondary" className="rounded-full">
                    {b}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </>
  );
}
