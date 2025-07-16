import { Play, Clock, Users, BookOpen, Award, ChevronLeft } from "lucide-react";

const BackupLayout = (props) => {
  const { mockCourse } = props;

  return (
    <div className="container mx-auto px-8 py-12">
      <div className="grid grid-cols-3 gap-8">
        {/* Course Content */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About This Course
            </h2>
            <p className="text-gray-600 whitespace-pre-line">
              {mockCourse.description}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Course Content
            </h2>
            <div className="space-y-4">
              {mockCourse.chapters.map((chapter, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {chapter.title}
                    </h3>
                    <span className="text-gray-500 text-sm">
                      {chapter.duration}
                    </span>
                  </div>
                  <div className="divide-y">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lessonIndex}
                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Play className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{lesson.title}</span>
                          {lesson.isPreview && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              Preview
                            </span>
                          )}
                        </div>
                        <span className="text-gray-500 text-sm">
                          {lesson.duration}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-8">
            <div className="aspect-video rounded-lg overflow-hidden mb-6">
              <img
                src={mockCourse.image}
                alt={mockCourse.title}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="w-full bg-primary hover:bg-primary-active text-white px-6 py-3 rounded-lg mb-6 transition-colors flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              <span>Start Learning Now</span>
            </button>
            <div className="border-t pt-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={mockCourse.instructor.image}
                  alt={mockCourse.instructor.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {mockCourse.instructor.name}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    {mockCourse.instructor.title}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">
                    Certificate of completion
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">Lifetime access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
