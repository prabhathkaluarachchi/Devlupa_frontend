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
  createdAt?: string;
}

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDescription, setNewCourseDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

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
      return alert("Please enter both title and description");
    }
    try {
      await API.post("/courses", {
        title: newCourseTitle,
        description: newCourseDescription,
      });
      await fetchCourses();
      setNewCourseTitle("");
      setNewCourseDescription("");
      alert("Course added successfully!");
    } catch {
      alert("Failed to add course");
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await API.delete(`/courses/${courseId}`);
      await fetchCourses();
      alert("Course deleted successfully!");
    } catch {
      alert("Failed to delete course");
    }
  };

  const addVideo = async () => {
    if (!selectedCourseId || !videoTitle || !videoUrl)
      return alert("Please fill all fields");
    try {
      await API.post("/courses/video", {
        courseId: selectedCourseId,
        title: videoTitle,
        url: videoUrl,
      });
      await fetchCourses();
      setVideoTitle("");
      setVideoUrl("");
      alert("Video added successfully!");
    } catch {
      alert("Failed to add video");
    }
  };

  const deleteVideo = async (courseId: string, videoId: string) => {
    if (!window.confirm("Are you sure you want to delete this video?")) return;
    try {
      await API.delete(`/courses/${courseId}/video/${videoId}`);
      await fetchCourses();
      alert("Video deleted successfully!");
    } catch {
      alert("Failed to delete video");
    }
  };

  const toggleCourseExpansion = (courseId: string) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
      setSelectedCourseId(null);
    } else {
      newExpanded.add(courseId);
      setSelectedCourseId(courseId);
    }
    setExpandedCourses(newExpanded);
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
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 flex flex-col md:ml-64 bg-[#F9FAFB] p-4">
          <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
            Manage Courses & Videos
          </h1>

          {/* Add New Course Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Add New Course
                  </h2>
                </div>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Course Title"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                />
                <textarea
                  placeholder="Course Description"
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                />
                <button
                  onClick={addCourse}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Course
                </button>
              </div>
            </div>

            {/* Course Statistics Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Course Statistics
                  </h2>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-blue-800">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{courses.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-green-800">Total Videos</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {courses.reduce((total, course) => total + course.videos.length, 0)}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-amber-800">Avg Videos/Course</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {courses.length > 0 ? (courses.reduce((total, course) => total + course.videos.length, 0) / courses.length).toFixed(1) : 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-purple-800">Latest Course</p>
                  <p className="text-lg font-bold text-purple-600 mt-1">
                    {courses.length > 0 ? courses[courses.length - 1].title : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Available</h3>
                <p className="text-gray-600">Create your first course to get started!</p>
              </div>
            ) : (
              courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {course.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>{course.videos.length} videos</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCourse(course._id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors ml-2"
                        aria-label={`Delete course ${course.title}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => toggleCourseExpansion(course._id)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <svg 
                        className={`w-4 h-4 mr-2 transition-transform ${expandedCourses.has(course._id) ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      {expandedCourses.has(course._id) ? 'Hide Videos' : 'Manage Videos'}
                    </button>
                  </div>

                  {/* Video Management Section */}
                  {expandedCourses.has(course._id) && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-xl">
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Add New Video</h4>
                        <div className="space-y-4">
                          <input
                            type="text"
                            placeholder="Video Title"
                            value={videoTitle}
                            onChange={(e) => setVideoTitle(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                          />
                          <input
                            type="text"
                            placeholder="YouTube URL"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                          />
                          <button
                            onClick={addVideo}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add Video
                          </button>
                        </div>
                      </div>

                      {/* Videos List */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Course Videos ({course.videos.length})</h4>
                        <div className="space-y-3">
                          {course.videos.length === 0 ? (
                            <p className="text-gray-500 text-center py-4 bg-white rounded-lg border border-gray-200">
                              No videos added yet.
                            </p>
                          ) : (
                            course.videos.map((video) => (
                              <div
                                key={video._id}
                                className="flex justify-between items-center bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors"
                              >
                                <div className="flex items-center min-w-0 flex-1">
                                  <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                  </svg>
                                  <span className="font-medium text-gray-900 truncate" title={video.title}>
                                    {video.title}
                                  </span>
                                </div>
                                <button
                                  onClick={() => deleteVideo(course._id, video._id)}
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors ml-2 flex-shrink-0"
                                  aria-label={`Delete video ${video.title}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <AdminFooter />
    </div>
  );
};

export default AdminCourses;