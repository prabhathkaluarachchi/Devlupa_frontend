import React, { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import AdminFooter from "../../components/AdminFooter";
import AdminSidebar from "../../components/AdminSidebar";

interface Course {
  _id: string;
  title: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  dueDate?: string;
  courseId: Course;
}

const AdminAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get("/assignments");
      setAssignments(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load assignments");
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const createAssignment = async () => {
    if (!courseId || !title.trim()) return alert("Course and title are required");

    try {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", title);
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);
      if (dueDate) formData.append("dueDate", dueDate);

      await API.post("/assignments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await fetchAssignments();
      setCourseId("");
      setTitle("");
      setDescription("");
      setImageFile(null);
      setDueDate("");
      alert("Assignment created successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!window.confirm("Are you sure to delete this assignment?")) return;
    setLoading(true);
    try {
      await API.delete(`/assignments/${id}`);
      await fetchAssignments();
      setLoading(false);
      alert("Assignment deleted");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Failed to delete assignment");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-[#4F46E5]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span className="text-[#4F46E5] text-lg font-semibold mt-4">
            Loading assignments...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          <AdminSidebar />
          <div className="flex-1 flex flex-col md:ml-64 bg-[#F9FAFB] p-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Assignments</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1 flex flex-col md:ml-64 bg-[#F9FAFB] p-4">
          <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
            Manage Assignments
          </h1>

          {/* Two Column Layout: Create Assignment + Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Create Assignment Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 lg:col-span-1">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Create Assignment
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Assignment Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                />

                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition resize-none"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files ? e.target.files[0] : null)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  />
                </div>

                <button
                  onClick={createAssignment}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Assignment
                </button>
              </div>
            </div>

            {/* Statistics Card */}
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Assignment Statistics
                  </h2>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-blue-800">Total Assignments</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{assignments.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-green-800">With Images</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {assignments.filter(a => a.imageUrl).length}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-amber-800">With Due Dates</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {assignments.filter(a => a.dueDate).length}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-purple-800">Active Courses</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {new Set(assignments.map(a => a.courseId._id)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Assignments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Available</h3>
                <p className="text-gray-600">Create your first assignment to get started!</p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                          {assignment.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {assignment.description}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAssignment(assignment._id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors ml-2 flex-shrink-0"
                        aria-label={`Delete assignment ${assignment.title}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {assignment.imageUrl && (
                      <img
                        src={
                          assignment.imageUrl.startsWith("http")
                            ? assignment.imageUrl
                            : `${import.meta.env.VITE_BACKEND_BASE_URL}${assignment.imageUrl}`
                        }
                        alt={assignment.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="font-medium">Course:</span>
                        <span className="ml-1">{assignment.courseId?.title || "N/A"}</span>
                      </div>
                      
                      {assignment.dueDate && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Due:</span>
                          <span className="ml-1">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
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

export default AdminAssignments;