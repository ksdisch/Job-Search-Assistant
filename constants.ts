
import { Application, ApplicationStatus } from './types';

export const STATUS_COLUMNS: ApplicationStatus[] = [
  ApplicationStatus.Discovery,
  ApplicationStatus.Applied,
  ApplicationStatus.Interview,
  ApplicationStatus.Offer,
  ApplicationStatus.Rejected,
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'Innovate Inc.',
    location: 'Remote',
    description: 'We are looking for a skilled Senior Frontend Engineer to join our dynamic team. You will be responsible for building and maintaining our user-facing web applications. Required skills: React, TypeScript, Tailwind CSS, 5+ years of experience.',
    url: '#',
    logo: 'https://picsum.photos/seed/innovate/100',
    status: ApplicationStatus.Discovery,
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Creative Solutions',
    location: 'New York, NY',
    description: 'Creative Solutions is seeking a talented Product Designer to create amazing user experiences. The ideal candidate should have a strong portfolio of successful projects. Key skills: Figma, UI/UX design principles, user research.',
    url: '#',
    logo: 'https://picsum.photos/seed/creative/100',
    status: ApplicationStatus.Discovery,
  },
  {
    id: '3',
    title: 'AI/ML Engineer',
    company: 'DataDriven AI',
    location: 'San Francisco, CA',
    description: 'Join our cutting-edge AI team! We are looking for an engineer with a passion for machine learning and data analysis. Experience with Python, TensorFlow, and PyTorch is a must.',
    url: '#',
    logo: 'https://picsum.photos/seed/data/100',
    status: ApplicationStatus.Applied,
  },
  {
    id: '4',
    title: 'DevOps Specialist',
    company: 'CloudWorks',
    location: 'Austin, TX',
    description: 'We need a DevOps Specialist to manage our cloud infrastructure. Responsibilities include CI/CD pipeline management, automation, and monitoring. Experience with AWS, Docker, and Kubernetes is required.',
    url: '#',
    logo: 'https://picsum.photos/seed/cloud/100',
    status: ApplicationStatus.Interview,
  },
];

export const MOCK_RESUME = `
John Doe
Senior Frontend Engineer

Summary:
Highly skilled and motivated Senior Frontend Engineer with over 8 years of experience in creating responsive, user-friendly web applications. Proficient in React, TypeScript, and modern JavaScript frameworks. Passionate about clean code and excellent user experience.

Experience:
- Lead Frontend Developer at Tech Solutions (2018-Present)
  - Led the development of a major e-commerce platform using React and Redux.
  - Mentored junior developers and conducted code reviews.
- Frontend Developer at WebCrafters (2015-2018)
  - Developed and maintained client websites using Angular and jQuery.

Skills:
- Languages: JavaScript, TypeScript, HTML, CSS
- Frameworks/Libraries: React, Redux, Next.js, Tailwind CSS
- Tools: Git, Webpack, Babel, Docker
`;
