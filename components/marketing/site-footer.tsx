import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_DOMAIN } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/register", label: "Create account" },
      { href: "/login", label: "Log in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">
            The creative operating system for ecommerce advertising. Built with
            safety and approval controls at every step.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
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
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Avokado. All rights reserved.</p>
          <p>{APP_DOMAIN}</p>
        </div>
      </div>
    </footer>
  );
}
