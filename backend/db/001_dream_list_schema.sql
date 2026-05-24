-- ============================================================
-- EMITLY — Dream List Database
-- PostgreSQL Schema + Seed Data
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- DREAM COMPANIES
-- =========================================

CREATE TABLE dream_companies (
    company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_name TEXT NOT NULL,
    website TEXT,
    linkedin_url TEXT,

    industry TEXT,
    country TEXT DEFAULT 'UAE',

    notes TEXT,

    discovery_source TEXT,
    discovery_reason TEXT,

    added_by_ai BOOLEAN DEFAULT FALSE,

    status TEXT DEFAULT 'active',

    monitoring_enabled BOOLEAN DEFAULT FALSE,

    last_scraped_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dream_companies_name
ON dream_companies(company_name);

CREATE INDEX idx_dream_companies_status
ON dream_companies(status);

CREATE INDEX idx_dream_companies_monitoring
ON dream_companies(monitoring_enabled);


-- =========================================
-- JOB SETTINGS (workspace-level scheduler config)
-- =========================================

CREATE TABLE job_settings (
    workspace_id TEXT PRIMARY KEY DEFAULT 'default',

    daily_scan_enabled BOOLEAN DEFAULT TRUE,
    daily_scan_time TIME DEFAULT '08:00:00',
    timezone TEXT DEFAULT 'Asia/Dubai',

    weekly_summary_enabled BOOLEAN DEFAULT TRUE,
    weekly_interval_days INTEGER DEFAULT 7,
    weekly_run_day INTEGER DEFAULT 1,

    campaign_mode TEXT DEFAULT 'notify'
        CHECK (campaign_mode IN ('auto', 'notify')),
    min_opportunity_score INTEGER DEFAULT 70,

    last_daily_run_at TIMESTAMP,
    last_weekly_run_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- =========================================
-- DAILY MATCH TABLE
-- =========================================

CREATE TABLE match_table (
    match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID REFERENCES dream_companies(company_id) ON DELETE CASCADE,

    company_name TEXT NOT NULL,

    match_date DATE NOT NULL DEFAULT CURRENT_DATE,

    news_article_1 JSONB DEFAULT '{}'::jsonb,
    service_match_1 JSONB DEFAULT '{}'::jsonb,

    news_article_2 JSONB DEFAULT '{}'::jsonb,
    service_match_2 JSONB DEFAULT '{}'::jsonb,

    news_article_3 JSONB DEFAULT '{}'::jsonb,
    service_match_3 JSONB DEFAULT '{}'::jsonb,

    condensed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_table_company
ON match_table(company_id);

CREATE INDEX idx_match_table_date
ON match_table(match_date);

CREATE INDEX idx_match_table_condensed
ON match_table(condensed);


-- =========================================
-- WEEKLY MATCH SUMMARY TABLE
-- =========================================

CREATE TABLE match_summary (
    summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID REFERENCES dream_companies(company_id) ON DELETE CASCADE,

    company_name TEXT NOT NULL,

    summary_start_date DATE NOT NULL,
    summary_end_date DATE NOT NULL,

    summary_date DATE NOT NULL DEFAULT CURRENT_DATE,

    news_article_1 JSONB DEFAULT '{}'::jsonb,
    service_match_1 JSONB DEFAULT '{}'::jsonb,
    contact_1 JSONB DEFAULT '{}'::jsonb,

    news_article_2 JSONB DEFAULT '{}'::jsonb,
    service_match_2 JSONB DEFAULT '{}'::jsonb,
    contact_2 JSONB DEFAULT '{}'::jsonb,

    news_article_3 JSONB DEFAULT '{}'::jsonb,
    service_match_3 JSONB DEFAULT '{}'::jsonb,
    contact_3 JSONB DEFAULT '{}'::jsonb,

    weekly_summary TEXT,

    opportunity_score INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_summary_company
ON match_summary(company_id);

CREATE INDEX idx_match_summary_date
ON match_summary(summary_date);


-- =========================================
-- CAMPAIGN DECISIONS (weekly review queue)
-- =========================================

CREATE TABLE campaign_decisions (
    decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL REFERENCES dream_companies(company_id) ON DELETE CASCADE,
    summary_id UUID REFERENCES match_summary(summary_id) ON DELETE SET NULL,

    company_name TEXT NOT NULL,
    opportunity_score INTEGER DEFAULT 0,
    weekly_summary TEXT,

    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'dismissed')),

    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE INDEX idx_campaign_decisions_status
ON campaign_decisions(status);

CREATE INDEX idx_campaign_decisions_company
ON campaign_decisions(company_id);


-- ─── TRIGGER: auto-update updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dream_companies_updated_at
    BEFORE UPDATE ON dream_companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_match_table_updated_at
    BEFORE UPDATE ON match_table
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_job_settings_updated_at
    BEFORE UPDATE ON job_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Default job settings row
INSERT INTO job_settings (workspace_id) VALUES ('default');


-- ============================================================
-- SEED DATA — UAE AI & Cybersecurity Companies
-- ============================================================
INSERT INTO dream_companies (company_name, website, linkedin_url, industry, country, notes, discovery_source, discovery_reason, added_by_ai, status) VALUES
    ('Group 42 Holding', 'https://www.g42.ai', 'https://linkedin.com/company/g42ai', 'AI & Technology', 'UAE', 'UAE-headquartered AI holding company operating across the full AI value chain — cloud, healthcare, space, cybersecurity, and enterprise AI.', 'seed', 'AI Holding Group', FALSE, 'active'),
    ('CPX Holding', 'https://www.cpx.net', 'https://linkedin.com/company/cpx-net', 'AI Cybersecurity', 'UAE', 'G42-backed cybersecurity company providing AI-powered cyber and physical security solutions to UAE government, critical infrastructure, and enterprises.', 'seed', 'Managed Security & Cyber Resilience', FALSE, 'active'),
    ('Core42', 'https://www.core42.ai', 'https://linkedin.com/company/core42', 'AI Infrastructure & Cloud', 'UAE', 'Enterprise and sovereign AI powerhouse providing cloud infrastructure, HPC, and the Compass LLM platform. The backbone of G42 AI infrastructure.', 'seed', 'Sovereign AI & Enterprise Cloud', FALSE, 'active'),
    ('Presight AI', 'https://www.presight.ai', 'https://linkedin.com/company/presight-ai', 'AI Analytics & Security Intelligence', 'UAE', 'AI and big data analytics company. Its TAQ platform delivers omni-analytics to enable decisive action from complex data, with applications in public safety, energy, and smart cities.', 'seed', 'Omni-Analytics & AI-Powered Surveillance', FALSE, 'active'),
    ('Inception', 'https://www.inceptioniai.org', 'https://linkedin.com/company/inception-g42', 'AI Research & Models', 'UAE', 'G42 AI Foundry focused on developing next-generation foundation models and AI research. Home of the Jais Arabic LLM.', 'seed', 'Foundation Models & AI R&D', FALSE, 'active'),
    ('Space42', 'https://www.space42.ai', 'https://linkedin.com/company/space42', 'AI Space Intelligence', 'UAE', 'World''s most valuable publicly listed space company. Formed by the merger of Bayanat and Yahsat, delivering AI-powered satellite intelligence and connectivity.', 'seed', 'Satellite Intelligence & Geospatial AI', FALSE, 'active'),
    ('M42', 'https://www.m42.ae', 'https://linkedin.com/company/m42health', 'AI Healthcare', 'UAE', 'Abu Dhabi-based tech-enabled healthcare company combining AI and clinical expertise to address global health and diagnostic challenges.', 'seed', 'Tech-Enabled Healthcare & Diagnostics', FALSE, 'active'),
    ('Khazna Data Centers', 'https://www.khazna.com', 'https://linkedin.com/company/khazna-data-centers', 'AI Infrastructure', 'UAE', 'Largest data center platform in the UAE with 70%+ market share. Provides secure, scalable infrastructure powering cloud, AI, and enterprise innovation.', 'seed', 'Data Center & Cloud Infrastructure', FALSE, 'active'),
    ('Astra Tech', 'https://www.astratech.com', 'https://linkedin.com/company/astratech', 'AI Fintech & Identity', 'UAE', 'Simplifying how people connect and manage finances through technology. Portfolio includes Botim (super-app) and Pyypl (digital payments).', 'seed', 'Digital Payments & Financial Super-App', FALSE, 'active'),
    ('AIQ', 'https://www.aiq.ai', 'https://linkedin.com/company/aiq-ai', 'AI Energy', 'UAE', 'Joint venture between Presight (G42) and ADNOC. Brings advanced AI to energy operations, solving complex challenges in oilfield productivity and sustainability.', 'seed', 'AI for Oil & Gas Sector', FALSE, 'active'),
    ('Katim', 'https://www.katim.com', 'https://linkedin.com/company/katim', 'AI Cybersecurity', 'UAE', 'Secure communications and sovereign technology company, successor to Digital14. Provides hardened devices and secure OS for government and defence clients.', 'seed', 'Secure Communications & Sovereign Tech', FALSE, 'active'),
    ('Help AG', 'https://www.helpag.com', 'https://linkedin.com/company/help-ag', 'AI Cybersecurity', 'UAE', 'One of the region''s largest MSSPs. Part of e& Enterprise (formerly Etisalat). Provides end-to-end cybersecurity consulting, SOC, MDR, and compliance services across the UAE and Middle East.', 'seed', 'Managed Security Services & Threat Intelligence', FALSE, 'active'),
    ('Injazat', 'https://www.injazat.com', 'https://linkedin.com/company/injazat', 'AI Cloud & Cybersecurity', 'UAE', 'Abu Dhabi-based digital transformation and cybersecurity company backed by Mubadala. Provides cloud, managed security, and mission-critical infrastructure protection for government and enterprise.', 'seed', 'Digital Transformation & Managed Security', FALSE, 'active'),
    ('Moro Hub', 'https://www.morohub.com', 'https://linkedin.com/company/moro-hub', 'AI Data & Cybersecurity', 'UAE', 'Dubai''s national data hub delivering cybersecurity, data protection, and smart city resilience. Subsidiary of DEWA with a focus on UAE sovereign digital infrastructure.', 'seed', 'Smart City Data & Cyber Resilience', FALSE, 'active'),
    ('Axon Technologies', 'https://www.axontechnologies.com', 'https://linkedin.com/company/axon-technologies-uae', 'AI Cybersecurity', 'UAE', 'UAE-headquartered cybersecurity firm specialising in protecting critical infrastructure and building a safer digital society. Strong focus on AI-powered threat detection and GRC.', 'seed', 'Information Security & Threat Detection', FALSE, 'active'),
    ('AHAD', 'https://www.ahad.io', 'https://linkedin.com/company/ahad-security', 'AI Cybersecurity', 'UAE', 'Abu Dhabi-based cybersecurity firm specialising in cyber defense, offensive testing, and threat intelligence for enterprises in the Middle East.', 'seed', 'Cyber Defense & Threat Intelligence', FALSE, 'active'),
    ('DTS Solution', 'https://www.dtssolution.com', 'https://linkedin.com/company/dts-solution', 'AI Cybersecurity', 'UAE', 'Leading UAE-based cybersecurity consulting company specialising in technical assessments, penetration testing, and managed security services.', 'seed', 'Technical Security Assessments & Managed Security', FALSE, 'active'),
    ('SpiderSilk', 'https://www.spidersilk.com', 'https://linkedin.com/company/spidersilk', 'AI Cybersecurity', 'UAE', 'AI-driven cybersecurity startup specialising in threat hunting and attack surface management. Acquired by CPX in 2026, bringing advanced AI threat capabilities into the G42 ecosystem.', 'seed', 'AI-Driven Threat Hunting & Attack Surface Management', FALSE, 'acquired'),
    ('Paramount Computer Systems', 'https://www.paramountcs.com', 'https://linkedin.com/company/paramount-computer-systems', 'AI Cybersecurity', 'UAE', 'Regional specialist enabling Zero Trust architectures, identity and access management, and SOC solutions for modern UAE enterprises.', 'seed', 'Zero Trust, IAM & SOC Solutions', FALSE, 'active'),
    ('Microminder Cyber Security', 'https://www.micromindercybersecurity.com', 'https://linkedin.com/company/microminder-cybersecurity', 'AI Cybersecurity', 'UAE', 'Global cybersecurity firm with strong UAE presence. Specialises in penetration testing, cloud security, and compliance audits. Also operates in UK and Saudi Arabia.', 'seed', 'Penetration Testing & Cloud Security', FALSE, 'active'),
    ('Cloud Box Technologies', 'https://www.cloudboxtech.com', 'https://linkedin.com/company/cloud-box-technologies', 'AI Cloud & Cybersecurity', 'UAE', 'UAE-based managed IT and cybersecurity services provider with specialisation in cloud security and hybrid environment protection.', 'seed', 'Cloud-Native Security & IT Managed Services', FALSE, 'active'),
    ('Katim Secure Communications', 'https://www.katim.com', 'https://linkedin.com/company/katim', 'AI Cybersecurity', 'UAE', 'Produces hardened Android OS-based mobile devices and secure collaboration platforms for government and defence. Successor to Digital14''s secure communications division.', 'seed', 'Secure Mobile OS & Communications', FALSE, 'active'),
    ('e& Enterprise Cybersecurity', 'https://enterprise.etisalat.ae/solutions/cybersecurity', 'https://linkedin.com/company/e-and-enterprise', 'AI Cybersecurity', 'UAE', 'Telecom-backed cybersecurity arm of e& (formerly Etisalat). Provides network security, MDR, and large-scale digital ecosystem protection across the UAE.', 'seed', 'Telecom-Backed Managed Security', FALSE, 'active'),
    ('UAE Cyber Security Council', 'https://uaecsc.gov.ae', NULL, 'Government AI Security', 'UAE', 'National body governing the UAE''s cybersecurity strategy. Issues mandates including NESA, CyberE71, and the UAE National Cybersecurity Strategy 2025–2031.', 'seed', 'National Cybersecurity Governance', FALSE, 'active'),
    ('SmartTech247', 'https://www.smarttech247.com', 'https://linkedin.com/company/smarttech247', 'AI Cybersecurity', 'UAE', 'AI-powered managed detection and response provider with a growing UAE presence. Focuses on AI-driven SOC operations and real-time threat detection.', 'seed', 'AI-Powered SOC & Threat Detection', FALSE, 'active'),
    ('Omnix International', 'https://www.omnixinternational.com', 'https://linkedin.com/company/omnix-international', 'AI Security & Surveillance', 'UAE', 'UAE-based technology integrator specialising in AI-powered video surveillance, physical security, and smart building solutions.', 'seed', 'Physical Security & AI Video Analytics', FALSE, 'active'),
    ('Palo Alto Networks UAE', 'https://www.paloaltonetworks.com/middle-east', 'https://linkedin.com/company/paloaltonetworks', 'AI Cybersecurity', 'UAE', 'US-headquartered global cybersecurity leader with significant UAE operations. Provides AI-driven network security, cloud security, and endpoint protection.', 'seed', 'Next-Gen Firewall & AI Security Platform', FALSE, 'active'),
    ('CrowdStrike UAE', 'https://www.crowdstrike.com/en-us/global/middle-east/', 'https://linkedin.com/company/crowdstrike', 'AI Cybersecurity', 'UAE', 'US-based AI-native cybersecurity leader with a strong UAE enterprise presence. Known for Falcon platform providing endpoint protection, threat intelligence, and identity security.', 'seed', 'AI-Native Endpoint Security & Threat Intelligence', FALSE, 'active'),
    ('Solutions+', 'https://www.solutionsplus.ae', 'https://linkedin.com/company/solutions-plus-uae', 'AI Enterprise Services', 'UAE', 'Mubadala-backed AI-driven shared services company and primary implementation partner for sovereign AI across the Mubadala Group. Delivers enterprise AI applications via its WEAVE AI platform, powered by Core42 Compass infrastructure. Strategic partner to G42''s Core42 for sovereign AI rollout across Abu Dhabi government entities.', 'seed', 'AI-Driven Shared Services & Implementation', FALSE, 'active'),
    ('Mubadala Investment Company', 'https://www.mubadala.com', 'https://linkedin.com/company/mubadala', 'Sovereign Investment & AI', 'UAE', 'Abu Dhabi sovereign wealth fund and one of the world''s most active technology investors. Strategic backer of G42, MGX, GlobalFoundries, and Injazat. Driving UAE AI strategy through portfolio companies including Solutions+. Over $22.4B invested in GlobalFoundries alone. Key force behind UAE-US AI partnerships including Stargate UAE.', 'seed', 'Sovereign Wealth Fund & Technology Investor', FALSE, 'active');
