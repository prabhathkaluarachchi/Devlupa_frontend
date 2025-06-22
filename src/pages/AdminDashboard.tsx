import React, { useEffect, useState } from "react";
import API from "../utils/axiosInstance";

interface CourseProgress {
  courseId: string;
  completedCount: number;
  totalVideos: number;
  percentage: number;
  courseTitle: string;
}

interface UserProgress {
  _id: string;
  name: string;
  progress: CourseProgress[];
}

const AdminDashboard: React.FC = () => {
  const [userProgressList, setUserProgressList] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get("/admin/users-progress")
      .then((res) => {
        setUserProgressList(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load progress summary");
        setLoading(false);
        console.error(err);
      });
  }, []);

  if (loading) return <div>Loading progress summary...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard - User Course Progress
      </h1>

      {userProgressList.length === 0 ? (
        <p>No progress data found.</p>
      ) : (
        userProgressList.map((user) => (
          <div key={user._id} className="mb-8 border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">{user.name}</h2>

            {user.progress.length === 0 ? (
              <p className="text-gray-500">No course progress yet.</p>
            ) : (
              user.progress.map((course) => (
                <div key={`${user._id}-${course.courseTitle}`} className="mb-4">
                  <p className="font-medium">
                    Course Title: {course.courseTitle}
                  </p>
                  <p className="mb-1">Completion: {course.percentage}%</p>
                  <progress
                    className="w-full h-4 rounded"
                    value={course.percentage}
                    max={100}
                    aria-label={`Progress: ${course.percentage}%`}
                  />
                </div>
              ))
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
