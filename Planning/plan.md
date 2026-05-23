###Stack 

Frontend: Next.js + TypeScript + Tailwind + shadcn/ui + Lucide icons
Backend: FastAPI on port 8000
AI Orchestration: LangGraph + LangChain
Storage for hackathon: local JSON first, Postgres/Supabase optional
Scraping: DuckDuckGo search + requests/BeautifulSoup + fallback sample data
Email: simulated send first, Resend optional later


###PRD

Build a full-stack hackathon MVP called "Emitly" based on the provided screenshots.

The product is an AI Marketing Intelligence and Outreach Platform for cybersecurity/AI-security sales teams.

Core use case:
A user adds a target company. The system researches recent AI-related activity from that company, identifies cybersecurity/AI-security risks, maps those risks to sellable services, recommends stakeholder roles, generates a 3-step personalized email sequence, and saves everything as a campaign.

Tech stack:
- Frontend: Next.js App Router + TypeScript + TailwindCSS + shadcn/ui + Lucide React
- Backend: FastAPI running on port 8000
- AI orchestration layer: structure backend so LangGraph can be added cleanly. Create placeholder graph/service modules now.
- Storage: use local JSON or in-memory store for MVP. Design code so it can later be swapped to Postgres/Supabase.
- Scraping: implement fallback-first architecture. If live scraping/search fails or API keys are missing, use local sample data.
- Email sending: implement simulated send first. Do not require real SMTP/API credentials.

Important:
The backend must run on localhost:8000.
The frontend must call the FastAPI backend.
Do not build authentication.
Do not build real email tracking.
Do not build complex RBAC.
Focus on a polished, working demo.

Design system:
Use the uploaded screenshots as the source of truth.
Visual style:
- Clean modern SaaS dashboard
- White/light grey background
- Dark green primary accent
- Soft green highlights
- Rounded cards
- Subtle shadows
- Spacious layout
- Premium B2B SaaS feel
- Left sidebar navigation
- Top search/header bar
- Consistent cards, badges, tabs, and tables

Brand:
Name: Emitly
Logo text: emitly
Primary color: deep green
Accent colors: soft green, pale yellow, soft blue, soft purple, soft red for risk

Navigation sidebar:
- Overview
- Dream Companies
- Campaigns
- Intelligence
- Email Workspace
- Contacts
- Automations
- Integrations
- Settings

Build these 5 screens:

SCREEN 1: Dashboard
Route: /dashboard
Use the dashboard screenshot as reference.

Content:
- Header: "Dashboard"
- Subtitle: "Here's what's happening with your outreach."
- CTA button: "Add Dream Company"
- KPI cards:
  1. Dream Companies
  2. Opportunities
  3. Emails Generated
  4. Ready to Send
- Recent Campaigns table with:
  Campaign, Company, Industry, Opportunity Score, Status, Emails, Updated
- Top Opportunities card/list
- Activity Feed card

SCREEN 2: Add Dream Company
Route: /dream-companies/new
Use the add company screenshot as reference.

Content:
- Header: "Add Dream Company"
- Subtitle: "Tell us about your target company and let AI uncover the right opportunities."
- Form fields:
  Company Name
  Website
  Industry
  Country
  Notes
- Buttons:
  Cancel
  Generate Intelligence
- Right-side AI helper panel:
  Title: "Let AI find the right signals"
  Steps:
  1. Research AI initiatives
  2. Detect cyber risks
  3. Match your services
  4. Generate outreach

On submit:
- Call POST http://localhost:8000/api/companies
- Then call POST http://localhost:8000/api/intelligence/generate
- Navigate to /intelligence/[companyId]

SCREEN 3: Company Intelligence
Route: /intelligence/[companyId]
Use the company intelligence screenshot as reference.

Content:
- Company header:
  Company logo placeholder
  Company name
  Industry
  Country
  Website
  Opportunity Score
- Button: Regenerate Intelligence
- Tabs:
  AI Intelligence
  Risks
  Matched Services
  Stakeholders
  Sources
- Cards:
  Latest AI Signal
  AI Initiative Summary
  Why This Company?
  Potential AI/Cyber Risks
  Matched Cybersecurity Services
  Recommended Stakeholders
  Key Takeaway
- Buttons:
  Save Campaign
  Generate Emails

On Generate Emails:
- Call POST http://localhost:8000/api/emails/generate
- Navigate to /email-workspace/[campaignId]

SCREEN 4: Email Workspace
Route: /email-workspace/[campaignId]
Use the email workspace screenshot as reference.

Content:
- Header: "Email Workspace — [Campaign Name]"
- Subtitle: "Review and personalize your AI-generated emails before sending."
- Email tabs:
  Email 1 — Initial Outreach
  Email 2 — Value Follow-up
  Email 3 — Final Follow-up
- Left panel: Personalization Reasons
  Recent AI Initiative
  Detected Risks
  Matched Services
  Targeting
  Context Summary
- Center panel:
  Editable Subject field
  Editable Email Body textarea/editor
  Simple toolbar visual only
  Character/word count
  "All changes saved" indicator
- Right panel:
  AI Scores
  Personalization Score
  Relevance Score
  AI Suggestions
  Actions:
    Edit with AI
    Regenerate Email
    Save Draft
    Approve Email

SCREEN 5: Campaign Detail
Route: /campaigns/[campaignId]
Use the campaign detail screenshot as reference.

Content:
- Header:
  Campaign name
  Company
  Industry
  Country
  Website
  Status badge
- KPI cards:
  Opportunity Score
  Emails
  Stakeholders
  Status
- Tabs:
  Overview
  Intelligence
  Stakeholders
  Emails
  Activity
- Campaign Timeline:
  Company Added
  AI Intelligence Generated
  Emails Generated
  Emails Approved
  Ready to Send
  Sent
- Campaign Summary
- Email Sequence Status
- Recent Activity
- Next Actions:
  Send / Simulate Send
  Edit Emails

Backend requirements:

Create FastAPI backend with these endpoints:

GET /health
Returns app status.

GET /api/dashboard
Returns dashboard metrics, recent campaigns, top opportunities, activity feed.

POST /api/companies
Creates a company.
Input:
{
  "company_name": "",
  "website": "",
  "industry": "",
  "country": "",
  "notes": ""
}

POST /api/intelligence/generate
Generates company intelligence.
Input:
{
  "company_id": "",
  "company_name": "",
  "website": "",
  "industry": "",
  "country": "",
  "notes": ""
}

Output:
{
  "company": {},
  "latest_signal": {},
  "initiative_summary": "",
  "risks": [],
  "matched_services": [],
  "stakeholders": [],
  "opportunity_score": 92,
  "why_this_company": "",
  "key_takeaway": "",
  "sources": []
}

POST /api/emails/generate
Generates 3-email sequence.
Input:
{
  "company_id": "",
  "intelligence_id": ""
}

Output:
{
  "campaign_id": "",
  "emails": [
    {
      "step": 1,
      "type": "Initial Outreach",
      "subject": "",
      "body": "",
      "personalization_reasons": [],
      "personalization_score": 92,
      "relevance_score": 88,
      "status": "Draft"
    }
  ]
}

GET /api/campaigns
Returns all campaigns.

GET /api/campaigns/{campaign_id}
Returns one campaign with company, intelligence, emails, timeline, activity.

PATCH /api/emails/{email_id}
Updates email subject/body/status.

POST /api/campaigns/{campaign_id}/simulate-send
Marks campaign/emails as simulated sent.

Backend architecture:
Create clean modules:
- main.py
- routers/dashboard.py
- routers/companies.py
- routers/intelligence.py
- routers/emails.py
- routers/campaigns.py
- services/research_service.py
- services/service_mapping.py
- services/email_generation.py
- services/campaign_store.py
- graph/marketing_graph.py
- data/sample_news.json
- data/services_catalog.json
- data/sample_contacts.json

LangGraph readiness:
In graph/marketing_graph.py, create a clear placeholder structure for later:
- research_node
- service_mapping_node
- risk_analysis_node
- stakeholder_node
- email_generation_node
- campaign_save_node

Even if the first implementation uses deterministic/sample functions, keep the architecture graph-ready.

Sample data:
Include realistic UAE/GCC AI company examples:
- Core42
- Presight AI
- G42
- Bayanat
- Technology Innovation Institute
- Khazna Data Centers
- Mubadala AI

Cybersecurity services catalog:
- AI Security Assessment
- AI Red Teaming
- Prompt Injection Testing
- Data Protection & Privacy Review
- Cloud Security Review
- AI Governance & Compliance
- Model Risk Assessment
- Security Architecture Review
- 24/7 Security Monitoring

Scraping fallback:
Implement research_service so it works even with no API keys.
Priority:
1. Try live search/scrape if environment variables exist.
2. If unavailable or failed, use sample_news.json.
3. Always return valid structured intelligence.

Email:
Do not send real emails by default.
Simulate sending and show a success state.
Add placeholder support for Resend later using RESEND_API_KEY, but do not require it.

UX behavior:
- All screens should look populated even with sample data.
- Loading states should be polished.
- Empty states should be clean.
- Errors should be user-friendly.
- Buttons should feel clickable.
- Use consistent spacing and cards.

Deliverables:
Generate the full frontend and backend codebase.
Include README with:
- how to run backend on port 8000
- how to run frontend
- required environment variables
- fallback behavior
- hackathon demo flow

Demo flow:
1. Open dashboard
2. Add Core42 as dream company
3. Generate intelligence
4. View risks and matched services
5. Generate emails
6. Edit/approve email
7. Open campaign detail
8. Simulate send
