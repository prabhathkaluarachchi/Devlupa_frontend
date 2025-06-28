import React from "react";

const AdminFooter: React.FC = () => {
  return (
    <footer className="bg-white text-gray-500 text-sm text-center py-4 mt-10 border-t">
      © {new Date().getFullYear()} DevLupa Admin. All rights reserved.
    </footer>
  );
};

export default AdminFooter;
