export type EventItem = {
  id: string;
  name: string;
  category: "Hackathons" | "Workshops" | "Internships" | "Competitions" | "Conferences";
  date: string;
  location: string;
  mode: "Online" | "Offline";
  organizer: string;
  prize: string;
  teamSize: string;
  status: "Open" | "Closing soon" | "Closed";
  description: string;
};

export const events: EventItem[] = [
  {
    id: "smart-india-hack",
    name: "Smart India Hackathon 2026",
    category: "Hackathons",
    date: "12–14 Oct 2026",
    location: "New Delhi",
    mode: "Offline",
    organizer: "Ministry of Education",
    prize: "₹1,00,000",
    teamSize: "4–6 members",
    status: "Open",
    description:
      "India's largest open innovation hackathon, where student teams solve real problem statements from government ministries and industry partners over 36 hours.",
  },
  {
    id: "ai-build-sprint",
    name: "AI Build Sprint",
    category: "Hackathons",
    date: "28 Sep 2026",
    location: "Remote",
    mode: "Online",
    organizer: "IIT Bombay E-Cell",
    prize: "₹50,000",
    teamSize: "2–4 members",
    status: "Closing soon",
    description:
      "A 24-hour online sprint to ship a working AI product. Mentors from leading startups review every submission.",
  },
  {
    id: "cloud-workshop",
    name: "Cloud Fundamentals Workshop",
    category: "Workshops",
    date: "5 Oct 2026",
    location: "Bengaluru",
    mode: "Offline",
    organizer: "CloudNative India",
    prize: "Certificate",
    teamSize: "Individual",
    status: "Open",
    description:
      "Hands-on workshop covering containers, deployments and cost-aware architecture for student builders.",
  },
  {
    id: "product-case-comp",
    name: "National Product Case Challenge",
    category: "Competitions",
    date: "19 Oct 2026",
    location: "Mumbai",
    mode: "Offline",
    organizer: "Unstop Partners",
    prize: "₹75,000",
    teamSize: "3 members",
    status: "Open",
    description:
      "Crack a live product case from a consumer tech company and pitch to a panel of product leaders.",
  },
  {
    id: "summer-internship-fair",
    name: "Summer Internship Fair",
    category: "Internships",
    date: "2 Nov 2026",
    location: "Remote",
    mode: "Online",
    organizer: "UNSTUCK Careers",
    prize: "Paid internships",
    teamSize: "Individual",
    status: "Open",
    description:
      "Meet 60+ startups hiring student interns across engineering, design, data and growth roles.",
  },
  {
    id: "devfest-conf",
    name: "Student DevFest Conference",
    category: "Conferences",
    date: "23 Nov 2026",
    location: "Hyderabad",
    mode: "Offline",
    organizer: "DevFest Student Chapter",
    prize: "Swag & mentorship",
    teamSize: "Individual",
    status: "Open",
    description:
      "A full day of talks on systems, AI and open source from engineers who started out in student clubs.",
  },
];

export type Team = {
  id: string;
  name: string;
  description: string;
  event: string;
  skills: string[];
  members: number;
  maxMembers: number;
};

export const teams: Team[] = [
  {
    id: "neural-nomads",
    name: "Neural Nomads",
    description: "Building an on-device AI study assistant for regional languages.",
    event: "Smart India Hackathon 2026",
    skills: ["Python", "PyTorch", "React"],
    members: 3,
    maxMembers: 6,
  },
  {
    id: "stack-savants",
    name: "Stack Savants",
    description: "Full-stack team looking for a designer to finish our campus logistics app.",
    event: "AI Build Sprint",
    skills: ["Node.js", "MongoDB", "UI Design"],
    members: 3,
    maxMembers: 4,
  },
  {
    id: "cipher-squad",
    name: "Cipher Squad",
    description: "Security-focused team working on a phishing detection browser extension.",
    event: "National Product Case Challenge",
    skills: ["Cybersecurity", "TypeScript"],
    members: 2,
    maxMembers: 3,
  },
  {
    id: "pixel-pilots",
    name: "Pixel Pilots",
    description: "Design-heavy team shipping an accessible campus events app.",
    event: "Student DevFest Conference",
    skills: ["Figma", "Flutter", "Accessibility"],
    members: 4,
    maxMembers: 5,
  },
];

export type Project = {
  id: string;
  name: string;
  description: string;
  category: "AI/ML" | "Web Development" | "Mobile Apps" | "Cloud" | "Cybersecurity";
  stack: string[];
  author: string;
  likes: number;
  rating: number;
  featured: boolean;
};

export const projects: Project[] = [
  {
    id: "notesense",
    name: "NoteSense",
    description: "Turns messy lecture recordings into structured, searchable revision notes.",
    category: "AI/ML",
    stack: ["Python", "Whisper", "Next.js"],
    author: "Aarav Mehta",
    likes: 342,
    rating: 4.8,
    featured: true,
  },
  {
    id: "campuscart",
    name: "CampusCart",
    description: "Peer-to-peer marketplace for hostel students to buy and sell essentials.",
    category: "Web Development",
    stack: ["React", "Node.js", "MongoDB"],
    author: "Ishita Rao",
    likes: 218,
    rating: 4.5,
    featured: true,
  },
  {
    id: "safepass",
    name: "SafePass",
    description: "Password hygiene scanner that grades your accounts without storing secrets.",
    category: "Cybersecurity",
    stack: ["Rust", "WASM"],
    author: "Kabir Singh",
    likes: 176,
    rating: 4.6,
    featured: false,
  },
  {
    id: "attendly",
    name: "Attendly",
    description: "Offline-first attendance app with QR check-in for college classrooms.",
    category: "Mobile Apps",
    stack: ["Flutter", "SQLite"],
    author: "Meera Nair",
    likes: 143,
    rating: 4.2,
    featured: false,
  },
  {
    id: "deployr",
    name: "Deployr",
    description: "One-click student deployment pipeline with free-tier cost guardrails.",
    category: "Cloud",
    stack: ["Docker", "Terraform", "Go"],
    author: "Rohan Das",
    likes: 129,
    rating: 4.4,
    featured: false,
  },
  {
    id: "signspeak",
    name: "SignSpeak",
    description: "Real-time sign language translation using a lightweight vision model.",
    category: "AI/ML",
    stack: ["TensorFlow", "React Native"],
    author: "Ananya Gupta",
    likes: 297,
    rating: 4.9,
    featured: true,
  },
];

export type Question = {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  author: string;
  answers: number;
  votes: number;
  solved: boolean;
};

export const questions: Question[] = [
  {
    id: "q1",
    title: "How do I structure a MERN project for a 36-hour hackathon?",
    excerpt:
      "We keep losing time on folder structure debates. What is a sane layout that scales for a weekend build?",
    tags: ["mern", "architecture", "hackathon"],
    author: "Priya S.",
    answers: 6,
    votes: 42,
    solved: true,
  },
  {
    id: "q2",
    title: "Best way to split work in a 4-person team with mixed skill levels?",
    excerpt:
      "Two of us are beginners. How do we divide tasks so nobody sits idle and nothing blocks the demo?",
    tags: ["teamwork", "planning"],
    author: "Dev Patel",
    answers: 9,
    votes: 61,
    solved: true,
  },
  {
    id: "q3",
    title: "My model overfits after 3 epochs on a tiny dataset — what now?",
    excerpt: "Only 1,200 labelled images. Augmentation helped a little but validation still drops.",
    tags: ["machine-learning", "training"],
    author: "Sneha K.",
    answers: 4,
    votes: 27,
    solved: false,
  },
  {
    id: "q4",
    title: "Deploying a Node API for free that doesn't sleep after 15 minutes?",
    excerpt: "Judges hit our demo link after the cold start and everything timed out.",
    tags: ["deployment", "node"],
    author: "Arjun V.",
    answers: 7,
    votes: 38,
    solved: false,
  },
];

export const leaderboard = [
  { rank: 1, name: "Ananya Gupta", college: "NIT Trichy", points: 4820, badge: "Top Contributor" },
  { rank: 2, name: "Dev Patel", college: "BITS Pilani", points: 4310, badge: "Problem Solver" },
  { rank: 3, name: "Priya Sharma", college: "IIIT Hyderabad", points: 3985, badge: "Mentor" },
  { rank: 4, name: "Rohan Das", college: "Jadavpur University", points: 3540, badge: "Team Builder" },
  {
    rank: 5,
    name: "Meera Nair",
    college: "College of Engineering Pune",
    points: 3120,
    badge: "Hackathon Champion",
  },
];

export const faqs = [
  {
    q: "Is UNSTUCK free for students?",
    a: "Yes. Creating a profile, joining teams, posting questions and showcasing projects are all free for students.",
  },
  {
    q: "How does teammate matching work?",
    a: "We match you with students whose skills complement yours, filtered by the events you are interested in and your availability for hackathons.",
  },
  {
    q: "Can I join a team without a project idea?",
    a: "Absolutely. Many teams look for specific skills rather than ideas — browse open teams and send a join request.",
  },
  {
    q: "Do organisers post events directly?",
    a: "Verified organisers publish events with registration details, prize pools and team-size requirements.",
  },
  {
    q: "How do reputation points work?",
    a: "You earn points for helpful answers, accepted solutions, upvotes and shipped projects. Points unlock badges and a weekly leaderboard rank.",
  },
  {
    q: "Can I use UNSTUCK if I am in my first year?",
    a: "Yes — first-year students are among our most active members. Start by answering questions in your strongest subject.",
  },
];
