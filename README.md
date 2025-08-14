# 🎓 IQ Academy - Learning Management System (LMS)

A modern, feature-rich Learning Management System built with React, designed for trading education and financial markets learning. This platform provides comprehensive course management, live streaming capabilities, and an intuitive learning experience for students, educators, and administrators.

## ✨ Features

### 🎯 Core LMS Features
- **Course Management**: Create, edit, and organize courses with sections and lectures
- **Drag & Drop Interface**: Intuitive reordering of courses, sections, and lectures
- **Multi-format Content**: Support for video, text, and mixed content types
- **Progress Tracking**: Monitor student progress through courses
- **Role-based Access Control**: Different interfaces for students, educators, and admins

### 🎥 Live Streaming & Recording
- **Live Sessions**: Real-time streaming with chat functionality
- **Recording Management**: Store and manage recorded sessions
- **Stream Scheduling**: Plan and organize live educational content

### 🏗️ Course Structure
- **Hierarchical Organization**: Courses → Sections → Lectures
- **Flexible Content Types**: Video lectures, text content, and interactive materials
- **Category Management**: Organize content by subject and difficulty
- **Tier System**: FREE and PREMIUM course access levels

### 👥 User Management
- **Student Dashboard**: Personalized learning experience with progress tracking
- **Educator Portal**: Course creation and management tools
- **Admin Panel**: Comprehensive system administration and oversight

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling with validation

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Material-UI (MUI)** - React component library
- **Shadcn/ui** - Modern component collection

### Additional Libraries
- **React Player** - Video and audio playback
- **React DnD** - Drag and drop functionality
- **React Markdown** - Markdown rendering
- **ApexCharts** - Data visualization
- **Swiper** - Touch slider
- **Socket.io** - Real-time communication

## 📁 Project Structure

```
src/
├── auth/                    # Authentication system
├── components/             # Reusable UI components
├── config/                 # Configuration files
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization
├── layouts/                # Layout components
├── pages/                  # Page components
│   ├── admin/             # Admin-specific pages
│   ├── educator/          # Educator-specific pages
│   ├── student/           # Student-specific pages
│   └── classroomShowcase/ # Course showcase
├── partials/               # Partial components
├── providers/              # Context providers
├── routing/                # Application routing
├── services/               # API services
├── store/                  # Redux store and slices
├── styles/                 # Global styles
└── utils/                  # Utility functions
```

## 🎨 Key Components

### Course Management
- **CourseCard**: Display course information with visual appeal
- **DraggableCourseCard**: Drag and drop functionality for course reordering
- **CourseForm**: Create and edit course details
- **FeaturedSection**: Highlighted course showcase

### Content Organization
- **SectionList**: Manage course sections with drag and drop
- **SectionItem**: Individual section with expandable content
- **LectureList**: Organize lectures within sections
- **LectureContent**: Display lecture content with progress tracking

### User Interface
- **UserProfileHero**: User profile display component
- **LoadingSpinner**: Loading states and indicators
- **Modal Components**: Reusable modal dialogs
- **DataGrid**: Tabular data display

## 🔐 Authentication & Authorization

The system implements a comprehensive authentication system with role-based access control:

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Student, Educator, and Admin roles
- **Plan-based Restrictions**: Different access levels based on subscription
- **Protected Routes**: Secure access to role-specific content

## 📱 Responsive Design

- **Mobile-First Approach**: Optimized for all device sizes
- **Touch-Friendly Interface**: Gesture support for mobile devices
- **Adaptive Layouts**: Responsive design patterns throughout
- **Progressive Enhancement**: Core functionality works on all devices

## 🌐 Internationalization

- **Multi-language Support**: English, Arabic, French, and more
- **RTL Support**: Right-to-left language support
- **Localized Content**: Region-specific content and formatting
- **Dynamic Language Switching**: Seamless language transitions

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/iq-academy-lms.git
   cd iq-academy-lms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_APP_API_URL=your_api_url_here
   BASE_URL=/
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm start` - Start production server

## 🏗️ Architecture Overview

### Frontend Architecture
- **Component-Based**: Modular, reusable components
- **State Management**: Redux Toolkit for global state
- **Routing**: React Router for navigation
- **API Integration**: Axios for HTTP requests
- **Form Handling**: React Hook Form with Zod validation

### Data Flow
1. **User Authentication** → JWT token generation
2. **Role-based Routing** → Access to appropriate features
3. **API Integration** → Backend communication
4. **State Management** → Centralized data handling
5. **Real-time Updates** → Live content streaming

## 🔧 Configuration

### Environment Variables
- `VITE_APP_API_URL`: Backend API endpoint
- `BASE_URL`: Application base path
- `NODE_ENV`: Environment mode

### Build Configuration
- **Vite**: Modern build tool configuration
- **PostCSS**: CSS processing and optimization
- **Tailwind**: Utility-first CSS framework
- **ESLint**: Code quality and consistency

## 📊 Performance Features

- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Efficient image handling
- **Bundle Optimization**: Optimized production builds
- **Caching Strategies**: Local storage and memory caching
- **Lazy Loading**: On-demand content loading

## 🔒 Security Features

- **JWT Tokens**: Secure authentication
- **Input Validation**: Form and data validation
- **XSS Prevention**: Cross-site scripting protection
- **CSRF Protection**: Cross-site request forgery prevention
- **Role-based Access**: Granular permission control

## 🌟 Key Features in Detail

### Course Creation & Management
- **Visual Course Builder**: Intuitive interface for course creation
- **Content Organization**: Hierarchical structure with sections and lectures
- **Media Support**: Video, audio, and document uploads
- **Publishing Control**: Draft and published states
- **Category Management**: Organized content classification

### Student Learning Experience
- **Personalized Dashboard**: Custom learning paths
- **Progress Tracking**: Visual progress indicators
- **Content Discovery**: Easy course browsing and search
- **Interactive Elements**: Engaging learning components
- **Mobile Learning**: Responsive design for all devices

### Educator Tools
- **Course Analytics**: Performance and engagement metrics
- **Content Management**: Easy content creation and editing
- **Student Management**: Track and support learners
- **Live Streaming**: Real-time educational content delivery

### Administrative Features
- **User Management**: Comprehensive user administration
- **System Monitoring**: Performance and usage analytics
- **Content Moderation**: Quality control and approval workflows
- **Reporting**: Detailed analytics and insights

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Include appropriate documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Vite Team** - For the fast build tool
- **Tailwind CSS** - For the utility-first CSS framework
- **Open Source Community** - For the excellent libraries and tools

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourusername/iq-academy-lms/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/iq-academy-lms/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/iq-academy-lms/discussions)
- **Email**: support@iqacademy.com

## 🔮 Roadmap

### Upcoming Features
- [ ] Advanced Analytics Dashboard
- [ ] AI-powered Content Recommendations
- [ ] Mobile App Development
- [ ] Advanced Assessment Tools
- [ ] Integration with External Platforms

### Long-term Vision
- [ ] Global Content Distribution
- [ ] Advanced Learning Paths
- [ ] Social Learning Features
- [ ] Gamification Elements
- [ ] Enterprise Solutions

---

**Made with ❤️ by the IQ Academy Team**

*Empowering education through technology*
