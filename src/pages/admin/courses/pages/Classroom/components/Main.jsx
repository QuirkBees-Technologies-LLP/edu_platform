import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthContext } from "../../../../../../auth/useAuthContext";
import { motion } from "framer-motion";

// components
import CourseCard from "../../../components/CourseCard";
import FeaturedSection from "../../../components/FeaturedSection";

// icons
import {
  BookOpen,
  ChevronRight,
  Search,
  User,
  Tag,
  Bookmark,
} from "lucide-react";

// Store
import {
  fetchCourses,
  selectAllCourses,
  selectCoursesStatus,
  selectCoursesError,
} from "@/store/reducer/courseSlice";

const Main = ({ onSelectCourse }) => {
  const { auth } = useAuthContext();
  const [coursesList, setCoursesList] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const dispatch = useDispatch();

  // Selectors
  const courses = useSelector(selectAllCourses);
  const status = useSelector(selectCoursesStatus);
  const error = useSelector(selectCoursesError);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (auth?.token) {
      setIsLoading(true);
      dispatch(
        fetchCourses({
          params: {
            isPublished: true,
          },
          token: auth.token,
        })
      )
        .unwrap()
        .then((response) => {
          setCoursesList(response);

          // Extract unique instructors
          const uniqueInstructors = Array.from(
            new Set(response.map((course) => course.instructor?._id))
          )
            .map((id) => {
              return response.find((course) => course.instructor?._id === id)
                ?.instructor;
            })
            .filter(Boolean);

          setInstructors(uniqueInstructors);

          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(response.map((course) => course.category))
          ).filter(Boolean);

          setCategories(uniqueCategories);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setIsLoading(false);
        });
    }
  }, [dispatch, auth?.token]);

  // Filter courses based on search term and selected category
  const filteredCourses = coursesList.filter((course) => {
    const matchesSearch =
      !searchTerm ||
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get featured courses (highest rated or marked as featured)
  const featuredCourses = coursesList
    .filter((course) => course.published)
    .slice(0, 5); // Take first 5 for FeaturedSection

  // Section component for consistent styling
  const Section = ({ title, icon, children, viewAllLink }) => (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>
      {children}
    </div>
  );

  // Instructor card component
  const InstructorCard = ({ instructor }) => (
    <motion.div
      className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
        <span className="text-white font-bold text-lg">
          {instructor?.name?.charAt(0) || "U"}
        </span>
      </div>
      <div>
        <h3 className="font-medium text-gray-800">{instructor?.name}</h3>
        <p className="text-sm text-gray-500">
          {instructor?.courses?.length || "0"} Courses
        </p>
      </div>
    </motion.div>
  );

  // Category badge component
  const CategoryBadge = ({ category, isSelected, onClick }) => (
    <motion.button
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
        isSelected
          ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
          : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
      }`}
      onClick={() => onClick(category)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Tag className="w-3.5 h-3.5" />
      {category}
    </motion.button>
  );

  const handleCategoryClick = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // deselect if already selected
    } else {
      setSelectedCategory(category);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 mb-10 overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute left-20 bottom-0 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 -mb-20"></div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-bold text-white mb-2">
            Explore Our Best Courses
          </h1>
          <p className="text-indigo-100 mb-6">
            Enhance your skills with our industry-leading instructors and
            expertly crafted courses.
          </p>

          <div className="relative">
            <input
              type="text"
              placeholder="Search for courses..."
              className="w-full bg-white/90 backdrop-blur-sm text-gray-800 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Featured Courses using FeaturedSection component */}
      {featuredCourses.length >= 5 && (
        <FeaturedSection
          courses={featuredCourses}
          title="Featured Courses"
          subtitle="Recommended by our team and top students"
        />
      )}

      {/* Categories */}
      <Section
        title="Browse by Category"
        icon={<Bookmark className="w-5 h-5" />}
      >
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <CategoryBadge
              key={category}
              category={category}
              isSelected={selectedCategory === category}
              onClick={handleCategoryClick}
            />
          ))}
          {categories.length > 0 && (
            <CategoryBadge
              category="All Categories"
              isSelected={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
            />
          )}
        </div>
      </Section>

      {/* Instructors */}
      <Section
        title="Our Instructors"
        icon={<User className="w-5 h-5" />}
        viewAllLink="#instructors"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructors.slice(0, 6).map((instructor) => (
            <InstructorCard key={instructor._id} instructor={instructor} />
          ))}
        </div>
      </Section>

      {/* All Courses */}
      <Section
        title={selectedCategory ? `${selectedCategory} Courses` : "All Courses"}
        icon={<BookOpen className="w-5 h-5" />}
      >
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={{ ...course, id: course._id }}
                onSelectCourse={onSelectCourse}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 text-center py-12 rounded-lg border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 flex items-center justify-center rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700">
              No courses found
            </h3>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : "No courses available in this category yet"}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </Section>
    </div>
  );
};

export default Main;
