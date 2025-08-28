import React, { useEffect, useState } from "react";
import API from "../../utils/axiosInstance";
import AdminHeader from "../../components/AdminHeader";
import AdminFooter from "../../components/AdminFooter";

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
  const [imageUrl, setImageUrl] = useState("");
  const [dueDate, setDueDate] = useState("");

  const fetchAssignments = async () => {
    try {
      const res = await API.get("/assignments");
      setAssignments(res.data);
    } catch {
      alert("Failed to load assignments");
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/courses");
      setCourses(res.data);
    } catch {
      console.error("Error fetching courses");
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchCourses();
  }, []);

  const createAssignment = async () => {
    if (!courseId || !title.trim()) {
      return alert("Course and title are required");
    }
    try {
      await API.post("/assignments", {
        courseId,
        title,
        description,
        imageUrl,
        dueDate,
      });
      await fetchAssignments();
      setCourseId("");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setDueDate("");
      alert("Assignment created successfully");
    } catch {
      alert("Failed to create assignment");
    }
  };

  const deleteAssignment = async (id: string) => {
    if (!window.confirm("Are you sure to delete this assignment?")) return;
    try {
      await API.delete(`/assignments/${id}`);
      await fetchAssignments();
      alert("Assignment deleted");
    } catch {
      alert("Failed to delete assignment");
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen flex flex-col">
      <AdminHeader />

      <main className="flex-grow p-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold mb-8 text-[#4F46E5]">
          Admin: Manage Assignments
        </h1>

        {/* Add Assignment Form */}
        <section className="bg-white rounded-2xl shadow-md p-6 max-w-md mb-10">
          <h2 className="text-2xl font-semibold mb-4">Create Assignment</h2>

          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4"
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
            className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4 resize-none"
          />

          <input
            type="text"
            placeholder="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4"
          />

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="border border-gray-300 focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent p-3 rounded-lg w-full mb-4"
          />

          <button
            onClick={createAssignment}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-2xl shadow transition"
          >
            Create Assignment
          </button>
        </section>

        {/* List Assignments */}
        <section className="space-y-6">
          {assignments.length === 0 && (
            <p className="text-gray-500 text-center">No assignments available.</p>
          )}

          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-[#1F2937]">
                    {a.title}
                  </h3>
                  <p className="text-gray-600">{a.description}</p>
                  {a.imageUrl && (
                    <img
                      src={a.imageUrl}
                      alt={a.title}
                      className="mt-3 rounded-lg w-40"
                    />
                  )}
                  {a.dueDate && (
                    <p className="text-sm text-gray-500 mt-2">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-700">
                    Course: {a.courseId?.title || "N/A"}
                  </p>
                </div>

                <button
                  onClick={() => deleteAssignment(a._id)}
                  className="text-red-600 hover:text-red-800 font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>

      <AdminFooter />
    </div>
  );
};

export default AdminAssignments;
