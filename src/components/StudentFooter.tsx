import React from "react";

const StudentFooter: React.FC = () => {
  return (
    <footer className="bg-white text-gray-500 text-sm text-center py-6 mt-10 border-t">
      © {new Date().getFullYear()} DevLupa. All rights reserved.
    </footer>
  );
};

export default StudentFooter;
