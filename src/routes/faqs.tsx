import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  HelpCircle,
  Users,
  CalendarDays,
  Trophy,
  BookOpen,
  MessageCircle,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — Help Centre | UNSTUCK" },
      {
        name: "description",
        content:
          "Find answers to common questions about UNSTUCK, student teams, events and community.",
      },
      { property: "og:title", content: "FAQs — Help Centre | UNSTUCK" },
      {
        property: "og:description",
        content: "Everything you need to know about using UNSTUCK.",
      },
    ],
  }),
  component: FaqPage,
});

const faqItems = [
  {
    q: "Is UNSTUCK free for students?",
    a: "Yes. Creating a profile, joining teams, posting questions and showcasing projects are all free for students.",
    category: "Getting Started",
  },
  {
    q: "How does teammate matching work?",
    a: "We match you with students whose skills complement yours, filtered by the events you are interested in and your availability for hackathons.",
    category: "Teams",
  },
  {
    q: "Can I join a team without a project idea?",
    a: "Absolutely. Many teams look for specific skills rather than ideas — browse open teams and send a join request.",
    category: "Teams",
  },
  {
    q: "Do organisers post events directly?",
    a: "Verified organisers publish events with registration details, prize pools and team-size requirements.",
    category: "Events",
  },
  {
    q: "How do reputation points work?",
    a: "You earn points for helpful answers, accepted solutions, upvotes and shipped projects. Points unlock badges and a weekly leaderboard rank.",
    category: "Community",
  },
  {
    q: "Can I use UNSTUCK if I am in my first year?",
    a: "Yes — first-year students are among our most active members. Start by answering questions in your strongest subject.",
    category: "Getting Started",
  },
];

const categories = [
  { name: "All Questions", icon: HelpCircle },
  { name: "Getting Started", icon: BookOpen },
  { name: "Teams", icon: Users },
  { name: "Events", icon: CalendarDays },
  { name: "Community", icon: Trophy },
];

function FaqPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Questions");

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All Questions" ||
        item.category === activeCategory;

      const matchesSearch =
        !query ||
        item.q.toLowerCase().includes(query) ||
        item.a.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <>
      <PageHeader
        eyebrow="HELP CENTRE"
        title="How can we help you?"
        subtitle="Find answers, explore UNSTUCK and get the most out of your student community."
      />

      <main className="min-h-screen bg-background">
        <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6">
          {/* Search section */}
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-5 flex items-center justify-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              YOUR QUESTIONS, ANSWERED
            </div>

            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What would you like to know?
            </h2>

            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Search for answers about teams, projects, events and more.
            </p>

            <div className="relative mt-7">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search your question..."
                aria-label="Search frequently asked questions"
                className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-12 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div className="mt-12">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Browse by category</h3>
              <span className="text-sm text-muted-foreground">
                {filteredFaqs.length} questions found
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.name;

                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() => setActiveCategory(category.name)}
                    aria-pressed={isActive}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FAQ questions */}
          <section className="mt-9">
            {filteredFaqs.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card px-5 shadow-sm sm:px-7">
                <Accordion type="single" collapsible>
                  {filteredFaqs.map((item, index) => (
                    <AccordionItem
                      key={item.q}
                      value={item.q}
                      className="border-border"
                    >
                      <AccordionTrigger className="gap-4 py-6 text-left text-sm font-semibold hover:no-underline sm:text-base">
                        <span className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          {item.q}
                        </span>
                      </AccordionTrigger>

                      <AccordionContent className="pb-6 pl-10 text-sm leading-7 text-muted-foreground">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-primary">
                          {item.category}
                        </span>
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-14 text-center">
                <HelpCircle className="mx-auto h-10 w-10 text-muted-foreground" />

                <h3 className="mt-4 text-lg font-semibold">
                  No questions found
                </h3>

                <p className="mt-2 text-sm text-muted-foreground">
                  Try another keyword or select a different category.
                </p>

                <Button
                  variant="outline"
                  className="mt-5 rounded-full"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All Questions");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          </section>

          {/* Support section */}
          <section className="mt-16 overflow-hidden rounded-3xl border border-border bg-muted/40 p-7 sm:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight">
                Still have questions?
              </h2>

              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Can't find what you are looking for? Connect with other
                students in the UNSTUCK community and get help.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button asChild className="rounded-full">
                  <Link to="/community">
                    Ask the community
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/signup">Create your profile</Link>
                </Button>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}