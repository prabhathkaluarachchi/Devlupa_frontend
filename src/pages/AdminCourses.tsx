import React, { useEffect, useState } from 'react';
import API from '../utils/axiosInstance';

interface Video {
  _id: string;
  title: string;
  url: string;
}

interface Course {
  _id: string;
  title: string;
  videos: Video[];
}

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/courses')
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addVideo = async () => {
    if (!selectedCourseId || !videoTitle || !videoUrl) return alert('Fill all fields');
    try {
      await API.post('/courses/video', {
        courseId: selectedCourseId,
        title: videoTitle,
        url: videoUrl,
      });
      // Refresh courses
      const res = await API.get('/courses');
      setCourses(res.data);
      setVideoTitle('');
      setVideoUrl('');
      alert('Video added');
    } catch (error) {
      alert('Failed to add video');
    }
  };

  const deleteVideo = async (courseId: string, videoId: string) => {
    if (!window.confirm('Are you sure to delete this video?')) return;
    try {
      await API.delete(`/courses/${courseId}/video/${videoId}`);
      const res = await API.get('/courses');
      setCourses(res.data);
      alert('Video deleted');
    } catch {
      alert('Failed to delete video');
    }
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin: Manage Courses & Videos</h1>

      <div className="mb-6">
        <label>Select Course: </label>
        <select
          className="border rounded p-2 ml-2"
          value={selectedCourseId || ''}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">-- Select --</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {selectedCourseId && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Video</h2>
          <input
            type="text"
            placeholder="Video Title"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="border p-2 rounded w-full mb-3"
          />
          <input
            type="text"
            placeholder="YouTube URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="border p-2 rounded w-full mb-3"
          />
          <button
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            onClick={addVideo}
          >
            Add Video
          </button>

          <h3 className="mt-8 text-lg font-semibold">Existing Videos</h3>
          <ul>
            {courses
              .find((c) => c._id === selectedCourseId)
              ?.videos.map((video) => (
                <li key={video._id} className="flex justify-between items-center my-2">
                  <span>{video.title}</span>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => deleteVideo(selectedCourseId, video._id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
