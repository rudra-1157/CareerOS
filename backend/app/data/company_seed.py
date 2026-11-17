"""
Seed data for 24 demo companies and 24+ demo job listings across 6 domains.
All entries are clearly marked as is_demo=True — these are sample profiles
for demonstration purposes only. No actual partnership or real vacancy is implied.
"""

from sqlalchemy.orm import Session
from app.models.company import Company, Job

COMPANIES = [
    # ── A. SOFTWARE DEVELOPMENT ───────────────────────────────────────────────
    {
        "name": "TCS",
        "domain": "Software Development",
        "industry": "Information Technology",
        "description": (
            "Tata Consultancy Services is a global IT services, consulting and business "
            "solutions organization with 600,000+ professionals across 55 countries. "
            "TCS partners with leading businesses worldwide to deliver transformation at scale."
        ),
        "website": "https://www.tcs.com",
        "headquarters": "Mumbai, India",
        "company_size": "500,000+ employees",
        "primary_skills": "Java,Python,SQL,Cloud,DevOps,Agile,Angular,React",
        "preferred_qualifications": "B.Tech/B.E./MCA in CS/IT with 60%+ aggregate",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Infosys",
        "domain": "Software Development",
        "industry": "Information Technology",
        "description": (
            "Infosys is a global leader in next-generation digital services and consulting, "
            "helping clients navigate digital transformation across 56 countries. "
            "Known for its InfyTQ campus hiring programme."
        ),
        "website": "https://www.infosys.com",
        "headquarters": "Bengaluru, India",
        "company_size": "350,000+ employees",
        "primary_skills": "Java,Python,SQL,Angular,Spring Boot,Microservices,AWS",
        "preferred_qualifications": "B.Tech/B.E. in CS/IT/ECE with 65%+ aggregate",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Accenture",
        "domain": "Software Development",
        "industry": "Consulting & IT Services",
        "description": (
            "Accenture is a global professional services company with leading capabilities in "
            "digital, cloud and security. Combining unmatched experience and specialized skills "
            "across 40+ industries, we offer Strategy and Consulting, Technology, Operations, "
            "Industry X and Accenture Song services."
        ),
        "website": "https://www.accenture.com",
        "headquarters": "Dublin, Ireland",
        "company_size": "700,000+ employees",
        "primary_skills": "Java,Python,React,Node.js,AWS,Azure,DevOps,SQL",
        "preferred_qualifications": "Any engineering degree with 60%+ throughout",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Capgemini",
        "domain": "Software Development",
        "industry": "Information Technology",
        "description": (
            "Capgemini is a global leader in partnering with companies to transform and "
            "manage their business by harnessing the power of technology. The Group is guided "
            "by its purpose of unleashing human energy through technology for an inclusive and "
            "sustainable future."
        ),
        "website": "https://www.capgemini.com",
        "headquarters": "Paris, France",
        "company_size": "360,000+ employees",
        "primary_skills": "Java,Python,C++,SQL,Cloud,DevOps,Selenium,Agile",
        "preferred_qualifications": "B.Tech/B.E./M.Sc/MCA with 60%+ in all academics",
        "logo_url": "",
        "is_demo": True,
    },

    # ── B. AI & MACHINE LEARNING ──────────────────────────────────────────────
    {
        "name": "NVIDIA",
        "domain": "AI & Machine Learning",
        "industry": "Semiconductors & AI",
        "description": (
            "NVIDIA pioneered accelerated computing to tackle challenges no one else can solve. "
            "CUDA, A100, H100, and GeForce GPUs power AI research worldwide. The company leads "
            "AI infrastructure for data centers, autonomous vehicles and robotics."
        ),
        "website": "https://www.nvidia.com",
        "headquarters": "Santa Clara, California, USA",
        "company_size": "30,000+ employees",
        "primary_skills": "CUDA,Python,Deep Learning,PyTorch,TensorFlow,C++,Computer Vision",
        "preferred_qualifications": "M.Tech/M.S./Ph.D. in CS/EE/Mathematics preferred; B.Tech with strong research",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Google",
        "domain": "AI & Machine Learning",
        "industry": "Technology & AI",
        "description": (
            "Google LLC is a global technology company specializing in internet-related services "
            "and products including search, cloud computing, software, and hardware. Google "
            "DeepMind leads AI research with projects like Gemini, AlphaFold and Waymo."
        ),
        "website": "https://careers.google.com",
        "headquarters": "Mountain View, California, USA",
        "company_size": "180,000+ employees",
        "primary_skills": "Python,Go,C++,Machine Learning,TensorFlow,Kubernetes,Distributed Systems",
        "preferred_qualifications": "B.Tech/M.Tech/Ph.D. in CS or related field; strong DS&A skills",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Microsoft",
        "domain": "AI & Machine Learning",
        "industry": "Technology & Cloud",
        "description": (
            "Microsoft Corporation is a multinational technology corporation producing computer "
            "software, consumer electronics, personal computers, and related services. Azure AI "
            "and Copilot represent Microsoft's AI-first product strategy."
        ),
        "website": "https://careers.microsoft.com",
        "headquarters": "Redmond, Washington, USA",
        "company_size": "220,000+ employees",
        "primary_skills": "Python,C#,.NET,Azure,Machine Learning,TypeScript,Kubernetes",
        "preferred_qualifications": "B.Tech/M.Tech in CS/CE/IT; competitive programming experience valued",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Fractal Analytics",
        "domain": "AI & Machine Learning",
        "industry": "AI & Analytics",
        "description": (
            "Fractal is one of the most prominent AI companies globally, working with Fortune 500 "
            "companies across consumer goods, insurance, healthcare and financial services. "
            "Known for its strong campus placement programme across Indian universities."
        ),
        "website": "https://fractal.ai",
        "headquarters": "Mumbai, India",
        "company_size": "4,000+ employees",
        "primary_skills": "Python,R,Machine Learning,NLP,Statistics,Tableau,SQL,PyTorch",
        "preferred_qualifications": "B.Tech/B.E./M.Sc in CS/Statistics/Mathematics with 7+ CGPA",
        "logo_url": "",
        "is_demo": True,
    },

    # ── C. DATA SCIENCE & ANALYTICS ──────────────────────────────────────────
    {
        "name": "Deloitte",
        "domain": "Data Science & Analytics",
        "industry": "Consulting & Analytics",
        "description": (
            "Deloitte is one of the Big Four accounting firms and the world's largest professional "
            "services network. Its analytics and AI practice helps clients derive value from data "
            "across risk, finance, HR, supply chain and customer experience."
        ),
        "website": "https://www2.deloitte.com",
        "headquarters": "London, UK",
        "company_size": "420,000+ employees",
        "primary_skills": "Python,SQL,Tableau,Power BI,Machine Learning,Excel,Statistics,R",
        "preferred_qualifications": "B.Tech/MBA/M.Sc in CS/Management/Analytics with 60%+",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "ZS Associates",
        "domain": "Data Science & Analytics",
        "industry": "Business Consulting & Analytics",
        "description": (
            "ZS is a management consulting and technology firm that creates data-driven and "
            "tech-enabled solutions. ZS focuses on healthcare, pharmaceuticals and biotech — "
            "and is well-known for its Business Technology Analyst (BTA) campus hiring."
        ),
        "website": "https://www.zs.com",
        "headquarters": "Evanston, Illinois, USA",
        "company_size": "13,000+ employees",
        "primary_skills": "Python,SQL,Data Visualization,Statistics,Excel,Machine Learning,VBA",
        "preferred_qualifications": "B.Tech/B.E./MBA in any discipline with 7.5+ CGPA",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "EY",
        "domain": "Data Science & Analytics",
        "industry": "Consulting & Professional Services",
        "description": (
            "Ernst & Young (EY) is one of the Big Four accounting firms. EY's data, analytics "
            "and AI practice advises clients on data strategy, cloud analytics, AI governance "
            "and decision intelligence."
        ),
        "website": "https://www.ey.com",
        "headquarters": "London, UK",
        "company_size": "395,000+ employees",
        "primary_skills": "Python,SQL,Power BI,Tableau,Data Modelling,Machine Learning,Azure",
        "preferred_qualifications": "B.Tech/MBA/CA in CS/Finance/Management with 60%+",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "JPMorgan Chase",
        "domain": "Data Science & Analytics",
        "industry": "Banking & Financial Services",
        "description": (
            "JPMorgan Chase & Co. is one of the world's leading financial services firms. Its "
            "technology and data science teams build AI-driven trading algorithms, fraud detection, "
            "risk models and customer analytics platforms at massive scale."
        ),
        "website": "https://careers.jpmorgan.com",
        "headquarters": "New York City, USA",
        "company_size": "270,000+ employees",
        "primary_skills": "Python,SQL,Java,Machine Learning,Statistics,Data Engineering,Spark",
        "preferred_qualifications": "B.Tech/M.Tech in CS/Mathematics/Statistics; strong quant background",
        "logo_url": "",
        "is_demo": True,
    },

    # ── D. CYBERSECURITY ─────────────────────────────────────────────────────
    {
        "name": "Cisco",
        "domain": "Cybersecurity",
        "industry": "Networking & Cybersecurity",
        "description": (
            "Cisco Systems is a worldwide leader in networking and cybersecurity. Products span "
            "enterprise networking, cloud security, endpoint protection, SecureX and Talos threat "
            "intelligence. Cisco offers one of the most structured campus recruitment programmes."
        ),
        "website": "https://jobs.cisco.com",
        "headquarters": "San Jose, California, USA",
        "company_size": "85,000+ employees",
        "primary_skills": "Networking,Python,Linux,Security,CCNA,Firewalls,Cloud Security,C",
        "preferred_qualifications": "B.Tech in CS/ECE/IT with 60%+; CCNA/CEH a plus",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Palo Alto Networks",
        "domain": "Cybersecurity",
        "industry": "Cybersecurity",
        "description": (
            "Palo Alto Networks is the world's cybersecurity leader. Its platform spans network "
            "security, cloud security (Prisma), AI-powered SOC (Cortex), and threat intelligence. "
            "The company protects thousands of enterprise and government customers worldwide."
        ),
        "website": "https://www.paloaltonetworks.com/company/careers",
        "headquarters": "Santa Clara, California, USA",
        "company_size": "14,000+ employees",
        "primary_skills": "Python,C++,Linux,Networking,Firewalls,Cloud Security,SIEM,Threat Intelligence",
        "preferred_qualifications": "B.Tech/M.Tech in CS/CE with interest in cybersecurity",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "CrowdStrike",
        "domain": "Cybersecurity",
        "industry": "Endpoint Security & Threat Intelligence",
        "description": (
            "CrowdStrike is a leading provider of cloud-delivered protection of endpoints, "
            "cloud workloads, identity and data. The Falcon platform uses AI to stop breaches "
            "in real time. CrowdStrike is a frequent participant in top university hackathons."
        ),
        "website": "https://www.crowdstrike.com/careers",
        "headquarters": "Austin, Texas, USA",
        "company_size": "9,000+ employees",
        "primary_skills": "Python,Go,Linux,Reverse Engineering,Malware Analysis,Cloud Security,Rust",
        "preferred_qualifications": "B.Tech in CS/CE/IT; experience with CTFs, bug bounty, or security research",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Quick Heal",
        "domain": "Cybersecurity",
        "industry": "Antivirus & Endpoint Security",
        "description": (
            "Quick Heal Technologies is a leading Indian cybersecurity solutions provider offering "
            "antivirus, endpoint protection, cloud security and enterprise security products. "
            "It is one of the top Indian companies for cybersecurity campus placements."
        ),
        "website": "https://www.quickheal.com/careers",
        "headquarters": "Pune, India",
        "company_size": "1,500+ employees",
        "primary_skills": "C,C++,Python,Assembly,Malware Analysis,Linux,Windows Internals,Networking",
        "preferred_qualifications": "B.Tech in CS/IT/ECE with interest in cybersecurity",
        "logo_url": "",
        "is_demo": True,
    },

    # ── E. PRODUCT DEVELOPMENT ────────────────────────────────────────────────
    {
        "name": "Zoho",
        "domain": "Product Development",
        "industry": "SaaS & Enterprise Software",
        "description": (
            "Zoho Corporation is a multinational technology company that makes web-based business "
            "tools and information technology. The Zoho suite includes 50+ products for CRM, HR, "
            "finance and collaboration used by millions worldwide. Zoho is a major campus recruiter."
        ),
        "website": "https://www.zoho.com/careers",
        "headquarters": "Chennai, India",
        "company_size": "15,000+ employees",
        "primary_skills": "Java,Python,C,JavaScript,React,SQL,Linux,Data Structures",
        "preferred_qualifications": "B.Tech/B.E. in CS/IT/ECE; strong programming fundamentals",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Freshworks",
        "domain": "Product Development",
        "industry": "SaaS & CRM",
        "description": (
            "Freshworks makes it fast and easy for businesses to delight their customers and "
            "employees. Products include Freshdesk (support), Freshsales (CRM), Freshservice "
            "(ITSM) and Freshchat. Freshworks is one of India's unicorn product companies."
        ),
        "website": "https://www.freshworks.com/company/careers",
        "headquarters": "San Mateo, California, USA (India HQ: Chennai)",
        "company_size": "7,000+ employees",
        "primary_skills": "Ruby on Rails,JavaScript,React,PostgreSQL,Redis,AWS,Kubernetes",
        "preferred_qualifications": "B.Tech in CS/IT with strong DSA and system design knowledge",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "BrowserStack",
        "domain": "Product Development",
        "industry": "Developer Tools & Testing",
        "description": (
            "BrowserStack is the world's leading cloud web and mobile testing platform. It enables "
            "developers to test across 3,000+ real browsers, devices and operating systems. "
            "BrowserStack has over 50,000 customers across 135 countries."
        ),
        "website": "https://www.browserstack.com/careers",
        "headquarters": "Mumbai, India",
        "company_size": "1,500+ employees",
        "primary_skills": "JavaScript,React,Node.js,Python,Selenium,Automation Testing,Docker,AWS",
        "preferred_qualifications": "B.Tech in CS/IT; experience with testing frameworks preferred",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Razorpay",
        "domain": "Product Development",
        "industry": "Fintech & Payments",
        "description": (
            "Razorpay is India's leading payments and business banking platform. It processes "
            "billions of dollars in payments and offers banking, lending, payroll and investment "
            "products for businesses. Razorpay is a leading startup recruiter for engineers."
        ),
        "website": "https://razorpay.com/jobs",
        "headquarters": "Bengaluru, India",
        "company_size": "3,500+ employees",
        "primary_skills": "Go,Python,JavaScript,React,PostgreSQL,Redis,Kafka,Kubernetes",
        "preferred_qualifications": "B.Tech in CS/IT with strong backend fundamentals",
        "logo_url": "",
        "is_demo": True,
    },

    # ── F. CLOUD & DEVOPS ─────────────────────────────────────────────────────
    {
        "name": "Amazon Web Services",
        "domain": "Cloud & DevOps",
        "industry": "Cloud Computing",
        "description": (
            "Amazon Web Services (AWS) is the world's most comprehensive and broadly adopted cloud "
            "platform. AWS offers 200+ services from data centers globally. AWS campus hiring "
            "spans SDE, cloud support, data engineering and solutions architect roles."
        ),
        "website": "https://aws.amazon.com/careers",
        "headquarters": "Seattle, Washington, USA",
        "company_size": "100,000+ employees",
        "primary_skills": "Python,Java,AWS,Terraform,Kubernetes,CI/CD,Linux,Distributed Systems",
        "preferred_qualifications": "B.Tech in CS/CE/ECE; strong DSA and system design",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Google Cloud",
        "domain": "Cloud & DevOps",
        "industry": "Cloud Computing & AI Infrastructure",
        "description": (
            "Google Cloud offers computing, data analytics, AI, and security infrastructure to "
            "enterprises worldwide. Products include GKE, BigQuery, Vertex AI and Cloud Run. "
            "Google Cloud is a top destination for DevOps and cloud engineering talent."
        ),
        "website": "https://cloud.google.com/careers",
        "headquarters": "Sunnyvale, California, USA",
        "company_size": "50,000+ employees",
        "primary_skills": "Go,Python,Kubernetes,Terraform,GCP,Linux,Networking,CI/CD",
        "preferred_qualifications": "B.Tech/M.Tech in CS/CE; GCP certifications valued",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "IBM",
        "domain": "Cloud & DevOps",
        "industry": "Technology & Cloud Services",
        "description": (
            "IBM is a multinational technology corporation known for mainframe computers, "
            "enterprise software, consulting and cloud services. IBM Cloud, Watson AI, and "
            "Red Hat OpenShift represent its modern cloud-native portfolio."
        ),
        "website": "https://www.ibm.com/employment",
        "headquarters": "Armonk, New York, USA",
        "company_size": "280,000+ employees",
        "primary_skills": "Java,Python,Linux,OpenShift,Kubernetes,IBM Cloud,DevOps,AI",
        "preferred_qualifications": "B.Tech/M.Tech in CS/IT/ECE with 60%+ throughout",
        "logo_url": "",
        "is_demo": True,
    },
    {
        "name": "Oracle",
        "domain": "Cloud & DevOps",
        "industry": "Database & Cloud Computing",
        "description": (
            "Oracle Corporation develops database software and technology, cloud-engineered "
            "systems and enterprise software products. Oracle Cloud Infrastructure (OCI) is "
            "growing rapidly as a cloud platform for enterprise workloads and AI training."
        ),
        "website": "https://www.oracle.com/corporate/careers",
        "headquarters": "Austin, Texas, USA",
        "company_size": "143,000+ employees",
        "primary_skills": "Java,SQL,Oracle DB,Cloud,Linux,Python,Kubernetes,PL/SQL",
        "preferred_qualifications": "B.Tech/M.Tech in CS/IT with strong database and Java skills",
        "logo_url": "",
        "is_demo": True,
    },
]

JOBS = [
    # ── TCS ───────────────────────────────────────────────────────────────────
    {
        "company_name": "TCS",
        "title": "Software Engineer — Ninja Track",
        "domain": "Software Development",
        "description": (
            "Join TCS as a Software Engineer on the Ninja Track. Work on enterprise application "
            "development across domains such as banking, retail and manufacturing. You will "
            "participate in agile sprints, write clean maintainable code and collaborate with "
            "global delivery teams."
        ),
        "required_skills": "Java,Python,SQL,Data Structures,OOP,Problem Solving",
        "preferred_skills": "Spring Boot,React,AWS,Git,Agile",
        "eligibility_criteria": "60%+ in X, XII and graduation; no active backlogs",
        "min_cgpa": 6.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Pan India",
        "work_mode": "Hybrid",
        "stipend_range": "₹3.36 LPA",
        "deadline": "Rolling Admissions",
        "openings": 5000,
        "is_demo": True,
    },
    # ── Infosys ───────────────────────────────────────────────────────────────
    {
        "company_name": "Infosys",
        "title": "Systems Engineer",
        "domain": "Software Development",
        "description": (
            "Infosys Systems Engineers work at client sites and development centers to build "
            "and maintain large-scale enterprise applications. The role includes application "
            "development, testing, documentation and production support using Java and Spring."
        ),
        "required_skills": "Java,SQL,Data Structures,OOP,Problem Solving,Git",
        "preferred_skills": "Spring Boot,Angular,AWS,Linux,REST API",
        "eligibility_criteria": "65%+ throughout with no backlogs at the time of joining",
        "min_cgpa": 6.5,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Bengaluru / Pune / Hyderabad",
        "work_mode": "Hybrid",
        "stipend_range": "₹3.6 LPA",
        "deadline": "Rolling Admissions",
        "openings": 3000,
        "is_demo": True,
    },
    # ── Accenture ─────────────────────────────────────────────────────────────
    {
        "company_name": "Accenture",
        "title": "Associate Software Engineer",
        "domain": "Software Development",
        "description": (
            "As an Associate Software Engineer at Accenture, you will work on digital "
            "transformation projects for leading enterprises. Responsibilities include full-stack "
            "development, cloud migration, API design and participating in agile ceremonies."
        ),
        "required_skills": "Python,JavaScript,SQL,React,Node.js,Git",
        "preferred_skills": "AWS,Docker,CI/CD,TypeScript,MongoDB",
        "eligibility_criteria": "60%+ throughout; B.Tech in CS/IT/ECE preferred",
        "min_cgpa": 6.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Bengaluru / Mumbai / Hyderabad",
        "work_mode": "Hybrid",
        "stipend_range": "₹4.5 LPA",
        "deadline": "Rolling Admissions",
        "openings": 2000,
        "is_demo": True,
    },
    # ── Capgemini ─────────────────────────────────────────────────────────────
    {
        "company_name": "Capgemini",
        "title": "Analyst — Digital Engineering",
        "domain": "Software Development",
        "description": (
            "Join Capgemini's Digital Engineering practice as an Analyst. Work on microservices, "
            "cloud-native apps and automation test suites for clients across Europe and North America. "
            "Training provided in Agile, DevOps and cloud platforms."
        ),
        "required_skills": "Java,Python,SQL,OOP,Data Structures,Agile",
        "preferred_skills": "Selenium,Docker,Kubernetes,Azure,REST API",
        "eligibility_criteria": "60%+ in X, XII and graduation; any engineering branch",
        "min_cgpa": 6.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Mumbai / Pune / Chennai",
        "work_mode": "Hybrid",
        "stipend_range": "₹3.8 LPA",
        "deadline": "Rolling Admissions",
        "openings": 1500,
        "is_demo": True,
    },
    # ── NVIDIA ────────────────────────────────────────────────────────────────
    {
        "company_name": "NVIDIA",
        "title": "Deep Learning Research Intern",
        "domain": "AI & Machine Learning",
        "description": (
            "NVIDIA's Deep Learning Research team invites interns to work on next-generation "
            "neural network architectures, model optimization and GPU-accelerated training. "
            "You will co-author research papers and ship improvements to production AI systems "
            "used globally in data centres and autonomous vehicles."
        ),
        "required_skills": "Python,PyTorch,Deep Learning,CUDA,Linux,Mathematics",
        "preferred_skills": "C++,Computer Vision,NLP,TensorRT,ONNX,Research Papers",
        "eligibility_criteria": "M.Tech/Ph.D. in CS/EE preferred; strong B.Tech with publications considered",
        "min_cgpa": 8.0,
        "experience_level": "Internship",
        "job_type": "Internship",
        "location": "Pune / Bengaluru, India",
        "work_mode": "On-site",
        "stipend_range": "₹1,20,000 / month",
        "deadline": "31 Jan 2025",
        "openings": 20,
        "is_demo": True,
    },
    # ── Google ────────────────────────────────────────────────────────────────
    {
        "company_name": "Google",
        "title": "Software Engineering Intern (STEP)",
        "domain": "AI & Machine Learning",
        "description": (
            "Google's STEP Intern Programme offers a 10-week software engineering internship for "
            "first- and second-year students. You will be mentored by a Google engineer, complete "
            "a defined project and present results to the team. Many STEP interns return as "
            "full-time SWEs."
        ),
        "required_skills": "Data Structures,Algorithms,Python,Java,Problem Solving,OOP",
        "preferred_skills": "Machine Learning,Go,Kotlin,System Design,Competitive Programming",
        "eligibility_criteria": "Currently enrolled in a 4-year engineering degree; 7.5+ CGPA",
        "min_cgpa": 7.5,
        "experience_level": "Internship",
        "job_type": "Internship",
        "location": "Hyderabad / Bengaluru, India",
        "work_mode": "On-site",
        "stipend_range": "₹1,50,000 / month",
        "deadline": "15 Dec 2024",
        "openings": 50,
        "is_demo": True,
    },
    # ── Microsoft ─────────────────────────────────────────────────────────────
    {
        "company_name": "Microsoft",
        "title": "Software Engineering Intern",
        "domain": "AI & Machine Learning",
        "description": (
            "Microsoft intern engineers work alongside full-time engineers building Azure AI, "
            "GitHub Copilot, Windows and Office products. Projects span cloud infrastructure, "
            "ML model serving, developer tools and enterprise software. Full-time offer "
            "consideration at programme end."
        ),
        "required_skills": "Data Structures,Algorithms,Python,C#,C++,OOP,System Design",
        "preferred_skills": "Azure,Machine Learning,TypeScript,React,.NET,Kubernetes",
        "eligibility_criteria": "Pre-final or final year B.Tech/M.Tech; 7.5+ CGPA",
        "min_cgpa": 7.5,
        "experience_level": "Internship",
        "job_type": "Internship",
        "location": "Hyderabad, India",
        "work_mode": "Hybrid",
        "stipend_range": "₹1,20,000 / month",
        "deadline": "30 Nov 2024",
        "openings": 100,
        "is_demo": True,
    },
    # ── Fractal Analytics ─────────────────────────────────────────────────────
    {
        "company_name": "Fractal Analytics",
        "title": "Engineer — AI & Analytics",
        "domain": "AI & Machine Learning",
        "description": (
            "Fractal's AI & Analytics Engineers build ML pipelines, NLP models and data products "
            "for Fortune 500 clients. The role involves data preprocessing, feature engineering, "
            "model building and deploying ML models to production cloud environments."
        ),
        "required_skills": "Python,Machine Learning,SQL,Statistics,Pandas,Scikit-learn",
        "preferred_skills": "NLP,PyTorch,TensorFlow,PySpark,Azure,Tableau",
        "eligibility_criteria": "B.Tech/B.E./M.Sc in CS/Statistics/Mathematics; 7+ CGPA",
        "min_cgpa": 7.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Mumbai / Bengaluru / Hyderabad",
        "work_mode": "Hybrid",
        "stipend_range": "₹8 – ₹12 LPA",
        "deadline": "Rolling Admissions",
        "openings": 200,
        "is_demo": True,
    },
    # ── Deloitte ─────────────────────────────────────────────────────────────
    {
        "company_name": "Deloitte",
        "title": "Business Technology Analyst",
        "domain": "Data Science & Analytics",
        "description": (
            "Deloitte's Business Technology Analysts work at the intersection of data and business "
            "strategy. You will design dashboards, analyse large datasets, build predictive models "
            "and present insights to senior clients in sectors like BFSI, healthcare and retail."
        ),
        "required_skills": "Python,SQL,Excel,Tableau,Statistics,Data Analysis",
        "preferred_skills": "Power BI,R,Machine Learning,Azure,SAP,Agile",
        "eligibility_criteria": "B.Tech/MBA/M.Sc in any discipline; 60%+ throughout",
        "min_cgpa": 6.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Mumbai / Delhi / Bengaluru",
        "work_mode": "Hybrid",
        "stipend_range": "₹5 – ₹7 LPA",
        "deadline": "Rolling Admissions",
        "openings": 500,
        "is_demo": True,
    },
    # ── ZS Associates ─────────────────────────────────────────────────────────
    {
        "company_name": "ZS Associates",
        "title": "Business Technology Analyst",
        "domain": "Data Science & Analytics",
        "description": (
            "ZS BTAs combine strong quantitative skills with business understanding to solve "
            "complex healthcare and pharmaceutical problems. The role involves data analysis, "
            "model building, dashboard development and client communication."
        ),
        "required_skills": "Python,SQL,Excel,Statistics,Problem Solving,Data Visualization",
        "preferred_skills": "R,Machine Learning,VBA,Tableau,Power BI",
        "eligibility_criteria": "B.Tech/B.E. in any branch; 7.5+ CGPA; no backlogs",
        "min_cgpa": 7.5,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Pune / Gurgaon",
        "work_mode": "Hybrid",
        "stipend_range": "₹8 – ₹10 LPA",
        "deadline": "Rolling Admissions",
        "openings": 150,
        "is_demo": True,
    },
    # ── EY ───────────────────────────────────────────────────────────────────
    {
        "company_name": "EY",
        "title": "Data & Analytics Analyst",
        "domain": "Data Science & Analytics",
        "description": (
            "EY Data & Analytics Analysts build end-to-end data pipelines and analytics solutions "
            "for clients across BFSI, retail and public sector. Responsibilities include ETL, "
            "data modelling, visualization and storytelling with data."
        ),
        "required_skills": "Python,SQL,Power BI,Data Modelling,Excel,Statistics",
        "preferred_skills": "Azure,Tableau,Machine Learning,PySpark,Databricks",
        "eligibility_criteria": "B.Tech/MBA in CS/IT/Finance; 60%+ throughout",
        "min_cgpa": 6.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Delhi / Bengaluru / Chennai",
        "work_mode": "Hybrid",
        "stipend_range": "₹5.5 – ₹7 LPA",
        "deadline": "Rolling Admissions",
        "openings": 300,
        "is_demo": True,
    },
    # ── JPMorgan ─────────────────────────────────────────────────────────────
    {
        "company_name": "JPMorgan Chase",
        "title": "Software Engineer — Data Engineering",
        "domain": "Data Science & Analytics",
        "description": (
            "JPMorgan Chase's Data Engineering team builds the firm's global data platform "
            "processing trillions of financial transactions. As a Software Engineer you will "
            "build Spark pipelines, data lakes, real-time streaming systems and ML feature stores."
        ),
        "required_skills": "Python,SQL,Spark,Data Engineering,Java,Linux,Statistics",
        "preferred_skills": "Kafka,Hadoop,AWS,Machine Learning,Scala,Airflow",
        "eligibility_criteria": "B.Tech/M.Tech in CS/Mathematics/EE; 7+ CGPA",
        "min_cgpa": 7.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Bengaluru / Mumbai",
        "work_mode": "Hybrid",
        "stipend_range": "₹12 – ₹18 LPA",
        "deadline": "31 Dec 2024",
        "openings": 100,
        "is_demo": True,
    },
    # ── Cisco ─────────────────────────────────────────────────────────────────
    {
        "company_name": "Cisco",
        "title": "Network Security Engineer — Graduate",
        "domain": "Cybersecurity",
        "description": (
            "Cisco's Network Security team builds enterprise firewalls, IDS/IPS, VPN and Zero "
            "Trust architecture. As a Graduate Engineer you will diagnose network security issues, "
            "write automation scripts and contribute to Cisco's Secure Firewall product."
        ),
        "required_skills": "Networking,Python,Linux,Security,TCP/IP,Firewalls,C",
        "preferred_skills": "CCNA,CEH,Cloud Security,Wireshark,SIEM,Docker",
        "eligibility_criteria": "B.Tech in CS/ECE/IT; CCNA certification preferred",
        "min_cgpa": 6.5,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Bengaluru / Hyderabad",
        "work_mode": "Hybrid",
        "stipend_range": "₹6 – ₹9 LPA",
        "deadline": "Rolling Admissions",
        "openings": 200,
        "is_demo": True,
    },
    # ── Palo Alto ─────────────────────────────────────────────────────────────
    {
        "company_name": "Palo Alto Networks",
        "title": "Security Research Intern",
        "domain": "Cybersecurity",
        "description": (
            "Palo Alto Networks Unit 42 Threat Intelligence team is looking for security research "
            "interns. You will analyse malware samples, reverse engineer binaries and contribute "
            "to threat actor tracking. Your findings will be published in public threat bulletins."
        ),
        "required_skills": "Python,Linux,C++,Networking,Malware Analysis,Security",
        "preferred_skills": "Reverse Engineering,Wireshark,IDA Pro,CTF Experience,Threat Intelligence",
        "eligibility_criteria": "Pre-final/final year B.Tech in CS; active CTF participation required",
        "min_cgpa": 7.0,
        "experience_level": "Internship",
        "job_type": "Internship",
        "location": "Bengaluru, India",
        "work_mode": "Hybrid",
        "stipend_range": "₹80,000 / month",
        "deadline": "31 Jan 2025",
        "openings": 15,
        "is_demo": True,
    },
    # ── CrowdStrike ───────────────────────────────────────────────────────────
    {
        "company_name": "CrowdStrike",
        "title": "Threat Intelligence Analyst",
        "domain": "Cybersecurity",
        "description": (
            "CrowdStrike's Counter Adversary Operations team tracks nation-state threat actors "
            "and criminal groups. The Threat Intelligence Analyst role involves OSINT research, "
            "malware analysis, writing intelligence reports and presenting findings to customers."
        ),
        "required_skills": "Python,Linux,Networking,Malware Analysis,OSINT,Security",
        "preferred_skills": "Reverse Engineering,YARA,Threat Hunting,SIEM,Go,Rust",
        "eligibility_criteria": "B.Tech in CS/IT; bug bounty or CTF experience strongly preferred",
        "min_cgpa": 7.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Remote (India)",
        "work_mode": "Remote",
        "stipend_range": "₹10 – ₹15 LPA",
        "deadline": "Rolling Admissions",
        "openings": 30,
        "is_demo": True,
    },
    # ── Quick Heal ────────────────────────────────────────────────────────────
    {
        "company_name": "Quick Heal",
        "title": "Security Researcher — Malware Analysis",
        "domain": "Cybersecurity",
        "description": (
            "Quick Heal's Security Labs team analyses thousands of new malware samples daily. "
            "Security Researchers reverse engineer malicious code, write signatures and detection "
            "rules, and contribute to Quick Heal's threat intelligence feeds."
        ),
        "required_skills": "C,C++,Python,Assembly,Malware Analysis,Linux,Windows Internals",
        "preferred_skills": "Reverse Engineering,IDA Pro,Ghidra,YARA,Networking,CTF",
        "eligibility_criteria": "B.Tech in CS/IT/ECE; cybersecurity projects or certifications valued",
        "min_cgpa": 6.5,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Pune, India",
        "work_mode": "On-site",
        "stipend_range": "₹4 – ₹6 LPA",
        "deadline": "Rolling Admissions",
        "openings": 50,
        "is_demo": True,
    },
    # ── Zoho ─────────────────────────────────────────────────────────────────
    {
        "company_name": "Zoho",
        "title": "Member Technical Staff",
        "domain": "Product Development",
        "description": (
            "Zoho's MTS engineers build, maintain and ship product features across the Zoho suite. "
            "You will own modules end-to-end — from requirement analysis and backend design to "
            "frontend implementation and release. Zoho values strong programming fundamentals "
            "over academic pedigree."
        ),
        "required_skills": "Java,C,Python,Data Structures,SQL,OOP,Problem Solving",
        "preferred_skills": "JavaScript,React,Linux,PostgreSQL,Git,REST API",
        "eligibility_criteria": "B.Tech/B.E. in any branch; 65%+ throughout",
        "min_cgpa": 6.5,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Chennai / Coimbatore / Bengaluru",
        "work_mode": "On-site",
        "stipend_range": "₹3.5 – ₹5 LPA",
        "deadline": "Rolling Admissions",
        "openings": 500,
        "is_demo": True,
    },
    # ── Freshworks ────────────────────────────────────────────────────────────
    {
        "company_name": "Freshworks",
        "title": "Software Development Engineer",
        "domain": "Product Development",
        "description": (
            "Freshworks SDE builds backend services and product features using Ruby on Rails, "
            "Go and PostgreSQL. You will work in small product squads, ship frequently and "
            "collaborate closely with product managers and designers. Freshworks has a strong "
            "culture of ownership and rapid career progression."
        ),
        "required_skills": "Data Structures,Algorithms,SQL,OOP,Problem Solving,Git",
        "preferred_skills": "Ruby,Go,JavaScript,React,Redis,PostgreSQL,Kubernetes",
        "eligibility_criteria": "B.Tech in CS/IT; competitive programming background preferred",
        "min_cgpa": 7.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Chennai, India",
        "work_mode": "Hybrid",
        "stipend_range": "₹8 – ₹12 LPA",
        "deadline": "Rolling Admissions",
        "openings": 150,
        "is_demo": True,
    },
    # ── BrowserStack ──────────────────────────────────────────────────────────
    {
        "company_name": "BrowserStack",
        "title": "Software Engineer — Test Platform",
        "domain": "Product Development",
        "description": (
            "BrowserStack's Test Platform team builds the infrastructure that runs millions of "
            "automated browser and mobile tests daily. The role involves building test runners, "
            "device farms, real-time streaming infrastructure and developer-facing SDKs."
        ),
        "required_skills": "JavaScript,Node.js,Python,Selenium,Automation Testing,Docker",
        "preferred_skills": "React,AWS,Redis,Kafka,Linux,Go,WebDriver Protocol",
        "eligibility_criteria": "B.Tech in CS/IT; prior automation testing exposure preferred",
        "min_cgpa": 7.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Mumbai, India",
        "work_mode": "Hybrid",
        "stipend_range": "₹8 – ₹14 LPA",
        "deadline": "Rolling Admissions",
        "openings": 80,
        "is_demo": True,
    },
    # ── Razorpay ─────────────────────────────────────────────────────────────
    {
        "company_name": "Razorpay",
        "title": "Software Development Engineer — Backend",
        "domain": "Product Development",
        "description": (
            "Razorpay's Backend SDE team builds the payments processing engine that handles "
            "millions of transactions per day at sub-100ms latency. You will work on "
            "microservices in Go and Python, Kafka streams, Redis caching and high-availability "
            "PostgreSQL clusters."
        ),
        "required_skills": "Python,Go,SQL,Data Structures,Algorithms,System Design,Git",
        "preferred_skills": "Kafka,Redis,PostgreSQL,Kubernetes,Microservices,gRPC",
        "eligibility_criteria": "B.Tech in CS/IT; 7+ CGPA; strong competitive programming background",
        "min_cgpa": 7.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Bengaluru, India",
        "work_mode": "Hybrid",
        "stipend_range": "₹12 – ₹18 LPA",
        "deadline": "Rolling Admissions",
        "openings": 100,
        "is_demo": True,
    },
    # ── AWS ───────────────────────────────────────────────────────────────────
    {
        "company_name": "Amazon Web Services",
        "title": "Software Development Engineer",
        "domain": "Cloud & DevOps",
        "description": (
            "AWS SDEs design and build the distributed systems that power the world's largest "
            "cloud platform. You will work on services like EC2, S3, Lambda, EKS or DynamoDB "
            "handling millions of requests per second. Strong systems thinking, DS&A mastery "
            "and customer obsession are core expectations."
        ),
        "required_skills": "Data Structures,Algorithms,Python,Java,System Design,Distributed Systems,Linux",
        "preferred_skills": "AWS,Kubernetes,Terraform,Go,C++,CI/CD,Microservices",
        "eligibility_criteria": "B.Tech/M.Tech in CS/CE/ECE; 7+ CGPA",
        "min_cgpa": 7.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Hyderabad / Bengaluru",
        "work_mode": "Hybrid",
        "stipend_range": "₹18 – ₹28 LPA",
        "deadline": "Rolling Admissions",
        "openings": 300,
        "is_demo": True,
    },
    # ── Google Cloud ──────────────────────────────────────────────────────────
    {
        "company_name": "Google Cloud",
        "title": "Cloud Infrastructure Engineer",
        "domain": "Cloud & DevOps",
        "description": (
            "Google Cloud Infrastructure Engineers build and operate the global cloud platform "
            "serving millions of developers. The role spans Kubernetes cluster management, "
            "networking, Terraform infrastructure-as-code and reliability engineering on GKE, "
            "Cloud Run and GCE."
        ),
        "required_skills": "Linux,Python,Go,Kubernetes,Networking,CI/CD,Terraform",
        "preferred_skills": "GCP,Helm,Prometheus,Istio,Docker,gRPC,Distributed Systems",
        "eligibility_criteria": "B.Tech/M.Tech in CS/CE; GCP certifications valued",
        "min_cgpa": 7.5,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Hyderabad, India",
        "work_mode": "Hybrid",
        "stipend_range": "₹18 – ₹25 LPA",
        "deadline": "31 Mar 2025",
        "openings": 100,
        "is_demo": True,
    },
    # ── IBM ───────────────────────────────────────────────────────────────────
    {
        "company_name": "IBM",
        "title": "Cloud & DevOps Engineer",
        "domain": "Cloud & DevOps",
        "description": (
            "IBM's Cloud & DevOps Engineers build automation pipelines, container platforms and "
            "cloud-native applications on IBM Cloud and Red Hat OpenShift. The role involves "
            "CI/CD pipeline development, Kubernetes operations and infrastructure-as-code."
        ),
        "required_skills": "Linux,Python,Kubernetes,CI/CD,Docker,Java,Git",
        "preferred_skills": "IBM Cloud,OpenShift,Terraform,Ansible,Helm,Go",
        "eligibility_criteria": "B.Tech/M.Tech in CS/IT/ECE; 60%+ throughout",
        "min_cgpa": 6.0,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Bengaluru / Hyderabad / Pune",
        "work_mode": "Hybrid",
        "stipend_range": "₹6 – ₹9 LPA",
        "deadline": "Rolling Admissions",
        "openings": 400,
        "is_demo": True,
    },
    # ── Oracle ────────────────────────────────────────────────────────────────
    {
        "company_name": "Oracle",
        "title": "Associate Cloud Engineer",
        "domain": "Cloud & DevOps",
        "description": (
            "Oracle's Cloud Engineering team builds the OCI platform powering enterprise AI and "
            "database workloads. Associate Cloud Engineers contribute to OCI Compute, Networking, "
            "Object Storage and Autonomous Database services using Java, Python and Kubernetes."
        ),
        "required_skills": "Java,SQL,Linux,Python,Cloud,Data Structures,OOP",
        "preferred_skills": "Oracle DB,Kubernetes,Terraform,PL/SQL,Docker,CI/CD",
        "eligibility_criteria": "B.Tech/M.Tech in CS/IT; 65%+ throughout",
        "min_cgpa": 6.5,
        "experience_level": "Fresher",
        "job_type": "Full-time",
        "location": "Hyderabad / Bengaluru",
        "work_mode": "Hybrid",
        "stipend_range": "₹8 – ₹12 LPA",
        "deadline": "Rolling Admissions",
        "openings": 200,
        "is_demo": True,
    },
]


def seed_companies_and_jobs(db: Session) -> None:
    """
    Idempotent seed function. Inserts demo companies and their jobs only if
    no demo companies exist yet. Safe to call on every application startup.
    """
    existing = db.query(Company).filter(Company.is_demo == True).count()
    if existing > 0:
        return  # Already seeded

    # Build a name->Company map so we can link jobs
    company_map: dict[str, Company] = {}
    for data in COMPANIES:
        company = Company(**data)
        db.add(company)
        db.flush()  # get company.id before committing
        company_map[data["name"]] = company

    for job_data in JOBS:
        company_name = job_data.pop("company_name")
        company = company_map.get(company_name)
        if not company:
            continue
        job = Job(company_id=company.id, **job_data)
        db.add(job)

    db.commit()
    print(f"[seed] ✅ Seeded {len(COMPANIES)} demo companies and {len(JOBS)} demo jobs.")
