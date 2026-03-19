import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const CandidateManagement = () => {
  const { creathonId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(`/api/creathons/${creathonId}/candidates`);
        if (!response.ok) throw new Error("Failed to fetch candidates");
        const data = await response.json();
        setCandidates(data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [creathonId]);

  const sendCandidateInfoToJury = async () => {
    try {
      const presentCandidates = candidates.filter(
        (c) => c.attendanceStatus === "present"
      );
      const response = await fetch(`/api/creathons/${creathonId}/notify-jury`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: presentCandidates }),
      });
      if (!response.ok) throw new Error("Notification failed");
      alert("Candidate information sent to jury successfully!");
    } catch (error) {
      console.error("Error notifying jury:", error);
    }
  };

  if (isLoading) return <div>Loading candidates...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Candidates</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Candidate List</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Attendance</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate._id} className="border">
                <td className="p-2 border">
                  {candidate.answers.find(
                    (a) => a.field.$oid === "6817a0cf259d1e8d72eb0a87"
                  )?.value || "N/A"}
                </td>
                <td className="p-2 border">
                  {candidate.answers.find(
                    (a) => a.field.$oid === "6817a0cf259d1e8d72eb0a85"
                  )?.value || "N/A"}
                </td>
                <td className="p-2 border">
                  {candidate.answers.find(
                    (a) => a.field.$oid === "6817a0cf259d1e8d72eb0a97"
                  )?.value || "N/A"}
                </td>
                <td className="p-2 border">{candidate.status}</td>
                <td className="p-2 border">{candidate.attendanceStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={sendCandidateInfoToJury}
        disabled={!candidates.some((c) => c.attendanceStatus === "present")}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Send Candidate Info to Jury
      </button>
    </div>
  );
};

export default CandidateManagement;
