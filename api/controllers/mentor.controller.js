import path from "path";
import fs from "fs";
import User from "../models/User.js";
import Mentor from "../models/Mentor.js";
import Creathon from "../models/Creathon.js";
import Form from "../models/form.js";
import { formatEvaluationText } from "../utils/formateEvaluationText.js";
import CandidatureSubmission from "../models/CandidatureSubmission.js";
import { verifyMentorInvitation } from "../middlewares/verifyMentorInvitation.js";
export const getCreathonSubmissionsForMentor = async (req, res) => {
  try {
    const userId = req.user?._id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * pageSize;

    // 1. Find mentor with creathon (populate region)
    const mentor = await Mentor.findOne({ user: userId })
      .populate({
        path: "creathon",
        populate: {
          path: "region",
          select: "name.fr name.en",
        },
      })
      .exec();

    if (!mentor) {
      return res
        .status(404)
        .json({ success: false, error: "Mentor not found" });
    }

    if (!mentor.creathon) {
      return res.status(400).json({
        success: false,
        error: "Mentor is not assigned to any creathon",
      });
    }

    const regionId = mentor.creathon.region?._id;
    if (!regionId) {
      return res.status(400).json({
        success: false,
        error: "Region not found for mentor's creathon",
      });
    }

    // 2. Find forms from the same region
    const formsInRegion = await Form.find({ region: regionId }).select("_id");
    const formIds = formsInRegion.map((form) => form._id);

    if (!formIds.length) {
      return res.status(404).json({
        success: false,
        error: "No forms found in this creathon's region",
      });
    }

    // 3. Fetch submissions
    const [submissions, total] = await Promise.all([
      CandidatureSubmission.find({
        form: { $in: formIds },
        attendanceStatus: "present",
      })
        .populate([
          { path: "form", select: "title fields startDate endDate region" },
          { path: "answers.field", select: "label type options" },
          { path: "files.field", select: "label type" },
          { path: "feedbacks.user", select: "firstName lastName email" },
          {
            path: "preselectionEvaluations.coordinatorId",
            select: "firstName lastName email",
          },
          {
            path: "mentorEvaluations.mentorId",
            select: "firstName lastName email",
          },
          {
            path: "mentorFeedbacks.mentorId",
            select: "firstName lastName email",
          },
          { path: "form.region", select: "name.fr name.en" },
        ])
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(pageSize),
      CandidatureSubmission.countDocuments({
        form: { $in: formIds },
        attendanceStatus: "present",
      }),
    ]);

    if (!submissions.length) {
      return res.status(404).json({
        success: false,
        error: "No submissions found for this creathon",
      });
    }

    // 4. Format response
    const formattedSubmissions = submissions.map((submission) => ({
      _id: submission._id,
      status: submission.status,
      attendanceStatus: submission.attendanceStatus || "pending",
      submittedAt: submission.createdAt,
      form: {
        title: submission.form?.title || "Untitled",
        period:
          submission.form?.startDate && submission.form?.endDate
            ? `${submission.form.startDate.toISOString()} - ${submission.form.endDate.toISOString()}`
            : "Dates not available",
      },
      answers: (submission.answers || []).map((answer) => ({
        field: {
          _id: answer.field?._id,
          label: answer.field?.label,
          type: answer.field?.type,
        },
        value: answer.value,
      })),
      files: (submission.files || []).map((file) => ({
        field: {
          _id: file.field?._id,
          label: file.field?.label,
          type: file.field?.type,
        },
        urls: file.urls,
      })),
      feedbacks: (submission.feedbacks || []).map((fb) => ({
        content: fb.content,
        date: fb.date,
        user:
          fb.user?.firstName || fb.user?.lastName
            ? `${fb.user.firstName || ""} ${fb.user.lastName || ""}`.trim()
            : "Utilisateur inconnu",
      })),
      preselectionEvaluations: (submission.preselectionEvaluations || []).map(
        (evaluation) => ({
          coordinator:
            evaluation.coordinatorId?.firstName ||
            evaluation.coordinatorId?.lastName
              ? `${evaluation.coordinatorId?.firstName || ""} ${
                  evaluation.coordinatorId?.lastName || ""
                }`.trim()
              : "Inconnu",
          email: evaluation.coordinatorId?.email || "Inconnu",
          evaluationText: evaluation?.evaluation
            ? formatEvaluationText(evaluation.evaluation)
            : "unknown", // or empty string, or null

          comment: evaluation.comment || "",
          date: evaluation.date,
        })
      ),
      mentorEvaluations: (submission.mentorEvaluations || []).map(
        (evaluation) => {
          const mentorName =
            evaluation.mentorId?.firstName || evaluation.mentorId?.lastName
              ? `${evaluation.mentorId.firstName || ""} ${
                  evaluation.mentorId.lastName || ""
                }`.trim()
              : "Mentor inconnu";

          return {
            mentor: mentorName,
            email: evaluation.mentorId?.email || "Inconnu",
            evaluationText: formatEvaluationText(evaluation.evaluation),
            comment: evaluation.comment || "",
            date: evaluation.date,
            mentorId: evaluation.mentorId?._id || evaluation.mentorId,
            mentorObj: evaluation.mentorId
              ? {
                  firstName: evaluation.mentorId.firstName,
                  lastName: evaluation.mentorId.lastName,
                  email: evaluation.mentorId.email,
                }
              : null,
          };
        }
      ),
      // In getCreathonSubmissionsForMentor
      mentorFeedbacks: (submission.mentorFeedbacks || []).map((fb) => {
        const mentorName =
          fb.mentorId?.firstName || fb.mentorId?.lastName
            ? `${fb.mentorId.firstName || ""} ${
                fb.mentorId.lastName || ""
              }`.trim()
            : "Mentor inconnu";

        return {
          content: fb.content,
          date: fb.date,
          mentor: mentorName, // Ensure this is always included
          mentorId: fb.mentorId?._id || fb.mentorId,
          mentorObj: fb.mentorId
            ? {
                firstName: fb.mentorId.firstName,
                lastName: fb.mentorId.lastName,
                email: fb.mentorId.email,
              }
            : null,
          // For consistency with evaluations
          user: mentorName, // Add this to match coordinator feedback structure
        };
      }),
    }));

    res.status(200).json({
      success: true,
      data: formattedSubmissions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      sort: {
        field: sortField,
        order: sortOrder === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching creathon submissions:", error);
    res.status(500).json({
      success: false,
      error: "Server error retrieving creathon submissions",
      details: error.message,
    });
  }
};

export const addMentorEvaluation = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { evaluation, comment = "" } = req.body;
    const userId = req.user._id; // Fixed: Directly access _id from req.user

    if (!evaluation) {
      return res.status(400).json({
        success: false,
        error: "Evaluation is required",
      });
    }

    const submission = await CandidatureSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: "Submission not found",
      });
    }

    // Check if mentor already evaluated this submission
    const existingEvaluationIndex = submission.mentorEvaluations.findIndex(
      (ev) => ev.mentorId.toString() === userId.toString()
    );

    if (existingEvaluationIndex !== -1) {
      // Update existing evaluation
      submission.mentorEvaluations[existingEvaluationIndex] = {
        mentorId: userId,
        evaluation,
        comment,
        date: new Date(),
      };
    } else {
      // Add new evaluation
      submission.mentorEvaluations.push({
        mentorId: userId,
        evaluation,
        comment,
        date: new Date(),
      });
    }

    await submission.save();

    // Populate the updated submission for response
    const updatedSubmission = await CandidatureSubmission.findById(
      submissionId
    ).populate({
      path: "mentorEvaluations.mentorId",
      select: "firstName lastName email",
    });

    const formattedEvaluations = updatedSubmission.mentorEvaluations.map(
      (ev) => ({
        mentor:
          `${ev.mentorId?.firstName || ""} ${
            ev.mentorId?.lastName || ""
          }`.trim() || "Inconnu",
        email: ev.mentorId?.email || "Inconnu",
        evaluationText: formatEvaluationText(ev.evaluation), // Fixed: Changed from eval.evaluation to ev.evaluation
        comment: ev.comment || "",
        date: ev.date,
        mentorId: ev.mentorId._id || ev.mentorId,
      })
    );

    res.status(200).json({
      success: true,
      data: formattedEvaluations,
      message: "Mentor evaluation added successfully",
    });
  } catch (error) {
    console.error("Error adding mentor evaluation:", error);
    res.status(500).json({
      success: false,
      error: "Server error adding mentor evaluation",
      details: error.message,
    });
  }
};

export const addMentorFeedback = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { content } = req.body;
    const userId = req.user._id; // Fixed: Directly access _id from req.user

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        error: "Feedback content is required",
      });
    }

    const submission = await CandidatureSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        error: "Submission not found",
      });
    }

    // Add new feedback
    submission.mentorFeedbacks.push({
      mentorId: userId,
      content: content.trim(),
      date: new Date(),
    });

    await submission.save();

    // Populate the updated submission for response
    const updatedSubmission = await CandidatureSubmission.findById(
      submissionId
    ).populate({
      path: "mentorFeedbacks.mentorId",
      select: "firstName lastName email",
    });

    const formattedFeedbacks = updatedSubmission.mentorFeedbacks.map((fb) => ({
      content: fb.content,
      date: fb.date,
      mentor:
        `${fb.mentorId?.firstName || ""} ${
          fb.mentorId?.lastName || ""
        }`.trim() || "Mentor inconnu",
      mentorId: fb.mentorId._id || fb.mentorId,
    }));

    res.status(200).json({
      success: true,
      data: formattedFeedbacks,
      message: "Mentor feedback added successfully",
    });
  } catch (error) {
    console.error("Error adding mentor feedback:", error);
    res.status(500).json({
      success: false,
      error: "Server error adding mentor feedback",
      details: error.message,
    });
  }
};

export const getMentorProfile = async (req, res) => {
  try {
    // 1. Get the COMPLETE raw document without any transformations
    const rawMentor = await Mentor.findOne({ user: req.user._id }).lean({
      getters: false,
      virtuals: false,
    }); // Disable all transformations

    if (!rawMentor) {
      return res.status(200).json({
        success: true,
        requiresProfileCreation: true,
        message: "Mentor profile not found. Please create your profile.",
      });
    }

    // 2. Get populated data separately
    const [user, creathon] = await Promise.all([
      User.findById(rawMentor.user)
        .select("firstName lastName email roles isConfirmed")
        .lean(),
      rawMentor.creathon
        ? Creathon.findById(rawMentor.creathon).lean()
        : Promise.resolve(null),
    ]);

    // 3. Construct the final response with guaranteed file inclusion
    const response = {
      ...rawMentor,
      user,
      creathon,
      personalInfo: {
        ...rawMentor.personalInfo,
        // These will definitely exist if they're in the database
        cv: rawMentor.personalInfo?.cv || null,
        idDocument: rawMentor.personalInfo?.idDocument || null,
      },
    };

    // 4. Final verification
    // console.log("Database File Verification:", {
    //   cvInDB: !!rawMentor.personalInfo?.cv,
    //   idInDB: !!rawMentor.personalInfo?.idDocument,
    //   cvFilename: rawMentor.personalInfo?.cv?.filename,
    //   idFilename: rawMentor.personalInfo?.idDocument?.filename,
    // });

    res.status(200).json({
      success: true,
      data: response,
      requiresProfileCompletion:
        rawMentor.accountStatus === "pending" ||
        !rawMentor.personalInfo?.fullName ||
        !rawMentor.personalInfo?.phone,
    });
  } catch (error) {
    console.error("Final getMentorProfile error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createMentorProfile = async (req, res) => {
  try {
    const { mentor } = req;
    const { personalInfo } = req.body;

    // Validate required fields
    const requiredFields = [
      "phone",
      "specialization",
      "address.street",
      "address.city",
      "address.country",
    ];
    const missingFields = requiredFields.filter((field) => {
      const parts = field.split(".");
      let value = personalInfo;
      for (const part of parts) {
        value = value[part];
        if (value === undefined) break;
      }
      return !value;
    });

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Update mentor profile
    const updatedMentor = await Mentor.findByIdAndUpdate(
      mentor._id,
      {
        personalInfo: {
          ...mentor.personalInfo, // Keep existing info
          ...personalInfo, // Add new info
        },
        status: "confirmed",
        respondedAt: new Date(),
        $unset: { invitationToken: 1, tokenExpires: 1 },
      },
      { new: true }
    );

    // Update user status if needed
    await User.findByIdAndUpdate(mentor.user, {
      isActive: true,
      $addToSet: { roles: "mentor" },
    });

    return res.status(200).json({
      success: true,
      data: updatedMentor,
      message: "Profile completed successfully",
    });
  } catch (error) {
    console.error("Error in createMentorProfile:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create profile",
    });
  }
};

export const updateMentorProfile = async (req, res) => {
  try {
    const { personalInfo } = req.body;
    const files = req.files;

    // Prepare the update object
    const updateData = {
      personalInfo: {
        ...personalInfo, // Parse the stringified personalInfo
      },
      accountStatus: "pending", // Reset to pending when profile is updated
    };

    // Handle file uploads if they exist
    if (files) {
      if (files.cv) {
        const cvFile = files.cv[0];
        updateData.personalInfo.cv = {
          filename: cvFile.filename,
          originalName: cvFile.originalname,
          path: `/uploads/mentor-documents/${cvFile.filename}`,
          url: `${process.env.BASE_URL}/uploads/mentor-documents/${cvFile.filename}`,
          size: cvFile.size,
          mimetype: cvFile.mimetype,
          uploadedAt: new Date(),
        };
      }

      if (files.idDocument) {
        const idFile = files.idDocument[0];
        updateData.personalInfo.idDocument = {
          filename: idFile.filename,
          originalName: idFile.originalname,
          path: `/uploads/mentor-documents/${idFile.filename}`,
          url: `${process.env.BASE_URL}/uploads/mentor-documents/${idFile.filename}`,
          size: idFile.size,
          mimetype: idFile.mimetype,
          uploadedAt: new Date(),
        };
      }
    }

    const mentor = await Mentor.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    // Check if required fields are completed
    const isProfileComplete =
      mentor.personalInfo.fullName &&
      mentor.personalInfo.phone &&
      mentor.personalInfo.specialization &&
      mentor.personalInfo.cv &&
      mentor.personalInfo.idDocument;

    res.status(200).json({
      success: true,
      data: mentor,
      isProfileComplete,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating mentor profile:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const uploadFiles = async (req, res) => {
  let filesToCleanup = [];

  try {
    console.log("=== UPLOAD FILES DEBUG START ===");
    console.log("Request files:", req.files);
    console.log("User ID:", req.user._id);

    // 1. Verify files were uploaded
    if (!req.files || (!req.files.cv && !req.files.idDocument)) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded",
      });
    }

    // Track files for cleanup
    if (req.files.cv) filesToCleanup.push(req.files.cv[0].path);
    if (req.files.idDocument) filesToCleanup.push(req.files.idDocument[0].path);

    // 2. Prepare update operations using $set
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const updateOperations = {};

    if (req.files.cv) {
      const cvFile = req.files.cv[0];
      console.log("Processing CV file:", cvFile.filename);

      updateOperations["personalInfo.cv"] = {
        filename: cvFile.filename,
        originalName: cvFile.originalname,
        path: `/uploads/mentor-documents/${cvFile.filename}`,
        url: `${baseUrl}/uploads/mentor-documents/${cvFile.filename}`,
        size: cvFile.size,
        mimetype: cvFile.mimetype,
        uploadedAt: new Date(),
      };
    }

    if (req.files.idDocument) {
      const idFile = req.files.idDocument[0];
      console.log("Processing ID document file:", idFile.filename);

      updateOperations["personalInfo.idDocument"] = {
        filename: idFile.filename,
        originalName: idFile.originalname,
        path: `/uploads/mentor-documents/${idFile.filename}`,
        url: `${baseUrl}/uploads/mentor-documents/${idFile.filename}`,
        size: idFile.size,
        mimetype: idFile.mimetype,
        uploadedAt: new Date(),
      };
    }

    console.log(
      "Update operations:",
      JSON.stringify(updateOperations, null, 2)
    );

    // 3. Use findOneAndUpdate with $set to force the update
    const updatedMentor = await Mentor.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateOperations },
      {
        new: true, // Return the updated document
        runValidators: true,
        upsert: false,
      }
    );

    if (!updatedMentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    console.log("✅ Document updated successfully");

    // 4. Double-check by fetching fresh from DB
    const verification = await Mentor.findById(updatedMentor._id).lean();
    console.log("🔍 DB Verification after update:");
    console.log(
      "- CV filename in DB:",
      verification.personalInfo?.cv?.filename
    );
    console.log(
      "- ID filename in DB:",
      verification.personalInfo?.idDocument?.filename
    );
    console.log(
      "- Full personalInfo:",
      JSON.stringify(verification.personalInfo, null, 2)
    );

    // 5. Verify the actual save worked
    const cvSaved = req.files.cv
      ? verification.personalInfo?.cv?.filename === req.files.cv[0].filename
      : true;

    const idSaved = req.files.idDocument
      ? verification.personalInfo?.idDocument?.filename ===
        req.files.idDocument[0].filename
      : true;

    if (!cvSaved || !idSaved) {
      console.error("❌ Verification failed!");
      console.error(
        "CV expected:",
        req.files.cv?.[0]?.filename,
        "Got:",
        verification.personalInfo?.cv?.filename
      );
      console.error(
        "ID expected:",
        req.files.idDocument?.[0]?.filename,
        "Got:",
        verification.personalInfo?.idDocument?.filename
      );
      throw new Error("File references not saved to database");
    }

    console.log("=== UPLOAD AND SAVE VERIFIED ===");

    res.status(200).json({
      success: true,
      data: updatedMentor,
      message: "Files uploaded and saved successfully",
      verification: {
        cvSaved: verification.personalInfo?.cv?.filename || null,
        idSaved: verification.personalInfo?.idDocument?.filename || null,
      },
    });

    // Clear cleanup list since upload was successful
    filesToCleanup = [];
  } catch (error) {
    console.error("❌ Upload failed:", error);
    console.error("Error stack:", error.stack);

    // Cleanup uploaded files on error
    for (const filePath of filesToCleanup) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log("🧹 Cleaned up file:", filePath);
        }
      } catch (cleanupError) {
        console.error("Failed to cleanup file:", filePath, cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || "File upload failed",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};
export const deleteFile = async (req, res) => {
  try {
    const { fileType } = req.params;
    const validFileTypes = ["cv", "idDocument"];

    if (!validFileTypes.includes(fileType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    const mentor = await Mentor.findOne({ user: req.user._id });
    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor profile not found",
      });
    }

    // Get file path before deleting
    const filePath = mentor.personalInfo?.[fileType]?.path;

    // Remove file reference from mentor
    const update = { $unset: { [`personalInfo.${fileType}`]: 1 } };
    const updatedMentor = await Mentor.findOneAndUpdate(
      { user: req.user._id },
      update,
      { new: true }
    );

    // Delete the actual file
    if (filePath) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedMentor,
      message: `${fileType.toUpperCase()} deleted successfully`,
    });
  } catch (error) {
    console.error("File deletion error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
// Get all mentors with user details
export const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find()
      .populate({
        path: "user",
        select: "firstName lastName email roles",
      })
      .select("accountStatus personalInfo");

    res.json(mentors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get mentor by user ID
export const getMentorByUserId = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ user: req.params.userId })
      .populate({
        path: "user",
        select: "firstName lastName email roles",
      })
      .select("status accountStatus personalInfo");

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.json(mentor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get mentors by creathon ID
export const getMentorsByCreathon = async (req, res) => {
  try {
    const mentors = await Mentor.find({ creathon: req.params.creathonId })
      .populate({
        path: "user",
        select: "firstName lastName email roles",
      })
      .select("status accountStatus personalInfo");

    res.json(mentors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
