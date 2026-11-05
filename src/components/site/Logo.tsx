import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="gradient-brand flex size-9 items-center justify-center rounded-xl shadow-glow">
        <Zap className="size-5 text-primary-foreground" strokeWidth={2.5} />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">UNSTUCK</span>
    </Link>
  );
}
