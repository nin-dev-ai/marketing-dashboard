import type { CampaignDetail } from "@/lib/types";
import { getMockCompany } from "@/lib/mock-intelligence";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const iso = (offsetMs: number) =>
  new Date(Date.now() - offsetMs).toISOString();

export function getMockCampaign(campaignId: string): CampaignDetail {
  const company = getMockCompany("core42");
  return {
    id: campaignId,
    name: `${company.name} Outreach`,
    company,
    status: "Draft",
    opportunity_score: 92,
    emails_count: 3,
    stakeholders_count: 5,
    timeline: [
      {
        id: "t1",
        label: "Company Added",
        status: "completed",
        timestamp: iso(7 * DAY),
        caption: "Created by James Pasaporten",
      },
      {
        id: "t2",
        label: "AI Intelligence Generated",
        status: "completed",
        timestamp: iso(6 * DAY),
        caption: "12 risks · 4 services · 3 stakeholders",
      },
      {
        id: "t3",
        label: "Emails Generated",
        status: "completed",
        timestamp: iso(5 * DAY),
        caption: "3-step sequence",
      },
      {
        id: "t4",
        label: "Approved",
        status: "in_progress",
        caption: "1 of 3 approved",
      },
      {
        id: "t5",
        label: "Ready to Send",
        status: "pending",
      },
      {
        id: "t6",
        label: "Sent",
        status: "pending",
      },
    ],
    summary: {
      key_signal: `${company.name} is building a sovereign AI infrastructure platform for healthcare in the UAE.`,
      industry: "AI Infrastructure / Healthcare",
      country: "United Arab Emirates",
      added_on: iso(7 * DAY),
      matched_services: [
        "AI Security Assessment",
        "AI Red Teaming",
        "Cloud Security Review",
        "AI Governance & Compliance",
      ],
      why_high_value:
        "High investment in AI infrastructure paired with regulator scrutiny — ideal for security-anchored conversations.",
    },
    email_sequence: [
      {
        id: "es1",
        step: 1,
        type: "Initial Outreach",
        subject: `Strengthening ${company.name}'s AI infrastructure security`,
        status: "Approved",
      },
      {
        id: "es2",
        step: 2,
        type: "Value Follow-up",
        subject: `${company.name} + AI red-teaming: a quick proof point`,
        status: "Draft",
      },
      {
        id: "es3",
        step: 3,
        type: "Final Follow-up",
        subject: `Closing the loop — sovereign AI security for ${company.name}`,
        status: "Draft",
      },
    ],
    activity: [
      {
        id: "a1",
        message: "Email 1 approved by James Pasaporten",
        timestamp: iso(2 * HOUR),
      },
      {
        id: "a2",
        message: "AI suggestions regenerated for Email 2",
        timestamp: iso(5 * HOUR),
      },
      {
        id: "a3",
        message: "Email sequence drafted",
        timestamp: iso(5 * DAY),
      },
      {
        id: "a4",
        message: "AI Intelligence generated",
        timestamp: iso(6 * DAY),
      },
    ],
  };
}
