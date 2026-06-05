"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Mail, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CONTACT_EMAIL = "hello@tryavokado.com";

type FormState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  company: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) {
    errors.name = "Please add your name.";
  }
  if (!form.email.trim()) {
    errors.email = "Please add an email address.";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "That email address doesn’t look quite right.";
  }
  if (!form.message.trim()) {
    errors.message = "Let us know how we can help.";
  }
  return errors;
}

function buildMailtoHref(form: FormState): string {
  const subject = form.company.trim()
    ? `Avokado enquiry — ${form.company.trim()}`
    : "Avokado enquiry";

  const bodyLines = [
    `Name: ${form.name.trim()}`,
    `Email: ${form.email.trim()}`,
    form.company.trim() ? `Company: ${form.company.trim()}` : null,
    "",
    form.message.trim(),
  ].filter((line): line is string => line !== null);

  const params = new URLSearchParams({
    subject,
    body: bodyLines.join("\r\n"),
  });

  // URLSearchParams encodes spaces as "+", which most mail clients tolerate,
  // but %20 is safer across the board for mailto bodies and subjects.
  const query = params.toString().replace(/\+/g, "%20");
  return `mailto:${CONTACT_EMAIL}?${query}`;
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    window.location.href = buildMailtoHref(form);
    setSubmitted(true);
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-5" />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-foreground">
          Your email is ready to send
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          We just opened a pre-filled message in your email client, addressed to{" "}
          <span className="font-medium text-foreground">{CONTACT_EMAIL}</span>.
          Review it, send it, and we’ll reply within one business day. If nothing
          opened, you can email us directly at the same address.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <a href={buildMailtoHref(form)}>
              <Mail className="size-4" /> Reopen the email
            </a>
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="size-4" /> Write another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-card p-6 sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              name="name"
              autoComplete="name"
              placeholder="Jane Cooper"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
            />
            {errors.name && (
              <p id="contact-name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="jane@store.com"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
            />
            {errors.email && (
              <p id="contact-email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact-company">
            Company{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="contact-company"
            name="company"
            autoComplete="organization"
            placeholder="Your store or brand"
            value={form.company}
            onChange={(event) => updateField("company", event.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea
            id="contact-message"
            name="message"
            rows={6}
            placeholder="Tell us about your store, your ad goals, or the question on your mind."
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            aria-required="true"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
          />
          {errors.message && (
            <p id="contact-message-error" className="text-sm text-destructive">
              {errors.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="submit" size="lg" className="sm:w-auto">
            Open email to send <ArrowRight className="size-4" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Opens your email client with the details filled in. Nothing is sent
            until you press send.
          </p>
        </div>
      </div>
    </form>
  );
}
