import { Fragment, useState } from "react";
import { Container } from "@/components";
import { toAbsoluteUrl } from "@/utils";

import { UserProfileHero } from "@/partials/heros";
import CourseCard from "./components/courseCard";

// testing
import featuredCourses from "./mocks/featuredCourses";
import popularCourses from "./mocks/popularCourses";
import FeaturedSection from "./components/featuredSection/FeaturedSection";

const ClassRoomShowcasePage = () => {
  const [visibleCourses, setVisibleCourses] = useState(9);
  const hasMoreCourses = visibleCourses < popularCourses.length;

  const handleShowMore = () => {
    setVisibleCourses((prev) => Math.min(prev + 9, popularCourses.length));
  };

  const image = (
    <img
      src={toAbsoluteUrl("/media/avatars/300-1.png")}
      className="rounded-full border-3 border-success size-[100px] shrink-0"
    />
  );
  return (
    <Fragment>
      <UserProfileHero
        name="Jenny Klabber"
        image={image}
        info={[
          { label: "KeenThemes", icon: "abstract-41" },
          { label: "SF, Bay Area", icon: "geolocation" },
          { email: "jenny@kteam.com", icon: "sms" },
        ]}
      />
      <Container>Hola mundo</Container>
      <Container>
        <FeaturedSection featuredCourses={featuredCourses} />
      </Container>

      <Container>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Popular Courses</h2>
          <p className="text-gray-600 mt-2">
            Explore our most popular learning resources
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-2">
            {popularCourses.slice(0, visibleCourses).map((course, index) => (
              <div key={index} className="aspect-square">
                <CourseCard {...course} />
              </div>
            ))}
          </div>

          {hasMoreCourses && (
            <div className="flex justify-center">
              <button
                onClick={handleShowMore}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Show More Courses
              </button>
            </div>
          )}
        </div>
      </Container>
    </Fragment>
  );
};

export { ClassRoomShowcasePage };
