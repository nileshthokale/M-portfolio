export interface ProjectPreviewVisual {
  id: string;
  title: string;
  caption: string;
  theme:
    | 'gokalifree-tools'
    | 'gokalifree-sandbox'
    | 'gokalifree-articles'
    | 'empty-slot';
  metricBadge: string;
}

export interface ProjectItem {
  number: string;
  slug: string;
  isEmptyTemplate?: boolean;
  name: string;
  category: string;
  tagline: string;
  liveUrl: string;
  repoUrl: string;
  role: string;
  timeline: string;
  summary: string;
  challenge: string;
  architecture: string;
  results: string[];
  techStack: string[];
  previews: [ProjectPreviewVisual, ProjectPreviewVisual, ProjectPreviewVisual];
}

export interface ServiceItem {
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  grade?: string;
  status: string;
  highlights: string[];
}

export interface SkillCategoryItem {
  id: string;
  category: string;
  badge: string;
  summary: string;
  skills: string[];
}

export const PORTFOLIO_DATA = {
  profile: {
    name: 'NILESH THOKALE',
    fullName: 'Nilesh Thokale',
    heroHeading: "HI, I'M NILESH",
    heroSubtitle:
      'COMPUTER SCIENCE GRADUATE (B.C.S.) PURSUING M.SC. IN DATA SCIENCE — PASSIONATE ABOUT CRAFTING BOLD WEB APPS, AI SOLUTIONS & GOKALIFREE.IN',
    role: 'Computer Science Graduate (B.C.S.) · Pursuing M.Sc. in Data Science',
    university: 'Savitribai Phule Pune University (SPPU)',
    focus: 'Web Development, Cybersecurity Learning & AI-Assisted Engineering',
    location: 'Ahilyanagar, Maharashtra, India',
    phone: '+91 97664 07124',
    email: 'nileshthokale0@gmail.com',
    mainPlatformUrl: 'https://gokalifree.in',
    resumePdfUrl: '/assets/aistudio/Nilesh_Thokale_Resume_79f388ed.pdf',
    socials: {
      github: 'https://github.com/nileshthokale',
      linkedin: 'https://linkedin.com/in/nileshthokale',
      gokalifree: 'https://gokalifree.in',
    },
  },
  navLinks: [
    { label: 'ABOUT', href: '#about' },
    { label: 'SERVICES', href: '#services' },
    { label: 'PROJECTS', href: '#projects' },
    { label: 'CONTACT', href: '#contact' },
  ],
  skillsMarquee: [
    { name: 'GOKALIFREE.IN', detail: '70+ Tools · 164 Commands' },
    { name: 'REACT.JS & VITE', detail: 'Frontend Web Engineering' },
    { name: 'TYPESCRIPT & JS', detail: 'Modern Client & Server Code' },
    { name: 'KALI LINUX & NMAP', detail: 'Cybersecurity & Recon' },
    { name: 'BURP SUITE & OWASP', detail: 'Web Security Testing' },
    { name: 'NODE.JS & EXPRESS', detail: 'REST APIs & Backend' },
    { name: 'PYTHON & MYSQL', detail: 'M.Sc. Data Science (SPPU)' },
    { name: 'AI & PROMPT ENG.', detail: 'AI-Assisted Development' },
  ],
  about: {
    heading: 'ABOUT ME',
    lines: [
      'Computer Science graduate (B.C.S., CGPA 7.09 — Grade A) currently pursuing an M.Sc. in Data Science at SPPU.',
      'I specialize in React.js web development, AI-assisted engineering, and cybersecurity.',
      'I built and maintain GoKaliFree (gokalifree.in) featuring 70+ security tools, 164 Linux commands, and 111 articles.',
      "Let's create something amazing together!",
    ],
    ctaLabel: 'CONTACT ME',
  },
  services: [
    {
      number: '01',
      title: 'FRONTEND WEB DEVELOPMENT',
      description:
        'Creation of responsive, high-speed React.js, TypeScript, Vite, and Tailwind CSS web applications tailored for modern businesses, SaaS products, and interactive portfolios.',
      deliverables: ['React.js & TypeScript SPAs', 'Tailwind CSS Responsive Design', 'Vercel Deployment'],
    },
    {
      number: '02',
      title: 'CYBERSECURITY PLATFORMS & LABS',
      description:
        'Interactive browser-based security utilities, terminal sandboxes, and educational guides covering 70+ Kali Linux tools, 164 Linux commands, Nmap, Burp Suite, Wireshark, and OWASP Top 10.',
      deliverables: ['Browser Terminal Sandboxes', 'Kali Linux & Nmap Labs', 'OWASP Top 10 Documentation'],
    },
    {
      number: '03',
      title: 'BACKEND & REST API DEVELOPMENT',
      description:
        'Custom Node.js and Express.js backend services, secure CORS proxy architectures, RESTful APIs, and adaptive video/media streaming applications with MySQL databases.',
      deliverables: ['Node.js & Express.js APIs', 'MySQL Database Design', 'Secure Proxy Services'],
    },
    {
      number: '04',
      title: 'AI-ASSISTED SOFTWARE ENGINEERING',
      description:
        'Leveraging modern AI tools and structured prompt engineering workflows to accelerate full-stack development, automate repetitive code tasks, and improve software reliability.',
      deliverables: ['Prompt Engineering Workflows', 'AI-Enhanced Productivity', 'Rapid Prototyping'],
    },
    {
      number: '05',
      title: 'DATA SCIENCE & TECHNICAL SEO',
      description:
        'M.Sc. Data Science fundamentals in Python and SQL combined with end-to-end SEO strategy — sitemap architecture, keyword clustering, and internal linking for organic growth.',
      deliverables: ['Python & SQL Data Analysis', 'Sitemap & Keyword Clustering', 'Technical SEO Audits'],
    },
  ] as ServiceItem[],
  projects: [
    {
      number: '01',
      slug: 'gokalifree',
      isEmptyTemplate: false,
      name: 'GOKALIFREE',
      category: 'Cybersecurity Learning Platform (gokalifree.in)',
      tagline:
        'Free cybersecurity learning platform featuring 70+ security tools, 164 Linux commands, 111 educational articles, and an interactive browser terminal sandbox.',
      liveUrl: 'https://gokalifree.in',
      repoUrl: 'https://github.com/nileshthokale',
      role: 'Solo Creator & Full-Stack Developer',
      timeline: '2026 — Present',
      summary:
        'Developed and currently maintain GoKaliFree (gokalifree.in), a client-side React.js & TypeScript SPA deployed on Vercel covering 70+ security tools, 164 Linux commands, and 111 articles for beginners and professionals learning ethical hacking.',
      challenge:
        'Built interactive, browser-based security utilities and a terminal sandbox to let users practice tools and commands directly in the browser without local setup.',
      architecture:
        'React.js, TypeScript, Vite, Node.js, Express.js, HTML5, CSS3, Tailwind CSS, Git, and Vercel with end-to-end SEO strategy (sitemap structure, keyword clustering, and internal linking).',
      results: [
        '70+ Kali Linux & ethical hacking security tools documented with practical examples',
        '164 Linux commands and 111 educational articles published with full SEO clustering',
        'Interactive browser-based security utilities and zero-setup terminal sandbox',
      ],
      techStack: ['React.js', 'TypeScript', 'Vite', 'Node.js', 'Express.js', 'Tailwind CSS', 'Vercel'],
      previews: [
        {
          id: 'gkf-1',
          title: '70+ Security Tools & 164 Linux Commands',
          caption: 'Interactive command atlas and tool reference on gokalifree.in',
          theme: 'gokalifree-tools',
          metricBadge: 'gokalifree.in · Live',
        },
        {
          id: 'gkf-2',
          title: 'Browser Terminal Sandbox & Security Utilities',
          caption: 'Practice commands directly in the browser without local setup',
          theme: 'gokalifree-sandbox',
          metricBadge: 'Interactive Sandbox',
        },
        {
          id: 'gkf-3',
          title: '111 Educational Articles & Technical SEO',
          caption: 'Keyword-clustered ethical hacking & OWASP Top 10 guides',
          theme: 'gokalifree-articles',
          metricBadge: '111 Articles',
        },
      ],
    },
    {
      number: '02',
      slug: 'project-slot-02',
      isEmptyTemplate: true,
      name: 'PROJECT SLOT 02',
      category: 'Empty Project Template — Ready to Fill',
      tagline: 'Empty project card template 02.',
      liveUrl: '#projects',
      repoUrl: 'https://github.com/nileshthokale',
      role: 'Add Role',
      timeline: '2026',
      summary: 'Empty project template 02. Edit in src/data/portfolio.ts.',
      challenge: 'Add challenge details in src/data/portfolio.ts.',
      architecture: 'Add stack details in src/data/portfolio.ts.',
      results: ['Add result 01', 'Add result 02'],
      techStack: ['Empty Slot 02'],
      previews: [
        {
          id: 'empty-2-1',
          title: 'Empty Project 02 — Main Preview',
          caption: 'Add your project screenshot or preview in src/data/portfolio.ts',
          theme: 'empty-slot',
          metricBadge: 'TEMPLATE 02',
        },
        {
          id: 'empty-2-2',
          title: 'Empty Preview Slot 02',
          caption: 'Secondary preview placeholder',
          theme: 'empty-slot',
          metricBadge: 'SLOT 02',
        },
        {
          id: 'empty-2-3',
          title: 'Empty Preview Slot 03',
          caption: 'Third preview placeholder',
          theme: 'empty-slot',
          metricBadge: 'SLOT 03',
        },
      ],
    },
    {
      number: '03',
      slug: 'project-slot-03',
      isEmptyTemplate: true,
      name: 'PROJECT SLOT 03',
      category: 'Empty Project Template — Ready to Fill',
      tagline: 'Empty project card template 03.',
      liveUrl: '#projects',
      repoUrl: 'https://github.com/nileshthokale',
      role: 'Add Role',
      timeline: '2026',
      summary: 'Empty project template 03. Edit in src/data/portfolio.ts.',
      challenge: 'Add challenge details in src/data/portfolio.ts.',
      architecture: 'Add stack details in src/data/portfolio.ts.',
      results: ['Add result 01', 'Add result 02'],
      techStack: ['Empty Slot 03'],
      previews: [
        {
          id: 'empty-3-1',
          title: 'Empty Project 03 — Main Preview',
          caption: 'Add your project screenshot or preview in src/data/portfolio.ts',
          theme: 'empty-slot',
          metricBadge: 'TEMPLATE 03',
        },
        {
          id: 'empty-3-2',
          title: 'Empty Preview Slot 02',
          caption: 'Secondary preview placeholder',
          theme: 'empty-slot',
          metricBadge: 'SLOT 02',
        },
        {
          id: 'empty-3-3',
          title: 'Empty Preview Slot 03',
          caption: 'Third preview placeholder',
          theme: 'empty-slot',
          metricBadge: 'SLOT 03',
        },
      ],
    },
  ] as ProjectItem[],
  education: [
    {
      degree: 'Master of Science (M.Sc.) in Data Science',
      institution: 'Savitribai Phule Pune University (SPPU)',
      period: '2026 – Present',
      status: 'Pursuing',
      highlights: [
        'Pursuing M.Sc. in Data Science with focus on Python, SQL, statistical analysis, and AI-assisted development.',
      ],
    },
    {
      degree: 'Bachelor of Computer Science (B.C.S.)',
      institution: 'Savitribai Phule Pune University (SPPU)',
      period: '2023 – 2026',
      grade: 'C.G.P.A.: 7.09 · Final Grade: A',
      status: 'First Class with Distinction (Grade A)',
      highlights: [
        'Graduated with CGPA 7.09 (Final Grade A). Built GoKaliFree (gokalifree.in) and modern React/Node.js web applications.',
      ],
    },
  ] as EducationItem[],
  skillCategories: [
    {
      id: 'education-msc',
      category: 'M.Sc. in Data Science (SPPU)',
      badge: 'MS',
      summary:
        'Pursuing Master of Science in Data Science (2026 – Present) at Savitribai Phule Pune University, applying Python, SQL, and AI-assisted workflows to real-world problems.',
      skills: ['2026 – Present', 'Savitribai Phule Pune University', 'Data Science Fundamentals'],
    },
    {
      id: 'education-bcs',
      category: 'B.C.S. Computer Science (SPPU)',
      badge: 'BC',
      summary:
        'Completed Bachelor of Computer Science (2023 – 2026) at Savitribai Phule Pune University with C.G.P.A. 7.09 and Final Grade A.',
      skills: ['C.G.P.A.: 7.09', 'Final Grade: A', '2023 – 2026'],
    },
    {
      id: 'cybersecurity',
      category: 'Cybersecurity',
      badge: 'CS',
      summary:
        'Hands-on offensive & defensive security experience building GoKaliFree.in with 70+ security tools, 164 Linux commands, and 111 educational articles.',
      skills: ['Kali Linux', 'Linux Commands', 'Nmap', 'Burp Suite (Basic)', 'Wireshark (Basic)', 'OWASP Top 10'],
    },
    {
      id: 'frontend',
      category: 'Frontend & Languages',
      badge: 'FE',
      summary:
        'Building responsive, fast client-side SPAs with modern JavaScript, TypeScript, React.js, Vite, HTML5, CSS3, and Tailwind CSS.',
      skills: ['JavaScript', 'TypeScript', 'React.js', 'Vite', 'Tailwind CSS', 'HTML5 & CSS3'],
    },
    {
      id: 'backend-db',
      category: 'Backend & Databases',
      badge: 'BE',
      summary:
        'Developing RESTful APIs, Node.js/Express.js services, secure CORS proxies, and relational MySQL database schemas.',
      skills: ['Node.js', 'Express.js', 'MySQL', 'REST APIs', 'SQL (Basic)', 'Python (Basic)'],
    },
    {
      id: 'ai-tools',
      category: 'AI & Developer Tools',
      badge: 'AI',
      summary:
        'Using AI-assisted development, prompt engineering, Git, GitHub, VS Code, Postman, and Vercel to ship production web applications.',
      skills: ['AI-Assisted Dev', 'Prompt Engineering', 'Git & GitHub', 'VS Code', 'Postman', 'Vercel'],
    },
  ] as SkillCategoryItem[],
};
