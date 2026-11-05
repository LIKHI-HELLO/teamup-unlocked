import { Link } from "@tanstack/react-router";

import { Logo } from "./Logo";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Events", to: "/events" },
      { label: "Teams", to: "/teams" },
      { label: "Projects", to: "/projects" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Community", to: "/community" },
      { label: "I'm Stuck", to: "/community" },
      { label: "FAQs", to: "/faqs" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Login", to: "/login" },
      { label: "Sign Up", to: "/signup" },
      { label: "Dashboard", to: "/dashboard" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            India&apos;s student collaboration platform for hackathons, projects, innovation and
            community learning.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-4 space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} UNSTUCK. Built by students, for students.
      </div>
    </footer>
  );
}
