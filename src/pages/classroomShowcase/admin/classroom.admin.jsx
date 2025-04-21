import React, { useState, useEffect } from "react";
import {
  Plus as AddIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  GripVertical,
  Book,
  Video,
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AdminNavigation from "./components/AdminNavigation";
import CourseListPage from "./components/CourseListPage";
import ContentManagementPage from "./components/ContentManagementPage";
import useCourseStore from "./store/courseStoreV2";

// Main Admin Component
const ClassroomAdminPage = () => {
  const {
    courses,
    selectedCourse,
    setSelectedCourse,
    addCourse,
    updateCourse,
    setCourses,
    clearError,
  } = useCourseStore();

  const [activePage, setActivePage] = useState("dashboard");
  const [contentPage, setContentPage] = useState("list");

  // Initialize with sample data if no courses exist
  useEffect(() => {
    if (courses.length === 0) {
      setCourses([
        {
          id: "course-1",
          title: "JavaScript Fundamentals",
          description: "Master the basics of JavaScript programming",
          thumbnail:
            "https://placehold.co/600x400/2563eb/ffffff?text=JavaScript+Fundamentals",
          isFeatured: true,
          isPublic: true,
          isPro: false,
          sections: [
            {
              id: "section-1",
              title: "Getting Started with JavaScript",
              lectures: [
                {
                  id: "lecture-1",
                  title: "Introduction to JavaScript",
                  content: `<h1>Welcome to JavaScript!</h1>
                  <p>JavaScript is a versatile programming language that powers the web.</p>
                  <h2>What you'll learn:</h2>
                  <ul>
                    <li>Basic syntax and data types</li>
                    <li>Variables and functions</li>
                    <li>Control flow and loops</li>
                  </ul>`,
                  video:
                    "https://placehold.co/600x400/2563eb/ffffff?text=JS+Intro+Video",
                  thumbnail:
                    "https://placehold.co/600x400/2563eb/ffffff?text=JS+Intro",
                  isComplete: true,
                  isPublished: true,
                  createdAt: "2024-03-28T10:00:00.000Z",
                  updatedAt: "2024-03-28T10:00:00.000Z",
                },
              ],
            },
          ],
        },
        {
          id: "course-2",
          title: "React Development Masterclass",
          description: "Build modern web applications with React",
          thumbnail:
            "https://placehold.co/600x400/dc2626/ffffff?text=React+Masterclass",
          isFeatured: true,
          isPublic: true,
          isPro: true,
          sections: [
            {
              id: "section-2",
              title: "React Fundamentals",
              lectures: [
                {
                  id: "lecture-2",
                  title: "Understanding React Components",
                  content: `<h1>React Components</h1>
                  <p>Components are the building blocks of React applications.</p>
                  <h2>Component Types:</h2>
                  <ul>
                    <li>Functional Components</li>
                    <li>Class Components</li>
                  </ul>
                  <pre><code>function Welcome(props) {
                    return <h1>Hello, {props.name}</h1>;
                  }</code></pre>`,
                  video:
                    "https://placehold.co/600x400/dc2626/ffffff?text=React+Components",
                  thumbnail:
                    "https://placehold.co/600x400/dc2626/ffffff?text=React+Basics",
                  isComplete: true,
                  isPublished: true,
                  createdAt: "2024-03-28T11:00:00.000Z",
                  updatedAt: "2024-03-28T11:00:00.000Z",
                },
              ],
            },
          ],
        },
        {
          id: "course-3",
          title: "Python for Data Science",
          description: "Learn Python for data analysis and machine learning",
          thumbnail:
            "https://placehold.co/600x400/16a34a/ffffff?text=Python+Data+Science",
          isFeatured: true,
          isPublic: false,
          isPro: true,
          sections: [
            {
              id: "section-3",
              title: "Python Basics for Data Science",
              lectures: [
                {
                  id: "lecture-3",
                  title: "NumPy and Pandas Introduction",
                  content: `<h1>Data Analysis with Python</h1>
                  <p>Learn how to manipulate and analyze data using NumPy and Pandas.</p>
                  <h2>Key Libraries:</h2>
                  <ul>
                    <li>NumPy for numerical computing</li>
                    <li>Pandas for data manipulation</li>
                  </ul>
                  <pre><code>import pandas as pd
import numpy as np

df = pd.DataFrame({
    'A': np.random.randn(5),
    'B': np.random.randn(5)
})</code></pre>`,
                  video:
                    "https://placehold.co/600x400/16a34a/ffffff?text=Python+Data",
                  thumbnail:
                    "https://placehold.co/600x400/16a34a/ffffff?text=Python+Intro",
                  isComplete: true,
                  isPublished: true,
                  createdAt: "2024-03-28T12:00:00.000Z",
                  updatedAt: "2024-03-28T12:00:00.000Z",
                },
              ],
            },
          ],
        },
        {
          id: "course-4",
          title: "UI/UX Design Principles",
          description: "Master modern UI/UX design techniques",
          thumbnail:
            "https://placehold.co/600x400/9333ea/ffffff?text=UI+Design",
          isFeatured: false,
          isPublic: true,
          isPro: true,
          sections: [
            {
              id: "section-4",
              title: "Design Fundamentals",
              lectures: [
                {
                  id: "lecture-4",
                  title: "Color Theory in Design",
                  content: `<h1>Understanding Color Theory</h1>
                  <p>Color is a fundamental aspect of design that affects user perception and emotion.</p>
                  <h2>Color Principles:</h2>
                  <ul>
                    <li>Color psychology</li>
                    <li>Color schemes</li>
                    <li>Accessibility considerations</li>
                  </ul>`,
                  video:
                    "https://placehold.co/600x400/9333ea/ffffff?text=Color+Theory",
                  thumbnail:
                    "https://placehold.co/600x400/9333ea/ffffff?text=Design+Basics",
                  isComplete: true,
                  isPublished: true,
                  createdAt: "2024-03-28T13:00:00.000Z",
                  updatedAt: "2024-03-28T13:00:00.000Z",
                },
              ],
            },
          ],
        },
        {
          id: "course-5",
          title: "Node.js Backend Development",
          description: "Build scalable backend applications with Node.js",
          thumbnail: "https://placehold.co/600x400/059669/ffffff?text=Node.js",
          isFeatured: false,
          isPublic: true,
          isPro: false,
          sections: [
            {
              id: "section-5",
              title: "Express.js Fundamentals",
              lectures: [
                {
                  id: "lecture-5",
                  title: "RESTful API Design",
                  content: `<h1>Building RESTful APIs</h1>
                  <p>Learn how to design and implement RESTful APIs using Express.js</p>
                  <h2>API Concepts:</h2>
                  <ul>
                    <li>HTTP methods</li>
                    <li>Route handling</li>
                    <li>Middleware</li>
                  </ul>
                  <pre><code>app.get('/api/users', (req, res) => {
                    res.json(users);
                  });</code></pre>`,
                  video:
                    "https://placehold.co/600x400/059669/ffffff?text=REST+API",
                  thumbnail:
                    "https://placehold.co/600x400/059669/ffffff?text=Express",
                  isComplete: true,
                  isPublished: true,
                  createdAt: "2024-03-28T14:00:00.000Z",
                  updatedAt: "2024-03-28T14:00:00.000Z",
                },
              ],
            },
          ],
        },
        {
          id: "course-6",
          title: "Mobile App Development with Flutter",
          description: "Create cross-platform mobile apps",
          thumbnail: "https://placehold.co/600x400/0284c7/ffffff?text=Flutter",
          isFeatured: false,
          isPublic: true,
          isPro: true,
          sections: [
            {
              id: "section-6",
              title: "Flutter Basics",
              lectures: [
                {
                  id: "lecture-6",
                  title: "Widget Fundamentals",
                  content: `<h1>Flutter Widgets</h1>
                  <p>Understanding the widget tree and basic Flutter components.</p>
                  <h2>Widget Types:</h2>
                  <ul>
                    <li>Stateless Widgets</li>
                    <li>Stateful Widgets</li>
                    <li>Built-in Widgets</li>
                  </ul>
                  <pre><code>class MyWidget extends StatelessWidget {
                    @override
                    Widget build(BuildContext context) {
                      return Container();
                    }
                  }</code></pre>`,
                  video:
                    "https://placehold.co/600x400/0284c7/ffffff?text=Flutter+Widgets",
                  thumbnail:
                    "https://placehold.co/600x400/0284c7/ffffff?text=Flutter+Basics",
                  isComplete: true,
                  isPublished: true,
                  createdAt: "2024-03-28T15:00:00.000Z",
                  updatedAt: "2024-03-28T15:00:00.000Z",
                },
              ],
            },
          ],
        },
        {
          id: "course-7",
          title: "AWS Cloud Architecture",
          description: "Master cloud computing with AWS",
          thumbnail:
            "https://placehold.co/600x400/ca8a04/ffffff?text=AWS+Cloud",
          isFeatured: false,
          isPublic: false,
          isPro: true,
          sections: [
            {
              id: "section-7",
              title: "AWS Services Overview",
              lectures: [
                {
                  id: "lecture-7",
                  title: "Introduction to EC2",
                  content: `<h1>Amazon EC2</h1>
                  <p>Learn about Elastic Compute Cloud (EC2) and virtual servers in the cloud.</p>
                  <h2>Key Concepts:</h2>
                  <ul>
                    <li>Instance types</li>
                    <li>Security groups</li>
                    <li>Auto-scaling</li>
                  </ul>
                  <h3>Best Practices:</h3>
                  <ol>
                    <li>Right-sizing instances</li>
                    <li>Implementing security measures</li>
                    <li>Monitoring and optimization</li>
                  </ol>`,
                  video:
                    "https://placehold.co/600x400/ca8a04/ffffff?text=AWS+EC2",
                  thumbnail:
                    "https://placehold.co/600x400/ca8a04/ffffff?text=AWS+Basics",
                  isComplete: true,
                  isPublished: true,
                  createdAt: "2024-03-28T16:00:00.000Z",
                  updatedAt: "2024-03-28T16:00:00.000Z",
                },
              ],
            },
          ],
        },
      ]);
    }
  }, [courses.length, setCourses]);

  const handleCourseCreate = (newCourse) => {
    const course = {
      id: `course-${Date.now()}`,
      ...newCourse,
      sections: [],
    };
    addCourse(course);
  };

  const handleCourseUpdate = (updatedCourse) => {
    updateCourse(updatedCourse);
  };

  const handlePageChange = (page) => {
    setActivePage(page);
    if (page !== "courses") {
      setContentPage("list");
      setSelectedCourse(null);
    }
  };

  const handleBack = () => {
    if (contentPage === "content") {
      setContentPage("list");
      setSelectedCourse(null);
    }
  };

  const renderContent = () => {
    if (activePage !== "courses") {
      return (
        <div className="p-4 lg:p-6">
          <h2 className="text-xl lg:text-2xl font-bold mb-4">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)}
          </h2>
          <p className="text-gray-600">{activePage} content coming soon...</p>
        </div>
      );
    }

    if (contentPage === "list") {
      return (
        <CourseListPage
          onCreateCourse={handleCourseCreate}
          onUpdateCourse={handleCourseUpdate}
          onCourseSelect={(course) => {
            setSelectedCourse(course);
            setContentPage("content");
          }}
        />
      );
    }

    if (contentPage === "content" && selectedCourse) {
      return (
        <ContentManagementPage
          course={selectedCourse}
          onUpdate={handleCourseUpdate}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation
        activePage={activePage}
        onPageChange={handlePageChange}
        onBack={handleBack}
      />
      <div className="max-w-7xl mx-auto">{renderContent()}</div>
    </div>
  );
};

export default ClassroomAdminPage;
