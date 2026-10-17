export interface Experience {
  company: string;
  position: string;
  location: string;
  description: string[];
  startDate: string;
  endDate: string;
  website: string;
  x?: string;
  linkedin?: string;
  github?: string;
  technologies: string[];
  isCurrent: boolean;
  isBlur?: boolean;
}

// Employment only. Things Samim founded on the side (Callisa, Wasilah) live in
// the hero and the project list instead.
export const experiences: Experience[] = [
  {
    isCurrent: true,
    company: 'SloanCode',
    position: 'Senior AI Software Engineer',
    location: 'New York, NY, United States',
    description: [
      'Engineer a live, multi-tenant AI phone receptionist SaaS for New York restaurants and home services.',
      'Own the AI voice workflow (OpenAI Realtime, Twilio), the FastAPI and Redis backend, Next.js portals, CRM and kitchen flow.',
      'Integrated Toast, Square and Clover POS and Stripe; added tenant-scoped roles, MFA and secret scanning.',
    ],
    startDate: 'May 2026',
    endDate: 'Present',
    technologies: [
      'OpenAI Realtime',
      'Twilio',
      'FastAPI',
      'Redis',
      'PostgreSQL',
      'Next.js',
      'Stripe',
    ],
    website: 'https://restaurant.sloancode.com/',
  },
  {
    isCurrent: true,
    company: 'Nuhu Labs',
    position: 'Software Engineer',
    location: 'Remote from Dhaka, Bangladesh',
    description: [
      'Shipping the Linux port of Byakaron, a Bangla phonetic keyboard, on the shared Zig engine through its C ABI.',
      'Built the IBus/Fcitx5 input method in C, a GTK3 companion app, and the .deb and Flatpak packaging.',
      'Released v0.2.0 with Wayland CI.',
    ],
    startDate: 'Aug 2026',
    endDate: 'Present',
    technologies: ['C', 'Zig', 'IBus', 'Fcitx5', 'GTK3', 'Flatpak'],
    website: 'https://nuhulabs.com',
  },
  {
    isCurrent: false,
    company: 'Brandifies',
    position: 'Machine Learning Engineer',
    location: 'Dhaka, Bangladesh',
    description: [
      'Built end-to-end ML pipelines: preprocessing, feature engineering, training, and evaluation.',
      'Fine-tuned LLMs and implemented RAG-based chatbot systems with vector databases.',
      'Developed predictive models using XGBoost and similar boosting algorithms.',
    ],
    startDate: 'Dec 2025',
    endDate: 'Sept 2026',
    technologies: ['Python', 'PyTorch', 'LangChain', 'RAG', 'XGBoost'],
    website: '#',
  },
  {
    isCurrent: false,
    company: 'RoboTech Valley',
    position: 'Robotics Engineer Intern',
    location: 'Dhaka, Bangladesh (On-Site)',
    description: [
      'Designed robotics modules using embedded systems and ROS for autonomous navigation.',
    ],
    startDate: 'Jul 2025',
    endDate: 'Sept 2025',
    technologies: ['ROS', 'Python', 'Embedded'],
    website: '#',
  },
  {
    isCurrent: false,
    company: 'Green University of Bangladesh',
    position: 'Teaching Assistant',
    location: 'Dhaka, Bangladesh',
    description: [
      'Conducted demo classes on C Programming and Data Structures.',
      'Evaluated exam scripts and prepared grade sheets.',
    ],
    startDate: 'May 2025',
    endDate: 'Aug 2025',
    technologies: ['C', 'Data Structures'],
    website: 'https://green.edu.bd',
  },
  {
    isCurrent: false,
    company: 'Green University of Bangladesh',
    position: 'Programming Trainer',
    location: 'Dhaka, Bangladesh',
    description: [
      'Trained students for competitive programming through weekly problem-solving sessions.',
    ],
    startDate: 'Jan 2025',
    endDate: 'Dec 2025',
    technologies: ['C++', 'Algorithms'],
    website: 'https://green.edu.bd',
  },
  {
    isCurrent: false,
    company: 'University Mentorship Program',
    position: 'Mentor',
    location: 'Dhaka, Bangladesh',
    description: [
      'Mentored first-year students in programming fundamentals and professional tools.',
    ],
    startDate: 'Jun 2023',
    endDate: 'Aug 2025',
    technologies: ['Git', 'Linux'],
    website: '#',
  },
];
