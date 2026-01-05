import { 
  User, 
  Classroom, 
  Note, 
  Question, 
  Announcement, 
  PYQ, 
  Recommendation, 
  AIMessage 
} from '@/types';

// Mock Users
export const mockStudentUser: User = {
  id: 'student-1',
  name: 'Alex Johnson',
  email: 'alex@student.edu',
  role: 'student',
  avatar: undefined,
};

export const mockTeacherUser: User = {
  id: 'teacher-1',
  name: 'Dr. Sarah Miller',
  email: 'sarah@faculty.edu',
  role: 'teacher',
  avatar: undefined,
};

// Mock Classrooms
export const mockClassrooms: Classroom[] = [
  {
    id: 'class-1',
    name: 'Computer Science 2024',
    code: 'CS2024',
    teacherId: 'teacher-1',
    teacherName: 'Dr. Sarah Miller',
    studentCount: 45,
    subjects: [
      {
        id: 'subj-1',
        name: 'Software Engineering & Testing',
        classroomId: 'class-1',
        icon: '🧪',
        chapters: [
          { id: 'ch-1', name: 'Unit 1: Software Development Life Cycle', subjectId: 'subj-1', noteCount: 8, order: 1 },
          { id: 'ch-2', name: 'Unit 2: Testing Fundamentals', subjectId: 'subj-1', noteCount: 6, order: 2 },
          { id: 'ch-3', name: 'Unit 3: Test Case Design', subjectId: 'subj-1', noteCount: 5, order: 3 },
          { id: 'ch-4', name: 'Unit 4: Automation Testing', subjectId: 'subj-1', noteCount: 7, order: 4 },
        ],
      },
      {
        id: 'subj-2',
        name: 'Computer Networks',
        classroomId: 'class-1',
        icon: '🌐',
        chapters: [
          { id: 'ch-5', name: 'Unit 1: Network Fundamentals', subjectId: 'subj-2', noteCount: 10, order: 1 },
          { id: 'ch-6', name: 'Unit 2: TCP/IP Protocol Suite', subjectId: 'subj-2', noteCount: 8, order: 2 },
          { id: 'ch-7', name: 'Unit 3: Network Security', subjectId: 'subj-2', noteCount: 6, order: 3 },
          { id: 'ch-8', name: 'Unit 4: Wireless Networks', subjectId: 'subj-2', noteCount: 4, order: 4 },
        ],
      },
      {
        id: 'subj-3',
        name: 'Data Structures & Algorithms',
        classroomId: 'class-1',
        icon: '📊',
        chapters: [
          { id: 'ch-9', name: 'Unit 1: Arrays & Linked Lists', subjectId: 'subj-3', noteCount: 12, order: 1 },
          { id: 'ch-10', name: 'Unit 2: Trees & Graphs', subjectId: 'subj-3', noteCount: 9, order: 2 },
          { id: 'ch-11', name: 'Unit 3: Sorting & Searching', subjectId: 'subj-3', noteCount: 11, order: 3 },
          { id: 'ch-12', name: 'Unit 4: Dynamic Programming', subjectId: 'subj-3', noteCount: 7, order: 4 },
        ],
      },
    ],
    createdAt: '2024-01-15',
  },
  {
    id: 'class-2',
    name: 'Advanced Programming 2024',
    code: 'AP2024',
    teacherId: 'teacher-2',
    teacherName: 'Prof. John Smith',
    studentCount: 32,
    subjects: [
      {
        id: 'subj-4',
        name: 'Machine Learning',
        classroomId: 'class-2',
        icon: '🤖',
        chapters: [
          { id: 'ch-13', name: 'Unit 1: Introduction to ML', subjectId: 'subj-4', noteCount: 6, order: 1 },
          { id: 'ch-14', name: 'Unit 2: Neural Networks', subjectId: 'subj-4', noteCount: 8, order: 2 },
          { id: 'ch-15', name: 'Unit 3: Deep Learning', subjectId: 'subj-4', noteCount: 5, order: 3 },
          { id: 'ch-16', name: 'Unit 4: NLP Basics', subjectId: 'subj-4', noteCount: 4, order: 4 },
        ],
      },
    ],
    createdAt: '2024-02-01',
  },
];

// Mock Notes for Chapter 1 (SDLC)
export const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Complete SDLC Overview',
    content: 'The Software Development Life Cycle (SDLC) is a process used by the software industry to design, develop and test high quality software. It consists of detailed phases: Planning, Analysis, Design, Implementation, Testing, Deployment, and Maintenance.',
    chapterId: 'ch-1',
    chapterName: 'Unit 1: Software Development Life Cycle',
    authorId: 'teacher-1',
    authorName: 'Dr. Sarah Miller',
    authorRole: 'teacher',
    visibility: 'public',
    status: 'approved',
    createdAt: '2024-01-20',
  },
  {
    id: 'note-2',
    title: 'Agile vs Waterfall Comparison',
    content: 'A comprehensive comparison between Agile and Waterfall methodologies. Agile focuses on iterative development with customer feedback loops, while Waterfall follows a sequential approach.',
    chapterId: 'ch-1',
    chapterName: 'Unit 1: Software Development Life Cycle',
    authorId: 'student-2',
    authorName: 'Emily Chen',
    authorRole: 'student',
    visibility: 'public',
    status: 'approved',
    createdAt: '2024-01-22',
  },
  {
    id: 'note-3',
    title: 'Scrum Framework Deep Dive',
    content: 'Detailed notes on Scrum framework including roles (Scrum Master, Product Owner, Development Team), ceremonies (Sprint Planning, Daily Standup, Sprint Review, Retrospective), and artifacts (Product Backlog, Sprint Backlog, Increment).',
    chapterId: 'ch-1',
    chapterName: 'Unit 1: Software Development Life Cycle',
    authorId: 'student-1',
    authorName: 'Alex Johnson',
    authorRole: 'student',
    visibility: 'public',
    status: 'approved',
    createdAt: '2024-01-25',
  },
  {
    id: 'note-4',
    title: 'My SDLC Summary',
    content: 'Personal summary of SDLC phases with examples from class projects.',
    chapterId: 'ch-1',
    chapterName: 'Unit 1: Software Development Life Cycle',
    authorId: 'student-1',
    authorName: 'Alex Johnson',
    authorRole: 'student',
    visibility: 'private',
    status: 'approved',
    createdAt: '2024-01-26',
  },
  {
    id: 'note-5',
    title: 'DevOps Integration in SDLC',
    content: 'How DevOps practices integrate with traditional SDLC, including CI/CD pipelines, infrastructure as code, and continuous monitoring.',
    chapterId: 'ch-1',
    chapterName: 'Unit 1: Software Development Life Cycle',
    authorId: 'student-3',
    authorName: 'Mike Wilson',
    authorRole: 'student',
    visibility: 'public',
    status: 'pending',
    createdAt: '2024-01-28',
  },
  {
    id: 'note-6',
    title: 'Requirements Engineering Notes',
    content: 'Notes on requirements gathering, analysis, and documentation in SDLC.',
    chapterId: 'ch-1',
    chapterName: 'Unit 1: Software Development Life Cycle',
    authorId: 'student-4',
    authorName: 'Lisa Park',
    authorRole: 'student',
    visibility: 'public',
    status: 'rejected',
    createdAt: '2024-01-27',
  },
];

// Mock Questions
export const mockQuestions: Question[] = [
  {
    id: 'q-1',
    text: 'What are the key differences between Agile and Waterfall methodologies?',
    chapterId: 'ch-1',
    authorId: 'student-1',
    authorName: 'Alex Johnson',
    visibility: 'public',
    answer: 'The main differences are: 1) Approach - Waterfall is sequential, Agile is iterative. 2) Flexibility - Waterfall has rigid phases, Agile welcomes changes. 3) Customer involvement - Limited in Waterfall, continuous in Agile. 4) Delivery - Single delivery in Waterfall, incremental in Agile.',
    answeredBy: 'Dr. Sarah Miller',
    createdAt: '2024-01-21',
    answeredAt: '2024-01-21',
  },
  {
    id: 'q-2',
    text: 'Can you explain the role of a Scrum Master?',
    chapterId: 'ch-1',
    authorId: 'student-2',
    authorName: 'Emily Chen',
    visibility: 'public',
    answer: 'The Scrum Master is a facilitator who helps the team follow Scrum practices. They remove impediments, protect the team from distractions, and ensure smooth sprint execution.',
    answeredBy: 'Dr. Sarah Miller',
    createdAt: '2024-01-22',
    answeredAt: '2024-01-23',
  },
  {
    id: 'q-3',
    text: 'I\'m confused about the difference between Sprint Backlog and Product Backlog. Can you help?',
    chapterId: 'ch-1',
    authorId: 'student-1',
    authorName: 'Alex Johnson',
    visibility: 'private',
    answer: 'Great question! Product Backlog is the complete list of features for the product, managed by the Product Owner. Sprint Backlog is a subset of items selected for a specific sprint, managed by the Development Team.',
    answeredBy: 'Dr. Sarah Miller',
    createdAt: '2024-01-24',
    answeredAt: '2024-01-24',
  },
  {
    id: 'q-4',
    text: 'How do we handle changing requirements in Waterfall?',
    chapterId: 'ch-1',
    authorId: 'student-3',
    authorName: 'Mike Wilson',
    visibility: 'public',
    createdAt: '2024-01-28',
  },
];

// Mock Announcements
export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Quiz on Unit 1 - SDLC',
    content: 'There will be a quiz on Software Development Life Cycle concepts tomorrow. Please review all notes including Agile, Waterfall, and Scrum frameworks.',
    classroomId: 'class-1',
    authorId: 'teacher-1',
    authorName: 'Dr. Sarah Miller',
    createdAt: '2024-01-27',
  },
  {
    id: 'ann-2',
    title: 'New Study Materials Uploaded',
    content: 'I have uploaded additional reading materials for Unit 1. Please check the notes section for the new resources on DevOps integration.',
    classroomId: 'class-1',
    authorId: 'teacher-1',
    authorName: 'Dr. Sarah Miller',
    createdAt: '2024-01-26',
  },
  {
    id: 'ann-3',
    title: 'Office Hours Extended',
    content: 'I will be holding extended office hours this Friday from 2-5 PM for anyone who needs extra help with SDLC concepts.',
    classroomId: 'class-1',
    authorId: 'teacher-1',
    authorName: 'Dr. Sarah Miller',
    createdAt: '2024-01-25',
  },
];

// Mock PYQs (Previous Year Questions)
export const mockPYQs: PYQ[] = [
  { id: 'pyq-1', question: 'Explain the phases of Software Development Life Cycle with a diagram.', chapterId: 'ch-1' },
  { id: 'pyq-2', question: 'Compare and contrast Agile and Waterfall methodologies.', chapterId: 'ch-1' },
  { id: 'pyq-3', question: 'Describe the Scrum framework and its key components.', chapterId: 'ch-1' },
  { id: 'pyq-4', question: 'What are the advantages of iterative development?', chapterId: 'ch-1' },
  { id: 'pyq-5', question: 'Explain the role of a Product Owner in Scrum.', chapterId: 'ch-1' },
];

// Mock Recommendations
export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    title: 'SDLC Tutorial - Complete Guide',
    type: 'video',
    url: 'https://youtube.com/watch?v=example1',
  },
  {
    id: 'rec-2',
    title: 'Agile Manifesto Explained',
    type: 'article',
    url: 'https://agilemanifesto.org',
  },
  {
    id: 'rec-3',
    title: 'Scrum in 10 Minutes',
    type: 'video',
    url: 'https://youtube.com/watch?v=example2',
  },
  {
    id: 'rec-4',
    title: 'DevOps and SDLC Integration',
    type: 'article',
    url: 'https://example.com/devops-sdlc',
  },
];

// Mock AI Chat Messages
export const mockAIMessages: AIMessage[] = [
  {
    id: 'ai-1',
    role: 'user',
    content: 'Explain backpropagation in neural networks',
    timestamp: '2024-01-28T10:30:00Z',
  },
  {
    id: 'ai-2',
    role: 'assistant',
    content: 'Based on the chapter notes, backpropagation is a supervised learning algorithm used for training neural networks. It works by:\n\n1. **Forward Pass**: Input data flows through the network to produce an output.\n\n2. **Calculate Error**: The difference between predicted and actual output is computed using a loss function.\n\n3. **Backward Pass**: The error is propagated backward through the network, computing gradients for each weight.\n\n4. **Update Weights**: Weights are adjusted using gradient descent to minimize the error.\n\nThis process repeats for multiple epochs until the network converges.',
    sources: ['Complete SDLC Overview', 'Scrum Framework Deep Dive'],
    timestamp: '2024-01-28T10:30:05Z',
  },
];
