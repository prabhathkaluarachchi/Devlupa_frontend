import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentHeader from "../../components/StudentHeader";
import StudentFooter from "../../components/StudentFooter";

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
      ? `https://www.youtube.com/embed/${videoId}${listId ? `?list=${listId}` : ""}`
      : null;
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-[#4F46E5]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span className="text-[#4F46E5] text-lg font-semibold mt-4">
            Loading Courses...
          </span>
        </div>
      </div>
    );

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <StudentHeader />

      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        <h1 className="text-3xl font-bold text-[#4F46E5] mb-8 flex items-center gap-2">
          📚 Available Courses
        </h1>

        {courses.length === 0 ? (
          <p className="text-gray-600 text-center">No courses available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => {
              const firstVideoUrl = course.videos?.[0]?.url;
              const embedUrl = getEmbedUrl(firstVideoUrl);

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:bg-[#EEF2FF] transition"
                >
                  <h2 className="text-xl font-semibold text-[#1F2937] mb-3">
                    {course.title}
                  </h2>
                  <p className="mb-4 text-gray-700 flex-grow">{course.description}</p>

                  {embedUrl && (
                    <div className="aspect-video rounded overflow-hidden mb-4 shadow-sm">
                      <iframe
                        src={embedUrl}
                        title={course.title}
                        className="w-full h-full"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="mt-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-5 py-2 rounded-xl shadow transition"
                  >
                    Start Course
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <StudentFooter />
    </div>
  );
};

export default CoursesPage;
