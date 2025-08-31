import React, { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import AdminFooter from "../../components/AdminFooter";
import AdminSidebar from "../../components/AdminSidebar";

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

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      setCourses(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const addCourse = async () => {
    if (!newCourseTitle.trim() || !newCourseDescription.trim()) {
      return alert("Enter both title and description");
    }
    try {
      await API.post("/courses", {
        title: newCourseTitle,
        description: newCourseDescription,
      });
      await fetchCourses();
      setNewCourseTitle("");
      setNewCourseDescription("");
      alert("Course added");
    } catch {
      alert("Failed to add course");
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure to delete this course?")) return;
    try {
      await API.delete(`/courses/${courseId}`);
      await fetchCourses();
      alert("Course deleted");
    } catch {
      alert("Failed to delete course");
    }
  };

  const addVideo = async () => {
    if (!selectedCourseId || !videoTitle || !videoUrl)
      return alert("Fill all fields");
    try {
      await API.post("/courses/video", {
        courseId: selectedCourseId,
        title: videoTitle,
        url: videoUrl,
      });
      await fetchCourses();
      setVideoTitle("");
      setVideoUrl("");
      alert("Video added");
    } catch {
      alert("Failed to add video");
    }
  };

  const deleteVideo = async (courseId: string, videoId: string) => {
    if (!window.confirm("Are you sure to delete this video?")) return;
    try {
      await API.delete(`/courses/${courseId}/video/${videoId}`);
      await fetchCourses();
      alert("Video deleted");
    } catch {
      alert("Failed to delete video");
    }
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
            Loading courses...
          </span>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col md:ml-64 bg-gray-50">
        <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
            Admin: Manage Courses & Videos
          </h1>

          {/* Add New Course */}
          <section className="bg-white rounded-2xl shadow-md p-6 max-w-md mb-10">
            <h2 className="text-2xl font-semibold mb-4">Add New Course</h2>
            <input
              type="text"
              placeholder="Course Title"
              value={newCourseTitle}
              onChange={(e) => setNewCourseTitle(e.target.value)}
              className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4 transition"
            />
            <textarea
              placeholder="Course Description"
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
              rows={4}
              className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4 transition resize-none"
            />
            <button
              onClick={addCourse}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-2xl shadow transition"
            >
              Add Course
            </button>
          </section>

          {/* List All Courses */}
          <section className="space-y-8">
            {courses.length === 0 && (
              <p className="text-gray-500 text-center">No courses available.</p>
            )}
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div
                    onClick={() =>
                      setSelectedCourseId(
                        selectedCourseId === course._id ? null : course._id
                      )
                    }
                    className="cursor-pointer flex-1"
                  >
                    <h3 className="text-2xl font-bold text-[#1F2937] hover:underline">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mt-1">{course.description}</p>
                  </div>
                  <button
                    onClick={() => deleteCourse(course._id)}
                    className="mt-4 md:mt-0 text-red-600 hover:text-red-800 font-semibold transition"
                    aria-label={`Delete course ${course.title}`}
                  >
                    Delete Course
                  </button>
                </div>

                {/* Video Management */}
                {selectedCourseId === course._id && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h4 className="text-xl font-semibold mb-4">
                      Add New Video
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Video Title"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full transition"
                      />
                      <input
                        type="text"
                        placeholder="YouTube URL"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full transition"
                      />
                    </div>
                    <button
                      onClick={addVideo}
                      className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-5 py-2 rounded-2xl shadow transition"
                    >
                      Add Video
                    </button>

                    <h5 className="mt-8 mb-3 text-lg font-semibold">Videos</h5>
                    <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
                      {course.videos.length === 0 && (
                        <p className="text-gray-500 italic">No videos yet.</p>
                      )}
                      {course.videos.map((video) => (
                        <li
                          key={video._id}
                          className="flex justify-between items-center py-3"
                        >
                          <span
                            className="truncate max-w-[70%]"
                            title={video.title}
                          >
                            {video.title}
                          </span>
                          <button
                            onClick={() => deleteVideo(course._id, video._id)}
                            className="text-red-500 hover:text-red-700 font-semibold transition text-sm"
                            aria-label={`Delete video ${video.title}`}
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </section>
        </main>

        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminCourses;
