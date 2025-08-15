// Shared constants used across Home and Assistance

export const EVENT_NAME = "Noir Model United Nations";
export const DATES_TEXT = "11–12 October, 2025";
export const TARGET_DATE_IST = "2025-10-11T09:00:00+05:30"; // IST
export const THEME_HEX = "#000026";
export const REGISTER_URL = "https://linktr.ee/noirmun";
export const LOGO_URL = "https://i.postimg.cc/MZhZ9Nsm/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45.png";
export const WHATSAPP_ESCALATE = "https://wa.me/918595511056";

export const LOGO_UN =
  "https://i.postimg.cc/htVHK31g/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-5.png"; // UNGA & UNCSW
export const LOGO_AIPPM =
  "https://i.postimg.cc/4xZTHgdn/AIPPM-removebg-preview-pmv7kqpcqpe18txaiaahkwoafmvqa378hd5tcs7x8g.png";
export const LOGO_IPL =
  "https://i.postimg.cc/JnYFTwM3/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-7.png";
export const LOGO_IP =
  "https://i.postimg.cc/PJ8S2P6h/Black-and-White-Graffiti-Clothing-Logo-Instagram-Post-45-8.png"; // International Press

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

export const ASSIST_TEXT = `UNA-USA ROPs (Very Short):
• Roll Call → Setting the agenda → General Speakers’ List (GSL) → Moderated/Unmoderated Caucuses → Drafts → Amendments → Voting.
• Points: Personal Privilege, Parliamentary Inquiry, Order.
• Motions: Set Agenda, Moderate/Unmoderate, Adjourn/ Suspend, Introduce Draft, Close Debate.
Tips: Be concise on GSL, drive specifics in moderated, use unmods to build blocs and text.

How Noir Committees Work:
• Study guides before conference, guided by EB.
• Strict decorum; time discipline; plagiarism zero-tolerance.
• Awards weigh consistency, bloc-building, drafting, and crisis handling (where applicable).`;
