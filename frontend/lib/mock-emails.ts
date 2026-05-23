import type { EmailWorkspaceData } from "@/lib/types";
import { getMockCompany } from "@/lib/mock-intelligence";

const HOUR = 60 * 60 * 1000;
const iso = (offsetMs: number) =>
  new Date(Date.now() - offsetMs).toISOString();

export function getMockEmailWorkspace(campaignId: string): EmailWorkspaceData {
  const company = getMockCompany("core42");
  return {
    campaign_id: campaignId,
    campaign_name: `${company.name} Outreach`,
    company,
    personalization: {
      recent_ai_initiative: `${company.name} launched a sovereign AI infrastructure platform for healthcare, signalling appetite for regulated, security-first AI.`,
      detected_risks: [
        "Prompt injection in clinical copilots",
        "Model & data poisoning during partner onboarding",
        "Multi-tenant misconfiguration",
      ],
      matched_services: [
        "AI Security Assessment",
        "AI Red Teaming",
        "Cloud Security Review",
      ],
      targeting: "Head of AI, Head of Cloud and VP Engineering",
      context_summary:
        "Sovereign AI buildout in healthcare. Buyer is balancing velocity with regulator scrutiny — a clear fit for our governance + red-teaming bundle.",
    },
    emails: [
      {
        id: "em1",
        step: 1,
        type: "Initial Outreach",
        status: "Approved",
        subject: `Strengthening ${company.name}'s AI infrastructure security`,
        body: `Hi {{first_name}},

Saw the launch of ${company.name}'s sovereign AI infrastructure platform for healthcare — congrats. It's a strong signal: regulated buyers are clearly asking for both AI velocity and assurance.

As organisations rapidly adopt AI, securing data, models and clinical copilots becomes mission-critical. We've helped similar GCC platforms harden multi-tenant cloud, red-team clinical copilots, and align with NIST AI RMF / ISO 42001 — without slowing delivery.

Would it be useful to compare notes for 20 minutes next week? Happy to share what we're seeing across healthcare AI in the region.

Best,
{{sender_name}}`,
        personalization_score: 92,
        relevance_score: 88,
        ai_suggestions: [
          `Add a concrete metric ${company.name} cares about (e.g. mean time to harden a tenant).`,
          "Replace the generic 'happy to share' line with a specific artifact you can offer.",
          "Highlight relevant ISO 42001 alignment work in a one-line proof point.",
        ],
        updated: iso(1 * HOUR),
      },
      {
        id: "em2",
        step: 2,
        type: "Value Follow-up",
        status: "Draft",
        subject: `${company.name} + AI red-teaming: a quick proof point`,
        body: `Hi {{first_name}},

Following up on the note about ${company.name}'s sovereign AI platform. Sharing a quick proof point in case useful: we recently red-teamed a regional healthcare LLM and surfaced 14 prompt-injection paths before launch — 4 of which would have exposed PHI under realistic clinician workflows.

If you're already tracking this internally, ignore me. If you'd like a peek at the methodology, I can send a one-pager.

Best,
{{sender_name}}`,
        personalization_score: 86,
        relevance_score: 84,
        ai_suggestions: [
          "Quantify outcome with a stronger before/after framing.",
          "Reference a public ${company.name} talk or paper if available.",
        ],
        updated: iso(3 * HOUR),
      },
      {
        id: "em3",
        step: 3,
        type: "Final Follow-up",
        status: "Draft",
        subject: `Closing the loop — sovereign AI security for ${company.name}`,
        body: `Hi {{first_name}},

Last note from me on this thread — wanted to be respectful of your inbox.

If sovereign AI security for ${company.name} is on your roadmap in the next 1–2 quarters, I'd love to be the first call. If not, all good — I'll close the loop on my side.

Either way, congrats again on the platform launch.

Best,
{{sender_name}}`,
        personalization_score: 78,
        relevance_score: 80,
        ai_suggestions: [
          "Soften the CTA — 'first call' may read as too forward for a final touch.",
          "Offer a low-friction artifact (slide, benchmark) as an alternative to a meeting.",
        ],
        updated: iso(5 * HOUR),
      },
    ],
  };
}
