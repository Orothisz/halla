// /scripts/scrape_sources.mjs
export const SOURCES = [
  // === Core International Humanitarian Law & UN Docs (kept from before) ===
  { url: 'https://www.icrc.org/en/doc/assets/files/other/icrc_002_0512.pdf', title: 'ICRC: What is IHL? (Handout)' },
  { url: 'https://www.icc-cpi.int/sites/default/files/RS-Eng.pdf', title: 'Rome Statute (English)' },
  { url: 'https://www.un.org/en/about-us/un-charter', title: 'UN Charter' },
  { url: 'https://www.ohchr.org/sites/default/files/Documents/ProfessionalInterest/ccpr.pdf', title: 'ICCPR' },
  { url: 'https://www.ohchr.org/sites/default/files/Documents/ProfessionalInterest/cescr.pdf', title: 'ICESCR' },
  { url: 'https://www.ohchr.org/sites/default/files/Documents/ProfessionalInterest/cedaw.pdf', title: 'CEDAW' },
  { url: 'https://www.ohchr.org/sites/default/files/Documents/ProfessionalInterest/crc.pdf', title: 'CRC' },
  { url: 'https://treaties.un.org/doc/Treaties/1949/08/19490812%2008-57%20AM/Ch_IV_1p.pdf', title: 'Geneva Conventions 1949' },
  { url: 'https://treaties.un.org/doc/Publication/UNTS/Volume%20112/v112.pdf', title: 'Additional Protocols 1977' },

  // === Regional Human Rights Treaties ===
  { url: 'https://www.echr.coe.int/documents/convention_eng.pdf', title: 'European Convention on Human Rights (ECHR)' },
  { url: 'https://www.oas.org/en/iachr/mandate/Basics/american-convention.pdf', title: 'American Convention on Human Rights (ACHR)' },
  { url: 'https://au.int/sites/default/files/treaties/36390-treaty-0011_-_african_charter_on_human_and_peoples_rights_e.pdf', title: 'African Charter on Human and Peoples’ Rights' },
  { url: 'https://www.ohchr.org/sites/default/files/Arab_Charter_Human_Rights.pdf', title: 'Arab Charter on Human Rights' },
  { url: 'https://asean.org/wp-content/uploads/images/2012/publications/ASEAN-Human-Rights-Declaration.pdf', title: 'ASEAN Human Rights Declaration' },

  // === Special Tribunals / Historical ===
  { url: 'https://www.icty.org/x/file/Legal%20Library/Statute/statute_sept09_en.pdf', title: 'ICTY Statute (Yugoslavia Tribunal)' },
  { url: 'https://unictr.irmct.org/sites/unictr.org/files/legal-library/100131_statute_en_fr_0.pdf', title: 'ICTR Statute (Rwanda Tribunal)' },
  { url: 'https://www.legal-tools.org/doc/45d5e3/pdf/', title: 'IMTFE Charter (Tokyo Tribunal)' },
  { url: 'https://avalon.law.yale.edu/imt/imtconst.asp', title: 'Nuremberg Tribunal Charter' },

  // === “Crazy” / Controversial UN & Intl Docs ===
  { url: 'https://undocs.org/en/S/1999/1257', title: 'UN Srebrenica Report (Bosnia)' },
  { url: 'https://undocs.org/en/S/2004/616', title: 'UN Report on Darfur Genocide' },
  { url: 'https://undocs.org/en/A/59/2005', title: 'UN Oil-for-Food Scandal (Volcker Report)' },
  { url: 'https://wikileaks.org/plusd/cables/09USUNNEWYORK979_a.html', title: 'Wikileaks: US Cables on UN Spying' },
  { url: 'https://wikileaks.org/plusd/cables/04USUNNEWYORK2740_a.html', title: 'Wikileaks: UNGA Negotiations Cable' },
  { url: 'https://undocs.org/en/S/2003/529', title: 'Iraq WMD (UNMOVIC/IAEA Report)' },
  { url: 'https://unispal.un.org/pdfs/A_RES_ES-10_20.pdf', title: 'UNGA Emergency Session on Palestine (ES-10/20)' },
  { url: 'https://digitallibrary.un.org/record/145097', title: 'UN Rwanda Genocide Report (1994)' },
  { url: 'https://undocs.org/en/A/ES-7/9', title: 'UNGA Resolution ES-7/9 (Israeli Settlements, 1980)' },
  { url: 'https://www.icj-cij.org/sites/default/files/case-related/131/131-20040709-ADV-01-00-EN.pdf', title: 'ICJ Advisory Opinion on the Wall (Israel-Palestine)' },

  // === Security, Peace, and “Hot” Issues ===
  { url: 'https://digitallibrary.un.org/record/683544/files/A-66-551%2BS-2011-701-EN.pdf', title: 'UN Syria Human Rights Report 2011' },
  { url: 'https://digitallibrary.un.org/record/3801353', title: 'UN COVID-19 Global Response Report' },
  { url: 'https://undocs.org/en/S/RES/1373(2001)', title: 'UNSC Resolution 1373 (Counter-Terrorism)' },
  { url: 'https://undocs.org/en/S/RES/1540(2004)', title: 'UNSC Resolution 1540 (WMD Non-Proliferation)' },
  { url: 'https://undocs.org/en/S/RES/1325(2000)', title: 'UNSC Resolution 1325 (Women, Peace & Security)' },
  { url: 'https://undocs.org/en/S/RES/827(1993)', title: 'UNSC Resolution 827 (ICTY creation)' },
  { url: 'https://undocs.org/en/S/RES/955(1994)', title: 'UNSC Resolution 955 (ICTR creation)' },

  // === Academic / MUN Crazy Useful ===
  { url: 'https://bestdelegate.com/wp-content/uploads/Model-UN-Guide.pdf', title: 'Best Delegate: Model UN Guide' },
  { url: 'https://www.nmun.org/assets/documents/handbooks/NMUNDelegatePreparationGuide.pdf', title: 'NMUN Delegate Preparation Guide' },
  { url: 'https://www.nmun.org/assets/documents/handbooks/NMUNRulesOfProcedure.pdf', title: 'NMUN Rules of Procedure' },
  { url: 'https://issuu.com/harvardmodelun/docs/harvard_mun_guide', title: 'Harvard MUN Delegate Guide' },
  { url: 'https://munplanet.com/uploads/articles/Ultimate-Model-UN-Guide.pdf', title: 'Ultimate Model UN Guide' },
  { url: 'https://carnegieendowment.org/files/nuclear_blackmail_2016.pdf', title: 'Carnegie: Nuclear Blackmail (for wild crisis debates)' },
  { url: 'https://www.rand.org/content/dam/rand/pubs/research_reports/RRA400/RRA442-1/RAND_RRA442-1.pdf', title: 'RAND: AI and International Stability' },
  { url: 'https://www.cfr.org/sites/default/files/report_pdf/CGS_Partial%20Restraint%20_FINAL.pdf', title: 'CFR: US Grand Strategy Shift (wild IR fuel)' },
  { url: 'https://www.files.ethz.ch/isn/154053/Bush_Doctrine.pdf', title: 'The Bush Doctrine (NSC 2002)' },
  { url: 'https://nsarchive2.gwu.edu/NSAEBB/NSAEBB95/press.htm', title: 'GWU National Security Archive: Iraq War Memos' },

  // === Regional Security Treaties ===
  { url: 'https://www.nato.int/cps/en/natohq/official_texts_17120.htm', title: 'NATO Treaty (Washington Treaty)' },
  { url: 'https://treaties.un.org/doc/Publication/UNTS/Volume%20119/v119.pdf', title: 'SEATO Treaty (Archived)' },
  { url: 'https://avalon.law.yale.edu/20th_century/rio.asp', title: 'Rio Treaty (Inter-American Treaty of Reciprocal Assistance)' },
  { url: 'https://asean.org/asean-charter/', title: 'ASEAN Charter' },
  { url: 'https://www.osce.org/files/f/documents/e/f/44455.pdf', title: 'OSCE Copenhagen Document' },

  // === Fun/“Crazy” Adds for Debate Fuel ===
  { url: 'https://www.cia.gov/readingroom/docs/CIA-RDP78-03061A000300010002-8.pdf', title: 'CIA Declassified: Cold War Propaganda' },
  { url: 'https://nsarchive.gwu.edu/dc.html?doc=1984&title=The-Pentagon-Papers', title: 'Pentagon Papers (Selections)' },
  { url: 'https://wikileaks.org/plusd/cables/10STATE17263_a.html', title: 'Wikileaks: US Cables on Iran Sanctions' },
  { url: 'https://wikileaks.org/plusd/cables/07STATE16207_a.html', title: 'Wikileaks: Climate Negotiations Cable' },
  { url: 'https://nsarchive2.gwu.edu/NSAEBB/NSAEBB4/', title: 'Declassified US Docs on Cuban Missile Crisis' },
];
