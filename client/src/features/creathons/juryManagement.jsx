import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

const JuryManagement = () => {
  const { creathonId } = useParams();
  const { register, handleSubmit, reset } = useForm();
  const [juryMembers, setJuryMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      setJuryMembers([...juryMembers, data]);
      reset();
    } catch (error) {
      console.error("Error adding jury member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitJuryList = async () => {
    try {
      const response = await fetch(`/api/creathons/${creathonId}/jury`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ juryMembers }),
      });
      if (!response.ok) throw new Error("Submission failed");
      alert("Jury list submitted successfully!");
    } catch (error) {
      console.error("Error submitting jury list:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Manage Jury Members</h2>

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
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Jury Member
        </button>
      </form>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Jury List</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {juryMembers.map((member, index) => (
              <tr key={index} className="border">
                <td className="p-2 border">
                  {member.firstName} {member.lastName}
                </td>
                <td className="p-2 border">{member.email}</td>
                <td className="p-2 border">
                  <button
                    onClick={() =>
                      setJuryMembers(juryMembers.filter((_, i) => i !== index))
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
        onClick={submitJuryList}
        disabled={juryMembers.length === 0}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Submit Jury List
      </button>
    </div>
  );
};

export default JuryManagement;
