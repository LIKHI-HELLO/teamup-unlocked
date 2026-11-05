import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  CalendarDays,
  FolderGit2,
  MessageCircleQuestion,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import heroImage from "@/assets/hero-students.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UNSTUCK — Find Teammates, Explore Events, Build Together" },
      {
        name: "description",
        content:
          "UNSTUCK is India's student collaboration platform for hackathons, projects, innovation and community learning.",
      },
      { property: "og:title", content: "UNSTUCK — Find Teammates, Explore Events, Build Together" },
      {
        property: "og:description",
        content:
          "Join 10,000+ students finding teammates, discovering hackathons and showcasing projects.",
      },
    ],
  }),
  component: Landing,
});

const stats = [
  { value: "10,000+", label: "Students" },
  { value: "500+", label: "Teams" },
  { value: "1,000+", label: "Projects" },
  { value: "200+", label: "Events" },
];

const features = [
  {
    icon: Users,
    title: "Find Teammates",
    body: "Match with students whose skills complete your team, filtered by event and availability.",
  },
  {
    icon: CalendarDays,
    title: "Discover Events",
    body: "Hackathons, workshops, competitions and internships in one searchable feed.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask Questions",
    body: "Post what you're stuck on and get answers from students who've solved it already.",
  },
  {
    icon: FolderGit2,
    title: "Showcase Projects",
    body: "Publish your build with tech stack, screenshots and live demo links.",
  },
  {
    icon: TrendingUp,
    title: "Build Reputation",
    body: "Earn points for helpful answers and accepted solutions, and climb the weekly board.",
  },
  {
    icon: Award,
    title: "Earn Achievements",
    body: "Unlock badges like Problem Solver, Team Builder and Hackathon Champion.",
  },
];

const testimonials = [
  {
    quote:
      "I found three teammates in two days and we ended up winning our first hackathon together.",
    name: "Ananya Gupta",
    role: "3rd year, NIT Trichy",
  },
  {
    quote:
      "The community answered a deployment question at 2 AM the night before our demo. Genuinely saved us.",
    name: "Arjun Verma",
    role: "2nd year, VIT Vellore",
  },
  {
    quote:
      "My project page got noticed by a startup recruiter. That turned into a paid summer internship.",
    name: "Meera Nair",
    role: "Final year, COEP",
  },
];

function Landing() {
  return (
    <>
      <section className="surface-glow relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              <Sparkles className="mr-1 size-3.5" /> Built for Indian student builders
            </Badge>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] sm:text-5xl lg:text-6xl">
              Find Teammates. <span className="text-gradient">Explore Events.</span> Build Together.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              India&apos;s student collaboration platform for hackathons, projects, innovation and
              community learning.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full shadow-glow">
                <Link to="/signup">Sign Up For Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/events">Explore Events</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="gradient-brand absolute -inset-4 rounded-[2rem] opacity-20 blur-2xl" />
            <img
              src={heroImage}
              alt="Students collaborating on laptops at a hackathon"
              width={1280}
              height={960}
              className="relative w-full rounded-3xl border shadow-soft"
            />
          </div>
        </div>
      </section>

      <section className="border-y bg-card/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-gradient sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">Everything a student builder needs</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          From the first idea to the final demo — teammates, events, answers and a portfolio that
          proves what you shipped.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="card-hover rounded-2xl border-border/70">
              <CardContent className="p-6">
                <span className="gradient-brand mb-4 flex size-11 items-center justify-center rounded-xl shadow-glow">
                  <f.icon className="size-5 text-primary-foreground" />
                </span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-bold sm:text-4xl">Students who got unstuck</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="card-hover rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 text-warning">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">“{t.quote}”</p>
                  <div className="mt-5">
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-20">
        <h2 className="text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.slice(0, 5).map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 rounded-3xl gradient-brand p-8 text-center shadow-glow">
          <h3 className="text-2xl font-bold text-primary-foreground">Ready to build together?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/85">
            Create your student profile in under a minute and find your next team today.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 rounded-full">
            <Link to="/signup">Sign Up For Free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
