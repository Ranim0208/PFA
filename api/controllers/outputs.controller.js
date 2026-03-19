// controllers/outputController.js
import TrainingOutput from "../models/TrainingOutput.js";
import ParticipantOutput from "../models/ParticipantOutput.js";
import Training from "../models/Training.js";
import AcceptedParticipant from "../models/AcceptedParticipant.js";
import User from "../models/User.js";
import fs from "fs";
import mongoose from "mongoose";
import { getParticipantsByTrainingId } from "../helpers/trainingOutput.js";
import { generateTrainingOutputEmail } from "../utils/outputEmailTemplate.js";
import { sendBulkEmails } from "../utils/sendBulkEmails.js";
// controllers/outputs.controller.js - Fixed Backend Controller
const cleanupFiles = (files = []) => {
  files.forEach((file) => {
    if (file.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Error deleting file ${file.path}:`, err);
      }
    }
  });
};

export const createTrainingOutput = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const {
      trainingId,
      title,
      description,
      dueDate,
      instructions,
      targetParticipants,
    } = req.body;

    // Validate required fields
    if (!trainingId || !title || !description || !dueDate) {
      if (req.files?.length) cleanupFiles(req.files);
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: trainingId, title, description, and dueDate are required",
      });
    }

    // Process targetParticipants - handle both string and array
    let participants = [];
    if (targetParticipants) {
      try {
        participants =
          typeof targetParticipants === "string"
            ? JSON.parse(targetParticipants)
            : Array.isArray(targetParticipants)
            ? targetParticipants
            : [];
      } catch (e) {
        console.error("Error parsing targetParticipants:", e);
        participants = [];
      }
    }

    // Process attachments
    const attachments =
      req.files?.map((file) => ({
        name: file.originalname,
        url: `/api/uploads/training-outputs/${file.filename}`,
        type: file.mimetype,
      })) || [];

    // Validate training exists
    const training = await Training.findById(trainingId);
    if (!training) {
      if (req.files?.length) cleanupFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Training not found",
      });
    }

    // Create the training output with proper data structure
    const outputData = {
      training: trainingId,
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate),
      instructions: instructions?.trim() || "",
      targetParticipants: participants, // Array of ObjectIds
      attachments: attachments,
      createdBy: req.user._id,
    };

    const newOutput = new TrainingOutput(outputData);
    const savedOutput = await newOutput.save();

    // Populate the response
    await savedOutput.populate([
      {
        path: "training",
        select: "title type startDate endDate",
      },
      {
        path: "createdBy",
        select: "firstName lastName email",
      },
      {
        path: "targetParticipants",
        select: "user",
        populate: {
          path: "user",
          select: "name email firstName lastName",
        },
      },
    ]);

    // Prepare email sending (don't await to avoid delaying the response)
    try {
      let participantsToNotify = [];

      if (participants.length > 0) {
        // Get specific participants
        const participantDocs = await AcceptedParticipant.find({
          _id: { $in: participants },
        }).populate("user", "firstName lastName email");
        participantsToNotify = participantDocs.map((p) => p.user);
      } else {
        // Get all participants for this training
        const allParticipants = await getParticipantsByTrainingId(trainingId);
        participantsToNotify = allParticipants.map((p) => p.user);
      }

      // Prepare emails
      const emails = participantsToNotify.map((user) =>
        generateTrainingOutputEmail(user, savedOutput, training)
      );

      // Send emails in background
      if (emails.length > 0) {
        sendBulkEmails(emails)
          .then((results) => {
            const successful = results.filter(
              (r) => r.status === "sent"
            ).length;
            console.log(
              `Sent ${successful}/${emails.length} notification emails`
            );
          })
          .catch((err) => {
            console.error("Error sending notification emails:", err);
          });
      }
    } catch (emailError) {
      console.error("Error preparing notification emails:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Training output created successfully",
      data: savedOutput,
    });
  } catch (error) {
    // Cleanup uploaded files on error
    if (req.files?.length) cleanupFiles(req.files);

    console.error("Error creating training output:", error);

    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errorMessages,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid data format",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all outputs for a training (Both mentor and participants)
// Backend: getTrainingOutputs function - Fixed for mentor submissions
// Backend: getTrainingOutputs function - Fixed for mentor submissions
export const getTrainingOutputs = async (req, res) => {
  try {
    const { trainingId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.roles[0];

    let query = { training: trainingId };

    // If user is a mentor, only show outputs they created
    if (userRole === "mentor") {
      query.createdBy = userId;
    }
    // If user is a participant, show outputs assigned to them or all participants
    else if (userRole === "projectHolder") {
      const participant = await AcceptedParticipant.findOne({ user: userId });

      if (!participant) {
        return res.status(403).json({ message: "Participant not found" });
      }

      query.$or = [
        { targetParticipants: { $size: 0 } },
        { targetParticipants: participant._id },
      ];
    }

    // Get the training outputs
    const outputs = await TrainingOutput.find(query)
      .sort({ dueDate: 1 })
      .populate([
        {
          path: "createdBy",
          select: "firstName lastName email",
        },
        {
          path: "targetParticipants",
          select: "user region form",
          populate: [
            {
              path: "user",
              select: "firstName lastName email",
            },
            {
              path: "region",
              select: "name",
            },
            {
              path: "form",
              select: "title",
            },
          ],
        },
      ])
      .lean();

    // If mentor, get all participant submissions for their outputs
    if (userRole === "mentor") {
      const outputIds = outputs.map((output) => output._id);

      // Get all participant submissions for these outputs
      const participantSubmissions = await ParticipantOutput.find({
        output: { $in: outputIds },
      })
        .populate([
          {
            path: "participant",
            select: "user region form",
            populate: [
              {
                path: "user",
                select: "firstName lastName email",
              },
              {
                path: "region",
                select: "name",
              },
              {
                path: "form",
                select: "title",
              },
            ],
          },
          {
            path: "evaluatedBy",
            select: "firstName lastName email",
          },
          {
            path: "comments.user",
            select: "firstName lastName email",
          },
        ])
        .lean();

      // Group submissions by output
      const submissionsByOutput = participantSubmissions.reduce(
        (acc, submission) => {
          const outputId = submission.output.toString();
          if (!acc[outputId]) {
            acc[outputId] = [];
          }
          acc[outputId].push(submission);
          return acc;
        },
        {}
      );

      // Add submissions to each output
      const outputsWithSubmissions = outputs.map((output) => {
        const outputSubmissions =
          submissionsByOutput[output._id.toString()] || [];

        // Calculate submission statistics for this output
        const totalExpected = output.targetParticipants?.length || 0;
        const totalSubmitted = outputSubmissions.filter(
          (s) => s.submitted
        ).length;
        const totalApproved = outputSubmissions.filter(
          (s) => s.approved
        ).length;
        const totalPending = outputSubmissions.filter(
          (s) => s.submitted && !s.approved
        ).length;

        // Check if output is overdue
        const isOverdue = new Date(output.dueDate) < new Date();

        return {
          ...output,
          participantSubmissions: outputSubmissions,
          submissionStats: {
            totalExpected,
            totalSubmitted,
            totalApproved,
            totalPending,
            completionRate:
              totalExpected > 0
                ? Math.round((totalSubmitted / totalExpected) * 100)
                : 0,
            approvalRate:
              totalSubmitted > 0
                ? Math.round((totalApproved / totalSubmitted) * 100)
                : 0,
          },
          isOverdue,
          daysUntilDue: Math.ceil(
            (new Date(output.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
          ),
        };
      });

      // Calculate overall statistics
      const overallStats = {
        totalOutputs: outputs.length,
        totalSubmissions: participantSubmissions.filter((s) => s.submitted)
          .length,
        totalApproved: participantSubmissions.filter((s) => s.approved).length,
        totalPending: participantSubmissions.filter(
          (s) => s.submitted && !s.approved
        ).length,
        overdueOutputs: outputsWithSubmissions.filter((o) => o.isOverdue)
          .length,
        completedOutputs: outputsWithSubmissions.filter(
          (o) =>
            o.submissionStats.totalExpected > 0 &&
            o.submissionStats.totalApproved === o.submissionStats.totalExpected
        ).length,
      };

      return res.json({
        success: true,
        data: outputsWithSubmissions,
        stats: overallStats,
      });
    }

    // For participants, return outputs without submission details
    res.json({
      success: true,
      data: outputs,
      stats: {
        totalOutputs: outputs.length,
      },
    });
  } catch (error) {
    console.error("Error getting training outputs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Additional endpoint for mentor to get all submissions across all their outputs
export const getMentorSubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      search,
      sortBy = "submissionDate",
      sortOrder = "desc",
      trainingId,
    } = req.query;

    // Build query for mentor's outputs
    let outputQuery = { createdBy: userId };

    // Filter by training if specified
    if (trainingId && trainingId !== "all") {
      outputQuery.training = trainingId;
    }

    // Get outputs created by this mentor (optionally filtered by training)
    const mentorOutputs = await TrainingOutput.find(outputQuery)
      .select("_id title training")
      .populate("training", "title")
      .lean();

    const outputIds = mentorOutputs.map((output) => output._id);

    // Build query for submissions
    let submissionQuery = {
      output: { $in: outputIds },
    };

    // Filter by status if provided
    if (status && status !== "all") {
      switch (status) {
        case "submitted":
          submissionQuery.submitted = true;
          submissionQuery.approved = false;
          break;
        case "approved":
          submissionQuery.approved = true;
          break;
        case "draft":
          submissionQuery.submitted = false;
          break;
      }
    }

    // Get submissions with all necessary data
    let submissionsQuery = ParticipantOutput.find(submissionQuery).populate([
      {
        path: "output",
        select: "title description dueDate training",
        populate: {
          path: "training",
          select: "title type",
        },
      },
      {
        path: "participant",
        select: "user region form",
        populate: [
          {
            path: "user",
            select: "firstName lastName email",
          },
          {
            path: "region",
            select: "name",
          },
          {
            path: "form",
            select: "title",
          },
        ],
      },
      {
        path: "evaluatedBy",
        select: "firstName lastName email",
      },
      {
        path: "comments.user",
        select: "firstName lastName email",
      },
    ]);

    // Apply search if provided
    if (search) {
      // Note: For complex search across populated fields, you might want to do this after the query
      // For now, we'll get all and filter in memory (not ideal for large datasets)
    }

    // Apply sorting
    const sortField =
      sortBy === "participant" ? "participant.user.firstName" : sortBy;
    submissionsQuery = submissionsQuery.sort({
      [sortField]: sortOrder === "asc" ? 1 : -1,
    });

    let submissions = await submissionsQuery.lean();

    // Apply search filter if provided (in-memory filtering)
    if (search) {
      const searchLower = search.toLowerCase();
      submissions = submissions.filter(
        (submission) =>
          submission.output?.title?.toLowerCase().includes(searchLower) ||
          submission.participant?.user?.firstName
            ?.toLowerCase()
            .includes(searchLower) ||
          submission.participant?.user?.lastName
            ?.toLowerCase()
            .includes(searchLower) ||
          submission.participant?.user?.email
            ?.toLowerCase()
            .includes(searchLower)
      );
    }

    // Add computed fields
    submissions = submissions.map((submission) => ({
      ...submission,
      status: submission.approved
        ? "approved"
        : submission.submitted
        ? "submitted"
        : "draft",
      isOverdue:
        new Date(submission.output.dueDate) < new Date() &&
        !submission.approved,
      daysUntilDue: Math.ceil(
        (new Date(submission.output.dueDate) - new Date()) /
          (1000 * 60 * 60 * 24)
      ),
    }));

    // Calculate statistics
    const stats = {
      total: submissions.length,
      submitted: submissions.filter((s) => s.submitted && !s.approved).length,
      approved: submissions.filter((s) => s.approved).length,
      draft: submissions.filter((s) => !s.submitted).length,
      overdue: submissions.filter((s) => s.isOverdue).length,
    };

    res.json({
      success: true,
      data: submissions,
      stats,
    });
  } catch (error) {
    console.error("Error getting mentor submissions:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Endpoint specifically for getting mentor submissions by training ID
export const getMentorSubmissionsByTraining = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trainingId } = req.params;
    const {
      status,
      search,
      sortBy = "submissionDate",
      sortOrder = "desc",
    } = req.query;

    // Get outputs created by this mentor for the specific training
    const mentorOutputs = await TrainingOutput.find({
      createdBy: userId,
      training: trainingId,
    })
      .select("_id title training")
      .populate("training", "title")
      .lean();

    if (mentorOutputs.length === 0) {
      return res.json({
        success: true,
        data: [],
        stats: {
          total: 0,
          submitted: 0,
          approved: 0,
          draft: 0,
          overdue: 0,
        },
        message: "No outputs found for this training",
      });
    }

    const outputIds = mentorOutputs.map((output) => output._id);

    // Build query for submissions
    let submissionQuery = {
      output: { $in: outputIds },
    };

    // Filter by status if provided
    if (status && status !== "all") {
      switch (status) {
        case "submitted":
          submissionQuery.submitted = true;
          submissionQuery.approved = false;
          break;
        case "approved":
          submissionQuery.approved = true;
          break;
        case "draft":
          submissionQuery.submitted = false;
          break;
      }
    }

    // Get submissions with all necessary data including comments
    let submissionsQuery = ParticipantOutput.find(submissionQuery)
      .populate([
        {
          path: "output",
          select: "title description dueDate training instructions",
          populate: {
            path: "training",
            select: "title type",
          },
        },
        {
          path: "participant",
          select: "user region form",
          populate: [
            {
              path: "user",
              select: "firstName lastName email",
            },
            {
              path: "region",
              select: "name",
            },
            {
              path: "form",
              select: "title",
            },
          ],
        },
        {
          path: "evaluatedBy",
          select: "firstName lastName email",
        },
      ])
      .populate("comments.user", "firstName lastName email");
    // Apply sorting
    const sortField =
      sortBy === "participant" ? "participant.user.firstName" : sortBy;
    submissionsQuery = submissionsQuery.sort({
      [sortField]: sortOrder === "asc" ? 1 : -1,
    });

    let submissions = await submissionsQuery.lean();

    // Apply search filter if provided (in-memory filtering)
    if (search) {
      const searchLower = search.toLowerCase();
      submissions = submissions.filter(
        (submission) =>
          submission.output?.title?.toLowerCase().includes(searchLower) ||
          submission.participant?.user?.firstName
            ?.toLowerCase()
            .includes(searchLower) ||
          submission.participant?.user?.lastName
            ?.toLowerCase()
            .includes(searchLower) ||
          submission.participant?.user?.email
            ?.toLowerCase()
            .includes(searchLower) ||
          submission.feedback?.toLowerCase().includes(searchLower)
      );
    }

    // Add computed fields and enhance attachment URLs
    submissions = submissions.map((submission) => ({
      ...submission,
      status: submission.approved
        ? "approved"
        : submission.submitted
        ? "submitted"
        : "draft",
      isOverdue:
        new Date(submission.output.dueDate) < new Date() &&
        !submission.approved,
      daysUntilDue: Math.ceil(
        (new Date(submission.output.dueDate) - new Date()) /
          (1000 * 60 * 60 * 24)
      ),
      // Enhance attachment URLs to be complete
      attachments:
        submission.attachments?.map((attachment) => ({
          ...attachment,
          url: attachment.url.startsWith("http")
            ? attachment.url
            : attachment.url.startsWith("/api/")
            ? `${process.env.BASE_URL || "https://incubation.tacir.tn"}${
                attachment.url
              }`
            : `${
                process.env.BASE_URL || "https://incubation.tacir.tn"
              }/api/uploads${attachment.url.replace("/uploads", "")}`,
        })) || [],
      // Add comment count for quick reference
      commentCount: submission.comments?.length || 0,
      // Add latest activity timestamp
      lastActivity:
        submission.comments?.length > 0
          ? new Date(
              Math.max(...submission.comments.map((c) => new Date(c.createdAt)))
            )
          : submission.evaluatedAt
          ? new Date(submission.evaluatedAt)
          : submission.submissionDate
          ? new Date(submission.submissionDate)
          : new Date(submission.updatedAt),
    }));

    // Calculate statistics
    const stats = {
      total: submissions.length,
      submitted: submissions.filter((s) => s.submitted && !s.approved).length,
      approved: submissions.filter((s) => s.approved).length,
      draft: submissions.filter((s) => !s.submitted).length,
      overdue: submissions.filter((s) => s.isOverdue).length,
      withComments: submissions.filter((s) => s.commentCount > 0).length,
      withAttachments: submissions.filter((s) => s.attachments.length > 0)
        .length,
    };
    console.log("submissions", submissions);
    res.json({
      success: true,
      data: submissions,
      stats,
      training: mentorOutputs[0]?.training || null,
    });
  } catch (error) {
    console.error("Error getting mentor submissions by training:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// New endpoint to add comments to submissions
export const addOutputComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantOutputId } = req.params;
    const { comment } = req.body;

    if (
      !comment ||
      typeof comment !== "string" ||
      comment.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
        error: "VALIDATION_ERROR",
        errors: ["Comment text is required"],
      });
    }

    const submission = await ParticipantOutput.findById(participantOutputId)
      .populate({
        path: "output",
        select: "createdBy",
      })
      .populate({
        path: "participant",
        select: "user",
        populate: {
          path: "user",
          select: "_id",
        },
      });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
        error: "NOT_FOUND",
      });
    }

    // Verify user permissions
    const isMentor = submission.output.createdBy.toString() === userId;
    const isParticipant =
      submission.participant?.user?._id.toString() === userId;

    if (!isMentor && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to comment on this submission",
        error: "UNAUTHORIZED",
      });
    }

    const newComment = {
      user: userId,
      role: isMentor ? "mentor" : "participant",
      comment: comment.trim(),
      createdAt: new Date(),
    };

    submission.comments.push(newComment);
    await submission.save();

    // Populate the user details for the response
    const populatedSubmission = await ParticipantOutput.populate(submission, {
      path: "comments.user",
      select: "firstName lastName",
    });

    const addedComment =
      populatedSubmission.comments[populatedSubmission.comments.length - 1];

    return res.status(201).json({
      success: true,
      data: addedComment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Server error adding comment:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "SERVER_ERROR",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Enhanced endpoint to get full submission details
export const getSubmissionDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { submissionId } = req.params;

    const submission = await ParticipantOutput.findById(submissionId)
      .populate([
        {
          path: "output",
          select: "title description dueDate instructions createdBy",
          populate: {
            path: "createdBy",
            select: "firstName lastName email",
          },
        },
        {
          path: "participant",
          select: "user",
          populate: {
            path: "user",
            select: "firstName lastName email",
          },
        },
        {
          path: "evaluatedBy",
          select: "firstName lastName email",
        },
        {
          path: "comments.user",
          select: "firstName lastName email",
        },
      ])
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Check permissions
    const isMentor = submission.output.createdBy._id.toString() === userId;
    const isParticipant = submission.participant.user._id.toString() === userId;

    if (!isMentor && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this submission",
      });
    }

    // Enhance attachment URLs
    submission.attachments =
      submission.attachments?.map((attachment) => ({
        ...attachment,
        url: attachment.url.startsWith("http")
          ? attachment.url
          : attachment.url.startsWith("/api/")
          ? `${process.env.BASE_URL || "https://incubation.tacir.tn"}${
              attachment.url
            }`
          : `${
              process.env.BASE_URL || "https://incubation.tacir.tn"
            }/api/uploads${attachment.url.replace("/uploads", "")}`,
      })) || [];

    // Add computed fields
    submission.status = submission.approved
      ? "approved"
      : submission.submitted
      ? "submitted"
      : "draft";

    submission.isOverdue =
      new Date(submission.output.dueDate) < new Date() && !submission.approved;

    submission.userRole = isMentor ? "mentor" : "participant";

    res.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error("Error getting submission details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all outputs for a participant across all their trainings
export const getParticipantOutputs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { trainingId, status, search } = req.query;

    // Find all participant records for this user
    const participantRecords = await AcceptedParticipant.find({ user: userId })
      .populate("region", "name _id")
      .populate("form", "title _id")
      .lean();

    if (!participantRecords || participantRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No participant records found for this user",
      });
    }

    // Get all participant IDs for this user
    const participantIds = participantRecords.map((p) => p._id);

    // Build query for training outputs
    let query = {
      $or: [
        { targetParticipants: { $size: 0 } }, // Outputs for all participants
        { targetParticipants: { $in: participantIds } }, // Outputs specifically for any of this user's participant records
      ],
    };

    // Add training filter if needed (you might need to implement this based on your training-participant relationship)
    if (trainingId && trainingId !== "all") {
      query.training = trainingId;
    }

    // Add search functionality
    if (search) {
      const searchConditions = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };

      if (query.$and) {
        query.$and.push(searchConditions);
      } else {
        query.$and = [searchConditions];
      }
    }

    // Get training outputs with necessary population
    const outputs = await TrainingOutput.find(query)
      .populate("createdBy", "firstName lastName email")
      .populate("targetParticipants", "user region form")
      .sort({ dueDate: 1 })
      .lean();

    // Get all output IDs
    const outputIds = outputs.map((o) => o._id);

    // Get all submissions for these outputs from any of the user's participant records
    const participantSubmissions = await ParticipantOutput.find({
      output: { $in: outputIds },
      participant: { $in: participantIds }, // Now using correct participant IDs
    })
      .populate("evaluatedBy", "firstName lastName email")
      .populate("comments.user", "firstName lastName email")
      .lean();

    // Create a map for quick lookup (outputId -> submission)
    const submissionMap = new Map();
    participantSubmissions.forEach((sub) => {
      submissionMap.set(sub.output.toString(), sub);
    });

    // Combine outputs with submission status and additional info
    const outputsWithSubmissions = outputs.map((output) => {
      const submission = submissionMap.get(output._id.toString());
      const daysUntilDue = Math.ceil(
        (new Date(output.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      // Determine which participant record this output is assigned to
      let assignedParticipantRecord = null;
      if (output.targetParticipants && output.targetParticipants.length > 0) {
        // Find the intersection between output's targetParticipants and user's participantIds
        const assignedParticipant = output.targetParticipants.find((targetP) =>
          participantIds.some(
            (pid) => pid.toString() === targetP._id.toString()
          )
        );

        if (assignedParticipant) {
          assignedParticipantRecord = participantRecords.find(
            (p) => p._id.toString() === assignedParticipant._id.toString()
          );
        }
      }

      // Determine status based on submission
      let outputStatus = "not_started";
      if (submission) {
        if (submission.approved) {
          outputStatus = "approved";
        } else if (submission.submitted) {
          outputStatus = "submitted";
        } else {
          outputStatus = "draft";
        }
      }

      return {
        ...output,
        submission: submission || null,
        status: outputStatus,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
        assignedParticipant: assignedParticipantRecord
          ? {
              _id: assignedParticipantRecord._id,
              region: assignedParticipantRecord.region,
              form: assignedParticipantRecord.form,
            }
          : null,
      };
    });

    // Filter by status if specified
    let filteredOutputs = outputsWithSubmissions;
    if (status && status !== "all") {
      filteredOutputs = outputsWithSubmissions.filter(
        (output) => output.status === status
      );
    }

    // Calculate statistics - now should work correctly
    const stats = {
      total: outputsWithSubmissions.length,
      notStarted: outputsWithSubmissions.filter(
        (o) => o.status === "not_started"
      ).length,
      draft: outputsWithSubmissions.filter((o) => o.status === "draft").length,
      submitted: outputsWithSubmissions.filter((o) => o.status === "submitted")
        .length,
      approved: outputsWithSubmissions.filter((o) => o.status === "approved")
        .length,
      overdue: outputsWithSubmissions.filter(
        (o) => o.isOverdue && o.status !== "approved"
      ).length,
    };

    res.json({
      success: true,
      data: filteredOutputs,
      stats,
      participant: {
        records: participantRecords.map((p) => ({
          _id: p._id,
          user: p.user,
          region: p.region,
          form: p.form,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting participant outputs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Optional: Add a helper function to get participant ID from user ID
export const getParticipantIdFromUserId = async (userId) => {
  const participant = await AcceptedParticipant.findOne({ user: userId });
  return participant ? participant._id : null;
};

// Get specific output details for participant
export const getParticipantOutputDetails = async (req, res) => {
  try {
    const { outputId } = req.params;
    const userId = req.user.id;

    // Find participant record
    const participant = await AcceptedParticipant.findOne({ user: userId });
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant record not found",
      });
    }

    // Get the training output
    const output = await TrainingOutput.findById(outputId)
      .populate("training", "title type startDate endDate")
      .populate("createdBy", "firstName lastName email")
      .populate({
        path: "targetParticipants",
        select: "user",
        populate: {
          path: "user",
          select: "firstName lastName email",
        },
      })
      .lean();

    if (!output) {
      return res.status(404).json({
        success: false,
        message: "Output not found",
      });
    }

    // Check if participant has access to this output
    const hasAccess =
      output.targetParticipants.length === 0 || // For all participants
      output.targetParticipants.some(
        (p) => p._id.toString() === participant._id.toString()
      );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this output",
      });
    }

    // Get participant's submission
    const submission = await ParticipantOutput.findOne({
      output: outputId,
      participant: participant._id,
    })
      .populate("evaluatedBy", "firstName lastName email")
      .populate("comments.user", "firstName lastName email")
      .lean();

    // Calculate time information
    const daysUntilDue = Math.ceil(
      (new Date(output.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      success: true,
      data: {
        ...output,
        submission: submission || null,
        daysUntilDue,
        isOverdue: daysUntilDue < 0,
        canSubmit: daysUntilDue >= 0 || !submission?.approved, // Can resubmit if not approved and overdue
      },
    });
  } catch (error) {
    console.error("Error getting output details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update participant submission (for resubmissions)
export const updateParticipantSubmission = async (req, res) => {
  try {
    const { outputId } = req.params;
    const { comment } = req.body;
    const files = req.files || [];
    const userId = req.user.id;

    // Find participant record
    const participant = await AcceptedParticipant.findOne({ user: userId });
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: "Participant record not found",
      });
    }

    // Check if output exists and participant has access
    const output = await TrainingOutput.findOne({
      _id: outputId,
      $or: [
        { targetParticipants: { $size: 0 } },
        { targetParticipants: participant._id },
      ],
    });

    if (!output) {
      return res.status(404).json({
        success: false,
        message: "Output not found or not accessible",
      });
    }

    // Process attachments
    const attachments = files.map((file) => ({
      name: file.originalname,
      url: `/api/uploads/participant-submissions/${file.filename}`,
      type: file.mimetype,
      size: file.size,
    }));

    // Update the submission
    const updatedSubmission = await ParticipantOutput.findOneAndUpdate(
      { output: outputId, participant: participant._id },
      {
        submitted: true,
        submissionDate: new Date(),
        attachments,
        comment: comment || "",
        // Clear previous evaluation when resubmitting
        $unset: {
          feedback: 1,
          evaluatedBy: 1,
          evaluatedAt: 1,
          approved: 1,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    )
      .populate("participant", "user")
      .populate({
        path: "participant",
        populate: {
          path: "user",
          select: "firstName lastName email",
        },
      });

    res.json({
      success: true,
      message: "Submission updated successfully",
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Error updating participant submission:", error);

    // Clean up uploaded files on error
    if (req.files?.length) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// controllers/outputController.js
// Fixed submitParticipantOutput function
export const submitParticipantOutput = async (req, res) => {
  try {
    const { outputId } = req.params;
    const userId = req.user.id;
    const { notes } = req.body;
    const files = req.uploadedFiles || [];

    // Find participant record
    const participantRecord = await AcceptedParticipant.findOne({
      user: userId,
    });

    if (!participantRecord) {
      return res.status(404).json({
        success: false,
        message: "No participant record found",
      });
    }

    const submissionData = {
      participant: participantRecord._id,
      output: outputId,
      submitted: true,
      submissionDate: new Date(),
      attachments: files.map((file) => ({
        name: file.originalName,
        type: file.mimetype,
        size: file.size,
        url: `/api/uploads/participant-submissions/${file.fileName}`,
      })),
      comments: [], // Initialize empty array
    };

    // Add notes as first comment if provided
    if (notes && notes.trim()) {
      submissionData.comments.push({
        user: userId,
        role: "participant",
        comment: notes.trim(),
        createdAt: new Date(),
      });
    }

    const submission = await ParticipantOutput.findOneAndUpdate(
      { participant: participantRecord._id, output: outputId },
      submissionData,
      { new: true, upsert: true }
    ).populate([
      {
        path: "participant",
        populate: { path: "user", select: "firstName lastName email" },
      },
      {
        path: "comments.user",
        select: "firstName lastName",
      },
    ]);

    res.status(200).json({
      success: true,
      data: submission,
      message: "Submission successful",
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Submission failed",
    });
  }
};
// Evaluate participant output (Mentor)
export const evaluateParticipantOutput = async (req, res) => {
  try {
    const { participantOutputId } = req.params;
    const { feedback, approved } = req.body;
    const mentorId = req.user.id;

    // Validate input
    if (!participantOutputId || typeof approved === "undefined") {
      return res.status(400).json({
        success: false,
        message: "Participant output ID and approval status are required",
      });
    }

    if (!feedback || feedback.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: "Feedback is required and should be at least 20 characters",
      });
    }

    const participantOutput = await ParticipantOutput.findByIdAndUpdate(
      participantOutputId,
      {
        approved,
        feedback: feedback.trim(),
        evaluatedBy: mentorId,
        evaluatedAt: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate("participant", "name email")
      .populate("evaluatedBy", "name email");

    if (!participantOutput) {
      return res.status(404).json({
        success: false,
        message: "Participant output not found",
      });
    }

    // TODO: Add notification to participant here

    res.json({
      success: true,
      message: `Output ${approved ? "approved" : "rejected"} successfully`,
      data: participantOutput,
    });
  } catch (error) {
    console.error("Error evaluating participant output:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during evaluation",
    });
  }
};

// Delete training output (Mentor)
export const deleteTrainingOutput = async (req, res) => {
  try {
    const { outputId } = req.params;

    // Delete the training output and all associated participant outputs
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await TrainingOutput.findByIdAndDelete(outputId).session(session);
      await ParticipantOutput.deleteMany({ output: outputId }).session(session);

      await session.commitTransaction();
      res.json({ message: "Output deleted successfully" });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Error deleting output:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Evaluate participant output (Mentor)
// export const evaluateParticipantOutput = async (req, res) => {
//   try {
//     const { participantOutputId, feedback, approved } = req.body;
//     const mentorId = req.user._id;

//     // Validate input
//     if (!participantOutputId || typeof approved === "undefined") {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const participantOutput = await ParticipantOutput.findByIdAndUpdate(
//       participantOutputId,
//       {
//         approved,
//         feedback,
//         evaluatedBy: mentorId,
//         evaluatedAt: new Date(),
//       },
//       { new: true }
//     )
//       .populate("participant", "name email")
//       .populate("evaluatedBy", "name email");

//     if (!participantOutput) {
//       return res.status(404).json({ message: "Participant output not found" });
//     }

//     res.json({
//       message: `Output ${approved ? "approved" : "rejected"} successfully`,
//       participantOutput,
//     });
//   } catch (error) {
//     console.error("Error evaluating participant output:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Add comment to participant output (Both)
// export const addOutputComment = async (req, res) => {
//   try {
//     const { participantOutputId, comment } = req.body;
//     const userId = req.user._id;
//     const userRole = req.user.role;

//     if (!participantOutputId || !comment) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const participantOutput = await ParticipantOutput.findById(
//       participantOutputId
//     );
//     if (!participantOutput) {
//       return res.status(404).json({ message: "Participant output not found" });
//     }

//     // Create comment object
//     const newComment = {
//       user: userId,
//       comment,
//       role: userRole,
//       createdAt: new Date(),
//     };

//     // Add to comments array (create if doesn't exist)
//     if (!participantOutput.comments) {
//       participantOutput.comments = [];
//     }
//     participantOutput.comments.push(newComment);

//     await participantOutput.save();

//     res.json({
//       message: "Comment added successfully",
//       comment: newComment,
//     });
//   } catch (error) {
//     console.error("Error adding comment:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Delete training output (Mentor)
// export const deleteTrainingOutput = async (req, res) => {
//   try {
//     const { outputId } = req.params;

//     // Delete the training output and all associated participant outputs
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//       await TrainingOutput.findByIdAndDelete(outputId).session(session);
//       await ParticipantOutput.deleteMany({ output: outputId }).session(session);

//       await session.commitTransaction();
//       res.json({ message: "Output deleted successfully" });
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     } finally {
//       session.endSession();
//     }
//   } catch (error) {
//     console.error("Error deleting output:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
