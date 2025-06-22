import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axiosInstance";

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Track watched videos (just _id of video)
  const [watchedVideoIds, setWatchedVideoIds] = useState<string[]>([]);

  useEffect(() => {
    if (!courseId) {
      setError("Invalid course ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    axios
      .get(`/courses/${courseId}`)
      .then((res) => {
        setCourse(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load course data");
        setLoading(false);
      });
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    axios
      .get(`/users/progress/${courseId}`)
      .then((res) => {
        setWatchedVideoIds(res.data); // array of video IDs
      })
      .catch((err) => {
        console.error("Failed to fetch watched videos", err);
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

  // Calculate completion percentage
  const progress =
    course && course.videos.length > 0
      ? Math.round((watchedVideoIds.length / course.videos.length) * 100)
      : 0;

  if (loading) return <div>Loading course...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!course) return <div>No course found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="mb-4">{course.description}</p>

      {/* ✅ Show progress */}
      <div className="mb-6 font-medium text-blue-600">
        Progress: {progress}%
      </div>

      {course.videos.length === 0 ? (
        <p>No videos available for this course.</p>
      ) : (
        course.videos.map((video) => (
          <div key={video._id} className="mb-8 border-b pb-6">
            <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
            {video.url ? (
              <div className="aspect-video mb-3">
                <iframe
                  src={video.url}
                  title={video.title}
                  className="w-full h-full rounded"
                  allowFullScreen
                />
              </div>
            ) : (
              <p>No video available</p>
            )}

            {/* ✅ Mark as Watched Button */}
            {watchedVideoIds.includes(video._id) ? (
              <button
                disabled
                className="px-4 py-2 text-white bg-green-500 rounded cursor-not-allowed"
              >
                Watched
              </button>
            ) : (
              <button
                onClick={() => handleMarkAsWatched(video._id)}
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded"
              >
                Mark as Watched
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default CourseDetail;
