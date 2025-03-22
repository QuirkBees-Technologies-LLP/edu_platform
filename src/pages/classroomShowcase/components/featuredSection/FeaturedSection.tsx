import React, { Fragment } from "react";
import CourseCard from "../courseCard";

const FeaturedSection = ({ featuredCourses }) => {
  return (
    <Fragment>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Featured Courses</h1>
        <p className="text-gray-600 mt-2">
          Learn from our top-rated instructors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:row-span-2">
          <CourseCard {...featuredCourses[0]} large={true} />
        </div>
        {/* 2x2 Grid of Featured Courses (Right Side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="col-span-1">
            <CourseCard {...featuredCourses[1]} />
          </div>
          <div className="col-span-1">
            <CourseCard {...featuredCourses[2]} />
          </div>
          <div className="col-span-1">
            <CourseCard {...featuredCourses[3]} />
          </div>
          <div className="col-span-1">
            <CourseCard {...featuredCourses[4]} />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default FeaturedSection;
