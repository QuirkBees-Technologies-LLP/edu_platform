const backupHomePage = () => {
  return (
    <>
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

        <div className="space-y-6">
          <ProfessorFilter
            selectedProfessor={selectedProfessor}
            onProfessorChange={handleProfessorChange}
          />

          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          <div className="grid grid-cols-3 gap-2">
            {filteredCourses.slice(0, visibleCourses).map((course, index) => (
              <div key={index} className="aspect-square">
                <CourseCard {...course} />
              </div>
            ))}
          </div>

          {hasMoreCourses && (
            <div className="flex justify-center">
              <button
                onClick={handleShowMore}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-active transition-colors"
              >
                Show More Courses
              </button>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};
