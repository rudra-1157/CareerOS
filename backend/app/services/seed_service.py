import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.company import Company
from app.models.job import JobListing, JobSkillRequirement

logger = logging.getLogger(__name__)

SAMPLE_COMPANIES = [
    {
        "name": "NeuralEdge Technologies",
        "industry": "Artificial Intelligence & Robotics",
        "domain": "AI / ML",
        "description": "Pioneering deep learning solutions, autonomous systems, and generative AI platforms for next-generation automation.",
        "website": "https://neuraledge.example.com",
        "logo_emoji": "🧠",
        "headquarters": "Bengaluru, India",
    },
    {
        "name": "CloudScale Systems",
        "industry": "Cloud Infrastructure & DevOps",
        "domain": "Cloud & DevOps",
        "description": "Building hyper-scale Kubernetes automation and multi-cloud reliability engineering tooling for enterprise platforms.",
        "website": "https://cloudscale.example.com",
        "logo_emoji": "☁️",
        "headquarters": "Hyderabad, India",
    },
    {
        "name": "Apex Fintech Solutions",
        "industry": "Financial Technology & Trading",
        "domain": "Backend Engineering",
        "description": "High-throughput algorithmic transaction processing, secure payment rails, and distributed ledger systems.",
        "website": "https://apexfintech.example.com",
        "logo_emoji": "💳",
        "headquarters": "Mumbai, India",
    },
    {
        "name": "PixelCraft Interactive",
        "industry": "Digital Experience & Product Design",
        "domain": "UI/UX & Product Design",
        "description": "Award-winning product studio crafting immersive user interfaces, design systems, and web applications.",
        "website": "https://pixelcraft.example.com",
        "logo_emoji": "🎨",
        "headquarters": "Pune, India",
    },
    {
        "name": "DataSphere Analytics",
        "industry": "Big Data & Business Intelligence",
        "domain": "Data Science & Analytics",
        "description": "End-to-end data pipelines, real-time analytics engines, and predictive intelligence dashboards.",
        "website": "https://datasphere.example.com",
        "logo_emoji": "📊",
        "headquarters": "Gurugram, India",
    },
    {
        "name": "CyberShield Defense",
        "industry": "Cybersecurity & InfoSec",
        "domain": "Cybersecurity",
        "description": "Defending global digital infrastructure with offensive security testing, SIEM operations, and automated threat mitigation.",
        "website": "https://cybershield.example.com",
        "logo_emoji": "🛡️",
        "headquarters": "Bengaluru, India",
    },
    {
        "name": "SwiftWave Mobility",
        "industry": "Mobile & Edge Computing",
        "domain": "Mobile App Development",
        "description": "Developing cross-platform mobile apps, offline-first architectures, and connected mobility software.",
        "website": "https://swiftwave.example.com",
        "logo_emoji": "📱",
        "headquarters": "Chennai, India",
    },
    {
        "name": "StackNova Labs",
        "industry": "Software Engineering & SaaS",
        "domain": "Full Stack Web Development",
        "description": "Building modern B2B SaaS platforms powered by React, FastAPI, micro-frontends, and real-time collaboration engines.",
        "website": "https://stacknova.example.com",
        "logo_emoji": "⚡",
        "headquarters": "Bengaluru, India",
    },
    {
        "name": "SiliconSense IoT",
        "industry": "Embedded Systems & Hardware",
        "domain": "Embedded Systems & IoT",
        "description": "Smart IoT sensor networks, firmware engineering, and low-power edge compute architectures.",
        "website": "https://siliconsense.example.com",
        "logo_emoji": "📟",
        "headquarters": "Hyderabad, India",
    },
    {
        "name": "FrontendForge Studio",
        "industry": "Web Technologies",
        "domain": "Frontend Engineering",
        "description": "High-performance web architecture, WebGL visualizations, and reactive component libraries.",
        "website": "https://frontendforge.example.com",
        "logo_emoji": "💻",
        "headquarters": "Noida, India",
    },
    {
        "name": "OmniHealth AI",
        "industry": "Healthcare AI & Diagnostics",
        "domain": "AI / ML",
        "description": "Clinical NLP, medical image segmentation, and intelligent triage assistant systems.",
        "website": "https://omnihealth.example.com",
        "logo_emoji": "🏥",
        "headquarters": "Bengaluru, India",
    },
    {
        "name": "Veloce Commerce",
        "industry": "E-Commerce & Logistics",
        "domain": "Full Stack Web Development",
        "description": "Next-generation quick commerce checkout flows, distributed inventory management, and rider routing engines.",
        "website": "https://veloce.example.com",
        "logo_emoji": "🚀",
        "headquarters": "Mumbai, India",
    },
    {
        "name": "AeroDynamics IoT",
        "industry": "Aerospace & Industrial IoT",
        "domain": "Embedded Systems & IoT",
        "description": "Telemetry streaming systems, RTOS embedded firmware, and ruggedized edge device protocols.",
        "website": "https://aerodynamics.example.com",
        "logo_emoji": "🛰️",
        "headquarters": "Bengaluru, India",
    },
    {
        "name": "Sentinel Cloud Security",
        "industry": "Cloud Security Posture",
        "domain": "Cloud & DevOps",
        "description": "Automated DevSecOps pipelines, identity federation, zero-trust cloud network virtualization.",
        "website": "https://sentinelsec.example.com",
        "logo_emoji": "🔒",
        "headquarters": "Hyderabad, India",
    },
    {
        "name": "QuantLeap Capital",
        "industry": "Quantitative Finance & Analytics",
        "domain": "Data Science & Analytics",
        "description": "Statistical arbitrage algorithms, low-latency market micro-structure analysis, and risk modeling.",
        "website": "https://quantleap.example.com",
        "logo_emoji": "📈",
        "headquarters": "Mumbai, India",
    }
]

SAMPLE_JOBS = [
    # 1. AI / ML
    {
        "company_name": "NeuralEdge Technologies",
        "title": "Junior Machine Learning Engineer",
        "domain": "AI / ML",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech / B.E. in Computer Science, Data Science, or related STEM field",
        "experience_requirement": "0-2 years",
        "openings": 3,
        "description": "Join our AI research and deployment squad building scalable inference pipelines for vision and transformer models.",
        "responsibilities": "Develop PyTorch training scripts, optimize ONNX runtime models, evaluate model drift, and containerize inference services.",
        "mandatory_skills": ["Python", "PyTorch", "Machine Learning"],
        "optional_skills": ["Docker", "FastAPI", "Computer Vision"]
    },
    {
        "company_name": "NeuralEdge Technologies",
        "title": "Generative AI Research Intern",
        "domain": "AI / ML",
        "employment_type": "Internship",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "Pursuing B.Tech / M.Tech in CS, AI, or Math",
        "experience_requirement": "Fresher / Student",
        "openings": 2,
        "description": "Explore retrieval-augmented generation (RAG), prompt engineering techniques, and LLM fine-tuning pipelines.",
        "responsibilities": "Implement vector database indexing, benchmark embedding models, and build demo interactive agents.",
        "mandatory_skills": ["Python", "Natural Language Processing"],
        "optional_skills": ["LangChain", "Vector Databases", "Hugging Face"]
    },
    {
        "company_name": "OmniHealth AI",
        "title": "Computer Vision Engineer",
        "domain": "AI / ML",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech / M.Tech in Computer Science / Electrical",
        "experience_requirement": "1-3 years",
        "openings": 2,
        "description": "Build high-accuracy diagnostic image segmentation and feature extraction models for clinical medical imaging.",
        "responsibilities": "Design CNN and Vision Transformer architectures, implement data augmentation pipelines, and document clinical validation metrics.",
        "mandatory_skills": ["Python", "TensorFlow", "Computer Vision"],
        "optional_skills": ["OpenCV", "PyTorch", "Image Processing"]
    },
    {
        "company_name": "OmniHealth AI",
        "title": "AI Platform Developer Intern",
        "domain": "AI / ML",
        "employment_type": "Internship",
        "work_arrangement": "Hybrid",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech pre-final / final year student",
        "experience_requirement": "Fresher",
        "openings": 4,
        "description": "Assist our infrastructure engineers in maintaining ML experiment tracking pipelines and dataset versioning.",
        "responsibilities": "Maintain MLflow registries, write data preprocessing scripts, and create automated unit tests for model training hooks.",
        "mandatory_skills": ["Python", "Git"],
        "optional_skills": ["Pandas", "Docker", "MLflow"]
    },

    # 2. Data Science & Analytics
    {
        "company_name": "DataSphere Analytics",
        "title": "Data Analyst Trainee",
        "domain": "Data Science & Analytics",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Gurugram, India",
        "education_requirement": "B.Tech, B.Sc Statistics/Math, or BCA",
        "experience_requirement": "0-1 years",
        "openings": 5,
        "description": "Transform complex business telemetry into actionable intelligence, interactive dashboards, and KPI tracking models.",
        "responsibilities": "Author SQL aggregations, build executive dashboards in PowerBI/Tableau, and perform root-cause metric anomaly detection.",
        "mandatory_skills": ["SQL", "Python", "Data Analysis"],
        "optional_skills": ["Power BI", "Tableau", "Excel"]
    },
    {
        "company_name": "DataSphere Analytics",
        "title": "Data Science Intern",
        "domain": "Data Science & Analytics",
        "employment_type": "Internship",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "Enrolled in B.Tech/BS in Computer Science or Data Science",
        "experience_requirement": "Fresher",
        "openings": 3,
        "description": "Work on predictive modeling, customer churn propensity scoring, and statistical hypothesis testing.",
        "responsibilities": "Clean structured datasets, perform exploratory data analysis (EDA), and train baseline regression/classification models.",
        "mandatory_skills": ["Python", "Pandas", "Scikit-Learn"],
        "optional_skills": ["NumPy", "Matplotlib", "Seaborn"]
    },
    {
        "company_name": "QuantLeap Capital",
        "title": "Quantitative Research Analyst",
        "domain": "Data Science & Analytics",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Mumbai, India",
        "education_requirement": "B.Tech/M.Sc from premier engineering/math institutions",
        "experience_requirement": "0-2 years",
        "openings": 2,
        "description": "Analyze market microstructure, backtest quantitative equity strategies, and build statistical risk attribution systems.",
        "responsibilities": "Write vectorized backtesters in Python/NumPy, compute Sharpe and VaR metrics, and clean tick-level orderbook data.",
        "mandatory_skills": ["Python", "Statistics", "SQL"],
        "optional_skills": ["R", "Time Series Analysis", "C++"]
    },
    {
        "company_name": "QuantLeap Capital",
        "title": "Data Engineering Intern",
        "domain": "Data Science & Analytics",
        "employment_type": "Internship",
        "work_arrangement": "Hybrid",
        "location": "Mumbai, India",
        "education_requirement": "B.Tech in CS/IT",
        "experience_requirement": "Fresher",
        "openings": 2,
        "description": "Design ETL pipelines for high-velocity financial market feeds and company earnings reports.",
        "responsibilities": "Write ingestion workers in Python/SQL, manage database schemas, and optimize query indexing.",
        "mandatory_skills": ["SQL", "Python"],
        "optional_skills": ["PostgreSQL", "Apache Spark", "Airflow"]
    },

    # 3. Full Stack Web Development
    {
        "company_name": "StackNova Labs",
        "title": "Full Stack Software Engineer",
        "domain": "Full Stack Web Development",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech/B.E. in Computer Science or related",
        "experience_requirement": "1-3 years",
        "openings": 4,
        "description": "Build modern responsive cloud applications with clean TypeScript/React interfaces and resilient FastAPI/Node backend microservices.",
        "responsibilities": "Architect REST and GraphQL APIs, craft responsive React components, write integration tests, and manage CI/CD builds.",
        "mandatory_skills": ["JavaScript", "React", "Node.js", "SQL"],
        "optional_skills": ["TypeScript", "Docker", "PostgreSQL", "Tailwind CSS"]
    },
    {
        "company_name": "StackNova Labs",
        "title": "Junior Full Stack Developer",
        "domain": "Full Stack Web Development",
        "employment_type": "Full-Time",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "B.Tech/BCA/MCA in CS or equivalent experience",
        "experience_requirement": "0-1 years",
        "openings": 3,
        "description": "Develop client portals and admin dashboards with interactive charts, auth flows, and state management.",
        "responsibilities": "Implement frontend pages in React, connect backend endpoints in Express/FastAPI, and resolve bug reports.",
        "mandatory_skills": ["JavaScript", "React", "HTML/CSS"],
        "optional_skills": ["Python", "FastAPI", "MongoDB"]
    },
    {
        "company_name": "Veloce Commerce",
        "title": "Full Stack Engineering Intern",
        "domain": "Full Stack Web Development",
        "employment_type": "Internship",
        "work_arrangement": "Hybrid",
        "location": "Mumbai, India",
        "education_requirement": "Pre-final / final year engineering student",
        "experience_requirement": "Fresher",
        "openings": 6,
        "description": "Join our fast-paced commerce team building storefront components, shopping carts, and order fulfillment views.",
        "responsibilities": "Build accessible UI components, integrate REST endpoints, test cross-browser responsiveness, and optimize web vitals.",
        "mandatory_skills": ["JavaScript", "HTML/CSS", "React"],
        "optional_skills": ["Node.js", "Git", "Redux"]
    },
    {
        "company_name": "Veloce Commerce",
        "title": "MERN Stack Developer",
        "domain": "Full Stack Web Development",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Mumbai, India",
        "education_requirement": "B.Tech in Computer Science / Information Technology",
        "experience_requirement": "1-2 years",
        "openings": 2,
        "description": "Scale real-time logistics mapping tools and customer support chat modules using MongoDB, Express, React, and Node.",
        "responsibilities": "Implement WebSocket listeners, build schema migrations, optimize aggregate queries, and maintain unit test suites.",
        "mandatory_skills": ["Node.js", "React", "MongoDB", "Express"],
        "optional_skills": ["WebSockets", "Redis", "TypeScript"]
    },

    # 4. Backend Engineering
    {
        "company_name": "Apex Fintech Solutions",
        "title": "Backend Systems Engineer",
        "domain": "Backend Engineering",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Mumbai, India",
        "education_requirement": "B.Tech / B.E. in Computer Science",
        "experience_requirement": "1-3 years",
        "openings": 3,
        "description": "Build fault-tolerant transaction settlement engines and microservices handling millions of daily banking events.",
        "responsibilities": "Design ACID-compliant database schemas, implement idempotent REST/gRPC endpoints, and optimize query latency.",
        "mandatory_skills": ["Python", "SQL", "FastAPI"],
        "optional_skills": ["PostgreSQL", "Redis", "Kafka", "Docker"]
    },
    {
        "company_name": "Apex Fintech Solutions",
        "title": "Backend Developer Intern",
        "domain": "Backend Engineering",
        "employment_type": "Internship",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "Pursuing B.Tech/MCA in Computer Science",
        "experience_requirement": "Fresher",
        "openings": 4,
        "description": "Assist in building API microservices, documentation with OpenAPI/Swagger, and integration test coverage.",
        "responsibilities": "Write unit and integration tests, implement validation models, and profile slow database queries.",
        "mandatory_skills": ["Python", "SQL"],
        "optional_skills": ["Django", "FastAPI", "Git"]
    },
    {
        "company_name": "CloudScale Systems",
        "title": "Golang Backend Developer",
        "domain": "Backend Engineering",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Hyderabad, India",
        "education_requirement": "B.Tech / B.E. in CS or equivalent",
        "experience_requirement": "1-3 years",
        "openings": 2,
        "description": "Design high-concurrency microservices, network proxies, and control-plane managers in Go.",
        "responsibilities": "Write goroutine-safe distributed queues, implement gRPC interfaces, and monitor runtime memory allocations.",
        "mandatory_skills": ["Go", "Distributed Systems", "SQL"],
        "optional_skills": ["Docker", "Kubernetes", "gRPC"]
    },
    {
        "company_name": "StackNova Labs",
        "title": "Java Spring Boot Developer",
        "domain": "Backend Engineering",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech/B.E. in Computer Science",
        "experience_requirement": "0-2 years",
        "openings": 3,
        "description": "Develop enterprise REST APIs using Spring Boot, Hibernate ORM, and relational databases.",
        "responsibilities": "Implement Spring Security JWT authentication, write repository queries, and manage Maven dependencies.",
        "mandatory_skills": ["Java", "Spring Boot", "SQL"],
        "optional_skills": ["Hibernate", "PostgreSQL", "JUnit"]
    },

    # 5. Frontend Engineering
    {
        "company_name": "FrontendForge Studio",
        "title": "React Frontend Developer",
        "domain": "Frontend Engineering",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Noida, India",
        "education_requirement": "B.Tech / BCA / MCA in CS / Design",
        "experience_requirement": "1-3 years",
        "openings": 3,
        "description": "Craft high-performance, pixel-perfect user interfaces with smooth 60fps animations and resilient state management.",
        "responsibilities": "Build accessible UI components, manage global state, implement client-side caching, and optimize core web vitals.",
        "mandatory_skills": ["JavaScript", "React", "CSS", "HTML"],
        "optional_skills": ["TypeScript", "Next.js", "Tailwind CSS", "Framer Motion"]
    },
    {
        "company_name": "FrontendForge Studio",
        "title": "Frontend Engineering Intern",
        "domain": "Frontend Engineering",
        "employment_type": "Internship",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "Enrolled in B.Tech / BCA",
        "experience_requirement": "Fresher",
        "openings": 5,
        "description": "Learn and build interactive dashboard widgets, form validations, and dark/light theme systems.",
        "responsibilities": "Convert Figma designs to clean React components, write component unit tests with Vitest/Jest, and resolve UI glitches.",
        "mandatory_skills": ["HTML", "CSS", "JavaScript"],
        "optional_skills": ["React", "Git", "Figma"]
    },
    {
        "company_name": "PixelCraft Interactive",
        "title": "Vue / Nuxt Frontend Engineer",
        "domain": "Frontend Engineering",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Pune, India",
        "education_requirement": "B.Tech or equivalent in IT/CS",
        "experience_requirement": "0-2 years",
        "openings": 2,
        "description": "Develop server-rendered web applications with Nuxt.js, Pinia state stores, and Tailwind CSS.",
        "responsibilities": "Build reusable component libraries, integrate REST endpoints, and implement dynamic routing with route guards.",
        "mandatory_skills": ["JavaScript", "Vue.js", "HTML/CSS"],
        "optional_skills": ["TypeScript", "Nuxt.js", "Tailwind CSS"]
    },
    {
        "company_name": "PixelCraft Interactive",
        "title": "Web UI Developer (Junior)",
        "domain": "Frontend Engineering",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Pune, India",
        "education_requirement": "Degree in Computer Science, Graphic Design, or Web Technologies",
        "experience_requirement": "0-1 years",
        "openings": 2,
        "description": "Focus on responsive layouts, typography, micro-interactions, and cross-device compatibility.",
        "responsibilities": "Maintain CSS utility classes, implement accessible ARIA attributes, and optimize asset loading times.",
        "mandatory_skills": ["HTML", "CSS", "JavaScript"],
        "optional_skills": ["React", "Sass", "Responsive Design"]
    },

    # 6. Mobile App Development
    {
        "company_name": "SwiftWave Mobility",
        "title": "Flutter Mobile Developer",
        "domain": "Mobile App Development",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Chennai, India",
        "education_requirement": "B.Tech/B.E. in CS/IT",
        "experience_requirement": "1-3 years",
        "openings": 3,
        "description": "Develop cross-platform iOS and Android applications using Flutter and Dart with clean BLoC architecture.",
        "responsibilities": "Build custom widget animations, integrate native platform channels, configure push notifications, and release app builds.",
        "mandatory_skills": ["Flutter", "Dart", "Mobile App Development"],
        "optional_skills": ["Firebase", "REST APIs", "Git"]
    },
    {
        "company_name": "SwiftWave Mobility",
        "title": "React Native Intern",
        "domain": "Mobile App Development",
        "employment_type": "Internship",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "Pursuing B.Tech / BCA",
        "experience_requirement": "Fresher",
        "openings": 4,
        "description": "Build mobile user interfaces with React Native, Expo, and standard navigation libraries.",
        "responsibilities": "Implement mobile screens, handle local async storage, connect backend REST APIs, and debug simulator issues.",
        "mandatory_skills": ["JavaScript", "React Native"],
        "optional_skills": ["React", "TypeScript", "Redux"]
    },
    {
        "company_name": "SwiftWave Mobility",
        "title": "Android Developer (Kotlin)",
        "domain": "Mobile App Development",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Chennai, India",
        "education_requirement": "B.Tech in CS/IT",
        "experience_requirement": "0-2 years",
        "openings": 2,
        "description": "Design modern native Android apps following Material Design 3 and Jetpack Compose paradigms.",
        "responsibilities": "Write coroutines for asynchronous tasks, implement Room database caching, and manage Gradle dependencies.",
        "mandatory_skills": ["Kotlin", "Android", "Java"],
        "optional_skills": ["Jetpack Compose", "Coroutines", "SQLite"]
    },
    {
        "company_name": "Veloce Commerce",
        "title": "iOS Developer Trainee",
        "domain": "Mobile App Development",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Mumbai, India",
        "education_requirement": "B.Tech/B.E. in Computer Science",
        "experience_requirement": "0-1 years",
        "openings": 2,
        "description": "Build fast consumer-facing checkout and order tracking screens using Swift and SwiftUI.",
        "responsibilities": "Implement SwiftUI views, handle location permissions, and write automated UI tests with XCTest.",
        "mandatory_skills": ["Swift", "iOS", "Mobile App Development"],
        "optional_skills": ["SwiftUI", "CocoaPods", "Git"]
    },

    # 7. Cloud & DevOps
    {
        "company_name": "CloudScale Systems",
        "title": "Junior DevOps Engineer",
        "domain": "Cloud & DevOps",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Hyderabad, India",
        "education_requirement": "B.Tech in Computer Science, IT, or Electronics",
        "experience_requirement": "0-2 years",
        "openings": 3,
        "description": "Automate infrastructure provisioning with Terraform, maintain CI/CD pipelines, and monitor server health.",
        "responsibilities": "Write GitHub Actions workflows, manage Docker container images, configure Prometheus alerts, and troubleshoot Linux environments.",
        "mandatory_skills": ["Linux", "Docker", "CI/CD", "Git"],
        "optional_skills": ["Kubernetes", "AWS", "Terraform", "Python"]
    },
    {
        "company_name": "CloudScale Systems",
        "title": "Cloud Infrastructure Intern",
        "domain": "Cloud & DevOps",
        "employment_type": "Internship",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "Enrolled in B.Tech / BCA",
        "experience_requirement": "Fresher",
        "openings": 3,
        "description": "Learn cloud resource management, automated scripts, and container deployment best practices.",
        "responsibilities": "Write Bash and Python utility scripts, document deployment runs, and assist in cloud cost optimization audits.",
        "mandatory_skills": ["Linux", "Bash", "Git"],
        "optional_skills": ["Docker", "AWS", "Python"]
    },
    {
        "company_name": "Sentinel Cloud Security",
        "title": "Site Reliability Engineer (SRE)",
        "domain": "Cloud & DevOps",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Hyderabad, India",
        "education_requirement": "B.Tech/B.E. in CS/IT",
        "experience_requirement": "1-3 years",
        "openings": 2,
        "description": "Ensure five-nines service uptime, optimize latency bottlenecks, and lead incident response automation.",
        "responsibilities": "Manage Kubernetes clusters, write Grafana dashboards, implement automated canary deployments, and participate in blameless postmortems.",
        "mandatory_skills": ["Kubernetes", "Docker", "Linux", "Python"],
        "optional_skills": ["Terraform", "Grafana", "Prometheus", "Golang"]
    },
    {
        "company_name": "Sentinel Cloud Security",
        "title": "AWS Cloud Engineer",
        "domain": "Cloud & DevOps",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Hyderabad, India",
        "education_requirement": "B.Tech in CS/IT with AWS certification preferred",
        "experience_requirement": "0-2 years",
        "openings": 2,
        "description": "Architect secure VPC networks, configure IAM role policies, and manage RDS/S3 cloud services.",
        "responsibilities": "Provision AWS CloudFormation/Terraform stacks, configure API Gateways, and audit security compliance logs.",
        "mandatory_skills": ["AWS", "Linux", "Cloud Computing"],
        "optional_skills": ["Terraform", "Python", "Docker"]
    },

    # 8. Cybersecurity
    {
        "company_name": "CyberShield Defense",
        "title": "Junior Cybersecurity Analyst",
        "domain": "Cybersecurity",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech/B.Sc in Cyber Security, CS, or IT",
        "experience_requirement": "0-2 years",
        "openings": 3,
        "description": "Monitor Security Operations Center (SOC) telemetry, investigate alerts, and execute incident containment protocols.",
        "responsibilities": "Analyze firewall and SIEM logs, assist in malware analysis, and generate vulnerability remediation tickets.",
        "mandatory_skills": ["Cybersecurity", "Networking", "Linux"],
        "optional_skills": ["Wireshark", "Python", "SIEM", "Nmap"]
    },
    {
        "company_name": "CyberShield Defense",
        "title": "Security Assessment & Pen Testing Intern",
        "domain": "Cybersecurity",
        "employment_type": "Internship",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "Enrolled in B.Tech in CS/IT with interest in ethical hacking",
        "experience_requirement": "Fresher",
        "openings": 2,
        "description": "Perform web application penetration testing based on the OWASP Top 10 vulnerabilities.",
        "responsibilities": "Audit source code for security flaws, execute Burp Suite scans, and write detailed vulnerability reports.",
        "mandatory_skills": ["Cybersecurity", "Web Security", "OWASP"],
        "optional_skills": ["Burp Suite", "Python", "Linux"]
    },
    {
        "company_name": "Sentinel Cloud Security",
        "title": "Application Security Engineer",
        "domain": "Cybersecurity",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Hyderabad, India",
        "education_requirement": "B.Tech in Computer Science / Information Security",
        "experience_requirement": "1-3 years",
        "openings": 2,
        "description": "Integrate SAST/DAST tooling into CI/CD pipelines, conduct threat modeling sessions, and review developer PRs.",
        "responsibilities": "Configure vulnerability scanners (SonarQube, Snyk), assist developers in fixing CVEs, and design secure authentication flows.",
        "mandatory_skills": ["Application Security", "Python", "Cryptography"],
        "optional_skills": ["Docker", "OWASP", "CI/CD"]
    },
    {
        "company_name": "CyberShield Defense",
        "title": "Network Security Trainee",
        "domain": "Cybersecurity",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech in CS/ECE/IT",
        "experience_requirement": "0-1 years",
        "openings": 2,
        "description": "Manage VPN configurations, intrusion detection systems (IDS), and network traffic segmentation.",
        "responsibilities": "Inspect packet captures with Wireshark, verify firewall ACLs, and maintain secure network topology documentation.",
        "mandatory_skills": ["Networking", "Cybersecurity", "TCP/IP"],
        "optional_skills": ["Linux", "Wireshark", "Cisco"]
    },

    # 9. Embedded Systems & IoT
    {
        "company_name": "SiliconSense IoT",
        "title": "Embedded Software Engineer",
        "domain": "Embedded Systems & IoT",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Hyderabad, India",
        "education_requirement": "B.Tech/B.E. in Electronics & Communication, Electrical, or CS",
        "experience_requirement": "0-2 years",
        "openings": 3,
        "description": "Write firmware for ARM Cortex-M microcontrollers, debug hardware interfaces, and optimize battery lifespan.",
        "responsibilities": "Implement I2C, SPI, and UART device drivers in C/C++, write unit tests with hardware-in-the-loop, and review schematics.",
        "mandatory_skills": ["C", "C++", "Embedded Systems"],
        "optional_skills": ["ARM", "RTOS", "Microcontrollers", "I2C/SPI"]
    },
    {
        "company_name": "SiliconSense IoT",
        "title": "IoT Systems Intern",
        "domain": "Embedded Systems & IoT",
        "employment_type": "Internship",
        "work_arrangement": "Hybrid",
        "location": "Hyderabad, India",
        "education_requirement": "Pre-final / final year in ECE, EEE, or CS",
        "experience_requirement": "Fresher",
        "openings": 4,
        "description": "Connect edge sensor nodes to MQTT brokers and cloud gateways with ESP32 and Raspberry Pi platforms.",
        "responsibilities": "Program ESP32 boards, handle sensor readings, test MQTT payload encoding, and create local telemetry dashboards.",
        "mandatory_skills": ["C", "Embedded Systems", "IoT"],
        "optional_skills": ["Python", "Arduino", "MQTT", "ESP32"]
    },
    {
        "company_name": "AeroDynamics IoT",
        "title": "RTOS Firmware Engineer",
        "domain": "Embedded Systems & IoT",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech/M.Tech in ECE / Aerospace / CS",
        "experience_requirement": "1-3 years",
        "openings": 2,
        "description": "Design mission-critical deterministic real-time firmware using FreeRTOS or Zephyr OS.",
        "responsibilities": "Design thread synchronization primitives, manage memory pools, debug timing jitter with logic analyzers, and ensure safety standards.",
        "mandatory_skills": ["C++", "RTOS", "Embedded Systems"],
        "optional_skills": ["FreeRTOS", "Linux", "CAN Bus"]
    },
    {
        "company_name": "AeroDynamics IoT",
        "title": "Hardware & IoT Integration Engineer",
        "domain": "Embedded Systems & IoT",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Bengaluru, India",
        "education_requirement": "B.Tech in ECE / Instrumentation",
        "experience_requirement": "0-2 years",
        "openings": 2,
        "description": "Bridge hardware prototypes with telemetry streaming servers and cloud ingestion pipelines.",
        "responsibilities": "Perform board bring-up, solder test points, write Python test automation scripts, and document PCB revisions.",
        "mandatory_skills": ["C", "IoT", "Microcontrollers"],
        "optional_skills": ["Python", "PCB Design", "Soldering"]
    },

    # 10. UI/UX & Product Design
    {
        "company_name": "PixelCraft Interactive",
        "title": "Junior UI/UX Designer",
        "domain": "UI/UX & Product Design",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Pune, India",
        "education_requirement": "Degree in Interaction Design, Human-Computer Interaction, CS, or Portfolio equivalent",
        "experience_requirement": "0-2 years",
        "openings": 2,
        "description": "Design intuitive user flows, high-fidelity wireframes, design systems, and interactive prototypes.",
        "responsibilities": "Conduct user research interviews, create Figma component libraries, test usability with target personas, and prepare dev handoffs.",
        "mandatory_skills": ["Figma", "UI/UX Design", "Wireframing"],
        "optional_skills": ["Prototyping", "User Research", "Design Systems", "HTML/CSS"]
    },
    {
        "company_name": "PixelCraft Interactive",
        "title": "Product Design Intern",
        "domain": "UI/UX & Product Design",
        "employment_type": "Internship",
        "work_arrangement": "Remote",
        "location": "Remote",
        "education_requirement": "Enrolled in Design or Engineering degree with strong design portfolio",
        "experience_requirement": "Fresher",
        "openings": 3,
        "description": "Assist our lead product designers with micro-animations, iconography, design system tokens, and usability audits.",
        "responsibilities": "Create variant states for design components, record user testing sessions, and build interactive Figma click-through demos.",
        "mandatory_skills": ["Figma", "UI/UX Design"],
        "optional_skills": ["Adobe XD", "Illustrator", "Prototyping"]
    },
    {
        "company_name": "StackNova Labs",
        "title": "Product UX Researcher",
        "domain": "UI/UX & Product Design",
        "employment_type": "Full-Time",
        "work_arrangement": "Hybrid",
        "location": "Bengaluru, India",
        "education_requirement": "Degree in Psychology, HCI, Design, or related",
        "experience_requirement": "1-3 years",
        "openings": 1,
        "description": "Translate user sentiment and behavior data into core product requirements, journey maps, and feature specs.",
        "responsibilities": "Organize card sorting exercises, analyze funnel drop-off analytics, and deliver research readouts to engineering teams.",
        "mandatory_skills": ["User Research", "UI/UX Design", "Usability Testing"],
        "optional_skills": ["Figma", "Data Analysis", "Journey Mapping"]
    },
    {
        "company_name": "FrontendForge Studio",
        "title": "Design Systems Specialist",
        "domain": "UI/UX & Product Design",
        "employment_type": "Full-Time",
        "work_arrangement": "On-Site",
        "location": "Noida, India",
        "education_requirement": "Degree in Design, CS, or equivalent experience",
        "experience_requirement": "0-2 years",
        "openings": 2,
        "description": "Bridge the gap between design and code by maintaining design tokens, accessibility standards, and Figma libraries.",
        "responsibilities": "Define color palettes and typography scales, ensure WCAG 2.1 AA accessibility, and collaborate with React engineers.",
        "mandatory_skills": ["Figma", "Design Systems", "UI/UX Design"],
        "optional_skills": ["HTML/CSS", "Accessibility", "Tailwind CSS"]
    }
]


def seed_job_portal_data(db: Session):
    """
    Idempotent seeder for sample companies and job listings.
    Ensures all 10 domains have rich illustrative opportunities clearly marked as demo.
    """
    existing_demo_jobs = db.query(JobListing).filter(JobListing.is_demo == True).count()
    if existing_demo_jobs >= len(SAMPLE_JOBS):
        logger.info(f"Job portal demo data already seeded ({existing_demo_jobs} listings). Skipping.")
        return

    logger.info("Seeding job portal demo companies and listings...")

    # 1. Seed or retrieve companies
    company_map = {}
    for c_data in SAMPLE_COMPANIES:
        company = db.query(Company).filter(Company.name == c_data["name"]).first()
        if not company:
            company = Company(
                name=c_data["name"],
                industry=c_data["industry"],
                domain=c_data["domain"],
                description=c_data["description"],
                website=c_data["website"],
                logo_emoji=c_data["logo_emoji"],
                headquarters=c_data["headquarters"],
                is_demo=True
            )
            db.add(company)
            db.flush()
        else:
            # Update missing attributes
            company.domain = c_data["domain"]
            company.description = c_data["description"]
            company.website = c_data["website"]
            company.logo_emoji = c_data["logo_emoji"]
            company.headquarters = c_data["headquarters"]
            company.is_demo = True
            db.flush()
        
        company_map[company.name] = company

    # 2. Seed Job Listings
    now = datetime.now(timezone.utc)
    seeded_count = 0

    for j_data in SAMPLE_JOBS:
        company = company_map.get(j_data["company_name"])
        if not company:
            continue

        # Check if job already exists
        existing_job = db.query(JobListing).filter(
            JobListing.company_id == company.id,
            JobListing.title == j_data["title"]
        ).first()

        if existing_job:
            continue

        deadline = now + timedelta(days=45)
        job = JobListing(
            company_id=company.id,
            title=j_data["title"],
            domain=j_data["domain"],
            employment_type=j_data["employment_type"],
            work_arrangement=j_data["work_arrangement"],
            location=j_data["location"],
            education_requirement=j_data["education_requirement"],
            experience_requirement=j_data["experience_requirement"],
            openings=j_data["openings"],
            description=j_data["description"],
            responsibilities=j_data["responsibilities"],
            deadline=deadline,
            is_published=True,
            is_closed=False,
            is_demo=True
        )
        db.add(job)
        db.flush()

        # Add mandatory skills
        for skill_name in j_data.get("mandatory_skills", []):
            req = JobSkillRequirement(
                job_listing_id=job.id,
                skill_name=skill_name,
                is_mandatory=True
            )
            db.add(req)

        # Add optional skills
        for skill_name in j_data.get("optional_skills", []):
            req = JobSkillRequirement(
                job_listing_id=job.id,
                skill_name=skill_name,
                is_mandatory=False
            )
            db.add(req)

        seeded_count += 1

    db.commit()
    logger.info(f"Successfully seeded {seeded_count} demo job listings across {len(company_map)} companies.")
