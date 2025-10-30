import React, { useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetClientCoursesQuery } from "../../../store/api/client/clientCoursesApiSlice";
import { useGetAcademySingleCategoryQuery } from "../../../store/api/client/clientAcademyCategoryApiSlice";
import WeeklyCalendar from "../live-session-category/WeeklyCalendar";
import CourseImage from "./CourseImage";
// icons
import {
  BookOpen,
  ChevronRight,
  Search,
  User,
  Tag,
  Bookmark,
} from "lucide-react";
import CourseCard from "./CourseCard";
import Loader from "../../../components/ui/loader";

const ClientCourses = () => {
  const [categoryId, setCategoryId] = useState();
  const { id } = useParams();
  const { data, isLoading } = useGetClientCoursesQuery(id);
  const defaultImage = "/media/images/600x400/1.jpg";
  const courses = data?.data;
  const { data: scheduleData, isLoading: scheduleLoading } =
    useGetAcademySingleCategoryQuery(categoryId);
  const eduID = data?.data?.[0]?.instructor?._id;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [coursesList, setCoursesList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (data?.data?.length > 0) {
      const catID = data?.data?.[0]?.category?._id;
      setCategoryId(catID);
      setCoursesList(data?.data);
    }
  }, [data?.data?.length]);

  const educators = scheduleData?.data?.category?.educators.filter(
    (edu) => edu._id === eduID
  );

  // Filter courses based on search term and selected category
  const filteredCourses = coursesList.filter((course) => {
    const matchesSearch =
      !searchTerm ||
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || course.category._id === selectedCategory?._id;

    return matchesSearch && matchesCategory;
  });

  // Section component for consistent styling
  const Section = ({ title, icon, children, viewAllLink }) => (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-light text-primary rounded-lg">
            {icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-primary text-sm font-medium flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>
      {children}
    </div>
  );

  const onSelectCourse = (course) => {
    navigate(`/academy/course/detail/${course._id}`);
  };

  return (
    <div>
      <Container>
        {isLoading || scheduleLoading ? (
          <Loader />
        ) : (
          <>
            <div className="mb-10">
              <h4 className="text-xl font-medium text-primary mb-2">
                IQ Academy Schedule
              </h4>
              {educators && educators.length > 0 ? (
                <WeeklyCalendar educators={educators} />
              ) : (
                <div className="text-center p-4 card mb-5">
                  <div className="card-body">There are no schedule found</div>
                </div>
              )}
            </div>
            <div className="mb-10">
              <h4 className="text-xl font-medium text-primary mb-2">Courses</h4>
              {/* <div className="card">
                        <div className="card-body">
                            {courses && courses.length > 0 ? (
                                <>
                                    <ul className='flex flex-col md:gap-12 gap-8'>
                                        {courses.map((course) => (
                                            <Link
                                                to={`/academy/course/detail/${course._id}`}
                                                key={course._id}
                                                className="card hover:shadow-lg transition-shadow duration-300"
                                            >
                                                <li>
                                                    <a href="#">
                                                        <div className="flex items-center gap-5">
                                                            <CourseImage
                                                                course={course}  // The course object containing the imageUrl and title
                                                                defaultImage={defaultImage}  // Your fallback default image
                                                            />
                                                            <h5 className='sm:text-lg text-md font-semibold text-gray-900'>
                                                                {course.title}
                                                            </h5>
                                                        </div>
                                                    </a>
                                                </li>
                                            </Link>
                                        ))}
                                    </ul>
                                    <div className="text-end mt-3">
                                        <button className='btn btn-primary'>More</button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10">
                                    <h3 className="text-xl font-medium text-gray-700">
                                        No courses available for this category
                                    </h3>
                                    <p className="text-gray-500 mt-2">
                                        Please check back later or browse other categories
                                    </p>
                                </div>
                            )}
                        </div>
                    </div> */}

              <Section
                title={
                  selectedCategory
                    ? `${selectedCategory?.name} IQ Vault`
                    : "All IQ Vault"
                }
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
                  <div className="text-center py-12 rounded-lg border border-gray-200">
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
                      className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-active"
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
          </>
        )}
      </Container>
    </div>
  );
};

export default ClientCourses;
