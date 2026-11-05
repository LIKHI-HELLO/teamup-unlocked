import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Heart, MapPin, Search, Trophy, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { events } from "@/data/mock";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Hackathons — UNSTUCK" },
      {
        name: "description",
        content:
          "Search hackathons, workshops, competitions, internships and conferences for students across India.",
      },
      { property: "og:title", content: "Events & Hackathons — UNSTUCK" },
      {
        property: "og:description",
        content: "Filter student events by category, location, date and online or offline mode.",
      },
    ],
  }),
  component: EventsPage,
});

const categories = [
  "All",
  "Hackathons",
  "Workshops",
  "Internships",
  "Competitions",
  "Conferences",
] as const;
const modes = ["All", "Online", "Offline"] as const;

function EventsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [mode, setMode] = useState<(typeof modes)[number]>("All");

  const filtered = useMemo(
    () =>
      events.filter(
        (e) =>
          (category === "All" || e.category === category) &&
          (mode === "All" || e.mode === mode) &&
          (e.name.toLowerCase().includes(query.toLowerCase()) ||
            e.location.toLowerCase().includes(query.toLowerCase()) ||
            e.organizer.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, category, mode],
  );

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Discover events worth your weekend"
        subtitle="Hackathons, workshops, competitions, internships and conferences — all in one feed."
      >
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, cities or organisers"
              className="h-11 rounded-full pl-9"
              aria-label="Search events"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={category === c ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {modes.map((m) => (
              <Button
                key={m}
                size="sm"
                variant={mode === m ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => setMode(m)}
              >
                {m === "All" ? "Any mode" : m}
              </Button>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-14 text-center">
            <h2 className="text-lg font-semibold">No events match those filters</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different category, or clear your search.
            </p>
            <Button
              variant="outline"
              className="mt-5 rounded-full"
              onClick={() => {
                setQuery("");
                setCategory("All");
                setMode("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <Card key={e.id} className="card-hover flex flex-col overflow-hidden rounded-2xl">
                <div className="gradient-brand h-24" />
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      {e.category}
                    </Badge>
                    <Badge
                      className="rounded-full"
                      variant={e.status === "Closing soon" ? "destructive" : "outline"}
                    >
                      {e.status}
                    </Badge>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">{e.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
                  <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CalendarDays className="size-4" /> {e.date}
                    </li>
                    <li className="flex items-center gap-2">
                      <MapPin className="size-4" /> {e.location} · {e.mode}
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="size-4" /> {e.teamSize}
                    </li>
                    <li className="flex items-center gap-2">
                      <Trophy className="size-4" /> {e.prize}
                    </li>
                  </ul>
                  <div className="mt-5 flex gap-2 pt-1">
                    <Button
                      className="flex-1 rounded-full"
                      onClick={() => toast.success(`Registration opens soon for ${e.name}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      aria-label={`Add ${e.name} to wishlist`}
                      onClick={() => toast(`${e.name} added to your wishlist`)}
                    >
                      <Heart className="size-4" />
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
