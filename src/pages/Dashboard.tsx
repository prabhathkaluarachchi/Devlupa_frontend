import React, { useEffect, useState } from 'react';
import API from '../utils/axiosInstance';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    API.get('/user/profile')
      .then((res) => setUser(res.data.user))
      .catch(() => alert('Unauthorized!'));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Welcome to Devlupa</h1>
      {user ? (
        <p>
          Logged in as <strong>{user.name}</strong> ({user.role})
        </p>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default Dashboard;
