export const MOSPI_TRACKS = [
  {
    id: "mospi-ts-01",
    title: "Statistical Methods & Survey Design",
    tagline: "Survey methodology, sampling techniques, and national accounts estimation.",
    description: "Master official statistical methodologies including multi-stage sampling design, GDP estimation, CPI compilation, and SDG indicator frameworks aligned to MoSPI standards.",
    frac_competency_tag: "comp_statistical",
    level: "Intermediate",
    duration: "18 Hours",
    modulesCount: 4,
    modules: [
      { id: "mod-01-1", title: "Survey Design & Sampling Techniques", duration: "5 Hours", description: "Multi-stage stratified random sampling, design effect, and sample size estimation for NSS/PLFS." },
      { id: "mod-01-2", title: "National Accounts & GDP Compilation", duration: "5 Hours", description: "Production approach, expenditure method, and base year revision workflows." },
      { id: "mod-01-3", title: "Price & Labour Statistics", duration: "4 Hours", description: "CPI compilation methodology, PLFS quarterly estimates, and seasonal adjustment." },
      { id: "mod-01-4", title: "SDG Indicator Frameworks", duration: "4 Hours", description: "Mapping official statistics to UN Sustainable Development Goal indicators." }
    ]
  },
  {
    id: "mospi-ts-02",
    title: "Technical Computing & AI/ML",
    tagline: "Python, R, GIS, and machine learning for official statistical operations.",
    description: "Build technical proficiency in statistical programming (Python, R, SQL), geospatial analysis (QGIS/ArcGIS), and AI/ML applications for survey data quality and automation.",
    frac_competency_tag: "comp_technical",
    level: "Advanced",
    duration: "22 Hours",
    modulesCount: 4,
    modules: [
      { id: "mod-02-1", title: "Python & R for Statistical Computing", duration: "6 Hours", description: "Automated CPI processing, reproducible analysis pipelines, and data visualization." },
      { id: "mod-02-2", title: "SQL, Stata & SPSS for Official Data", duration: "5 Hours", description: "Query optimization, survey analysis commands, and database management for microdata." },
      { id: "mod-02-3", title: "GIS & Spatial Mapping", duration: "5 Hours", description: "Choropleth mapping, geo-tagging economic census, and remote sensing applications." },
      { id: "mod-02-4", title: "AI/ML for Survey Quality Assurance", duration: "6 Hours", description: "Outlier detection, intelligent imputation, and NLP for policy document parsing." }
    ]
  },
  {
    id: "mospi-ts-03",
    title: "Digital Governance & Cybersecurity",
    tagline: "Data privacy, Gov-Cloud, DPI systems, and digital compliance.",
    description: "Navigate the digital governance landscape for government statistical organizations — from DPDPA 2023 compliance and CERT-In cybersecurity to MeghRaj cloud architecture and DPI integration.",
    frac_competency_tag: "comp_digital_governance",
    level: "Intermediate",
    duration: "16 Hours",
    modulesCount: 4,
    modules: [
      { id: "mod-03-1", title: "Cybersecurity Fundamentals for Government", duration: "4 Hours", description: "CERT-In guidelines, threat modeling, and incident response for statistical systems." },
      { id: "mod-03-2", title: "Data Privacy & IT Act Compliance", duration: "4 Hours", description: "DPDPA 2023, consent management, data minimization, and purpose limitation." },
      { id: "mod-03-3", title: "Gov-Cloud (MeghRaj) Architecture", duration: "4 Hours", description: "Secure cloud deployment, role-based access, and data residency compliance." },
      { id: "mod-03-4", title: "DPI Systems Integration", duration: "4 Hours", description: "Aadhaar eKYC, DigiLocker verification, and UPI-based service delivery." }
    ]
  },
  {
    id: "mospi-ts-04",
    title: "Behavioural & Leadership Skills",
    tagline: "Leadership, communication, ethics, and change management for officers.",
    description: "Develop the behavioural competencies essential for leading statistical organizations — from stakeholder engagement and ethical reporting to project management and digital transformation leadership.",
    frac_competency_tag: "comp_behavioural",
    level: "Foundational",
    duration: "14 Hours",
    modulesCount: 4,
    modules: [
      { id: "mod-04-1", title: "Leadership & Decision Making", duration: "4 Hours", description: "Strategic thinking, cross-divisional coordination, and evidence-based decision frameworks." },
      { id: "mod-04-2", title: "Communication & Statistical Reporting", duration: "3 Hours", description: "Presenting findings to Parliament, press briefings, and infographic design." },
      { id: "mod-04-3", title: "Project Management for Surveys", duration: "4 Hours", description: "Critical path analysis, field operations scheduling, and risk mitigation for large-scale surveys." },
      { id: "mod-04-4", title: "Ethics, Integrity & Change Management", duration: "3 Hours", description: "Methodological transparency, stakeholder change adoption, and institutional transformation." }
    ]
  },

  // ── Real iGOT Karmayogi Courses ──────────────────────────────────
  {
    id: "six-sigma",
    title: "Six Sigma Fundamentals",
    tagline: "Process improvement using the DMAIC methodology for government operations.",
    description: "Embark on a journey to operational excellence with this fundamental course on Six Sigma by Genpact. Understand and apply a structured, data-driven approach to eliminate defects and improve process performance using the DMAIC framework.",
    frac_competency_tag: "comp_behavioural",
    level: "Intermediate",
    duration: "4h 5m",
    modulesCount: 8,
    provider: "Genpact",
    igot_url: "https://portal.igotkarmayogi.gov.in/public/toc/do_1139220025817088001841/overview",
    modules: [
      { id: "ss-01", title: "Overview to Six Sigma", duration: "11m 18s", description: "Introduction to Six Sigma principles and its critical role in modern process re-engineering." },
      { id: "ss-02", title: "Define Phase", duration: "14m 46s", description: "Project charter, Voice of Customer (VOC), and Critical-to-Quality (CTQ) tree mapping." },
      { id: "ss-03", title: "Diagnose Process Door", duration: "40m 22s", description: "Process mapping, value stream analysis, and identifying process bottlenecks." },
      { id: "ss-04", title: "Diagnose Data Door", duration: "1h", description: "Statistical tools, measurement system analysis, and data-driven root cause identification." },
      { id: "ss-05", title: "Design Phase", duration: "39m 28s", description: "Solution design, pilot planning, and risk assessment using FMEA." },
      { id: "ss-06", title: "Deploy Phase", duration: "47m 23s", description: "Control plans, statistical process control (SPC) charts, and sustaining improvements." },
      { id: "ss-07", title: "Case Study: District Health Society", duration: "11m 1s", description: "Real-world Six Sigma application in a government healthcare setting." },
      { id: "ss-08", title: "Assessment", duration: "20m", description: "Final assessment covering all DMAIC phases and Six Sigma concepts." }
    ]
  },
  {
    id: "ai-chatgpt",
    title: "AI Using Google Bard & ChatGPT for Beginners",
    tagline: "Leverage generative AI tools for government productivity and data analysis.",
    description: "A comprehensive introduction to generative AI through ChatGPT and Google Bard. Learn to use ChatGPT's Code Interpreter for data analysis and explore AI applications in professional government settings.",
    frac_competency_tag: "comp_technical",
    level: "Beginner",
    duration: "25m",
    modulesCount: 4,
    provider: "Invest India",
    igot_url: "https://portal.igotkarmayogi.gov.in/public/toc/do_1139231744741212161951/overview",
    modules: [
      { id: "aic-01", title: "ChatGPT — Code Interpreter", duration: "9m 19s", description: "Using ChatGPT's Code Interpreter to upload, analyze, and visualize data from various file formats." },
      { id: "aic-02", title: "Google Bard", duration: "2m 19s", description: "Utilizing Google Bard's features for content creation, drafting communications, and generating diverse responses." },
      { id: "aic-03", title: "AI: Expert's Insights", duration: "7m 23s", description: "Expert perspectives on AI trends, applications in governance, and responsible AI usage." },
      { id: "aic-04", title: "Knowledge Assessment", duration: "10m", description: "Final assessment covering generative AI concepts and practical applications." }
    ]
  },
  {
    id: "dddm",
    title: "Data Driven Decision Making for Government",
    tagline: "Build data literacy for evidence-based governance and policy design.",
    description: "A foundational understanding of Data Driven Decision Making (DDDM) for government professionals. Addresses the growing need for data literacy within public administration, exploring how to build robust digital infrastructure to support anticipatory and evidence-based decisions.",
    frac_competency_tag: "comp_digital_governance",
    level: "Beginner",
    duration: "2h 30m",
    modulesCount: 7,
    provider: "Wadhwani Institute of Technology & Policy",
    igot_url: "https://portal.igotkarmayogi.gov.in/public/toc/do_11373498382292889612851/overview",
    modules: [
      { id: "dd-01", title: "Introduction to DDDM", duration: "10m", description: "Course overview, FAQs, and foundational concepts of Data Driven Decision Making." },
      { id: "dd-02", title: "Data Analytics", duration: "20m", description: "Core analytics concepts — descriptive, diagnostic, predictive, and prescriptive analytics." },
      { id: "dd-03", title: "Common Tools for Visualization", duration: "20m", description: "Introduction to data visualization tools including Excel, Tableau, and Power BI." },
      { id: "dd-04", title: "Process Model Through Case Study", duration: "45m", description: "Applying the DDDM process model through a real government case study." },
      { id: "dd-05", title: "Filters & Pages Dashboard", duration: "25m", description: "Designing effective dashboards with filters, pages, and interactive elements." },
      { id: "dd-06", title: "Analytics Maturity Model", duration: "20m", description: "Understanding organizational analytics maturity and building data culture." },
      { id: "dd-07", title: "Final Assessment", duration: "20m", description: "Comprehensive assessment covering all DDDM concepts and tools." }
    ]
  }
];
