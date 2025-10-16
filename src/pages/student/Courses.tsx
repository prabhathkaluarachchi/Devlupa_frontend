import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentFooter from "../../components/StudentFooter";
import StudentSidebar from "../../components/StudentSidebar";

interface Video {
  _id: string;
  title: string;
  url: string;
  order: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  videos: Video[];
  tasks?: string[];
}

const CoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/courses")
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch courses", err);
        setLoading(false);
      });
  }, []);

  const getEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    const ytMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    const normalMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
    const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);

    const videoId = ytMatch?.[1] || normalMatch?.[1];
    const listId = listMatch?.[1];

    return videoId
      ? `https://www.youtube.com/embed/${videoId}${
          listId ? `?list=${listId}` : ""
        }`
      : null;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <span className="text-indigo-600 text-lg font-semibold">
            Loading Courses...
          </span>
        </div>
      </div>
    );

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64 transition-all">
        <main className="flex-grow max-w-7xl mx-auto w-full p-6">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">🎓</span>
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Available Courses
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl">
              Explore our comprehensive collection of courses designed to
              enhance your skills and knowledge.
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  No Courses Available
                </h2>
                <p className="text-gray-600 mb-4">
                  Check back later for new course offerings.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => {
                const firstVideoUrl = course.videos?.[0]?.url;
                const embedUrl = getEmbedUrl(firstVideoUrl);
                const videoCount = course.videos?.length || 0;

                return (
                  <div
                    key={course._id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    {/* Course Thumbnail */}
                    {embedUrl ? (
                      <div className="aspect-video relative overflow-hidden">
                        <iframe
                          src={embedUrl}
                          title={course.title}
                          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                          allowFullScreen
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                          {videoCount} {videoCount === 1 ? "video" : "videos"}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                        <div className="text-center">
                          <span className="text-4xl mb-2 text-gray-400">
                            📹
                          </span>
                          <p className="text-gray-500 text-sm">
                            Course Preview
                          </p>
                        </div>
                        <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                          {videoCount} {videoCount === 1 ? "video" : "videos"}
                        </div>
                      </div>
                    )}

                    {/* Course Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Course Stats */}
                      <div className="flex items-center justify-between mb-4">
                        {/* <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">🎯</span>
                          {course.tasks?.length || 0} tasks
                        </div> */}
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-1">⏱️</span>
                          {videoCount} lessons
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group/btn"
                      >
                        <span>Start Learning</span>
                        <span className="group-hover/btn:translate-x-1 transition-transform">
                          →
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Learning Benefits Section */}
          {courses.length > 0 && (
            <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>🚀</span>
                Learning Benefits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Self-Paced Learning
                  </h3>
                  <p className="text-sm text-gray-600">
                    Learn at your own comfortable pace
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">👨‍🏫</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Expert Instructors
                  </h3>
                  <p className="text-sm text-gray-600">
                    Learn from industry professionals
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">🛠️</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Practical Projects
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hands-on real world applications
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">🏆</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Career Advancement
                  </h3>
                  <p className="text-sm text-gray-600">
                    Boost your professional skills
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        <StudentFooter />
      </div>
    </div>
  );
};

export default CoursesPage;
