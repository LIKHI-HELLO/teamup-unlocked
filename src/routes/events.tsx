import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  MapPin,
  Search,
  Users,
  ExternalLink,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Hackathons — UNSTUCK" },
      {
        name: "description",
        content:
          "Search hackathons, workshops, competitions, internships and conferences for students across India.",
      },
    ],
  }),
  component: EventsPage,
});

type Event = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  mode: string | null;
  registration_link: string | null;
  organizer_id: string | null;
};

const categories = [
  "All",
  "Hackathons",
  "Workshops",
  "Internships",
  "Competitions",
  "Conferences",
];

const modes = ["All", "Online", "Offline"];

function formatDate(date: string | null) {
  if (!date) return "Date not announced";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EventsPage() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<Event[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [mode, setMode] = useState("All");
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      try {
        const { data, error } = await (supabase as any)
          .from("events")
          .select(
            "id, title, category, description, start_date, end_date, location, mode, registration_link, organizer_id"
          )
          .order("start_date", { ascending: true });

        if (error) throw error;

        if (active) {
          setEvents((data || []) as Event[]);
        }

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (user) {
          const { data: registrations, error: registrationError } =
            await (supabase as any)
              .from("event_registrations")
              .select("event_id")
              .eq("user_id", user.id);

          if (registrationError) {
            console.error(
              "Registration loading error:",
              registrationError.message
            );
          } else if (active) {
            setRegisteredIds(
              (registrations || []).map(
                (registration: { event_id: string }) => registration.event_id
              )
            );
          }
        }
      } catch (error) {
        console.error("Events loading error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load events."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const search = query.toLowerCase().trim();

    return events.filter((event) => {
      const matchesCategory =
        category === "All" ||
        (event.category || "").toLowerCase().replace(/s$/, "") ===
          category.toLowerCase().replace(/s$/, "");

      const matchesMode =
        mode === "All" ||
        (event.mode || "").toLowerCase() === mode.toLowerCase();

      const matchesSearch =
        !search ||
        [
          event.title,
          event.description,
          event.location,
          event.category,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(search));

      return matchesCategory && matchesMode && matchesSearch;
    });
  }, [events, query, category, mode]);

  async function handleRegister(event: Event) {
    setRegisteringId(event.id);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        toast.error("Please log in to register for an event.");
        await navigate({ to: "/login" });
        return;
      }

      if (registeredIds.includes(event.id)) {
        toast.info("You are already registered for this event.");
        return;
      }

      const { error } = await (supabase as any)
        .from("event_registrations")
        .insert({
          event_id: event.id,
          user_id: user.id,
        });

      if (error) {
        if (error.code === "23505") {
          setRegisteredIds((previous) => [...previous, event.id]);
          toast.info("You are already registered for this event.");
          return;
        }

        throw error;
      }

      setRegisteredIds((previous) => [...previous, event.id]);
      toast.success("Successfully registered for the event!");
    } catch (error) {
      console.error("Event registration error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setRegisteringId(null);
    }
  }

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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search events, cities or organisers"
              className="h-11 rounded-full pl-9"
              aria-label="Search events"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={category === item ? "default" : "outline"}
                className="rounded-full"
                onClick={() => setCategory(item)}
              >
                {item}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {modes.map((item) => (
              <Button
                key={item}
                size="sm"
                variant={mode === item ? "secondary" : "ghost"}
                className="rounded-full"
                onClick={() => setMode(item)}
              >
                {item === "All" ? "Any mode" : item}
              </Button>
            ))}
          </div>
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-4 py-12">
        {loading ? (
          <p className="py-12 text-center text-muted-foreground">
            Loading events...
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed p-14 text-center">
            <h2 className="text-lg font-semibold">
              No events found
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Try a different search or clear your filters.
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
            {filtered.map((event) => {
              const isRegistered = registeredIds.includes(event.id);
              const isSelected = selectedEvent === event.id;

              return (
                <Card
                  key={event.id}
                  className="card-hover flex flex-col overflow-hidden rounded-2xl"
                >
                  <div className="gradient-brand h-24" />

                  <CardContent className="flex flex-1 flex-col p-5">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        {event.category || "General"}
                      </Badge>

                      <Badge variant="outline" className="rounded-full">
                        {event.mode || "Mode not specified"}
                      </Badge>
                    </div>

                    <h2 className="mt-3 text-lg font-semibold">
                      {event.title}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {event.description || "No description available."}
                    </p>

                    <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CalendarDays className="size-4 shrink-0" />
                        {formatDate(event.start_date)}
                      </li>

                      {event.end_date && (
                        <li className="flex items-center gap-2">
                          <CalendarDays className="size-4 shrink-0" />
                          Ends: {formatDate(event.end_date)}
                        </li>
                      )}

                      <li className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        {event.location || "Location not specified"}
                      </li>

                      <li className="flex items-center gap-2">
                        <Users className="size-4 shrink-0" />
                        Student event
                      </li>
                    </ul>

                    {isSelected && (
                      <div className="mt-4 rounded-xl bg-muted p-3">
                        <p className="text-sm font-medium">
                          Event details
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                          {event.description || "No additional details available."}
                        </p>

                        {event.registration_link && (
                          <a
                            href={event.registration_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                          >
                            External registration link
                            <ExternalLink className="size-4" />
                          </a>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex gap-2 pt-5">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-full"
                        onClick={() =>
                          setSelectedEvent(isSelected ? null : event.id)
                        }
                      >
                        {isSelected ? "Hide Details" : "View Details"}
                      </Button>

                      <Button
                        className="flex-1 rounded-full"
                        disabled={isRegistered || registeringId === event.id}
                        onClick={() => handleRegister(event)}
                      >
                        {isRegistered
                          ? "Registered"
                          : registeringId === event.id
                            ? "Registering..."
                            : "Register"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}