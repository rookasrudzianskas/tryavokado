"use client";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Globe, Loader2, ShoppingBag, Store } from "lucide-react";
import { createWorkspaceAction } from "@/app/onboarding/actions";
import {
  createWorkspaceSchema,
  type CreateWorkspaceFormInput,
} from "@/lib/validations/workspace";
import { type EcommercePlatform } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PLATFORMS: {
  value: EcommercePlatform;
  label: string;
  description: string;
  icon: typeof Store;
}[] = [
  { value: "shopify", label: "Shopify", description: "Connect via OAuth", icon: ShoppingBag },
  { value: "woocommerce", label: "WooCommerce", description: "REST API keys", icon: Store },
  { value: "website", label: "Website only", description: "Inspect any URL", icon: Globe },
];

export function CreateWorkspaceForm() {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateWorkspaceFormInput>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const selected = useWatch({ control, name: "primaryPlatform" });

  function onSubmit(values: CreateWorkspaceFormInput) {
    setServerError(null);
    startTransition(async () => {
      const res = await createWorkspaceAction(values);
      if (res && !res.ok) setServerError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="companyName">Company name</Label>
        <Input
          id="companyName"
          placeholder="e.g. Marlowe Coffee Co."
          autoFocus
          aria-invalid={!!errors.companyName}
          {...register("companyName")}
        />
        {errors.companyName && (
          <p className="text-xs text-destructive">{errors.companyName.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This becomes your workspace name. You can change it later.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Primary ecommerce platform</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const active = selected === platform.value;
            return (
              <button
                type="button"
                key={platform.value}
                onClick={() =>
                  setValue("primaryPlatform", platform.value, {
                    shouldValidate: true,
                  })
                }
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40 hover:bg-accent/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {platform.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {platform.description}
                </span>
              </button>
            );
          })}
        </div>
        {errors.primaryPlatform && (
          <p className="text-xs text-destructive">
            Choose where your products live.
          </p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        Create workspace
      </Button>
    </form>
  );
}
