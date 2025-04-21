const mockInstructors = [
  {
    id: 1,
    name: "Harrison Meyer",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100",
    title: "Senior UI Engineer",
    bio: "10+ years of experience in web development and UI engineering",
    expertise: ["Frontend", "UI/UX", "React", "JavaScript"],
  },
  {
    id: 2,
    name: "Kendra Wilson",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100",
    title: "UX Design Lead",
    bio: "Expert in creating intuitive and beautiful user experiences",
    expertise: ["UX Design", "UI Design", "Design Systems", "Prototyping"],
  },
  {
    id: 3,
    name: "Maya Rosewood",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
    title: "Full Stack Developer",
    bio: "Specialized in modern web technologies and architecture",
    expertise: ["Full Stack", "Node.js", "Python", "Cloud Architecture"],
  },
];

const courseImages = [
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&q=80&w=800",
];

const categories = {
  programming: {
    id: "programming",
    name: "Programming",
    subcategories: [
      {
        id: "web-development",
        name: "Web Development",
        topics: ["Frontend", "Backend", "Full Stack", "DevOps"],
      },
      {
        id: "mobile-development",
        name: "Mobile Development",
        topics: ["iOS", "Android", "React Native", "Flutter"],
      },
      {
        id: "data-science",
        name: "Data Science",
        topics: ["Python", "Machine Learning", "Data Analysis", "Big Data"],
      },
    ],
  },
  design: {
    id: "design",
    name: "Design",
    subcategories: [
      {
        id: "ui-design",
        name: "UI Design",
        topics: [
          "Wireframing",
          "Prototyping",
          "Design Systems",
          "UI Components",
        ],
      },
      {
        id: "ux-design",
        name: "UX Design",
        topics: [
          "User Research",
          "Information Architecture",
          "Interaction Design",
          "Usability Testing",
        ],
      },
      {
        id: "graphic-design",
        name: "Graphic Design",
        topics: ["Typography", "Color Theory", "Branding", "Visual Design"],
      },
    ],
  },
  business: {
    id: "business",
    name: "Business",
    subcategories: [
      {
        id: "marketing",
        name: "Marketing",
        topics: [
          "Digital Marketing",
          "Content Strategy",
          "SEO",
          "Social Media",
        ],
      },
      {
        id: "entrepreneurship",
        name: "Entrepreneurship",
        topics: ["Business Planning", "Startup Strategy", "Funding", "Growth"],
      },
      {
        id: "management",
        name: "Management",
        topics: [
          "Leadership",
          "Project Management",
          "Team Building",
          "Strategy",
        ],
      },
    ],
  },
};

const courseTemplates = {
  programming: {
    webDevelopment: [
      {
        title: "Modern Web Development with React",
        subtitle:
          "Build scalable web applications using React and modern tools",
        description:
          "Master React development from basics to advanced concepts. Learn about hooks, state management, and best practices.",
        topics: ["React", "JavaScript", "State Management", "API Integration"],
      },
      {
        title: "Full Stack Development with Node.js",
        subtitle: "Create complete web applications with Node.js and Express",
        description:
          "Learn to build full-stack applications using Node.js, Express, and modern databases.",
        topics: ["Node.js", "Express", "MongoDB", "REST APIs"],
      },
    ],
    mobileDevelopment: [
      {
        title: "iOS App Development with Swift",
        subtitle: "Create native iOS applications using Swift",
        description:
          "Learn to build iOS applications using Swift and Xcode. Master iOS development fundamentals.",
        topics: ["Swift", "iOS", "Xcode", "App Store"],
      },
    ],
    dataScience: [
      {
        title: "Python for Data Science",
        subtitle: "Master data analysis and machine learning with Python",
        description:
          "Learn Python programming for data science, including data analysis and machine learning basics.",
        topics: ["Python", "Pandas", "NumPy", "Machine Learning"],
      },
    ],
  },
  design: {
    uiDesign: [
      {
        title: "UI Design Fundamentals",
        subtitle: "Learn the principles of modern UI design",
        description:
          "Master the fundamentals of UI design, including layout, typography, and color theory.",
        topics: ["UI Design", "Typography", "Color Theory", "Layout"],
      },
    ],
    uxDesign: [
      {
        title: "UX Research & Design",
        subtitle: "Master user experience design and research",
        description:
          "Learn UX research methods and design principles to create user-centered products.",
        topics: ["UX Research", "User Testing", "Wireframing", "Prototyping"],
      },
    ],
  },
  business: {
    marketing: [
      {
        title: "Digital Marketing Strategy",
        subtitle: "Create effective digital marketing campaigns",
        description:
          "Learn to create and execute successful digital marketing strategies.",
        topics: ["SEO", "Social Media", "Content Marketing", "Analytics"],
      },
    ],
  },
};

const generateSections = (courseId, category, subcategory, topic) => [
  {
    id: `${courseId}-1`,
    title: "Introduction",
    lectures: [
      {
        id: `${courseId}-1-1`,
        tag: "1-1",
        title: "Welcome to the Course",
        duration: "10:00",
        type: "video",
        content: "https://www.youtube.com/watch?v=db0DvhkG7cc",
        image: courseImages[0],
      },
      {
        id: `${courseId}-1-2`,
        tag: "1-2",
        title: "Course Overview",
        duration: "15:00",
        type: "text",
        content:
          "In this lecture, we'll walk through the course structure and objectives...",
        image: courseImages[1],
      },
    ],
  },
  {
    id: `${courseId}-2`,
    title: "Core Concepts",
    lectures: [
      {
        id: `${courseId}-2-1`,
        tag: "2-1",
        title: "Main Concepts",
        duration: "20:00",
        type: "video",
        content: "https://www.youtube.com/watch?v=db0DvhkG7cc",
        image: courseImages[2],
      },
    ],
  },
];

const generateUnifiedCourses = (count = 10) => {
  return Array.from({ length: count }, (_, index) => {
    const courseId = index + 1;
    const instructor = mockInstructors[index % mockInstructors.length];

    // Randomly select category and subcategory
    const categoryKeys = Object.keys(categories);
    const categoryKey =
      categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
    const category = categories[categoryKey];
    const subcategory =
      category.subcategories[
        Math.floor(Math.random() * category.subcategories.length)
      ];
    const topic =
      subcategory.topics[Math.floor(Math.random() * subcategory.topics.length)];

    // Get template based on category and subcategory
    const template = courseTemplates[categoryKey]?.[subcategory.id]?.[0] || {
      title: `Comprehensive ${subcategory.name} Course`,
      subtitle: `Master ${subcategory.name} fundamentals and advanced concepts`,
      description: `This comprehensive course will take you from beginner to advanced level in ${subcategory.name}.`,
      topics: subcategory.topics,
    };

    return {
      id: courseId,
      title: template.title,
      subtitle: template.subtitle,
      instructor,
      category: {
        id: category.id,
        name: category.name,
        subcategory: {
          id: subcategory.id,
          name: subcategory.name,
          topic: topic,
        },
      },
      duration: `${Math.floor(Math.random() * 10 + 2)} hours`,
      totalLessons: Math.floor(Math.random() * 20 + 10),
      enrolled: Math.floor(Math.random() * 5000 + 1000),
      rating: (Math.random() * 2 + 3).toFixed(1),
      price: Math.floor(Math.random() * 100 + 49),
      image: courseImages[index % courseImages.length],
      description: template.description,
      sections: generateSections(courseId, category, subcategory, topic),
      tags: [category.name, subcategory.name, topic],
      prerequisites: ["Basic computer knowledge", "Eagerness to learn"],
      lastUpdated: new Date(
        Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
      ).toISOString(),
      language: "English",
      certificate: true,
      lifetimeAccess: true,
      mobileAccess: true,
    };
  });
};

// Generate featured courses (top 5)
const featuredCourses = generateUnifiedCourses(5);

// Generate popular courses (20)
const popularCourses = generateUnifiedCourses(20);

export {
  featuredCourses,
  popularCourses,
  generateUnifiedCourses,
  categories,
  mockInstructors,
};
