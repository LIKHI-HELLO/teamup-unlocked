import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqs } from "@/data/mock";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — How UNSTUCK Works" },
      {
        name: "description",
        content:
          "Answers about teams, events, reputation points, project showcases and using UNSTUCK as a student.",
      },
      { property: "og:title", content: "FAQs — How UNSTUCK Works" },
      {
        property: "og:description",
        content: "Common questions about teammate matching, events and reputation on UNSTUCK.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQs"
        title="Everything you might be wondering"
        subtitle="Still stuck? Post it in the community and a student will answer."
      />
      <section className="mx-auto max-w-3xl px-4 py-12">
        <Accordion type="single" collapsible>
          {faqs.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild className="rounded-full">
            <Link to="/community">Ask the community</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/signup">Create your profile</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
