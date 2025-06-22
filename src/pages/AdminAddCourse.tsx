import React, { useEffect, useState } from 'react';
import API from '../utils/axiosInstance';

const AdminAddCourse: React.FC = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await API.get('/courses');
      setCourses(res.data);
    } catch {
      alert('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const addCourse = async () => {
    if (!title || !description) return alert('Please fill all fields');
    try {
      await API.post('/courses', { title, description });
      setTitle('');
      setDescription('');
      fetchCourses();
      alert('Course added successfully');
    } catch {
      alert('Failed to add course');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin: Manage Courses</h1>
      <input
        type="text"
        placeholder="Course Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />
      <textarea
        placeholder="Course Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="border p-2 rounded w-full mb-3"
        rows={3}
      />
      <button
        onClick={addCourse}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Add Course
      </button>

      <h2 className="text-xl font-semibold mt-8 mb-4">Existing Courses</h2>
      <ul>
        {courses.map((course: any) => (
          <li key={course._id} className="border p-3 rounded mb-3">
            <h3 className="font-bold">{course.title}</h3>
            <p>{course.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminAddCourse;
