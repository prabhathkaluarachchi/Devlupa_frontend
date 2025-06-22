import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

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

  useEffect(() => {
    axios.get('/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));
  }, []);

  const getEmbedUrl = (url?: string): string | null => {
    if (!url) return null;

    const ytMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    const normalMatch = url.match(/v=([a-zA-Z0-9_-]+)/);
    const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);

    const videoId = ytMatch?.[1] || normalMatch?.[1];
    const listId = listMatch?.[1];

    return videoId ? `https://www.youtube.com/embed/${videoId}${listId ? `?list=${listId}` : ''}` : null;
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Available Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => {
          const firstVideoUrl = course.videos?.[0]?.url;
          const embedUrl = getEmbedUrl(firstVideoUrl);

          return (
            <div key={course._id} className="border rounded p-4 shadow-md bg-white">
              <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
              <p className="mb-3 text-gray-700">{course.description}</p>

              {embedUrl && (
                <div className="aspect-video mb-2">
                  <iframe
                    src={embedUrl}
                    title={course.title}
                    className="w-full h-full rounded"
                    allowFullScreen
                  />
                </div>
              )}

              <button onClick={() => navigate(`/courses/${course._id}`)} className="mt-2 bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700">
                Start Course
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesPage;
