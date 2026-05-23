import type { Company, CompanyIntelligence } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;
const iso = (offsetMs: number) =>
  new Date(Date.now() - offsetMs).toISOString();

const CORE42: Company = {
  id: "core42",
  name: "Core42",
  website: "https://core42.ai",
  industry: "AI Infrastructure",
  country: "United Arab Emirates",
  tags: ["Healthcare", "AI Infrastructure"],
};

const PRESIGHT: Company = {
  id: "presight",
  name: "Presight AI",
  website: "https://presight.ai",
  industry: "AI Analytics",
  country: "United Arab Emirates",
  tags: ["Analytics", "Government"],
};

const G42_HEALTH: Company = {
  id: "g42-healthcare",
  name: "G42 Healthcare",
  website: "https://g42healthcare.ai",
  industry: "Healthcare AI",
  country: "United Arab Emirates",
  tags: ["Healthcare", "AI"],
};

const COMPANIES: Record<string, Company> = {
  core42: CORE42,
  presight: PRESIGHT,
  "g42-healthcare": G42_HEALTH,
};

/** Lookup helper used by route pages. Falls back to Core42 sample. */
export function getMockCompany(id: string): Company {
  return COMPANIES[id] ?? CORE42;
}

export function getMockIntelligence(companyId: string): CompanyIntelligence {
  const company = getMockCompany(companyId);
  return {
    company,
    opportunity_score: 92,
    latest_signal: {
      title: `${company.name} launches sovereign AI infrastructure platform for healthcare`,
      source: "TechMENA",
      published_at: iso(2 * DAY),
      summary: `${company.name} announced the launch of a sovereign cloud platform built for healthcare and life sciences, enabling secure deployment of AI applications on UAE-based infrastructure with strict data residency and compliance controls.`,
      url: "https://example.com/news/core42-sovereign-ai",
    },
    initiative_summary: `${company.name} is building a sovereign AI and cloud infrastructure platform focused on healthcare and life sciences. Their solution enables regulated organisations to securely build, train and deploy AI models while meeting data residency, privacy and compliance requirements specific to the GCC.`,
    why_this_company: `${company.name} sits at the intersection of regulated industries (healthcare, public sector) and high-velocity AI deployment. The combined demand for AI velocity and assurance creates an unusually strong fit for our cybersecurity, governance and red-teaming services — they need both to move fast and to prove safety.`,
    risks: [
      {
        id: "r1",
        title: "Prompt injection in clinical copilots",
        description:
          "LLM-powered assistants exposed to clinician input are vulnerable to prompt injection that can exfiltrate PHI or alter outputs.",
        severity: "High",
      },
      {
        id: "r2",
        title: "Model & data poisoning",
        description:
          "Healthcare training pipelines are exposed to tampered datasets and adversarial fine-tuning during partner onboarding.",
        severity: "High",
      },
      {
        id: "r3",
        title: "Cloud misconfiguration in multi-tenant AI",
        description:
          "Sovereign multi-tenant AI platforms commonly leak across tenants when IAM, VPC and KMS policies aren't co-designed.",
        severity: "Medium",
      },
      {
        id: "r4",
        title: "Lack of AI governance & assurance",
        description:
          "Limited evidence of formal AI risk management framework (NIST AI RMF, ISO/IEC 42001) — a likely gap for regulated buyers.",
        severity: "Medium",
      },
    ],
    matched_services: [
      {
        id: "s1",
        name: "AI Security Assessment",
        rationale:
          "End-to-end review of LLM/AI surfaces against OWASP LLM Top 10 and MITRE ATLAS.",
      },
      {
        id: "s2",
        name: "AI Red Teaming",
        rationale:
          "Adversarial testing of clinical copilots and agents — jailbreaks, data exfiltration, abuse cases.",
      },
      {
        id: "s3",
        name: "Cloud Security Review",
        rationale:
          "Hardening of multi-tenant sovereign AI cloud across IAM, networking and KMS.",
      },
      {
        id: "s4",
        name: "AI Governance & Compliance",
        rationale:
          "NIST AI RMF / ISO 42001 alignment programme tailored to healthcare regulators.",
      },
    ],
    stakeholders: [
      {
        id: "p1",
        name: "Head of AI",
        role: "Owner of AI strategy & product",
        team: "AI / Product",
        reason:
          "Owns the AI roadmap and feels the friction of governance gaps first.",
      },
      {
        id: "p2",
        name: "Head of Cloud",
        role: "Owner of infrastructure & multi-tenant platform",
        team: "Cloud Engineering",
        reason:
          "Accountable for sovereign cloud assurance and tenant isolation.",
      },
      {
        id: "p3",
        name: "VP Engineering",
        role: "Owns delivery velocity & quality",
        team: "Engineering",
        reason:
          "Cares about red-teaming as a way to ship AI features safely & fast.",
      },
    ],
    key_takeaway: `${company.name} is doubling down on sovereign AI infrastructure for healthcare with a high-value opportunity. Engaging the right stakeholders with a clear AI security & compliance narrative is the winning approach in the next 90 days.`,
    sources: [
      {
        id: "src1",
        title: `${company.name} unveils sovereign AI cloud`,
        url: "https://example.com/news/core42-sovereign-ai",
        publisher: "TechMENA",
        date: iso(2 * DAY),
      },
      {
        id: "src2",
        title: "GCC healthcare AI market outlook 2026",
        url: "https://example.com/report/gcc-healthcare-ai-2026",
        publisher: "Gulf Insights",
        date: iso(14 * DAY),
      },
      {
        id: "src3",
        title: "Sovereign AI: regulator perspectives",
        url: "https://example.com/article/sovereign-ai-regulators",
        publisher: "MENA Tech Review",
        date: iso(30 * DAY),
      },
    ],
  };
}
