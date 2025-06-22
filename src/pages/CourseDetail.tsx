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

  if (loading) return <div>Loading course...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!course) return <div>No course found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{course.title}</h1>
      <p className="mb-4">{course.description}</p>

      {course.videos.length === 0 ? (
        <p>No videos available for this course.</p>
      ) : (
        course.videos.map((video) => (
          <div key={video._id} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
            {video.url ? (
              <div className="aspect-video">
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
          </div>
        ))
      )}
    </div>
  );
};

export default CourseDetail;
