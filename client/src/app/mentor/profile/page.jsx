"use client";

import React, { useState, useEffect } from "react";
import {
  UploadCloud,
  User,
  Mail,
  BookOpen,
  Home,
  MapPin,
  Flag,
  Hash,
  Clock,
  AlertCircle,
  CheckCircle,
  Download,
  Trash2,
} from "lucide-react";
import { fetchCurrentUser } from "@/services/users/user";
import {
  createMentorProfile,
  getMentorProfile,
  updateMentorProfile,
  uploadMentorFiles,
  deleteMentorFile,
} from "@/services/mentor/mentor.services";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { toast } from "react-toastify";

const MentorProfile = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [files, setFiles] = useState({
    cv: null,
    idDocument: null,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    bio: "",
    street: "",
    city: "",
    country: "",
    postalCode: "",
    rib: "",
    yearsOfExperience: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userData = await fetchCurrentUser();
        setUser(userData);

        const profileResponse = await getMentorProfile();
        console.log("Profile response:", profileResponse);
        if (profileResponse.requiresProfileCreation) {
          return;
        }

        if (profileResponse.data) {
          setMentorData(profileResponse.data);
          const { personalInfo } = profileResponse.data;

          setFormData({
            fullName: personalInfo?.fullName || "",
            phone: personalInfo?.phone || "",
            email: personalInfo?.email || userData?.email || "",
            specialization: personalInfo?.specialization || "",
            bio: personalInfo?.bio || "",
            street: personalInfo?.address?.street || "",
            city: personalInfo?.address?.city || "",
            country: personalInfo?.address?.country || "",
            postalCode: personalInfo?.address?.postalCode || "",
            rib: personalInfo?.rib || "",
            yearsOfExperience: personalInfo?.yearsOfExperience || 0,
          });
        }
      } catch (err) {
        setError(err.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB

      if (file.size > MAX_SIZE) {
        setError(`${field.toUpperCase()} file exceeds 10MB limit`);
        return;
      }

      setFiles({
        ...files,
        [field]: file,
      });
      setError(null);
    }
  };

  const handleDeleteFile = async (field) => {
    try {
      setFileLoading(true);
      await deleteMentorFile(field);
      setMentorData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: null,
        },
      }));
      setSuccess(`${field.toUpperCase()} deleted successfully`);
      toast.success(`${field.toUpperCase()} deleted successfully`);
    } catch (err) {
      setError(err.message || `Failed to delete ${field}`);
    } finally {
      setFileLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Handle file uploads first if there are files to upload
      if (files.cv || files.idDocument) {
        setFileLoading(true);
        const uploadResponse = await uploadMentorFiles(files);
        setMentorData(uploadResponse);
        setFileLoading(false);
        toast.success("Files uploaded successfully");
        return;
      }

      // Prepare profile data
      const profileData = {
        personalInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          specialization: formData.specialization,
          bio: formData.bio,
          address: {
            street: formData.street,
            city: formData.city,
            country: formData.country,
            postalCode: formData.postalCode,
          },
          rib: formData.rib,
          yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        },
      };

      const response = mentorData
        ? await updateMentorProfile(profileData)
        : await createMentorProfile(profileData);

      setSuccess("Profile saved successfully!");
      setMentorData(response.data);
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
      setFileLoading(false);
    }
  };

  if (loading && !mentorData && !user) {
    return <Loader />;
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-tacir-lightgray min-h-screen">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white px-4 sm:px-6 py-4 sm:py-6 rounded-xl shadow-md border border-gray-100">
          {/* Header - Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-tacir-darkblue">
              Mentor Profile
            </h1>
            <span className="bg-tacir-lightblue text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 rounded-full w-fit">
              {mentorData ? "Profile Complete" : "Setup Required"}
            </span>
          </div>

          <div className="border-b border-gray-200 my-4 sm:my-6"></div>

          {/* Status Messages - Responsive */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 sm:gap-3 border border-red-100 text-sm sm:text-base">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-red-500" />
              <div className="break-words">{error}</div>
            </div>
          )}
          {success && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-2 sm:gap-3 border border-green-100 text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-green-500" />
              <div className="break-words">{success}</div>
            </div>
          )}

          {/* Main Content Grid - Fully Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-2 order-1">
              <div className="bg-tacir-lightgray p-4 sm:p-6 rounded-xl">
                <div className="flex flex-col items-center">
                  {/* Profile Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mb-3 sm:mb-4 bg-white border-4 border-tacir-lightblue flex items-center justify-center shadow-sm">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 sm:w-20 sm:h-20 text-tacir-darkgray" />
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex items-center gap-2 text-center">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-darkblue flex-shrink-0" />
                    <h2 className="text-lg sm:text-xl font-semibold text-tacir-darkblue break-words">
                      {formData.fullName || user?.name || "Name"}
                    </h2>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-tacir-darkgray mt-2 text-center">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-darkblue flex-shrink-0" />
                    <span className="text-sm sm:text-base break-all">
                      {formData?.email || "email@example.com"}
                    </span>
                  </div>

                  {/* Badge */}
                  <span className="bg-tacir-blue text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 rounded-full mt-3 sm:mt-4">
                    Mentor
                  </span>
                </div>

                {/* Documents Section */}
                <div className="mt-6 sm:mt-8">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-tacir-darkblue flex items-center gap-2">
                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    Documents
                  </h3>

                  {/* CV Upload */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium mb-2 text-tacir-darkblue">
                      CV
                    </label>
                    {mentorData?.personalInfo?.cv ? (
                      <div className="border border-gray-200 rounded-lg p-2 sm:p-3 bg-white">
                        <div className="flex items-start sm:items-center justify-between gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
                            <a
                              href={mentorData.personalInfo.cv.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-tacir-blue hover:underline flex items-center gap-1 text-sm break-all"
                            >
                              <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">
                                {mentorData.personalInfo.cv.originalName}
                              </span>
                            </a>
                            <span className="text-xs text-tacir-darkgray">
                              ({Math.round(mentorData.personalInfo.cv.size / 1024)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteFile("cv")}
                            disabled={fileLoading}
                            className="text-tacir-pink hover:text-tacir-pink/80 p-1 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          id="cv-upload"
                          type="file"
                          onChange={(e) => handleFileChange(e, "cv")}
                        />
                        <label htmlFor="cv-upload" className="block">
                          <div className="w-full flex items-center justify-between gap-2 border-2 border-dashed border-tacir-lightblue rounded-lg px-3 sm:px-4 py-2 sm:py-3 hover:bg-tacir-lightblue/10 cursor-pointer transition-colors">
                            <span className="text-sm sm:text-base text-tacir-darkgray truncate">
                              {files.cv?.name || "Upload CV"}
                            </span>
                            <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue flex-shrink-0" />
                          </div>
                        </label>
                        <p className="mt-1 text-xs text-tacir-darkgray">
                          PDF or Word documents (max 10MB)
                        </p>
                      </>
                    )}
                  </div>

                  {/* ID Document Upload */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-medium mb-2 text-tacir-darkblue">
                      ID Document
                    </label>
                    {mentorData?.personalInfo?.idDocument ? (
                      <div className="border border-gray-200 rounded-lg p-2 sm:p-3 bg-white">
                        <div className="flex items-start sm:items-center justify-between gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0 flex-1">
                            <a
                              href={mentorData.personalInfo.idDocument.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-tacir-blue hover:underline flex items-center gap-1 text-sm break-all"
                            >
                              <Download className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">
                                {mentorData.personalInfo.idDocument.originalName}
                              </span>
                            </a>
                            <span className="text-xs text-tacir-darkgray">
                              ({Math.round(mentorData.personalInfo.idDocument.size / 1024)} KB)
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteFile("idDocument")}
                            disabled={fileLoading}
                            className="text-tacir-pink hover:text-tacir-pink/80 p-1 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <input
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          id="id-upload"
                          type="file"
                          onChange={(e) => handleFileChange(e, "idDocument")}
                        />
                        <label htmlFor="id-upload" className="block">
                          <div className="w-full flex items-center justify-between gap-2 border-2 border-dashed border-tacir-lightblue rounded-lg px-3 sm:px-4 py-2 sm:py-3 hover:bg-tacir-lightblue/10 cursor-pointer transition-colors">
                            <span className="text-sm sm:text-base text-tacir-darkgray truncate">
                              {files.idDocument?.name || "Upload ID Document"}
                            </span>
                            <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue flex-shrink-0" />
                          </div>
                        </label>
                        <p className="mt-1 text-xs text-tacir-darkgray">
                          PDF, JPG, or PNG (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-3 order-2">
              <form onSubmit={handleSubmit}>
                <div className="bg-tacir-lightgray p-4 sm:p-6 rounded-xl">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-tacir-darkblue">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Full Name */}
                    <div className="shadow-md bg-white p-3 sm:p-4 rounded-lg">
                      <label className="block text-sm font-medium text-tacir-darkblue mb-2">
                        Full Name *
                      </label>
                      <input
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div className="shadow-md bg-white p-3 sm:p-4 rounded-lg">
                      <label className="block text-sm font-medium text-tacir-darkblue mb-2">
                        Phone *
                      </label>
                      <input
                        name="phone"
                        type="text"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                      />
                    </div>

                    {/* Specialization */}
                    <div className="sm:col-span-2 shadow-md bg-white p-3 sm:p-4 rounded-lg">
                      <label className="text-sm font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-tacir-blue flex-shrink-0" />
                        <span>Specialization *</span>
                      </label>
                      <input
                        name="specialization"
                        type="text"
                        value={formData.specialization}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                      />
                    </div>

                    {/* Bio */}
                    <div className="sm:col-span-2 shadow-md bg-white p-3 sm:p-4 rounded-lg">
                      <label className="block text-sm font-medium text-tacir-darkblue mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all resize-none"
                      />
                    </div>

                    {/* Address Section */}
                    <div className="sm:col-span-2 shadow-md bg-white p-3 sm:p-4 rounded-lg">
                      <h4 className="text-sm sm:text-base font-medium mb-3 sm:mb-4 flex items-center gap-2 text-tacir-darkblue">
                        <Home className="w-4 h-4 sm:w-5 sm:h-5 text-tacir-blue flex-shrink-0" />
                        <span>Address</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Street */}
                        <div>
                          <label className="text-sm font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue flex-shrink-0" />
                            <span>Street</span>
                          </label>
                          <input
                            name="street"
                            type="text"
                            value={formData.street}
                            onChange={handleInputChange}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-tacir-darkblue mb-2">
                            City
                          </label>
                          <input
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                          />
                        </div>

                        {/* Country */}
                        <div>
                          <label className="text-sm font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
                            <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue flex-shrink-0" />
                            <span>Country</span>
                          </label>
                          <input
                            name="country"
                            type="text"
                            value={formData.country}
                            onChange={handleInputChange}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                          />
                        </div>

                        {/* Postal Code */}
                        <div>
                          <label className="text-sm font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
                            <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue flex-shrink-0" />
                            <span>Postal Code</span>
                          </label>
                          <input
                            name="postalCode"
                            type="text"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* RIB */}
                    <div className="sm:col-span-2 bg-white rounded-lg shadow-md p-3 sm:p-4">
                      <label className="block text-sm font-medium text-tacir-darkblue mb-2">
                        RIB (Bank Info)
                      </label>
                      <input
                        name="rib"
                        type="text"
                        value={formData.rib}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                      />
                    </div>

                    {/* Years of Experience */}
                    <div className="sm:col-span-2 bg-white rounded-lg shadow-md p-3 sm:p-4">
                      <label className="text-sm font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-tacir-blue flex-shrink-0" />
                        <span>Years of Experience</span>
                      </label>
                      <input
                        name="yearsOfExperience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={handleInputChange}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tacir-lightblue focus:border-tacir-lightblue transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit Button - Responsive */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`mt-6 sm:mt-8 w-full sm:w-auto bg-tacir-blue hover:bg-tacir-darkblue text-white font-medium py-2.5 sm:py-3 px-6 sm:px-8 rounded-lg shadow-md transition-all duration-200 text-sm sm:text-base ${
                      loading
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:shadow-lg"
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      "Save Profile"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;