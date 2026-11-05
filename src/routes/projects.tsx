import { createFileRoute } from "@tanstack/react-router";
import { Github, Heart, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { projects } from "@/data/mock";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Student Project Showcase — UNSTUCK" },
      {
        name: "description",
        content:
          "Browse student-built projects across AI/ML, web, mobile, cloud and cybersecurity, with tech stacks and demos.",
      },
      { property: "og:title", content: "Student Project Showcase — UNSTUCK" },
      {
        property: "og:description",
        content: "Like, rate and get inspired by projects shipped by students across India.",
      },
    ],
  }),
  component: ProjectsPage,
});

const filters = [
  "All",
  "AI/ML",
  "Web Development",
  "Mobile Apps",
  "Cloud",
  "Cybersecurity",
] as const;

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-warning" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`size-3.5 ${i < Math.round(rating) ? "fill-current" : ""}`} />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

function ProjectsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [liked, setLiked] = useState<string[]>([]);

  const list = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  );
  const featured = projects.filter((p) => p.featured);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Showcase what you shipped"
        subtitle="A portfolio that speaks for itself — tech stack, demo links and community ratings."
      >
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setFilter(f)}
            >
              {f}
            </Button>
          ))}
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold">Featured projects</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {featured.map((p) => (
            <Card key={p.id} className="card-hover overflow-hidden rounded-2xl">
              <div className="gradient-brand h-20" />
              <CardContent className="p-5">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Stars rating={p.rating} />
                  <span className="text-xs text-muted-foreground">by {p.author}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-semibold">All projects</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const isLiked = liked.includes(p.id);
            return (
              <Card key={p.id} className="card-hover flex flex-col rounded-2xl">
                <CardContent className="flex flex-1 flex-col p-5">
                  <Badge variant="secondary" className="w-fit rounded-full">
                    {p.category}
                  </Badge>
                  <h3 className="mt-3 text-lg font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <Badge key={s} variant="outline" className="rounded-full">
                        {s}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Stars rating={p.rating} />
                    <span className="text-xs text-muted-foreground">by {p.author}</span>
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Button
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() =>
                        setLiked((prev) =>
                          prev.includes(p.id)
                            ? prev.filter((id) => id !== p.id)
                            : [...prev, p.id],
                        )
                      }
                    >
                      <Heart className={`mr-1.5 size-4 ${isLiked ? "fill-current" : ""}`} />
                      {p.likes + (isLiked ? 1 : 0)}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full"
                      onClick={() => toast(`${p.name} repository link coming soon`)}
                    >
                      <Github className="mr-1.5 size-4" /> Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
