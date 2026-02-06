export const mockCourses = [
  {
    id: 1,
    title: "Complete Web Development Bootcamp",
    description:
      "Learn web development from scratch to advanced concepts. Includes HTML, CSS, JavaScript, React, and Node.js.",
    thumbnail: "/media/courses/web-dev.jpg",
    instructor: {
      id: 2,
      name: "John Doe",
      avatar: "/media/avatars/john.png",
    },
    category: {
      id: 2,
      name: "Programming",
    },
    studentsCount: 1234,
    duration: "48h 30m",
    lecturesCount: 156,
    progress: 65,
  },
  {
    id: 2,
    title: "UI/UX Design Masterclass",
    description:
      "Master the art of user interface and user experience design. Learn Figma, design principles, and user research.",
    thumbnail: "/media/courses/design.jpg",
    instructor: {
      id: 3,
      name: "Jane Smith",
      avatar: "/media/avatars/jane.png",
    },
    category: {
      id: 3,
      name: "Design",
    },
    studentsCount: 856,
    duration: "32h 15m",
    lecturesCount: 98,
    progress: 0,
  },
  {
    id: 3,
    title: "Digital Marketing Strategy",
    description:
      "Learn how to create and execute successful digital marketing campaigns. SEO, SEM, Social Media, and more.",
    thumbnail: "/media/courses/marketing.jpg",
    instructor: {
      id: 4,
      name: "Robert Johnson",
      avatar: "/media/avatars/robert.png",
    },
    category: {
      id: 5,
      name: "Marketing",
    },
    studentsCount: 567,
    duration: "24h 45m",
    lecturesCount: 78,
    progress: 30,
  },
];

export const mockFeaturedCourses = [
  {
    id: 4,
    title: "Advanced Machine Learning",
    description:
      "Deep dive into ML algorithms, neural networks, and AI applications.",
    thumbnail: "/media/courses/ml.jpg",
    instructor: {
      id: 2,
      name: "John Doe",
      avatar: "/media/avatars/john.png",
    },
    badge: "New",
    category: {
      id: 2,
      name: "Programming",
    },
  },
  {
    id: 5,
    title: "Business Leadership",
    description:
      "Develop essential leadership skills for modern business environments.",
    thumbnail: "/media/courses/business.jpg",
    instructor: {
      id: 4,
      name: "Robert Johnson",
      avatar: "/media/avatars/robert.png",
    },
    badge: "Popular",
    category: {
      id: 4,
      name: "Business",
    },
  },
];
