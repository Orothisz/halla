// src/shared/constants.js
// Pure JS — no JSX here.

export const EVENT_NAME = "Noir Model United Nations";
export const DATES_TEXT = "31 October - 1 November, 2025";
export const TARGET_DATE_IST = "2025-10-31T09:00:00+05:30"; // IST
export const THEME_HEX = "#000026";
export const REGISTER_URL = "https://noirmun.com";
export const LOGO_URL =
  "https://i.postimg.cc/MZhZ9Nsm/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45.png";
export const WHATSAPP_ESCALATE = "https://wa.me/918595511056";

// Committee logos
const LOGO_UN =
  "https://i.postimg.cc/htVHK31g/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-5.png"; // UNGA & UNCSW
const LOGO_AIPPM =
  "https://i.postimg.cc/4xZTHgdn/AIPPM-removebg-preview-pmv7kqpcqpe18txaiaahkwoafmvqa378hd5tcs7x8g.png";
const LOGO_IPL =
  "https://i.postimg.cc/JnYFTwM3/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-7.png";
const LOGO_IP =
  "https://i.postimg.cc/PJ8S2P6h/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-8.png"; // International Press

// Committees (used by Home + Brief modal)
export const COMMITTEES = [
  {
    name: "United Nations General Assembly (UNGA)",
    agenda:
      "Reassessing the Doctrine of Sovereign Immunity: Ensuring Criminal Accountability of Heads of State for Grave International Crimes",
    logo: LOGO_UN,
    brief: {
      overview:
        "Plenary GA with full diplomatic protocol. Debate pivots on reconciling functional immunity with accountability for atrocity crimes.",
      objectives: [
        "Map boundaries between state immunities and duty to prosecute grave crimes.",
        "Draft a GA framework for national prosecutions & mutual legal assistance.",
        "Propose cooperation contours with ICC without revising the Rome Statute.",
      ],
      format:
        "Standard GA procedure; majority decisions for recommendations; special session on model clauses.",
      resources: [
        "ICJ jurisprudence (Arrest Warrant)",
        "UNGA precedents on accountability",
      ],
    },
  },
  {
    name: "United Nations Commission on the Status of Women (UNCSW)",
    agenda:
      "Rehabilitation and Reintegration of Women Recruited and Abused by Extremist and Armed Non-State Actors",
    logo: LOGO_UN,
    brief: {
      overview: "Policy-heavy committee focused on DDR with survivor-centric lens.",
      objectives: [
        "Design survivor-safe reintegration pathways (ID, health, livelihoods).",
        "Guardrails against stigmatization; confidentiality and witness protection.",
        "Safeguards for children born of conflict (documentation, services).",
      ],
      format:
        "Agreed conclusions + annexed programmatic toolkit for country offices.",
      resources: ["UNFPA/UN Women guidance", "DDR standards", "Case studies"],
    },
  },
  {
    name: "All India Political Parties Meet (AIPPM)",
    agenda:
      "Reviewing the Waqf Act: Land, Faith, and the Limits of Minority Rights in a Secular State",
    logo: LOGO_AIPPM,
    brief: {
      overview:
        "High-octane domestic forum; intersects constitutional law, federalism, minority rights.",
      objectives: [
        "Evaluate competing property/faith claims.",
        "Calibrate oversight and transparency standards without chilling free exercise.",
        "Propose time-bound review mechanisms and audit frameworks.",
      ],
      format:
        "Parliamentary style with moderated cross-talk; working paper → draft bill clauses.",
      resources: ["Select committee reports", "Law Commission references"],
    },
  },
  {
    name: "YouTube All Stars",
    agenda: "Classified",
    logo:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/512px-YouTube_full-color_icon_%282017%29.svg.png",
    brief: {
      overview:
        "Crisis-lite entertainment diplomacy. Expect brand safety, creator economy shocks, and live audience sentiment injections.",
      objectives: [
        "Crisis cards with metrics shocks",
        "Creator policy pact",
        "Rapid response tooling",
      ],
      format: "Timed PR cycles + negotiation sprints.",
      resources: ["Platform policy excerpts", "Ad safety frameworks"],
    },
  },
  {
    name: "Indian Premier League (IPL)",
    agenda: "Mega Auction — Format: Double Delegation",
    logo: LOGO_IPL,
    brief: {
      overview:
        "Economics-meets-sport. Negotiate caps, trades, and long-term franchise strategy under uncertainty.",
      objectives: [
        "Auction strategy & analytics",
        "Fan equity guardrails",
        "Broadcast-rights interplay",
      ],
      format: "Double delegation; salary-cap maths; draft-board dynamics.",
      resources: ["Historic auction data (mock)", "CBA-style clauses"],
    },
  },
  {
    name: "International Press (IP)",
    agenda: "Coverage through Photography, Journalism, and Caricature",
    logo: LOGO_IP,
    brief: {
      overview:
        "Live newsroom with photo desks and satirical art corner; ethics & verification at speed.",
      objectives: [
        "Balanced reportage",
        "Photo briefs & caption discipline",
        "Fact-check pipeline",
      ],
      format: "Rolling editions; press conferences; embargo windows.",
      resources: ["Newsroom style guides", "Photojournalism ethics"],
    },
  },
];

// Assistance page short text (avoid backticks for safe builds)
export const ASSIST_TEXT = [
  "UNA-USA ROPs (Very Short):",
  "• Roll Call → Setting the agenda → General Speakers’ List (GSL) → Moderated/Unmoderated Caucuses → Drafts → Amendments → Voting.",
  "• Points: Personal Privilege, Parliamentary Inquiry, Order.",
  "• Motions: Set Agenda, Moderate/Unmoderate, Adjourn/ Suspend, Introduce Draft, Close Debate.",
  "Tips: Be concise on GSL, drive specifics in moderated, use unmods to build blocs and text.",
  "",
  "How Noir Committees Work:",
  "• Study guides before conference, guided by EB.",
  "• Strict decorum; time discipline; plagiarism zero-tolerance.",
  "• Awards weigh consistency, bloc-building, drafting, and crisis handling (where applicable).",
].join("\n");

// Optional helpers for older components that expect these:
export const POSTERS = COMMITTEES.map((c) => c.logo);
export const BRIEFS = COMMITTEES.map((c) => `${c.name}: ${c.agenda}`);

// Venue details
export const VENUE = {
  name: "Delite Sarovar Portico, Faridabad",
  image: "https://i.postimg.cc/vBsFB36D/Hotel-Facade-xfqdhj.avif",
  location:
    "https://www.google.com/maps?sca_esv=e85bf51f2ebe9d69&output=search&q=delite+sarovar+portico+fbd&source=lnms&fbs=AIIjpHxU7SXXniUZfeShr2fp4giZ1Y6MJ25_tmWITc7uy4KIeuYzzFkfneXafNx6OMdA4MRT57TpI4o2tavIRfF1e7-xTLfbOlRZsi_SKi4JeEBY7pnUnsYZ2YolLXlDdpWd5X8Dl3ww1kgiAU4MTvhlsxynlXYG66bQ0LfJUkXjx90u6LziqyMljOah4l7FbuzQ5ppUaZOESIdhGWk6sqjHiMsayGn74Q&entry=mc&ved=1t:200715&ictx=111",
};

/* -------------------------
 * Itinerary & Dress Code
 * ------------------------- */
export const ITINERARY = [
  {
    day: 1,
    dateText: "31 Oct 2025",
    dressCode: "Indian Ethnic",
    events: [
      { time: "7:00 AM - 7:45 AM", title: "Registration" },
      { time: "7:45 AM - 8:15 AM", title: "Breakfast" },
      { time: "8:25 AM - 9:45 AM", title: "Opening Ceremony" },
      { time: "10:00 AM - 12:00 PM", title: "Committee Session 1" },
      { time: "12:00 PM - 2:00 PM", title: "Lunch (Staggered)" },
      { time: "2:00 PM - 5:00 PM", title: "Committee Session 2" },
      { time: "5:00 PM - 5:30 PM", title: "High Tea & Dispersal" },
      { time: "5:30 PM Onwards", title: "Socials Evening" },
    ],
  },
  {
    day: 2,
    dateText: "1 Nov 2025",
    dressCode: "Western Formals",
    events: [
      { time: "7:45 AM", title: "Reporting Time" },
      { time: "8:00 AM - 8:30 AM", title: "Breakfast" },
      { time: "8:30 AM - 12:00 PM", title: "Committee Session 3" },
      { time: "12:00 PM - 1:00 PM", title: "Lunch (Staggered)" },
      { time: "1:15 PM - 3:00 PM", title: "Closing Ceremony" },
      { time: "3:00 PM - 3:30 PM", title: "High Tea & Dispersal" },
      { time: "3:30 PM Onwards", title: "Socials" },
    ],
  },
];

/* -------------------------
 * Partners
 * ------------------------- */
export const PARTNERS = [
  {
    role: "Venue & Catering Partner",
    name: "Delite Sarovar Portico, Faridabad",
    logo: "https://i.postimg.cc/vBsFB36D/Hotel-Facade-xfqdhj.avif", // using VENUE.image
  },
  {
    role: "Rewards Partner",
    name: "Benefitzz",
    logo:
      "https://i.postimg.cc/52qbMT6n/Whats-App-Image-2025-09-04-at-00-04-12-bbcede37.jpg",
  },
  {
    role: "Kitchen Partner",
    name: "SettoGo Kiitchen & Consulting",
    logo:
      "https://i.postimg.cc/7ZYwwX04/Whats-App-Image-2025-09-04-at-00-04-14-d07da825.jpg",
  },
  {
    role: "Brand Association Partner",
    name: "Royal Bliss",
    logo:
      "https://i.postimg.cc/Mpv37rQd/Whats-App-Image-2025-09-04-at-00-42-53-1764d3f9.jpg",
  },
  {
    role: "Institutional Partner",
    name: "DPS Ballabgarh",
    logo: "https://i.postimg.cc/43GPYWjq/Untitled-design-12.png",
  },
  {
    role: "Study Partner",
    name: "Study Anchor",
    logo:
      "https://i.postimg.cc/Bvwt9Hnw/Whats-App-Image-2025-09-03-at-17-26-52-ed8e1170.jpg",
  },
  {
    role: "Study Partner",
    name: "Sam Institute of English Language and Personality Development",
    logo:
      "https://i.postimg.cc/RhSY76c4/sam-institute-of-english-language-personality-development-logo-1.jpg",
  },
  {
    role: "Gaming Partner",
    name: "Galaxy Laser Tag",
    logo: "https://i.postimg.cc/Qd1qMNTb/Untitled-design-16.png",
  },
  {
    role: "Food Partner",
    name: "Bistro 57",
    logo: "https://i.postimg.cc/wMFMkjBD/Untitled-design-14.png",
  },
];
