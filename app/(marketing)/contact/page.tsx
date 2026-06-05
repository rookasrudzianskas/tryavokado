import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Reveal } from "@/components/marketing/reveal";
import { ContactForm } from "@/components/marketing/contact-form";

const CONTACT_EMAIL = "hello@tryavokado.com";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Avokado team. Send us a message and we’ll reply within one business day — or email us directly at hello@tryavokado.com.",
};

const LINKS = [
  {
    href: "/how-it-works",
    title: "See how it works",
    body: "Walk through the path from connecting your store to launching campaigns.",
    icon: MessageSquare,
  },
  {
    href: "/security",
    title: "Security & data handling",
    body: "How we encrypt tokens, gate spend, and keep the AI from acting on its own.",
    icon: ShieldCheck,
  },
];

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
      <Reveal>
        <div className="max-w-2xl">
          <Badge variant="outline" className="gap-1.5">
            <Mail className="size-3 text-primary" /> Contact
          </Badge>
          <h1 className="mt-5 text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
            Let’s talk about your store and your ads.
          </h1>
          <p className="mt-5 text-pretty text-lg text-muted-foreground">
            Questions about setup, pricing, security, or whether Avokado fits the
            way you work? Send us a note. A real person reads every message, and
            we reply within one business day.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <Reveal>
          <ContactForm />
        </Reveal>

        <Reveal delay={0.08}>
          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Reach us directly
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Prefer your own email client? Write to us at the address below
                and we’ll pick it up.
              </p>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group mt-5 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="size-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {CONTACT_EMAIL}
                  </span>
                </span>
                <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </a>

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-muted/60 px-4 py-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm text-muted-foreground">
                  We typically reply within{" "}
                  <span className="font-medium text-foreground">
                    one business day
                  </span>
                  , Monday to Friday.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
              <h2 className="font-display text-lg font-semibold text-foreground">
                You might be looking for
              </h2>
              <Separator className="my-5" />
              <ul className="space-y-5">
                {LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-start gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <link.icon className="size-4" />
                      </span>
                      <span>
                        <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                          {link.title}
                          <ArrowUpRight className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                        </span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {link.body}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
