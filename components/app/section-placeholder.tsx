import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { PageHeader } from "./page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Honest placeholder for sections still being built. Describes exactly what the
 * section will do — no fake buttons that appear functional.
 */
export function SectionPlaceholder({
  title,
  description,
  icon: Icon,
  capabilities,
  cta,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  capabilities: string[];
  cta?: { label: string; href: string };
}) {
  return (
    <>
      <PageHeader title={title} description={description}>
        <Badge variant="muted">In development</Badge>
      </PageHeader>

      <Card className="overflow-hidden">
        <CardContent className="grid gap-8 p-8 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-8" />
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                What {title.toLowerCase()} will do
              </h2>
              <p className="text-sm text-muted-foreground">
                This section is part of the build plan and connects to the schema
                and adapters already in place.
              </p>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {capabilities.map((cap) => (
                <li
                  key={cap}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {cap}
                </li>
              ))}
            </ul>
            {cta && (
              <Button asChild variant="outline" className="mt-2">
                <Link href={cta.href}>
                  {cta.label} <ArrowRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
