import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

const MentorManagement = () => {
  const { creathonId } = useParams();
  const { register, handleSubmit, reset } = useForm();
  const [mentors, setMentors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Add new mentor to local state
      setMentors([...mentors, data]);
      reset();
    } catch (error) {
      console.error("Error adding mentor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitTeamList = async () => {
    try {
      const response = await fetch(`/api/creathons/${creathonId}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentors }),
      });
      if (!response.ok) throw new Error("Submission failed");
      alert("Mentor list submitted successfully!");
    } catch (error) {
      console.error("Error submitting team list:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Mentors</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">First Name</label>
            <input
              {...register("firstName", { required: true })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Last Name</label>
            <input
              {...register("lastName", { required: true })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Email</label>
            <input
              {...register("email", { required: true })}
              type="email"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Phone</label>
            <input
              {...register("phone")}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Specialization</label>
            <input
              {...register("specialization")}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Mentor
        </button>
      </form>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Mentor List</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Specialization</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mentors.map((mentor, index) => (
              <tr key={index} className="border">
                <td className="p-2 border">
                  {mentor.firstName} {mentor.lastName}
                </td>
                <td className="p-2 border">{mentor.email}</td>
                <td className="p-2 border">{mentor.phone}</td>
                <td className="p-2 border">{mentor.specialization}</td>
                <td className="p-2 border">
                  <button
                    onClick={() =>
                      setMentors(mentors.filter((_, i) => i !== index))
                    }
                    className="text-red-500"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={submitTeamList}
        disabled={mentors.length === 0}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Submit Mentor List
      </button>
    </div>
  );
};

export default MentorManagement;
