import React from "react";
import CourseCard from "../../../classroomShowcase/components/courseCard";
import { motion } from "framer-motion";
import { Star, ChevronRight, TrendingUp } from "lucide-react";

const FeaturedSection = ({
  courses,
  title = "Featured Courses",
  subtitle = "Learn from our top-rated instructors",
}) => {
  if (!courses || courses.length < 5) {
    return null; // Don't render if we don't have enough courses
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <section className="py-12">
      <div className="mb-8 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
        <div className="pl-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md">
              <Star className="w-4 h-4" />
            </div>
            <motion.h1
              className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {title}
            </motion.h1>
          </div>
          <motion.p
            className="text-gray-600 ml-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center">
          <motion.a
            href="/courses"
            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors font-medium text-sm"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>View all courses</span>
            <ChevronRight className="w-4 h-4" />
          </motion.a>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="lg:row-span-2 relative group" variants={item}>
          <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg shadow-indigo-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Most Popular</span>
          </div>
          <CourseCard
            {...courses[0]}
            large={true}
            id={courses[0]._id || courses[0].id}
          />
        </motion.div>

        {/* 2x2 Grid of Featured Courses (Right Side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.div className="col-span-1" variants={item}>
            <CourseCard {...courses[1]} id={courses[1]._id || courses[1].id} />
          </motion.div>
          <motion.div className="col-span-1" variants={item}>
            <CourseCard {...courses[2]} id={courses[2]._id || courses[2].id} />
          </motion.div>
          <motion.div className="col-span-1" variants={item}>
            <CourseCard {...courses[3]} id={courses[3]._id || courses[3].id} />
          </motion.div>
          <motion.div className="col-span-1" variants={item}>
            <CourseCard {...courses[4]} id={courses[4]._id || courses[4].id} />
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Bottom Decoration */}
      <div className="mt-12 flex justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-200"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          <span className="w-2 h-2 rounded-full bg-indigo-200"></span>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
