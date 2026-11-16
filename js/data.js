/**
 * EduNova LMS - Initial Seed Data
 * Provides comprehensive demo data for Courses, Lessons, Chapters,
 * Users, Assignments, Submissions, Quizzes, Announcements, Batches, and Notifications.
 */

const SEED_DATA = {
  users: [
    {
      id: "u-admin-1",
      name: "Dr. Robert Vance",
      email: "admin@edunova.com",
      password: "admin123",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      title: "Dean of Academic Technology",
      department: "Administration",
      phone: "+1 (555) 234-5678",
      joinedDate: "2024-01-15",
      status: "active",
      bio: "Academic administrator and computer science researcher with 18+ years of experience leading educational transformation."
    },
    {
      id: "u-teacher-1",
      name: "Prof. Sarah Chen",
      email: "sarah.chen@edunova.com",
      password: "teacher123",
      role: "teacher",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      title: "Associate Professor of Computer Science",
      department: "Software Engineering & AI",
      phone: "+1 (555) 345-6789",
      joinedDate: "2024-02-10",
      status: "active",
      bio: "Former Principal Architect at CloudTech. Passionate about modern web architecture, distributed systems, and experiential tech learning."
    },
    {
      id: "u-teacher-2",
      name: "Marcus Sterling",
      email: "marcus@edunova.com",
      password: "teacher123",
      role: "teacher",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      title: "Lead Design Strategist",
      department: "Digital Product Design",
      phone: "+1 (555) 456-7890",
      joinedDate: "2024-03-01",
      status: "active",
      bio: "Award-winning product designer and design systems consultant who has crafted user experiences for Fortune 500 apps."
    },
    {
      id: "u-student-1",
      name: "Alex Morgan",
      email: "alex.morgan@edunova.com",
      password: "student123",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      title: "Undergraduate Fellow",
      department: "Computer Science Major",
      phone: "+1 (555) 567-8901",
      joinedDate: "2024-08-20",
      status: "active",
      studentId: "STU-2026-0891",
      batch: "Batch A - 2026",
      bio: "Aspiring full-stack engineer and open source contributor. Eager to master web technologies and distributed backend services."
    },
    {
      id: "u-student-2",
      name: "Emma Watson",
      email: "emma@edunova.com",
      password: "student123",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      title: "Junior Scholar",
      department: "Data & Artificial Intelligence",
      phone: "+1 (555) 678-9012",
      joinedDate: "2024-09-01",
      status: "active",
      studentId: "STU-2026-0924",
      batch: "Batch A - 2026",
      bio: "Data enthusiast fascinated by deep learning, natural language processing, and ethical machine intelligence."
    },
    {
      id: "u-student-3",
      name: "Liam Nguyen",
      email: "liam@edunova.com",
      password: "student123",
      role: "student",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      title: "Design Fellow",
      department: "UI/UX Design",
      phone: "+1 (555) 789-0123",
      joinedDate: "2024-09-15",
      status: "active",
      studentId: "STU-2026-0955",
      batch: "Batch B - 2026",
      bio: "Interaction designer passionate about creating accessible, inclusive web experiences and design tokens."
    }
  ],

  courses: [
    {
      id: "crs-101",
      code: "CS-401",
      title: "Full-Stack Web Engineering with Modern React & Node",
      slug: "fullstack-web-engineering",
      tagline: "Build enterprise-grade, scalable full-stack applications with production-ready patterns.",
      description: "Master modern full-stack web engineering from the ground up. This course covers state-of-the-art frontend patterns with React, component architecture, state management, REST & GraphQL APIs, secure Node.js microservices, SQL & NoSQL persistence, authentication protocols (JWT, OAuth2), and continuous deployment pipelines.",
      category: "Web Development",
      level: "Intermediate",
      duration: "10 Weeks (42 Hours)",
      rating: 4.9,
      reviewsCount: 384,
      instructorId: "u-teacher-1",
      instructorName: "Prof. Sarah Chen",
      instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      instructorTitle: "Associate Professor of Computer Science",
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
      enrolledCount: 248,
      isPublished: true,
      featured: true,
      price: "$0 (Scholarship Sponsored)",
      outcomes: [
        "Architect clean, modular React component hierarchies using custom hooks",
        "Build secure RESTful backends with Node.js, Express, and JWT authentication",
        "Implement relational database schemas and complex queries with PostgreSQL",
        "Deploy scalable containerized applications with Docker and modern CI/CD",
        "Optimize Core Web Vitals, caching, and frontend runtime performance"
      ],
      chapters: [
        {
          id: "ch-101-1",
          title: "Foundations of Modern Web Architecture",
          order: 1,
          lessons: [
            {
              id: "les-101-1-1",
              title: "1.1 Anatomy of Enterprise Web Apps",
              duration: "18 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              description: "Explore the core tiers of enterprise web applications: client layers, edge caching, API gateways, service meshes, and distributed persistence engines.",
              resources: [
                { name: "Web Architecture Overview (PDF)", size: "2.4 MB", type: "pdf", url: "#" },
                { name: "System Design Diagram Cheat Sheet", size: "1.1 MB", type: "image", url: "#" }
              ]
            },
            {
              id: "les-101-1-2",
              title: "1.2 Modern JavaScript & TypeScript Essentials",
              duration: "24 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              description: "Deep dive into TypeScript generics, utility types, async iterator patterns, and compile-time type safety for robust full-stack codebases.",
              resources: [
                { name: "TypeScript Production Guide (PDF)", size: "3.8 MB", type: "pdf", url: "#" },
                { name: "Starter Code Repository Template", size: "450 KB", type: "code", url: "#" }
              ]
            },
            {
              id: "les-101-1-3",
              title: "1.3 Tooling: Vite, ESLint, Prettier & Monorepos",
              duration: "15 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              description: "Configure blazing fast developer workflows with Vite, enforce linting rules, automated testing hooks, and monorepo workspace tooling.",
              resources: [
                { name: "Vite & Monorepo Setup Guide", size: "1.2 MB", type: "pdf", url: "#" }
              ]
            }
          ]
        },
        {
          id: "ch-101-2",
          title: "Advanced React & State Architecture",
          order: 2,
          lessons: [
            {
              id: "les-101-2-1",
              title: "2.1 Declarative Component Patterns & Hooks",
              duration: "28 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              description: "Learn compound components, render props, and building robust reusable custom hooks that encapsulate complex asynchronous logic.",
              resources: [
                { name: "Custom Hooks Reference Manual", size: "1.9 MB", type: "pdf", url: "#" }
              ]
            },
            {
              id: "les-101-2-2",
              title: "2.2 Global State Management with Context & Signals",
              duration: "22 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
              description: "Contrast Context API, Zustand, and fine-grained reactivity to prevent unnecessary component re-renders in large enterprise applications.",
              resources: [
                { name: "State Comparison Matrix", size: "850 KB", type: "pdf", url: "#" }
              ]
            }
          ]
        },
        {
          id: "ch-101-3",
          title: "Backend Microservices, Auth & PostgreSQL",
          order: 3,
          lessons: [
            {
              id: "les-101-3-1",
              title: "3.1 RESTful API Architecture with Express & Validation",
              duration: "30 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
              description: "Architecting idiomatic REST endpoints, comprehensive schema validation with Zod/Joi, error boundary handling, and structured JSON logs.",
              resources: [
                { name: "REST API Best Practices Guidelines", size: "1.7 MB", type: "pdf", url: "#" }
              ]
            },
            {
              id: "les-101-3-2",
              title: "3.2 JWT, Refresh Tokens & RBAC Security",
              duration: "26 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
              description: "Implement bulletproof authentication with httpOnly cookie storage, rotating refresh tokens, and granular role-based access control.",
              resources: [
                { name: "Auth Security Checklist (PDF)", size: "2.1 MB", type: "pdf", url: "#" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "crs-102",
      code: "AI-502",
      title: "Machine Learning & Neural Networks Foundations",
      slug: "machine-learning-neural-networks",
      tagline: "Build, train, and evaluate deep neural networks using PyTorch and modern mathematical foundations.",
      description: "Dive into machine learning and modern neural networks. Learn linear regression, loss optimization via gradient descent, backpropagation, convolutional networks for computer vision, recurrent networks, transformer architectures, and fine-tuning foundation models with practical real-world datasets.",
      category: "AI & Machine Learning",
      level: "Advanced",
      duration: "12 Weeks (50 Hours)",
      rating: 4.95,
      reviewsCount: 290,
      instructorId: "u-teacher-1",
      instructorName: "Prof. Sarah Chen",
      instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      instructorTitle: "Associate Professor of Computer Science",
      thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
      enrolledCount: 195,
      isPublished: true,
      featured: true,
      price: "$0 (Scholarship Sponsored)",
      outcomes: [
        "Master the linear algebra and calculus behind gradient backpropagation",
        "Construct deep feedforward and convolutional models in PyTorch",
        "Implement regularization, batch normalization, and dropout techniques",
        "Understand attention mechanisms and Transformer self-attention layers",
        "Deploy trained models as low-latency inference APIs"
      ],
      chapters: [
        {
          id: "ch-102-1",
          title: "Mathematical Foundations & Gradient Optimization",
          order: 1,
          lessons: [
            {
              id: "les-102-1-1",
              title: "1.1 Linear Algebra & Tensors in PyTorch",
              duration: "25 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              description: "Understanding multi-dimensional tensors, broadcasting rules, matrix multiplication, and GPU acceleration in PyTorch.",
              resources: [
                { name: "Tensor Math Handout (PDF)", size: "3.1 MB", type: "pdf", url: "#" }
              ]
            },
            {
              id: "les-102-1-2",
              title: "1.2 Gradient Descent & Backpropagation",
              duration: "32 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              description: "Deriving the chain rule computationally and building a mini automatic differentiation engine from scratch.",
              resources: [
                { name: "Backpropagation Mathematical Derivation", size: "2.6 MB", type: "pdf", url: "#" }
              ]
            }
          ]
        },
        {
          id: "ch-102-2",
          title: "Deep Vision & Convolutional Neural Networks",
          order: 2,
          lessons: [
            {
              id: "les-102-2-1",
              title: "2.1 Convolution Kernels, Stride & Pooling",
              duration: "27 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              description: "How 2D convolutions extract spatial feature hierarchies from images, pooling strategies, and receptive fields.",
              resources: [
                { name: "CNN Architecture Cheat Sheet", size: "1.8 MB", type: "pdf", url: "#" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "crs-103",
      code: "DS-201",
      title: "UI/UX Design Systems & Interactive Prototyping",
      slug: "ui-ux-design-systems",
      tagline: "Create cohesive, accessible, enterprise design systems and high-fidelity prototypes.",
      description: "Master modern user interface and interaction design. Learn Figma design tokens, auto-layout 5.0, responsive constraints, accessible color contrast (WCAG AAA), component variants, micro-interactions, usability heuristics, and developer handoff documentation.",
      category: "Design",
      level: "Beginner",
      duration: "8 Weeks (32 Hours)",
      rating: 4.88,
      reviewsCount: 215,
      instructorId: "u-teacher-2",
      instructorName: "Marcus Sterling",
      instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      instructorTitle: "Lead Design Strategist",
      thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
      enrolledCount: 164,
      isPublished: true,
      featured: true,
      price: "$0 (Scholarship Sponsored)",
      outcomes: [
        "Construct scalable design token architectures for multi-brand platforms",
        "Design responsive user journeys adhering to WCAG 2.1 accessibility criteria",
        "Build complex interactive prototypes with smart animate transitions",
        "Conduct systematic user testing and usability heuristic audits",
        "Generate developer-ready design specifications and CSS variables"
      ],
      chapters: [
        {
          id: "ch-103-1",
          title: "Design Tokens & Foundational Typography",
          order: 1,
          lessons: [
            {
              id: "les-103-1-1",
              title: "1.1 Establishing Color Scales & Semantic Tokens",
              duration: "20 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              description: "Designing systematic color palettes with OKLCH, setting up light/dark mode variables, and ensuring contrast compliance.",
              resources: [
                { name: "Design System Starter Kit (Figma)", size: "4.2 MB", type: "figma", url: "#" }
              ]
            },
            {
              id: "les-103-1-2",
              title: "1.2 Typographic Hierarchies & Fluid Spacing",
              duration: "18 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
              description: "Defining harmonious modular scales, line heights, letter-spacing, and fluid clamp() spacing tokens.",
              resources: [
                { name: "Typography Guidebook (PDF)", size: "1.5 MB", type: "pdf", url: "#" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "crs-104",
      code: "OPS-303",
      title: "Cloud Architecture & DevOps with Kubernetes",
      slug: "cloud-devops-kubernetes",
      tagline: "Deploy resilient, autoscaling multi-container microservices with Kubernetes & Terraform.",
      description: "Learn enterprise cloud infrastructure engineering. Master Docker containerization, Kubernetes orchestration (Pods, Deployments, Services, Ingress), Helm chart management, Infrastructure as Code with Terraform, observability with Prometheus & Grafana, and automated deployment pipelines.",
      category: "Cloud & DevOps",
      level: "Advanced",
      duration: "9 Weeks (36 Hours)",
      rating: 4.82,
      reviewsCount: 142,
      instructorId: "u-teacher-1",
      instructorName: "Prof. Sarah Chen",
      instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      instructorTitle: "Associate Professor of Computer Science",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
      enrolledCount: 120,
      isPublished: true,
      featured: false,
      price: "$0 (Scholarship Sponsored)",
      outcomes: [
        "Build secure, multi-stage minimal Docker container images",
        "Deploy and scale microservices on managed Kubernetes clusters",
        "Configure automated TLS certificates and reverse-proxy Ingress controllers",
        "Provision immutable cloud infrastructure using Terraform scripts",
        "Set up comprehensive health metrics, alerts, and log aggregators"
      ],
      chapters: [
        {
          id: "ch-104-1",
          title: "Containerization & Multi-Stage Builds",
          order: 1,
          lessons: [
            {
              id: "les-104-1-1",
              title: "1.1 Docker Internals, Namespaces & Cgroups",
              duration: "22 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              description: "Understanding Linux kernel primitives that power modern application isolation and container virtualization.",
              resources: [
                { name: "Container Security Checklist (PDF)", size: "1.4 MB", type: "pdf", url: "#" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "crs-105",
      code: "SEC-210",
      title: "Cybersecurity Fundamentals & Threat Defense",
      slug: "cybersecurity-fundamentals",
      tagline: "Protect enterprise web systems against vulnerabilities, OWASP Top 10, and zero-day threats.",
      description: "An intensive hands-on course covering defensive and offensive cybersecurity concepts. Explore the OWASP Top 10 web vulnerabilities (SQLi, XSS, CSRF, SSRF), secure code auditing, cryptographic hashing and signatures, penetration testing methodology, and zero-trust security postures.",
      category: "Cyber Security",
      level: "Intermediate",
      duration: "8 Weeks (30 Hours)",
      rating: 4.91,
      reviewsCount: 178,
      instructorId: "u-teacher-1",
      instructorName: "Prof. Sarah Chen",
      instructorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      instructorTitle: "Associate Professor of Computer Science",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
      enrolledCount: 153,
      isPublished: true,
      featured: false,
      price: "$0 (Scholarship Sponsored)",
      outcomes: [
        "Identify and remediate OWASP Top 10 application security flaws",
        "Implement modern Public Key Infrastructure (PKI) and TLS 1.3 configs",
        "Perform vulnerability scans and automated static code analysis",
        "Design zero-trust authentication policies with multi-factor safeguards",
        "Construct incident response playbooks for enterprise threat mitigation"
      ],
      chapters: [
        {
          id: "ch-105-1",
          title: "Web Exploitation & Mitigation",
          order: 1,
          lessons: [
            {
              id: "les-105-1-1",
              title: "1.1 Injection Flaws & Parameterized Query Defenses",
              duration: "25 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              description: "Detailed dissection of SQL injection vectors and defensive ORM / parameterized query best practices.",
              resources: [
                { name: "OWASP Top 10 Quick Reference", size: "2.0 MB", type: "pdf", url: "#" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "crs-106",
      code: "DAT-105",
      title: "Data Science with Python & Statistical Modeling",
      slug: "data-science-python",
      tagline: "Turn raw datasets into actionable predictive insights with Pandas, NumPy, and Scikit-Learn.",
      description: "Master exploratory data analysis, data wrangling, hypothesis testing, predictive modeling, and data storytelling. Work with real-world datasets spanning e-commerce, healthcare, and finance using Pandas, Matplotlib, Seaborn, and Scikit-Learn.",
      category: "Data Science",
      level: "Beginner",
      duration: "10 Weeks (40 Hours)",
      rating: 4.87,
      reviewsCount: 220,
      instructorId: "u-teacher-2",
      instructorName: "Marcus Sterling",
      instructorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      instructorTitle: "Lead Design Strategist",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      enrolledCount: 188,
      isPublished: true,
      featured: false,
      price: "$0 (Scholarship Sponsored)",
      outcomes: [
        "Clean, reshape, and aggregate multi-gigabyte tabular datasets with Pandas",
        "Formulate statistical hypothesis tests and calculate confidence intervals",
        "Build classification and regression models with cross-validation",
        "Craft interactive visualization dashboards for executive stakeholders",
        "Deliver reproducible Jupyter notebooks following professional standards"
      ],
      chapters: [
        {
          id: "ch-106-1",
          title: "Exploratory Data Analysis with Pandas",
          order: 1,
          lessons: [
            {
              id: "les-106-1-1",
              title: "1.1 DataFrames, Series & Data Ingestion",
              duration: "21 min",
              type: "video",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              description: "Ingesting CSV, JSON, and SQL sources into Pandas DataFrames and inspecting statistical summaries.",
              resources: [
                { name: "Pandas Cheat Sheet (PDF)", size: "1.6 MB", type: "pdf", url: "#" }
              ]
            }
          ]
        }
      ]
    }
  ],

  enrollments: [
    {
      id: "enr-1",
      userId: "u-student-1", // Alex Morgan
      courseId: "crs-101",
      enrolledAt: "2024-08-25",
      completedLessons: ["les-101-1-1", "les-101-1-2", "les-101-1-3"],
      progress: 43, // percentage
      status: "in-progress",
      grade: "A-",
      notes: {
        "les-101-1-1": "Key takeaway: Client tier handles UI rendering, edge caching saves server load. Remember API gateways handle rate limiting.",
        "les-101-1-2": "TypeScript utility types like Partial<T>, Pick<T, K>, and ReturnType<T> make API payload handling strictly typed!"
      }
    },
    {
      id: "enr-2",
      userId: "u-student-1",
      courseId: "crs-102",
      enrolledAt: "2024-09-02",
      completedLessons: ["les-102-1-1"],
      progress: 33,
      status: "in-progress",
      grade: "B+",
      notes: {
        "les-102-1-1": "Tensor broadcasting: smaller tensor is stretched across dimensions. Always match shapes carefully!"
      }
    },
    {
      id: "enr-3",
      userId: "u-student-1",
      courseId: "crs-103",
      enrolledAt: "2024-09-10",
      completedLessons: ["les-103-1-1", "les-103-1-2"],
      progress: 100, // Alex completed this one!
      status: "completed",
      completedAt: "2024-10-15",
      grade: "A+",
      certificateId: "CERT-EDU-2026-9921",
      notes: {
        "les-103-1-1": "OKLCH color space ensures consistent perceived lightness across all hues. Much better than HSL for dark themes."
      }
    },
    {
      id: "enr-4",
      userId: "u-student-2", // Emma Watson
      courseId: "crs-102",
      enrolledAt: "2024-09-05",
      completedLessons: ["les-102-1-1", "les-102-1-2"],
      progress: 67,
      status: "in-progress",
      grade: "A",
      notes: {}
    },
    {
      id: "enr-5",
      userId: "u-student-3", // Liam Nguyen
      courseId: "crs-103",
      enrolledAt: "2024-09-18",
      completedLessons: ["les-103-1-1"],
      progress: 50,
      status: "in-progress",
      grade: "A-",
      notes: {}
    }
  ],

  assignments: [
    {
      id: "asg-201",
      courseId: "crs-101",
      courseTitle: "Full-Stack Web Engineering",
      title: "Project 1: Scalable RESTful API with Authentication",
      description: "Design and implement a secure RESTful API using Node.js and Express. Requirements:\n1. Implement JWT authentication with access and refresh tokens.\n2. Create CRUD routes for a resource with schema validation (Zod).\n3. Protect admin routes with role-based middleware.\n4. Write comprehensive integration tests with Jest/Supertest.\n5. Submit a GitHub repository link and a 1-page architecture design document.",
      dueDate: "2026-11-25T23:59:00",
      maxPoints: 100,
      passingPoints: 70,
      teacherId: "u-teacher-1",
      status: "active",
      submissionsCount: 14,
      attachmentUrl: "sample_assignment_rubric.pdf"
    },
    {
      id: "asg-202",
      courseId: "crs-101",
      courseTitle: "Full-Stack Web Engineering",
      title: "Project 2: Responsive React Dashboard with Custom Hooks",
      description: "Develop a high-performance analytics dashboard in React featuring custom hooks for data fetching, responsive grid layouts, dark mode support, and interactive charts.",
      dueDate: "2026-12-05T23:59:00",
      maxPoints: 100,
      passingPoints: 75,
      teacherId: "u-teacher-1",
      status: "active",
      submissionsCount: 8,
      attachmentUrl: "react_dashboard_spec.pdf"
    },
    {
      id: "asg-203",
      courseId: "crs-102",
      courseTitle: "Machine Learning Foundations",
      title: "Lab 2: Neural Network Backpropagation from Scratch",
      description: "Implement a 3-layer feedforward neural network in Python using pure NumPy (no PyTorch/TensorFlow). Implement forward pass, cross-entropy loss, backpropagation gradient calculations, and test against the MNIST handwritten digits dataset.",
      dueDate: "2026-11-20T23:59:00",
      maxPoints: 100,
      passingPoints: 70,
      teacherId: "u-teacher-1",
      status: "active",
      submissionsCount: 19,
      attachmentUrl: "nn_backprop_instructions.pdf"
    },
    {
      id: "asg-204",
      courseId: "crs-103",
      courseTitle: "UI/UX Design Systems",
      title: "Milestone 1: Design Token System & Component Library in Figma",
      description: "Create an accessible enterprise design token hierarchy in Figma containing color tokens, typography scales, spacing units, and 5 interactive component variants (Button, Input, Card, Modal, Dropdown).",
      dueDate: "2026-10-10T23:59:00",
      maxPoints: 100,
      passingPoints: 80,
      teacherId: "u-teacher-2",
      status: "closed",
      submissionsCount: 22,
      attachmentUrl: "design_system_eval.pdf"
    }
  ],

  submissions: [
    {
      id: "sub-301",
      assignmentId: "asg-201",
      studentId: "u-student-1", // Alex Morgan
      studentName: "Alex Morgan",
      studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      submittedAt: "2026-11-14T16:30:00",
      status: "graded",
      grade: 94,
      feedback: "Exceptional architecture, Alex! Your JWT token rotation strategy with Redis blacklisting was implemented flawlessly. Clean folder structure and 96% test coverage. Minor suggestion: add rate limiting on the /auth/refresh endpoint.",
      content: "https://github.com/alexmorgan-dev/edunova-rest-api-v1",
      submissionNotes: "Completed all 5 requirements, including bonus Docker Compose setup and comprehensive Swagger API docs.",
      gradedBy: "u-teacher-1",
      gradedAt: "2026-11-15T11:20:00"
    },
    {
      id: "sub-302",
      assignmentId: "asg-203",
      studentId: "u-student-1", // Alex Morgan
      studentName: "Alex Morgan",
      studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      submittedAt: "2026-11-15T18:45:00",
      status: "submitted", // Pending grading!
      grade: null,
      feedback: null,
      content: "https://github.com/alexmorgan-dev/numpy-neural-net-scratch",
      submissionNotes: "Achieved 97.4% test accuracy on MNIST with 2 hidden layers (128, 64 neurons) and He initialization.",
      gradedBy: null,
      gradedAt: null
    },
    {
      id: "sub-303",
      assignmentId: "asg-204",
      studentId: "u-student-1", // Alex Morgan
      studentName: "Alex Morgan",
      studentAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      submittedAt: "2026-10-09T14:15:00",
      status: "graded",
      grade: 98,
      feedback: "Stunning design tokens! Your OKLCH palette contrast scores hit WCAG AAA across every color pair. Component variants handle all edge states gracefully.",
      content: "https://www.figma.com/design/sample-edunova-token-library",
      submissionNotes: "Created both light and dark token palettes with automated documentation.",
      gradedBy: "u-teacher-2",
      gradedAt: "2026-10-12T09:30:00"
    },
    {
      id: "sub-304",
      assignmentId: "asg-201",
      studentId: "u-student-2", // Emma Watson
      studentName: "Emma Watson",
      studentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      submittedAt: "2026-11-15T20:10:00",
      status: "submitted", // Pending grading!
      grade: null,
      feedback: null,
      content: "https://github.com/emma-watson-dev/secure-api-backend",
      submissionNotes: "Implemented bcrypt hashing, rate limiting, and Zod input validation pipelines.",
      gradedBy: null,
      gradedAt: null
    }
  ],

  quizzes: [
    {
      id: "qz-401",
      courseId: "crs-101",
      courseTitle: "Full-Stack Web Engineering",
      title: "Checkpoint Quiz: Web Architecture & TypeScript Core",
      description: "Test your comprehension of distributed web architectures, TypeScript generic constraints, and browser rendering lifecycle.",
      timeLimitMinutes: 15,
      passingScore: 75,
      questionsCount: 5,
      questions: [
        {
          id: "q-1",
          question: "Which HTTP status code is most appropriate when a client sends a valid JWT token that lacks sufficient role permissions to access a resource?",
          options: [
            "401 Unauthorized",
            "403 Forbidden",
            "400 Bad Request",
            "422 Unprocessable Entity"
          ],
          correctIndex: 1,
          explanation: "401 Unauthorized indicates the user is not authenticated (invalid/missing token), whereas 403 Forbidden indicates the user is authenticated but lacks permission for that specific action or resource."
        },
        {
          id: "q-2",
          question: "In TypeScript, what is the key difference between 'type' and 'interface'?",
          options: [
            "Interfaces cannot be implemented by classes",
            "Interfaces support declaration merging, whereas types cannot be redeclared to merge properties",
            "Types can only represent primitive values",
            "Interfaces cannot extend other interfaces"
          ],
          correctIndex: 1,
          explanation: "Interfaces allow declaration merging (multiple definitions with the same name will merge), whereas type aliases cannot be declared multiple times in the same scope."
        },
        {
          id: "q-3",
          question: "Why should refresh tokens typically be stored in 'httpOnly' cookies instead of localStorage?",
          options: [
            "localStorage only holds up to 50 bytes of data",
            "httpOnly cookies are automatically encrypted by the operating system",
            "httpOnly cookies cannot be accessed or read by client-side JavaScript, mitigating XSS token theft",
            "Cookies transmit data faster over HTTP/3 protocols"
          ],
          correctIndex: 2,
          explanation: "httpOnly cookies prevent client-side JavaScript from reading the cookie value (document.cookie), drastically reducing the impact of Cross-Site Scripting (XSS) attacks."
        },
        {
          id: "q-4",
          question: "What does the React hook 'useCallback' primarily accomplish?",
          options: [
            "It runs a side effect whenever a component mounts",
            "It memoizes a callback function definition between re-renders to prevent unnecessary child re-renders",
            "It creates a synchronous database connection",
            "It triggers an immediate component repaint"
          ],
          correctIndex: 1,
          explanation: "useCallback caches a function instance between renders until one of its declared dependencies changes, preserving referential equality for child components wrapped in React.memo."
        },
        {
          id: "q-5",
          question: "In relational database design, what is the primary purpose of a database index?",
          options: [
            "To encrypt table rows at rest",
            "To speed up data retrieval operations at the trade-off of slight overhead during write operations",
            "To enforce foreign key cascade deletes exclusively",
            "To automatically generate backup copies of table columns"
          ],
          correctIndex: 1,
          explanation: "Database indexes (like B-trees) drastically speed up SELECT queries matching the index columns, with a minor performance and storage cost during INSERT, UPDATE, and DELETE operations."
        }
      ]
    },
    {
      id: "qz-402",
      courseId: "crs-102",
      courseTitle: "Machine Learning Foundations",
      title: "Quiz 1: Gradient Descent & Loss Optimization",
      description: "Assess your mastery of loss surfaces, learning rates, gradient vectors, and activation functions.",
      timeLimitMinutes: 12,
      passingScore: 70,
      questionsCount: 4,
      questions: [
        {
          id: "q-201",
          question: "What happens during gradient descent if the learning rate is set excessively high?",
          options: [
            "The model converges to the global minimum within 1 epoch",
            "The weights remain unchanged permanently",
            "The parameters may oscillate wildly or diverge, causing the loss to explode to NaN",
            "The training dataset is automatically normalized"
          ],
          correctIndex: 2,
          explanation: "An excessively large learning rate causes step sizes to overshoot the valleys of the loss function, leading to divergence and numerical instability."
        },
        {
          id: "q-202",
          question: "Which activation function is most susceptible to the 'vanishing gradient problem' during deep backpropagation?",
          options: [
            "ReLU (Rectified Linear Unit)",
            "LeakyReLU",
            "Sigmoid",
            "GELU"
          ],
          correctIndex: 2,
          explanation: "The sigmoid function saturates for large positive or negative inputs, with derivatives close to zero (< 0.25). In deep networks, multiplying these small gradients repeatedly causes gradients to vanish."
        },
        {
          id: "q-203",
          question: "What is the primary function of Dropout layers during deep neural network training?",
          options: [
            "To double the number of neurons during testing",
            "To act as a regularizer by randomly deactivating a fraction of neurons to prevent co-adaptation and overfitting",
            "To compress the model weights for mobile execution",
            "To normalize tensor dimensions across batches"
          ],
          correctIndex: 1,
          explanation: "Dropout randomly sets activations to zero during training with probability p, preventing neurons from relying on specific co-adapted partners and promoting generalizable features."
        },
        {
          id: "q-204",
          question: "Why is Cross-Entropy loss preferred over Mean Squared Error (MSE) for multiclass classification with Softmax outputs?",
          options: [
            "MSE requires 10x more GPU memory",
            "Cross-Entropy yields steeper gradients when predictions are confidently wrong, leading to faster and more reliable convergence",
            "Softmax cannot be differentiated with MSE",
            "MSE only accepts binary inputs"
          ],
          correctIndex: 1,
          explanation: "When combined with softmax, cross-entropy produces a loss gradient proportional to (y_hat - y), avoiding the saturation and vanishing gradients that occur with MSE."
        }
      ]
    }
  ],

  quizAttempts: [
    {
      id: "qa-1",
      quizId: "qz-401",
      studentId: "u-student-1", // Alex Morgan
      studentName: "Alex Morgan",
      score: 100,
      totalQuestions: 5,
      correctCount: 5,
      passed: true,
      completedAt: "2024-09-12T14:22:00",
      answers: { "q-1": 1, "q-2": 1, "q-3": 2, "q-4": 1, "q-5": 1 }
    },
    {
      id: "qa-2",
      quizId: "qz-402",
      studentId: "u-student-1",
      studentName: "Alex Morgan",
      score: 75,
      totalQuestions: 4,
      correctCount: 3,
      passed: true,
      completedAt: "2024-09-18T16:40:00",
      answers: { "q-201": 2, "q-202": 2, "q-203": 1, "q-204": 0 }
    }
  ],

  announcements: [
    {
      id: "anc-1",
      title: "EduNova 2.0 Academic Semester Launch & System Upgrade",
      authorName: "Dr. Robert Vance",
      authorRole: "Dean of Academic Technology",
      authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      date: "2026-11-10T09:00:00",
      target: "all", // all, students, teachers
      category: "Platform",
      isPinned: true,
      content: "Welcome to the new academic term on EduNova! We have upgraded our learning infrastructure with interactive lesson note taking, automatic quiz grading, verified digital certificates, and faster video delivery. Please review your enrolled courses and upcoming project schedules."
    },
    {
      id: "anc-2",
      title: "Industry Keynote: Distributed Systems Architecture by Google Tech Lead",
      authorName: "Prof. Sarah Chen",
      authorRole: "Associate Professor of Computer Science",
      authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      date: "2026-11-13T14:30:00",
      target: "students",
      category: "Academic",
      isPinned: true,
      content: "We are thrilled to announce a live virtual masterclass this Thursday at 4:00 PM EST with a Google Tech Lead covering large-scale Kubernetes clusters and planetary database synchronization. Check your email for Zoom calendar invitations."
    },
    {
      id: "anc-3",
      title: "Mid-Term Project Submissions & Office Hours Announcement",
      authorName: "Marcus Sterling",
      authorRole: "Lead Design Strategist",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      date: "2026-11-15T11:00:00",
      target: "students",
      category: "Course",
      isPinned: false,
      content: "Please ensure your Milestone 1 design token systems are shared with edit permissions before the Sunday midnight deadline. Extended mentoring office hours are open on Wednesday and Friday from 2:00 PM to 5:00 PM."
    }
  ],

  batches: [
    {
      id: "batch-1",
      name: "Cohort Alpha - Full Stack 2026",
      code: "COH-FS-2026A",
      courseId: "crs-101",
      courseName: "Full-Stack Web Engineering",
      teacherId: "u-teacher-1",
      teacherName: "Prof. Sarah Chen",
      startDate: "2026-09-01",
      endDate: "2026-12-15",
      schedule: "Mon & Wed • 6:00 PM - 8:00 PM EST",
      studentsCount: 32,
      capacity: 40,
      status: "active"
    },
    {
      id: "batch-2",
      name: "Cohort AI Intensive 2026",
      code: "COH-AI-2026B",
      courseId: "crs-102",
      courseName: "Machine Learning & Neural Networks",
      teacherId: "u-teacher-1",
      teacherName: "Prof. Sarah Chen",
      startDate: "2026-09-15",
      endDate: "2026-12-20",
      schedule: "Tue & Thu • 5:30 PM - 7:30 PM EST",
      studentsCount: 28,
      capacity: 35,
      status: "active"
    },
    {
      id: "batch-3",
      name: "Design Studio Weekend Batch",
      code: "COH-UX-2026W",
      courseId: "crs-103",
      courseName: "UI/UX Design Systems",
      teacherId: "u-teacher-2",
      teacherName: "Marcus Sterling",
      startDate: "2026-10-01",
      endDate: "2026-12-10",
      schedule: "Sat • 10:00 AM - 2:00 PM EST",
      studentsCount: 24,
      capacity: 30,
      status: "active"
    }
  ],

  discussions: [
    {
      id: "disc-1",
      courseId: "crs-101",
      lessonId: "les-101-1-1",
      authorId: "u-student-1",
      authorName: "Alex Morgan",
      authorAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      authorRole: "student",
      date: "2026-11-12T10:15:00",
      text: "In the lecture diagram, the API Gateway terminates TLS before forwarding traffic to internal microservices. Is mutual TLS (mTLS) recommended between internal pods in production?",
      upvotes: 6,
      replies: [
        {
          id: "reply-1",
          authorId: "u-teacher-1",
          authorName: "Prof. Sarah Chen",
          authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          authorRole: "teacher",
          date: "2026-11-12T12:30:00",
          text: "Excellent question, Alex! Yes, modern zero-trust enterprise architectures strongly advocate for mTLS within the service mesh (e.g., using Istio or Linkerd) to prevent lateral packet inspection if a single container is breached."
        }
      ]
    },
    {
      id: "disc-2",
      courseId: "crs-101",
      lessonId: "les-101-1-2",
      authorId: "u-student-2",
      authorName: "Emma Watson",
      authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      authorRole: "student",
      date: "2026-11-14T09:40:00",
      text: "When should we prefer Zod over TypeScript compile-time types for incoming REST payloads?",
      upvotes: 4,
      replies: [
        {
          id: "reply-2",
          authorId: "u-teacher-1",
          authorName: "Prof. Sarah Chen",
          authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
          authorRole: "teacher",
          date: "2026-11-14T11:15:00",
          text: "Remember that TypeScript types are completely erased at runtime! Any data coming across the network (HTTP requests, URL params, external APIs) must be validated at runtime with Zod or Joi to ensure type safety."
        }
      ]
    }
  ],

  notifications: [
    {
      id: "notif-1",
      userId: "u-student-1",
      title: "Assignment Graded",
      message: "Prof. Sarah Chen graded your 'Project 1: Scalable RESTful API' with 94/100 (A).",
      type: "grade",
      date: "2026-11-15T11:20:00",
      read: false,
      link: "#assignments"
    },
    {
      id: "notif-2",
      userId: "u-student-1",
      title: "New Announcement",
      message: "Dr. Robert Vance posted: 'EduNova 2.0 Academic Semester Launch & System Upgrade'",
      type: "announcement",
      date: "2026-11-10T09:00:00",
      read: true,
      link: "#dashboard"
    },
    {
      id: "notif-3",
      userId: "u-teacher-1",
      title: "New Assignment Submission",
      message: "Emma Watson submitted 'Project 1: Scalable RESTful API with Authentication' for review.",
      type: "submission",
      date: "2026-11-15T20:10:00",
      read: false,
      link: "#assignments"
    },
    {
      id: "notif-4",
      userId: "u-admin-1",
      title: "New Student Enrollment",
      message: "Liam Nguyen enrolled in 'UI/UX Design Systems & Interactive Prototyping'.",
      type: "system",
      date: "2026-11-15T14:00:00",
      read: false,
      link: "#admin/users"
    }
  ]
};

// Export for ES modules and standard browser globals
if (typeof module !== "undefined" && module.exports) {
  module.exports = SEED_DATA;
} else if (typeof window !== "undefined") {
  window.SEED_DATA = SEED_DATA;
}
