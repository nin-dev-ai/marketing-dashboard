"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Loader2,
  Mail,
  Sparkles,
  Telescope,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INDUSTRIES = [
  "AI Infrastructure",
  "Healthcare AI",
  "Financial Services",
  "Government",
  "Telecommunications",
  "Energy",
  "Retail / E-commerce",
  "Other",
];

const COUNTRIES = [
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Bahrain",
  "Kuwait",
  "Oman",
  "Egypt",
  "Other",
];

const AI_STEPS = [
  {
    icon: Telescope,
    title: "Research AI initiatives",
    description:
      "We scan recent news, press, and public signals across the company's AI strategy.",
  },
  {
    icon: ShieldAlert,
    title: "Detect cyber risks",
    description:
      "Identify AI-specific risks: prompt injection, model abuse, governance gaps, cloud exposure.",
  },
  {
    icon: Wrench,
    title: "Match your services",
    description:
      "Map our security offers to their initiatives so each conversation lands sharply.",
  },
  {
    icon: Mail,
    title: "Generate outreach",
    description:
      "A 3-step personalized email sequence written for the right stakeholders.",
  },
];

export default function AddDreamCompanyPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    website: "",
    industry: "",
    country: "",
    notes: "",
  });

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim()) {
      toast.error("Company name is required.");
      return;
    }
    setSubmitting(true);
    // Simulate the POST → intelligence-generation pipeline.
    await new Promise((r) => setTimeout(r, 900));
    setSubmitting(false);
    toast.success("Generating intelligence — redirecting…");
    router.push(`/intelligence/core42`);
  }

  return (
    <>
      <PageHeader
        title="Add Dream Company"
        subtitle="Tell us about your target company and let AI uncover the right opportunities."
      />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <Card className="flex flex-col">
          <div className="flex-1 space-y-6 p-6">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Company information
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter the details of the company you want to target.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <Field
                id="company_name"
                label="Company Name"
                required
              >
                <Input
                  id="company_name"
                  name="company_name"
                  placeholder="e.g. Core42"
                  value={form.company_name}
                  onChange={handleChange}
                  autoComplete="organization"
                />
              </Field>

              <Field id="website" label="Website">
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={handleChange}
                  autoComplete="url"
                />
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field id="industry" label="Industry">
                  <SelectInput
                    id="industry"
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                    placeholder="Select industry"
                    options={INDUSTRIES}
                  />
                </Field>
                <Field id="country" label="Country">
                  <SelectInput
                    id="country"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    placeholder="Select country"
                    options={COUNTRIES}
                  />
                </Field>
              </div>

              <Field id="notes" label="Notes">
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  placeholder="Add any additional context about this company…"
                  value={form.notes}
                  onChange={handleChange}
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
            <p className="text-xs text-muted-foreground">
              You can edit any of these details later from the company profile.
            </p>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" type="button">
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {submitting ? "Generating…" : "Generate Intelligence"}
              </Button>
            </div>
          </div>
        </Card>

        <aside className="space-y-4">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-primary-100 to-primary-50 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary-700">
                    Let AI find the right signals
                  </p>
                  <p className="text-xs text-primary-700/70">
                    Run by AI with research and review by you.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {AI_STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1 leading-snug">
                      <p className="text-sm font-medium text-foreground">
                        {i + 1}. {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border bg-muted/40 px-4 py-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ArrowRight className="h-3.5 w-3.5" />
                Takes ~30 seconds. You can edit everything before sending.
              </p>
            </div>
          </Card>
        </aside>
      </form>
    </>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function SelectInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  options,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
