import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../utils/axiosInstance";
import StudentFooter from "../../components/StudentFooter";
import StudentSidebar from "../../components/StudentSidebar";

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
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

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
        setActiveVideo(res.data.videos[0] || null);
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
          <span className="text-indigo-600 text-lg font-semibold">
            Loading Course Content...
          </span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-red-200 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );

  if (!course)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            No Course Found
          </h2>
          <p className="text-gray-600">
            The requested course could not be found.
          </p>
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
          {/* Course Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {course.title}
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                  {course.description}
                </p>
              </div>

              {/* Progress Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white mt-6 lg:mt-0 lg:ml-6 min-w-[250px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Your Progress</span>
                  <span className="text-lg font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-indigo-400 rounded-full h-3 mb-2">
                  <div
                    className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-indigo-100 text-sm">
                  {watchedVideoIds.length} of {course.videos.length} videos
                  completed
                </p>
              </div>
            </div>
          </div>

          {/* Video Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Video List Sidebar */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📺</span>
                  Course Videos
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {course.videos.map((video, index) => (
                    <div
                      key={video._id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${
                        activeVideo?._id === video._id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 hover:border-indigo-200"
                      }`}
                      onClick={() => setActiveVideo(video)}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            watchedVideoIds.includes(video._id)
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {watchedVideoIds.includes(video._id)
                            ? "✓"
                            : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 text-sm leading-tight mb-1">
                            {video.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500">
                            {watchedVideoIds.includes(video._id) ? (
                              <span className="text-green-600 font-medium">
                                ✓ Completed
                              </span>
                            ) : (
                              <span className="text-orange-600">● Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Video Player */}
            <div className="xl:col-span-3">
              {activeVideo && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Video Player */}
                  <div className="aspect-video bg-black">
                    {getEmbedUrl(activeVideo.url) ? (
                      <iframe
                        src={getEmbedUrl(activeVideo.url) ?? undefined}
                        title={activeVideo.title}
                        className="w-full h-full"
                        allowFullScreen
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <div className="text-center">
                          <span className="text-4xl mb-2">📹</span>
                          <p>Invalid video URL</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Video Info & Actions */}
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
                        {activeVideo.title}
                      </h2>

                      {watchedVideoIds.includes(activeVideo._id) ? (
                        <button
                          disabled
                          className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-xl cursor-not-allowed font-semibold shadow-sm"
                        >
                          <span className="mr-2">✅</span>
                          Watched
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsWatched(activeVideo._id)}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                          <span className="mr-2">🎯</span>
                          Mark as Watched
                        </button>
                      )}
                    </div>

                    {/* Progress for current video */}
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📊</span>
                      Video{" "}
                      {course.videos.findIndex(
                        (v) => v._id === activeVideo._id
                      ) + 1}{" "}
                      of {course.videos.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation between videos */}
              {activeVideo && (
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => {
                      const currentIndex = course.videos.findIndex(
                        (v) => v._id === activeVideo._id
                      );
                      if (currentIndex > 0) {
                        setActiveVideo(course.videos[currentIndex - 1]);
                      }
                    }}
                    disabled={
                      course.videos.findIndex(
                        (v) => v._id === activeVideo._id
                      ) === 0
                    }
                    className="flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mr-2">⬅️</span>
                    Previous
                  </button>

                  <button
                    onClick={() => {
                      const currentIndex = course.videos.findIndex(
                        (v) => v._id === activeVideo._id
                      );
                      if (currentIndex < course.videos.length - 1) {
                        setActiveVideo(course.videos[currentIndex + 1]);
                      }
                    }}
                    disabled={
                      course.videos.findIndex(
                        (v) => v._id === activeVideo._id
                      ) ===
                      course.videos.length - 1
                    }
                    className="flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <span className="ml-2">➡️</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        <StudentFooter />
      </div>
    </div>
  );
};

export default CourseDetail;
