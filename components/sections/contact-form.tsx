"use client";

import { useState } from "react";
import services from "@/data/services.json";
import { trackClick } from "@/lib/analytics-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconCheck } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBranding } from "@/components/site/branding-provider";

type FormValues = {
  name: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  company: "",
  phone: "",
  service: "",
  budget: "",
  timeline: "",
  message: "",
};

/** A phone is valid when it has 7–15 digits (spaces, +, - and () allowed). */
function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Contact inquiry form (docs/04_COMPONENT_LIBARY.MD, docs/08_CONTENT_PLAN.MD).
 * Submits to POST /api/leads (validation, storage, email notification).
 */
export function ContactForm() {
  // Budget ranges, timeline options and the phone-required toggle are editable
  // from the dashboard (Settings → Inquiry form) — no redeploy needed.
  const { branding } = useBranding();
  const budgetOptions = branding.budgetOptions;
  const timelineOptions = branding.timelineOptions;
  const phoneRequired = branding.phoneRequired;

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const update =
    (field: keyof FormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((prev) => ({ ...prev, [field]: event.target.value }));

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Please enter a valid email address.";
    if (!values.company.trim()) next.company = "Please enter your company name.";
    if (!values.phone.trim()) {
      if (phoneRequired) next.phone = "Please enter your phone number.";
    } else if (!isValidPhone(values.phone)) {
      next.phone = "Please enter a valid phone number.";
    }
    if (values.message.trim().length < 10)
      next.message = "Tell us a little more (at least 10 characters).";
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setSubmitError(null);
    trackClick("contact-form");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setStatus("success");
        return;
      }

      const data = (await response.json().catch(() => null)) as
        | { error?: string; errors?: Record<string, string> }
        | null;

      if (response.status === 400 && data?.errors) {
        setErrors(data.errors);
      } else {
        setSubmitError(data?.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    }
    setStatus("idle");
  };

  if (status === "success") {
    return (
      <Card className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <IconCheck className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold tracking-tight">Thanks, {values.name.split(" ")[0]}!</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Your inquiry has been received. We&apos;ll get back to you within one business day.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setValues(initialValues);
            setStatus("idle");
          }}
        >
          Send another inquiry
        </Button>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Name *"
          name="name"
          placeholder="Jane Smith"
          value={values.name}
          onChange={update("name")}
          error={errors.name}
          required
        />
        <Input
          label="Email *"
          name="email"
          type="email"
          placeholder="jane@company.com"
          value={values.email}
          onChange={update("email")}
          error={errors.email}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Company *"
          name="company"
          placeholder="ABC Accounting"
          value={values.company}
          onChange={update("company")}
          error={errors.company}
          required
        />
        <Input
          label={phoneRequired ? "Phone *" : "Phone (optional)"}
          name="phone"
          type="tel"
          placeholder="+1 555 000 0000"
          value={values.phone}
          onChange={update("phone")}
          error={errors.phone}
          required={phoneRequired}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Service needed" name="service" value={values.service} onChange={update("service")}>
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.title} value={service.title}>
              {service.title}
            </option>
          ))}
          <option value="Not sure yet">Not sure yet</option>
        </Select>

        <Select label="Budget" name="budget" value={values.budget} onChange={update("budget")}>
          <option value="">Select a range</option>
          {budgetOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>

        <Select label="Timeline" name="timeline" value={values.timeline} onChange={update("timeline")}>
          <option value="">Select a timeline</option>
          {timelineOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </div>

      <Textarea
        label="Project description *"
        name="message"
        placeholder="Tell us about the process you want to automate..."
        value={values.message}
        onChange={update("message")}
        error={errors.message}
        required
      />

      {submitError && (
        <p role="alert" className="text-sm text-red-400">
          {submitError}
        </p>
      )}

      <div className="mt-2 flex items-center justify-between gap-4">
        <p className="text-xs text-muted">
          * Required fields. We reply within one business day.
        </p>
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending..." : "Send inquiry"}
        </Button>
      </div>
    </form>
  );
}
