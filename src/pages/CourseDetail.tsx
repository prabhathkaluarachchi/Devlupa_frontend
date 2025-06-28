import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";
import StudentHeader from "../components/StudentHeader";
import StudentFooter from "../components/StudentFooter";

interface Video {
  _id: string;
  title: string;
  url: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  videos: Video[];
}

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract YouTube embed URL if needed
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
      : url;
  };

  useEffect(() => {
    if (!courseId) {
      setError("Invalid course ID");
      setLoading(false);
      return;
    }

    axios
      .get(`/courses/${courseId}`)
      .then((res) => {
        setCourse(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch course", err);
        setError("Failed to load course data");
        setLoading(false);
      });

    axios
      .get(`/users/progress/${courseId}`)
      .then((res) => {
        setWatchedVideoIds(res.data); // array of watched video IDs
      })
      .catch((err) => {
        console.error("Failed to fetch progress", err);
      });
  }, [courseId]);

  const handleMarkAsWatched = (videoId: string) => {
    if (watchedVideoIds.includes(videoId)) return;

    axios
      .post(`/users/progress/${courseId}/${videoId}`)
      .then(() => {
        setWatchedVideoIds((prev) => [...prev, videoId]);
      })
      .catch((err) => console.error("Failed to mark as watched", err));
  };

  const progress =
    course && course.videos.length > 0
      ? Math.round((watchedVideoIds.length / course.videos.length) * 100)
      : 0;

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
            Loading Course...
          </span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-red-600 text-center min-h-screen flex items-center justify-center">
        {error}
      </div>
    );
  if (!course)
    return (
      <div className="p-6 text-gray-600 text-center min-h-screen flex items-center justify-center">
        No course found.
      </div>
    );

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <StudentHeader />

      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        <h1 className="text-4xl font-bold text-[#4F46E5] mb-4">
          {course.title}
        </h1>
        <p className="mb-8 text-gray-700 max-w-3xl">{course.description}</p>

        <div className="mb-8 max-w-md">
          <p className="font-medium text-[#1F2937] mb-2">
            Progress: {progress}%
          </p>
          <progress
            className="w-full h-3 rounded bg-gray-200"
            value={progress}
            max={100}
            aria-label="Course progress"
          />
        </div>

        {course.videos.map((video, index) => {
          const embedUrl = getEmbedUrl(video.url);

          return (
            <div
              key={video._id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 mb-8"
            >
              <h2 className="text-2xl font-semibold text-[#1F2937] mb-4">
                {index + 1}. {video.title}
              </h2>

              {embedUrl ? (
                <div className="aspect-video max-h-[400px] rounded-lg overflow-hidden border border-gray-300 shadow-sm mb-5 ">
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    className="w-full h-full it"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-gray-500 mb-5">Invalid video URL</p>
              )}

              {watchedVideoIds.includes(video._id) ? (
                <button
                  disabled
                  className="bg-green-500 text-white px-5 py-2 rounded-lg cursor-not-allowed"
                >
                  ✅ Watched
                </button>
              ) : (
                <button
                  onClick={() => handleMarkAsWatched(video._id)}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-5 py-2 rounded-lg transition"
                >
                  Mark as Watched
                </button>
              )}
            </div>
          );
        })}
      </main>

      <StudentFooter />
    </div>
  );
};

export default CourseDetail;
