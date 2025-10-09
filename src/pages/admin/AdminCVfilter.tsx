// import { useState } from "react";
// import AdminSidebar from "../../components/AdminSidebar";
// import AdminFooter from "../../components/AdminFooter";
// import API from "../../utils/axiosInstance";

// const AdminCVFilter: React.FC = () => {
//   const [requirement, setRequirement] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [matchScore, setMatchScore] = useState<number | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [resultText, setResultText] = useState("");
//   const [email, setEmail] = useState("");
//   const [sendingEmail, setSendingEmail] = useState(false);

//   // Handle file selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//       // Reset previous result
//       setMatchScore(null);
//       setResultText("");
//     }
//   };

//   // Analyze CV
//   const analyzeCV = async () => {
//     if (!file || !requirement.trim()) {
//       alert("Please upload a CV and enter the job requirement.");
//       return;
//     }

//     setLoading(true);
//     setMatchScore(null);
//     setResultText("");

//     try {
//       const formData = new FormData();
//       formData.append("cv", file);
//       formData.append("requirement", requirement);

//       const res = await API.post("/admin/cv-filter", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       const score = res.data.matchScore || 0;
//       setMatchScore(score);
//       setResultText(
//         score >= 75
//           ? "✅ This student is eligible for the internship."
//           : "❌ This student is not eligible for the internship."
//       );
//     } catch (err: any) {
//       console.error("CV Analysis Error:", err);
//       setResultText(err.response?.data?.message || "⚠️ Failed to analyze CV.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Send registration email
//   const handleSendEmail = async () => {
//     if (!email.trim()) {
//       alert("Please enter the student's email address.");
//       return;
//     }

//     setSendingEmail(true);
//     try {
//       const res = await API.post("/admin/send-link", { email });
//       alert(res.data.message);
//       setEmail("");
//     } catch (err: any) {
//       console.error("Send Email Error:", err);
//       alert(err.response?.data?.message || "Failed to send email.");
//     } finally {
//       setSendingEmail(false);
//     }
//   };

//   return (
//     <div className="flex bg-[#F9FAFB] min-h-screen">
//       <AdminSidebar />
//       <div className="flex-1 flex flex-col md:ml-64">
//         <main className="p-6 flex-grow max-w-4xl mx-auto w-full">
//           <h1 className="text-3xl font-bold text-[#4F46E5] mb-6">
//             CV Filter – Internship Eligibility
//           </h1>

//           {/* Upload & Requirement Section */}
//           <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
//             <label className="block font-medium mb-2 text-gray-700">
//               Upload CV File (PDF, DOCX, TXT)
//             </label>
//             <input
//               type="file"
//               accept=".pdf,.doc,.docx,.txt"
//               onChange={handleFileChange}
//               className="w-full border border-gray-300 rounded p-2 mb-4"
//             />

//             <label className="block font-medium mb-2 text-gray-700">
//               Job Requirement / Description
//             </label>
//             <textarea
//               value={requirement}
//               onChange={(e) => setRequirement(e.target.value)}
//               placeholder="Paste LinkedIn job post or company requirement here..."
//               className="w-full border border-gray-300 rounded p-3 h-32"
//             />

//             <button
//               onClick={analyzeCV}
//               disabled={loading}
//               className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
//             >
//               {loading ? "Analyzing..." : "Analyze CV"}
//             </button>
//           </div>

//           {/* Result Section */}
//           {matchScore !== null && (
//             <div className="bg-gray-50 border rounded-2xl p-6 mb-6">
//               <h2 className="text-xl font-semibold text-gray-800 mb-3">
//                 Result
//               </h2>
//               <p className="text-lg text-gray-700 mb-2">
//                 Match Score:{" "}
//                 <span
//                   className={`font-bold ${
//                     matchScore >= 75 ? "text-green-600" : "text-red-600"
//                   }`}
//                 >
//                   {matchScore}%
//                 </span>
//               </p>
//               <p className="text-gray-700 mb-4">{resultText}</p>

//               {matchScore >= 75 && (
//                 <div className="mt-4">
//                   <label className="block font-medium mb-2 text-gray-700">
//                     Enter Student Email to Send Registration Link
//                   </label>
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="student@example.com"
//                     className="w-full border border-gray-300 rounded p-2 mb-3"
//                   />
//                   <button
//                     onClick={handleSendEmail}
//                     disabled={sendingEmail}
//                     className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
//                   >
//                     {sendingEmail ? "Sending..." : "Send Registration Link"}
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </main>
//         <AdminFooter />
//       </div>
//     </div>
//   );
// };

// export default AdminCVFilter;


import { useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import AdminFooter from "../../components/AdminFooter";
import API from "../../utils/axiosInstance";

const AdminCVFilter: React.FC = () => {
  const [requirement, setRequirement] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchingRequirements, setMatchingRequirements] = useState<string[]>([]);
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState("");
  const [email, setEmail] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Reset previous result
      setMatchScore(null);
      setMatchingRequirements([]);
      setMissingRequirements([]);
      setResultText("");
    }
  };

  // Analyze CV
  const analyzeCV = async () => {
    if (!file || !requirement.trim()) {
      alert("Please upload a CV and enter the job requirement.");
      return;
    }

    setLoading(true);
    setMatchScore(null);
    setMatchingRequirements([]);
    setMissingRequirements([]);
    setResultText("");

    try {
      const formData = new FormData();
      formData.append("cv", file);
      formData.append("requirement", requirement);

      const res = await API.post("/admin/cv-filter", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const score = res.data.matchScore || 0;
      setMatchScore(score);
      setMatchingRequirements(res.data.matchingRequirements || []);
      setMissingRequirements(res.data.missingRequirements || []);
      setResultText(
        score >= 75
          ? "✅ This student is eligible for the internship."
          : "❌ This student is not eligible for the internship."
      );
    } catch (err: any) {
      console.error("CV Analysis Error:", err);
      setResultText(err.response?.data?.message || "⚠️ Failed to analyze CV.");
    } finally {
      setLoading(false);
    }
  };

  // Send registration email
  const handleSendEmail = async () => {
    if (!email.trim()) {
      alert("Please enter the student's email address.");
      return;
    }

    setSendingEmail(true);
    try {
      const res = await API.post("/admin/send-link", { email });
      alert(res.data.message);
      setEmail("");
    } catch (err: any) {
      console.error("Send Email Error:", err);
      alert(err.response?.data?.message || "Failed to send email.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="flex bg-[#F9FAFB] min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:ml-64">
        <main className="p-6 flex-grow max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold text-[#4F46E5] mb-6">
            CV Filter – Internship Eligibility

          </h1>

          {/* Upload & Requirement Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <label className="block font-medium mb-2 text-gray-700">
              Upload CV File (PDF, DOCX, TXT)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded p-2 mb-4"
            />

            <label className="block font-medium mb-2 text-gray-700">
              Job Requirement / Description
            </label>
            <textarea
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="Paste LinkedIn job post or company requirement here..."
              className="w-full border border-gray-300 rounded p-3 h-32"
            />

            <button
              onClick={analyzeCV}
              disabled={loading}
              className="mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
            >
              {loading ? "Analyzing..." : "Analyze CV"}
            </button>
          </div>

          {/* Result Section */}
          {matchScore !== null && (
            <div className="bg-gray-50 border rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Result
              </h2>
              <p className="text-lg text-gray-700 mb-2">
                Match Score:{" "}
                <span
                  className={`font-bold ${
                    matchScore >= 75 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {matchScore}%
                </span>
              </p>
              <p className="text-gray-700 mb-4">{resultText}</p>

              {/* Matching Requirements */}
              {matchingRequirements.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    ✅ Matching Requirements:
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {matchingRequirements.map((req, index) => (
                      <li key={index} className="text-gray-700">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing Requirements */}
              {missingRequirements.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    ❌ Missing Requirements:
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {missingRequirements.map((req, index) => (
                      <li key={index} className="text-gray-700">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matchScore >= 75 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <label className="block font-medium mb-2 text-gray-700">
                    Enter Student Email to Send Registration Link
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full border border-gray-300 rounded p-2 mb-3"
                  />
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white font-semibold px-6 py-2 rounded-xl shadow transition"
                  >
                    {sendingEmail ? "Sending..." : "Send Registration Link"}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
};

export default AdminCVFilter;
