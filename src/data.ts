const REPO = "https://github.com/olalekanajimoti/business-analyst-portfolio/tree/main";

export const links = {
  github: "https://github.com/olalekanajimoti/business-analyst-portfolio",
  linkedin: "https://www.linkedin.com/in/olalekan-ajimoti",
  email: "mailto:olalekanajimoti@gmail.com",
  cv: "/Olalekan_Ajimoti_Business_Analyst_CV.pdf",
};

export type Chapter = { num: string; verb: string; line: string; proof: string };

export const chapters: Chapter[] = [
  {
    num: "01",
    verb: "Discover",
    line: "Every brief hides a better question.",
    proof: "A festival asked for a registration website. Underneath were three different journeys: attendees, vendors and volunteers.",
  },
  {
    num: "02",
    verb: "Define",
    line: "Complaints are data wearing a disguise.",
    proof: "Two duplicate-charge emails traced back to one timing fault in how payments became tickets.",
  },
  {
    num: "03",
    verb: "Design",
    line: "Draw the flow before anyone builds it.",
    proof: "As-Is and To-Be swimlanes, decision tables and a traceability matrix for every requirement.",
  },
  {
    num: "04",
    verb: "Deliver",
    line: "Test it the way real people will break it.",
    proof: "Tickets now arrive the moment payment clears. 90+ prioritised changes shipped in 10 weeks.",
  },
];

export type Work = { name: string; title: string; tag: string; summary: string; href: string; accent: string; featured?: boolean };

export const work: Work[] = [
  {
    name: "MyTicketSeller",
    title: "A ticketing platform, built from scratch to live",
    tag: "Payments · Product ownership",
    summary: "Found the root cause of duplicate charges, separated revenue by currency and replaced shared logins with role-based door access.",
    href: `${REPO}/01-delivered-case-studies/myticketseller-event-ticketing`,
    accent: "#F8650A",
    featured: true,
  },
  {
    name: "Taash",
    title: "Tax law, turned into decision tables",
    tag: "Rules analysis · Fintech",
    summary: "Segmented tax journeys and versioned rules, updated as a controlled change when the Nigeria Tax Act 2025 arrived.",
    href: `${REPO}/01-delivered-case-studies/taash-tax-automation`,
    accent: "#3078C0",
    featured: true,
  },
  {
    name: "Komfort Place Signature",
    title: "From social DMs to a measured booking funnel",
    tag: "Journey design · Analytics",
    summary: "One-tap WhatsApp booking on every page and a first-party dashboard showing where bookings start.",
    href: `${REPO}/01-delivered-case-studies/komfort-place-signature-digital-growth`,
    accent: "#A020F0",
    featured: true,
  },
  {
    name: "NaijaFoodFestival",
    title: "One brief, three journeys",
    tag: "Service design",
    summary: "Separate attendee, vendor and volunteer flows with approvals, automated emails and reporting.",
    href: `${REPO}/01-delivered-case-studies/naija-food-festival-service-design`,
    accent: "#F30000",
  },
  {
    name: "BOZ Jewelry",
    title: "Retail and e-commerce transformation",
    tag: "Stakeholders · Change",
    summary: "E-commerce rebuild and Microsoft 365 rollout; improvements contributed to a reported 60% rise in engagement.",
    href: `${REPO}/01-delivered-case-studies/boz-retail-transformation`,
    accent: "#C9A24A",
  },
  {
    name: "Creatrix Empire",
    title: "Campaign data into decisions",
    tag: "Performance analysis",
    summary: "Channel analysis behind a reported 45% engagement rise and around 150% organic traffic growth.",
    href: `${REPO}/01-delivered-case-studies/creatrix-marketing-analytics`,
    accent: "#3CA8E4",
  },
  {
    name: "The Ecommerce Boss",
    title: "Forms, spreadsheets and email, made traceable",
    tag: "Process automation",
    summary: "As-Is and To-Be workflows connecting forms, Airtable, Make and Zapier.",
    href: `${REPO}/01-delivered-case-studies/ecommerce-boss-event-automation`,
    accent: "#E5E5E5",
  },
  {
    name: "CONVVA",
    title: "Sell-anywhere commerce for African SMEs",
    tag: "Product discovery",
    summary: "One commerce record coordinating products, stock, orders, payment and delivery.",
    href: `${REPO}/02-product-case-studies/convva-sme-commerce`,
    accent: "#2563EB",
  },
];

export const stats = [
  { value: "9+", label: "years turning problems into requirements" },
  { value: "12", label: "case studies with full BA artefacts" },
  { value: "90+", label: "changes shipped in 10 weeks" },
  { value: "4→1", label: "codebases consolidated" },
];
