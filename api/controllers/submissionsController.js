import fs from "fs";
import path from "path";
import CandidatureSubmission from "../models/CandidatureSubmission.js";
import FieldsValidator from "../validators/fieldsValidator.js";
import Form from "../models/form.js";
import { EVALUATION_TEXTS } from "../constants/evaluationOptions.js";
import { formatEvaluationText } from "../utils/formateEvaluationText.js";
import sendEmail from "../utils/emailSender.js";
import User from "../models/User.js";
import RegionalCoordinator from "../models/RegionalCoordinator.js";
import CandidateStatusChangeLog from "../models/CandidateStatusChangeLog.js";
import mongoose from "mongoose";
import { AddMember } from "../controllers/membersController.js";
import {
  generateUserAcceptanceEmail,
  generateRegionalCoordinatorEmail,
  generateGeneralCoordinatorEmail,
  getEventDatesText,
  generateReplacementNotificationEmail,
} from "../utils/emailTemplates.js";
import TemplateField from "../models/templateField.js";
import AcceptedParticipant from "../models/AcceptedParticipant.js";

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Deleted file:", filePath);
    }
  } catch (error) {
    console.error("Error deleting file:", filePath, error);
  }
};
export const submitApplication = async (req, res) => {
  let uploadedFiles = [];

  try {
    const { formId } = req.params;
    let { answers } = req.body;

    console.log("=== SUBMISSION DEBUG ===");
    console.log("Form ID:", formId);
    console.log("Uploaded files:", req.files);

    // Parse answers if it's a string (from FormData)
    if (typeof answers === "string") {
      try {
        answers = JSON.parse(answers);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid answers format",
        });
      }
    }

    // Fetch form with fields
    const form = await Form.findById(formId).populate("fields").lean();
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "Form not found",
      });
    }

    // Track uploaded files for cleanup
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => {
          uploadedFiles.push(file.path);
        });
    }

    // Convert answers array to object keyed by field ID
    const answersMap = {};
    answers.forEach((answer) => {
      answersMap[answer.field] = answer.value;
    });

    console.log("Initial answersMap:", answersMap);

    // Process uploaded files and prepare files array for database
    const filesForDatabase = [];
    if (req.files) {
      console.log("=== FILE DEBUG INFO ===");

      // ✅ FIXED: Use /api/uploads path to reach Express backend
      const baseUrl = "https://incubation.tacir.tn";

      Object.entries(req.files).forEach(([fieldId, files]) => {
        if (files && files.length > 0) {
          const file = files[0];

          // ✅ CRITICAL FIX: Use /api/uploads instead of /uploads
          const fileUrl = `${baseUrl}/api/uploads/candidat-docs/${file.filename}`;

          console.log(`Field: ${fieldId}`);
          console.log(`File path on server: ${file.path}`);
          console.log(`File filename: ${file.filename}`);
          console.log(`Public URL (via API): ${fileUrl}`);

          // Test if file exists on disk
          const fileExists = fs.existsSync(file.path);
          console.log(`File exists on server disk: ${fileExists}`);

          if (fileExists) {
            console.log(`✅ File should be accessible at: ${fileUrl}`);
          } else {
            console.log(`❌ File NOT found on server at: ${file.path}`);
          }

          // Add file info to files array for database
          filesForDatabase.push({
            field: fieldId,
            urls: [fileUrl], // ✅ Store API URL
          });

          // Also update answersMap with file info for validation
          answersMap[fieldId] = {
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            url: fileUrl, // ✅ Store API URL
            size: file.size,
            mimetype: file.mimetype,
            uploadedAt: new Date(),
          };

          console.log(`✅ Processed file for ${fieldId}:`, file.filename);
        }
      });
      console.log("=== END FILE DEBUG ===");
    }

    console.log("Final answersMap for validation:", answersMap);
    console.log("Files for database:", filesForDatabase);

    // Build Joi validation schema based on fields
    const schema = FieldsValidator(form.fields);

    // Validate answers
    const { error } = schema.validate(answersMap, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      console.log("❌ Validation errors:", error.details);

      // Delete uploaded files if validation fails
      uploadedFiles.forEach((filePath) => {
        deleteFile(filePath);
      });

      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: error.details.map((detail) => ({
          field: detail.context.key,
          error: detail.message,
        })),
      });
    }

    // Update answers with file information (store file object in answers)
    const finalAnswers = answers.map((answer) => {
      // If this field has a file uploaded, replace the value with file object
      if (answersMap[answer.field] && answersMap[answer.field].filename) {
        return {
          field: answer.field,
          value: answersMap[answer.field], // Store complete file info in answers
        };
      }
      return answer;
    });

    // Create submission with both answers and files
    const submission = new CandidatureSubmission({
      form: formId,
      answers: finalAnswers,
      files: filesForDatabase, // Save file URLs in the dedicated files field
      status: "submitted",
    });

    await submission.save();

    console.log("✅ Submission created successfully:", submission._id);
    console.log("✅ Files saved in database:", submission.files);

    // Clear cleanup list
    uploadedFiles = [];

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: submission,
    });
  } catch (err) {
    console.error("❌ Submission error:", err);

    // Delete uploaded files on error
    uploadedFiles.forEach((filePath) => {
      deleteFile(filePath);
    });

    res.status(500).json({
      success: false,
      message: "Error submitting application",
      error: err.message,
    });
  }
};
export const getFormSubmissions = async (req, res) => {
  try {
    const { formId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Calculer le nombre de documents à sauter
    const skip = (page - 1) * pageSize;

    // Requête principale avec pagination
    const submissionsQuery = CandidatureSubmission.find({ form: formId })
      .populate({
        path: "form",
        select: "title fields startDate endDate",
      })
      .populate({
        path: "answers.field",
        select: "label type options",
      })
      .populate({
        path: "files.field",
        select: "label type",
      })
      .populate({
        path: "feedbacks.user",
        select: "firstName lastName email",
      })
      .populate({
        path: "preselectionEvaluations.coordinatorId", // adjust path name as needed
        select: "firstName lastName email",
      })
      .populate({
        path: "form.region",
        select: "name.fr name.en",
      })

      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    // Requête pour le nombre total de documents
    const countQuery = CandidatureSubmission.countDocuments({ form: formId });

    // Exécuter les requêtes en parallèle
    const [submissions, total] = await Promise.all([
      submissionsQuery,
      countQuery,
    ]);

    if (!submissions) {
      return res.status(404).json({
        success: false,
        error: "No submissions found for this form",
      });
    }

    // Formater les résultats
    const formattedSubmissions = submissions.map((submission) => ({
      _id: submission._id,
      status: submission.status,
      attendanceStatus: submission.attendanceStatus || "pending",
      submittedAt: submission.createdAt,
      form: {
        title: submission.form.title,
        period: `${submission.form.startDate.toISOString()} - ${submission.form.endDate.toISOString()}`,
      },
      answers: submission.answers.map((answer) => ({
        field: {
          _id: answer.field._id,
          label: answer.field.label,
          type: answer.field.type,
        },
        value: answer.value,
      })),
      files: submission.files.map((file) => ({
        field: {
          _id: file.field._id,
          label: file.field.label,
          type: file.field.type,
        },
        urls: file.urls,
      })),
      feedbacks: submission.feedbacks.map((fb) => ({
        content: fb.content,
        date: fb.date,
        user:
          `${fb.user.firstName || ""} ${fb.user.lastName || ""}` ||
          "Utilisateur inconnu",
      })),
      preselectionEvaluations:
        submission.preselectionEvaluations?.map((evaluation) => ({
          coordinator:
            `${evaluation.coordinatorId?.firstName || ""} ${
              evaluation.coordinatorId?.lastName || ""
            }`.trim() || "Inconnu",
          email: evaluation.coordinatorId?.email || "Inconnu",
          evaluationText: formatEvaluationText(evaluation.evaluation),
          date: evaluation.date,
        })) || [],
    }));

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      success: true,
      data: formattedSubmissions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      sort: {
        field: sortField,
        order: sortOrder === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      success: false,
      error: "Server error retrieving submissions",
      details: error.message,
    });
  }
};

export const reviewSubmission = async (req, res) => {
  const { submissionId } = req.params;
  const userId = req.user._id; // from token (middleware)
  const { content, status } = req.body;

  if (!content && !status) {
    return res
      .status(400)
      .json({ message: "Content or status must be provided." });
  }

  try {
    const submission = await CandidatureSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    // Optional: Add feedback
    if (content) {
      submission.feedbacks.push({
        user: new mongoose.Types.ObjectId(userId),
        content,
        date: new Date(),
      });
    }

    // Optional: Update status
    if (status) {
      const validStatuses = [
        "submitted",
        "under_review",
        "accepted",
        "rejected",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value." });
      }
      submission.status = status;
    }

    await submission.save();

    res
      .status(200)
      .json({ message: "Submission updated successfully.", submission });
  } catch (error) {
    console.error("Review error:", error);
    res
      .status(500)
      .json({ message: "An error occurred while reviewing the submission." });
  }
};

// PATCH /api/candidatures/submissions/:submissionId/feedback
export const leaveFeedback = async (req, res) => {
  const { submissionId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Feedback content is required." });
  }

  try {
    const submission = await CandidatureSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found." });
    }

    submission.feedbacks.push({
      user: userId,
      content,
      date: new Date(),
    });

    await submission.save();

    res.status(200).json({
      message: "Feedback added successfully.",
      feedbacks: submission.feedbacks,
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Server error while adding feedback." });
  }
};

// PATCH /api/candidatures/submissions/:submissionId/status
export const changeSubmissionStatus = async (req, res) => {
  const { submissionId } = req.params;
  const { status } = req.body;

  const validStatuses = ["submitted", "under_review", "accepted", "rejected"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." }); // ✅ has message
  }

  try {
    const submission = await CandidatureSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found." }); // ✅ has message
    }

    submission.status = status;

    if (status === "accepted") {
      submission.validatedAt = new Date();
    }

    await submission.save();

    return res.status(200).json({
      success: true, // ✅ optional but helps client
      message: "Status updated successfully.",
      status,
    });
  } catch (error) {
    console.error("Error updating status:", error);

    // ✅ Always send a JSON with `message`
    return res.status(500).json({
      success: false,
      message: error?.message || "Server error while updating status.",
    });
  }
};

// In your server route
export const addPreselectionEvaluation = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { evaluation } = req.body;
    const coordinatorId = req.user._id;

    console.log("Received evaluation:", evaluation); // Debug log

    if (!EVALUATION_TEXTS.includes(evaluation)) {
      return res.status(400).json({
        message: "Évaluation invalide.",
        validOptions: EVALUATION_TEXTS,
        received: evaluation,
      });
    }

    const submission = await CandidatureSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Candidature introuvable." });
    }

    const existingEvalIndex = submission.preselectionEvaluations.findIndex(
      (e) => e.coordinatorId.toString() === coordinatorId.toString()
    );

    if (existingEvalIndex >= 0) {
      // Update existing evaluation
      submission.preselectionEvaluations[existingEvalIndex].evaluation =
        evaluation;
      submission.preselectionEvaluations[existingEvalIndex].date = new Date();
    } else {
      // Add new evaluation
      submission.preselectionEvaluations.push({
        coordinatorId,
        evaluation,
        date: new Date(),
      });
    }

    await submission.save();
    res.json(submission.preselectionEvaluations);
  } catch (err) {
    console.error("Evaluation error:", err);
    res.status(500).json({
      message: "Erreur serveur lors de l'évaluation.",
      error: err.message,
    });
  }
};

export const createAccountsForAcceptedParticipants = async (req, res) => {
  const coordinatorId = req.user._id;

  try {
    const { submissionIds } = req.body;

    // Validate submissionIds are valid MongoDB ObjectIds
    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "submissionIds must be a non-empty array",
      });
    }

    // Convert all submission IDs to ObjectIds
    const objectIdSubmissions = submissionIds.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid submission ID: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    // 1. First update submissions status to "accepted_after_creathon"
    const updateResult = await CandidatureSubmission.updateMany(
      {
        _id: { $in: objectIdSubmissions },
      },
      {
        $set: {
          status: "acceptedAfterCreathon",
          confirmedBy: coordinatorId,
          confirmedAt: new Date(),
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No accepted submissions found or already processed",
        results: [],
      });
    }

    // 2. Get all updated submissions with their forms and populate region
    const submissions = await CandidatureSubmission.find({
      _id: { $in: submissionIds },
      status: "acceptedAfterCreathon",
    })
      .populate({
        path: "form",
        populate: { path: "region" },
      })
      .lean();

    if (!submissions || submissions.length === 0) {
      // Rollback status updates
      await CandidatureSubmission.updateMany(
        { _id: { $in: submissionIds } },
        { $set: { status: "accepted" } }
      );
      return res.status(404).json({
        success: false,
        message: "Submissions not found after status update",
        results: [],
      });
    }

    // 3. Get the email and name field IDs from the form template
    const formFields = await TemplateField.find({
      _id: { $in: submissions[0].form.fields },
      $or: [
        { type: "email" },
        { "label.fr": { $regex: /nom|prénom|name/i } },
        { type: "phone" },
      ],
    }).lean();

    const emailField = formFields.find((f) => f.type === "email");
    const nameField = formFields.find(
      (f) => f.label?.fr?.match(/nom|prénom|name/i) && f.type === "text"
    );
    const phoneField = formFields.find((f) => f.type === "phone");

    if (!emailField) {
      // Rollback status updates if critical error occurs
      await CandidatureSubmission.updateMany(
        { _id: { $in: submissionIds } },
        { $set: { status: "accepted" } }
      );
      return res.status(400).json({
        success: false,
        message: "No email field found in form template",
        results: [],
      });
    }

    // 4. Process submissions to extract user info
    const processedSubmissions = submissions
      .map((submission) => {
        const emailAnswer = submission.answers.find(
          (a) => a.field.toString() === emailField._id.toString()
        );
        const nameAnswer = nameField
          ? submission.answers.find(
              (a) => a.field.toString() === nameField._id.toString()
            )
          : null;
        const phoneAnswer = phoneField
          ? submission.answers.find(
              (a) => a.field.toString() === phoneField._id.toString()
            )
          : null;
        return {
          ...submission,
          user: {
            email: emailAnswer?.value,
            firstName: nameAnswer?.value?.split(" ")[0] || "Participant",
            lastName: nameAnswer?.value?.split(" ").slice(1).join(" ") || "",
            phone: phoneAnswer?.value || "",
          },
        };
      })
      .filter((submission) => submission.user.email);

    // 5. Create accounts and save accepted participants
    const results = await Promise.all(
      processedSubmissions.map(async (submission) => {
        try {
          // Create a mock request object for AddMember
          const mockReq = {
            body: {
              firstName: submission.user.firstName,
              lastName: submission.user.lastName,
              email: submission.user.email,
              role: "projectHolder",
            },
            user: coordinatorId,
          };

          // Create a mock response object
          const mockRes = {
            statusCode: 200,
            jsonData: null,
            status: function (code) {
              this.statusCode = code;
              return this;
            },
            json: function (data) {
              this.jsonData = data;
              if (this.statusCode >= 400) {
                throw new Error(
                  data.error || data.message || "Account creation failed"
                );
              }
              return data;
            },
          };

          // Call the existing AddMember function
          await AddMember(mockReq, mockRes);

          // Get the created user ID
          const userId = mockRes.jsonData?.userId;
          if (!userId) {
            throw new Error("User ID not returned from AddMember");
          }

          // Save to AcceptedParticipant collection
          const acceptedParticipant = new AcceptedParticipant({
            user: userId,
            submission: submission._id,
            form: submission.form._id,
            region: submission.form.region._id,
            answers: submission.answers,
            files: submission.files,
            validatedBy: submission.validatedBy,
            confirmedBy: coordinatorId,
            eventDates: submission.form.eventDates,
            status: "acceptedAfterCreathon",
          });

          await acceptedParticipant.save();

          return {
            success: true,
            email: submission.user.email,
            userId,
            participantId: acceptedParticipant._id,
            message: "Account created and participant saved successfully",
          };
        } catch (error) {
          console.error(
            `Error processing submission ${submission._id}:`,
            error
          );
          // Rollback status for this submission if account creation fails
          await CandidatureSubmission.updateOne(
            { _id: submission._id },
            { $set: { status: "accepted" } }
          );
          return {
            success: false,
            email: submission.user.email,
            message: error.message,
            errorDetails: error,
          };
        }
      })
    );

    // 6. Return overall results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    return res.status(200).json({
      success: true,
      totalProcessed: processedSubmissions.length,
      successfulCount: successful.length,
      failedCount: failed.length,
      results,
      message: `Successfully processed ${successful.length} of ${processedSubmissions.length} participants`,
    });
  } catch (error) {
    console.error("Error in createAccountsForAcceptedParticipants:", error);
    // Rollback all status updates if major error occurs
    if (submissionIds) {
      await CandidatureSubmission.updateMany(
        { _id: { $in: submissionIds } },
        { $set: { status: "accepted" } }
      );
    }
    return res.status(500).json({
      success: false,
      message: error.message,
      errorDetails: error,
    });
  }
};

export const validatePreselection = async (req, res) => {
  const { submissionIds } = req.body;
  const coordinatorId = req.user._id;

  if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "submissionIds must be a non-empty array",
    });
  }

  try {
    // 1. Get all submissions with their forms
    const submissions = await CandidatureSubmission.find({
      _id: { $in: submissionIds },
    })
      .populate({
        path: "form",
        populate: { path: "region" },
      })
      .lean();

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucune soumission trouvée",
      });
    }

    // 2. Check if any form is still open
    const now = new Date();
    const openForms = submissions.filter((sub) => {
      return sub.form && new Date(sub.form.endDate) > now;
    });

    if (openForms.length > 0) {
      const formTitles = [
        ...new Set(openForms.map((sub) => sub.form.title.fr)),
      ].join(", ");
      return res.status(400).json({
        success: false,
        message: `La validation n'est pas permise. Les candidatures suivantes sont encore ouvertes : ${formTitles}. Veuillez attendre la fermeture des candidatures.`,
      });
    }
    // 1. First update all submissions
    const updateResult = await CandidatureSubmission.updateMany(
      { _id: { $in: submissionIds } },
      {
        $set: {
          status: "accepted",
          validatedBy: coordinatorId,
          validatedAt: new Date(),
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No submissions found or already validated",
      });
    }

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Submissions not found after update",
      });
    }

    // 3. Get the email and name field IDs from the form template
    const formFields = await TemplateField.find({
      _id: { $in: submissions[0].form.fields },
      $or: [
        { type: "email" },
        { "label.fr": { $regex: /nom|prénom|name/i } },
        { type: "phone" },
      ],
    }).lean();

    const emailField = formFields.find((f) => f.type === "email");
    const nameField = formFields.find(
      (f) => f.label?.fr?.match(/nom|prénom|name/i) && f.type === "text"
    );
    const phoneField = formFields.find((f) => f.type === "phone");

    if (!emailField) {
      return res.status(400).json({
        success: false,
        message: "No email field found in form template",
      });
    }

    // 4. Process submissions to extract user info
    const processedSubmissions = submissions
      .map((submission) => {
        const emailAnswer = submission.answers.find(
          (a) => a.field.toString() === emailField._id.toString()
        );
        const nameAnswer = nameField
          ? submission.answers.find(
              (a) => a.field.toString() === nameField._id.toString()
            )
          : null;
        const phoneAnswer = phoneField
          ? submission.answers.find(
              (a) => a.field.toString() === phoneField._id.toString()
            )
          : null;
        return {
          ...submission,
          user: {
            email: emailAnswer?.value,
            firstName: nameAnswer?.value?.split(" ")[0] || "Participant",
            lastName: nameAnswer?.value?.split(" ").slice(1).join(" ") || "",
            phone: phoneAnswer?.value || "[Numéro à compléter]",
          },
        };
      })
      .filter((submission) => submission.user.email);

    // 5. Group by form and region
    const formGroups = processedSubmissions.reduce((acc, submission) => {
      const formId = submission.form._id.toString();
      const regionId = submission.form.region._id.toString();

      const key = `${formId}-${regionId}`;

      if (!acc[key]) {
        acc[key] = {
          form: submission.form,
          region: submission.form.region,
          submissions: [],
        };
      }
      acc[key].submissions.push(submission);
      return acc;
    }, {});

    // 6. Process each form/region group
    await Promise.all(
      Object.values(formGroups).map(async ({ form, region, submissions }) => {
        try {
          const regionalCoordinator = await RegionalCoordinator.findOne({
            region: region._id,
          })
            .populate("user")
            .lean();

          const generalCoordinators = await User.find({
            roles: "GeneralCoordinator",
          }).lean();

          const eventDatesText = getEventDatesText(form.eventDates);

          const usersForEmail = submissions.map((s) => ({
            firstName: s.user.firstName,
            lastName: s.user.lastName,
            email: s.user.email,
            phone: s.user.phone,
          }));

          // Send emails (your existing email sending logic)...
          const emailPromises = [];

          // 1. Emails to accepted users
          for (const user of usersForEmail) {
            emailPromises.push(
              sendEmail(
                generateUserAcceptanceEmail(user, form, eventDatesText)
              ).catch((e) =>
                console.error("Failed to send to candidate:", user.email, e)
              )
            );
          }

          // 2. Email to regional coordinator
          if (regionalCoordinator?.user) {
            const rcEmail = generateRegionalCoordinatorEmail(
              regionalCoordinator.user,
              form,
              usersForEmail,
              eventDatesText
            );
            emailPromises.push(
              sendEmail(rcEmail).catch((e) =>
                console.error("Failed to send to regional coordinator:", e)
              )
            );
          }

          // 3. Emails to general coordinators
          for (const coordinator of generalCoordinators) {
            const gcEmail = generateGeneralCoordinatorEmail(
              coordinator,
              form,
              usersForEmail,
              eventDatesText
            );
            emailPromises.push(
              sendEmail(gcEmail).catch((e) =>
                console.error("Failed to send to general coordinator:", e)
              )
            );
          }

          await Promise.all(emailPromises);
        } catch (groupError) {
          console.error(
            `Error processing form ${form._id} for region ${region._id}:`,
            groupError
          );
        }
      })
    );

    return res.status(200).json({
      success: true,
      updated: updateResult.modifiedCount,
      message: "Submissions validated and notifications sent successfully",
    });
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during validation",
      error: error.message,
    });
  }
};
// controllers/submissionsController.js
export const getAcceptedSubmissions = async (req, res) => {
  try {
    const { regionId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const forms = await Form.find({ region: regionId }).select("_id").lean();
    if (forms.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No forms found for this region",
      });
    }
    // console.log(forms);

    // Convert form IDs to ObjectIds
    const formObjectIds = forms.map(
      (form) => new mongoose.Types.ObjectId(form._id.toString())
    );

    // console.log("Form IDs:", formObjectIds);
    // Calculate documents to skip
    const skip = (page - 1) * pageSize;
    if (
      !Array.isArray(formObjectIds) ||
      formObjectIds.length === 0 ||
      formObjectIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      console.error("Invalid formIds being used:", formObjectIds);
      return res.status(500).json({
        success: false,
        error: "Server misconfiguration: invalid formIds",
      });
    }

    // Query for accepted submissions
    const submissionsQuery = CandidatureSubmission.find({
      form: { $in: formObjectIds },
      status: "accepted",
    })
      .populate({
        path: "form",
        select: "title fields startDate endDate",
      })
      .populate({
        path: "answers.field",
        select: "label type options",
      })
      .populate({
        path: "files.field",
        select: "label type",
      })
      .populate({
        path: "feedbacks.user",
        select: "firstName lastName email",
      })
      .populate({
        path: "preselectionEvaluations.coordinatorId", // adjust path name as needed
        select: "firstName lastName email",
      })
      .populate({
        path: "form.region",
        select: "name.fr name.en",
      })

      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(pageSize);
    // Count query with proper ObjectIds
    const countQuery = CandidatureSubmission.countDocuments({
      form: { $in: formObjectIds },
    });

    // Execute queries
    const [submissions, total] = await Promise.all([
      submissionsQuery,
      countQuery,
    ]);

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No submissions found for forms in this region",
      });
    }

    // Format results
    const formattedSubmissions = submissions.map((submission) => ({
      _id: submission._id,
      status: submission.status,
      attendanceStatus: submission.attendanceStatus || "pending", // New field to track attendance
      submittedAt: submission.createdAt,
      form: {
        title: submission.form.title,
        period: `${submission.form.startDate.toISOString()} - ${submission.form.endDate.toISOString()}`,
      },
      answers: submission.answers.map((answer) => ({
        field: {
          _id: answer.field._id,
          label: answer.field.label,
          type: answer.field.type,
        },
        value: answer.value,
      })),
      files: submission.files.map((file) => ({
        field: {
          _id: file.field._id,
          label: file.field.label,
          type: file.field.type,
        },
        urls: file.urls,
      })),
      feedbacks: submission.feedbacks.map((fb) => ({
        content: fb.content,
        date: fb.date,
        user:
          `${fb.user.firstName || ""} ${fb.user.lastName || ""}` ||
          "Utilisateur inconnu",
      })),
      preselectionEvaluations:
        submission.preselectionEvaluations?.map((evaluation) => ({
          coordinator:
            `${evaluation.coordinatorId?.firstName || ""} ${
              evaluation.coordinatorId?.lastName || ""
            }`.trim() || "Inconnu",
          email: evaluation.coordinatorId?.email || "Inconnu",
          evaluationText: formatEvaluationText(evaluation.evaluation),
          date: evaluation.date,
        })) || [],
    }));

    // console.log("Formatted Submissions:", formattedSubmissions);
    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      success: true,
      data: formattedSubmissions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      sort: {
        field: sortField,
        order: sortOrder === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching submissions by region:", error);
    res.status(500).json({
      success: false,
      error: "Server error retrieving submissions by region",
      details: error.message,
    });
  }
};

export const updateAttendanceStatus = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status } = req.body;

    if (!["present", "absent", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid attendance status",
      });
    }

    const updatedSubmission = await CandidatureSubmission.findByIdAndUpdate(
      submissionId,
      { attendanceStatus: status },
      { new: true }
    );

    if (!updatedSubmission) {
      return res.status(404).json({
        success: false,
        error: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedSubmission,
    });
  } catch (error) {
    console.error("Error updating attendance status:", error);
    res.status(500).json({
      success: false,
      error: "Server error updating attendance status",
      details: error.message,
    });
  }
};
// controllers/formController.js
// controllers/formController.js
export const getFormsRegions = async (req, res) => {
  try {
    // Fetch only published forms with their regions populated
    const forms = await Form.find({ published: true }).populate("region");
    console.log("Forms:", forms);
    // Extract unique regions
    const uniqueRegions = forms
      .map((form) => form.region)
      .filter((region) => region) // Exclude null values
      .reduce((acc, region) => {
        const exists = acc.find((r) => r._id.equals(region._id));
        if (!exists) acc.push(region);
        return acc;
      }, []);

    // Return only necessary fields for the frontend
    const formattedRegions = uniqueRegions.map((region) => ({
      _id: region._id.toString(), // Ensure _id is a proper string
      name: region.name, // Assuming the region schema has a 'name' field
    }));

    console.log("Regions:", formattedRegions);
    res.status(200).json({ success: true, data: formattedRegions });
  } catch (error) {
    console.error("Error fetching form regions:", error);
    res.status(500).json({ success: false, error: "Failed to fetch regions" });
  }
};

export const getFormSubmissionsByRegion = async (req, res) => {
  try {
    const { regionId } = req.params;
    console.log("Region ID:", regionId);
    // Validate regionId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(regionId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid region ID format",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // First, get all forms for this region
    const forms = await Form.find({ region: regionId }).select("_id").lean();
    if (forms.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No forms found for this region",
      });
    }
    // console.log(forms);

    // Convert form IDs to ObjectIds
    const formObjectIds = forms.map(
      (form) => new mongoose.Types.ObjectId(form._id.toString())
    );

    console.log("Form IDs:", formObjectIds);
    // Calculate documents to skip
    const skip = (page - 1) * pageSize;
    if (
      !Array.isArray(formObjectIds) ||
      formObjectIds.length === 0 ||
      formObjectIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
    ) {
      console.error("Invalid formIds being used:", formObjectIds);
      return res.status(500).json({
        success: false,
        error: "Server misconfiguration: invalid formIds",
      });
    }

    // Main query with proper ObjectIds
    const submissionsQuery = CandidatureSubmission.find({
      form: { $in: formObjectIds },
    })
      .populate({
        path: "form",
        select: "title fields startDate endDate",
      })
      .populate({
        path: "answers.field",
        select: "label type options",
      })
      .populate({
        path: "files.field",
        select: "label type",
      })
      .populate({
        path: "feedbacks.user",
        select: "firstName lastName email",
      })
      .populate({
        path: "preselectionEvaluations.coordinatorId", // adjust path name as needed
        select: "firstName lastName email",
      })
      .populate({
        path: "form.region",
        select: "name.fr name.en",
      })

      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(pageSize);
    // Count query with proper ObjectIds
    const countQuery = CandidatureSubmission.countDocuments({
      form: { $in: formObjectIds },
    });

    // Execute queries
    const [submissions, total] = await Promise.all([
      submissionsQuery,
      countQuery,
    ]);

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No submissions found for forms in this region",
      });
    }

    // Format results
    const formattedSubmissions = submissions.map((submission) => ({
      _id: submission._id,
      status: submission.status,
      attendanceStatus: submission.attendanceStatus || "pending", // New field to track attendance
      submittedAt: submission.createdAt,
      form: {
        title: submission.form.title,
        period: `${submission.form.startDate.toISOString()} - ${submission.form.endDate.toISOString()}`,
      },
      answers: submission.answers.map((answer) => ({
        field: {
          _id: answer.field._id,
          label: answer.field.label,
          type: answer.field.type,
        },
        value: answer.value,
      })),
      files: submission.files.map((file) => ({
        field: {
          _id: file.field._id,
          label: file.field.label,
          type: file.field.type,
        },
        urls: file.urls,
      })),
      feedbacks: submission.feedbacks.map((fb) => ({
        content: fb.content,
        date: fb.date,
        user:
          `${fb.user.firstName || ""} ${fb.user.lastName || ""}` ||
          "Utilisateur inconnu",
      })),
      preselectionEvaluations:
        submission.preselectionEvaluations?.map((evaluation) => ({
          coordinator:
            `${evaluation.coordinatorId?.firstName || ""} ${
              evaluation.coordinatorId?.lastName || ""
            }`.trim() || "Inconnu",
          email: evaluation.coordinatorId?.email || "Inconnu",
          evaluationText: formatEvaluationText(evaluation.evaluation),
          date: evaluation.date,
        })) || [],
    }));

    // console.log("Formatted Submissions:", formattedSubmissions);
    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      success: true,
      data: formattedSubmissions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      sort: {
        field: sortField,
        order: sortOrder === 1 ? "asc" : "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching submissions by region:", error);
    res.status(500).json({
      success: false,
      error: "Server error retrieving submissions by region",
      details: error.message,
    });
  }
};

export const confirmAttendanceStatus = async (req, res) => {
  const { id } = req.params;
  const { attendanceStatus } = req.body;

  console.log("Received attendance update request:", {
    submissionId: id,
    attendanceStatus,
    userId: req.user._id,
  });

  // Validate input
  if (!attendanceStatus || typeof attendanceStatus !== "string") {
    console.error("Invalid request format received");
    return res.status(400).json({
      success: false,
      message: "Invalid request format. Expected { attendanceStatus: string }",
    });
  }

  const validStatuses = ["pending", "present", "absent", "declined"];
  if (!validStatuses.includes(attendanceStatus)) {
    console.error("Invalid attendance status received:", attendanceStatus);
    return res.status(400).json({
      success: false,
      message: `Invalid attendance status. Must be one of: ${validStatuses.join(
        ", "
      )}`,
      validStatuses,
    });
  }

  try {
    // Find the existing submission first
    const existingSubmission = await CandidatureSubmission.findById(id);
    if (!existingSubmission) {
      console.error("Submission not found with ID:", id);
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    // Update with full document return
    const updatedSubmission = await CandidatureSubmission.findByIdAndUpdate(
      id,
      {
        $set: {
          attendanceStatus,
          confirmedBy: req.user._id,
          confirmedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true, // Ensure schema validations run
      }
    ).lean(); // Use lean() for better performance

    if (!updatedSubmission) {
      console.error("Failed to update submission:", id);
      return res.status(500).json({
        success: false,
        message: "Failed to update attendance status",
      });
    }

    console.log("Attendance status updated successfully:", {
      submissionId: id,
      previousStatus: existingSubmission.attendanceStatus,
      newStatus: attendanceStatus,
    });

    // Return the complete updated submission
    res.json({
      success: true,
      message: "Attendance status updated successfully",
      submission: updatedSubmission,
    });
  } catch (err) {
    console.error("Error updating attendance status:", {
      error: err.message,
      stack: err.stack,
      submissionId: id,
      userId: req.user._id,
    });

    res.status(500).json({
      success: false,
      message: "Error updating attendance",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// export const getCreathonSubmissionsForMentor = async (req, res) => {
//   try {
//     const { userId } = req.user; // Assuming you have user info in req.user
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.pageSize) || 10;
//     const sortField = req.query.sortField || "createdAt";
//     const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
//     const skip = (page - 1) * pageSize;

//     // 1. Get the mentor's assigned creathon
//     const mentor = await Mentor.findOne({ user: userId })
//       .populate({
//         path: "creathon",
//         select: "region forms",
//       })
//       .exec();

//     if (!mentor) {
//       return res.status(404).json({
//         success: false,
//         error: "Mentor not found",
//       });
//     }

//     if (!mentor.creathon) {
//       return res.status(400).json({
//         success: false,
//         error: "Mentor is not assigned to any creathon",
//       });
//     }

//     // 2. Get all forms associated with the creathon's region
//     // (Assuming forms are associated with regions and creathons are associated with regions)
//     const creathon = await Creathon.findById(mentor.creathon._id)
//       .populate({
//         path: "forms",
//         select: "_id",
//       })
//       .exec();

//     if (!creathon || !creathon.forms || creathon.forms.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: "No forms found for this creathon",
//       });
//     }

//     const formIds = creathon.forms.map((form) => form._id);

//     // 3. Get all submissions for these forms
//     const submissionsQuery = CandidatureSubmission.find({
//       form: { $in: formIds },
//     })
//       .populate({
//         path: "form",
//         select: "title fields startDate endDate",
//       })
//       .populate({
//         path: "answers.field",
//         select: "label type options",
//       })
//       .populate({
//         path: "files.field",
//         select: "label type",
//       })
//       .populate({
//         path: "feedbacks.user",
//         select: "firstName lastName email",
//       })
//       .populate({
//         path: "preselectionEvaluations.coordinatorId",
//         select: "firstName lastName email",
//       })
//       .populate({
//         path: "form.region",
//         select: "name.fr name.en",
//       })
//       .sort({ [sortField]: sortOrder })
//       .skip(skip)
//       .limit(pageSize);

//     const countQuery = CandidatureSubmission.countDocuments({
//       form: { $in: formIds },
//     });

//     const [submissions, total] = await Promise.all([
//       submissionsQuery,
//       countQuery,
//     ]);

//     if (!submissions || submissions.length === 0) {
//       return res.status(404).json({
//         success: false,
//         error: "No submissions found for this creathon",
//       });
//     }

//     // Format the results (similar to your existing format)
//     const formattedSubmissions = submissions.map((submission) => ({
//       _id: submission._id,
//       status: submission.status,
//       attendanceStatus: submission.attendanceStatus || "pending",
//       submittedAt: submission.createdAt,
//       form: {
//         title: submission.form.title,
//         period: `${submission.form.startDate.toISOString()} - ${submission.form.endDate.toISOString()}`,
//       },
//       answers: submission.answers.map((answer) => ({
//         field: {
//           _id: answer.field._id,
//           label: answer.field.label,
//           type: answer.field.type,
//         },
//         value: answer.value,
//       })),
//       files: submission.files.map((file) => ({
//         field: {
//           _id: file.field._id,
//           label: file.field.label,
//           type: file.field.type,
//         },
//         urls: file.urls,
//       })),
//       feedbacks: submission.feedbacks.map((fb) => ({
//         content: fb.content,
//         date: fb.date,
//         user:
//           `${fb.user.firstName || ""} ${fb.user.lastName || ""}` ||
//           "Utilisateur inconnu",
//       })),
//       preselectionEvaluations:
//         submission.preselectionEvaluations?.map((evaluation) => ({
//           coordinator:
//             `${evaluation.coordinatorId?.firstName || ""} ${
//               evaluation.coordinatorId?.lastName || ""
//             }`.trim() || "Inconnu",
//           email: evaluation.coordinatorId?.email || "Inconnu",
//           evaluationText: formatEvaluationText(evaluation.evaluation),
//           date: evaluation.date,
//         })) || [],
//     }));

//     const totalPages = Math.ceil(total / pageSize);

//     res.status(200).json({
//       success: true,
//       data: formattedSubmissions,
//       pagination: {
//         page,
//         pageSize,
//         total,
//         totalPages,
//       },
//       sort: {
//         field: sortField,
//         order: sortOrder === 1 ? "asc" : "desc",
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching creathon submissions:", error);
//     res.status(500).json({
//       success: false,
//       error: "Server error retrieving creathon submissions",
//       details: error.message,
//     });
//   }
// };

// In submissionsController.js
export const withdrawCandidate = async (req, res) => {
  const { submissionId } = req.params;
  const coordinatorId = req.user._id;

  try {
    // 1. Verify the submission exists and is accepted
    const submission = await CandidatureSubmission.findById(submissionId)
      .populate({
        path: "form",
        select: "_id title startDate endDate",
      })
      .populate({
        path: "answers.field",
        match: { type: "email" },
      });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    if (submission.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Seules les candidatures acceptées peuvent être retirées",
      });
    }

    // 2. Find and deactivate user account if exists
    const emailAnswer = submission.answers.find(
      (a) => a.field?.type === "email"
    );
    const candidateEmail = emailAnswer?.value;

    if (candidateEmail) {
      await User.findOneAndUpdate(
        { email: candidateEmail },
        { $set: { isArchived: true } }, // Using existing isArchived field
        { new: true }
      );
    }

    // 3. Update the candidate status
    const updatedSubmission = await CandidatureSubmission.findByIdAndUpdate(
      submissionId,
      {
        $set: {
          attendanceStatus: "declined",
          status: "rejected", // Using existing status rather than new 'withdrawn'
          confirmedBy: coordinatorId,
          confirmedAt: new Date(),
        },
      },
      { new: true }
    );

    // 4. Log the withdrawal (using more meaningful name)
    const candidateWithdrawalLog = new CandidateStatusChangeLog({
      action: "CANDIDATE_WITHDRAWAL",
      performedBy: coordinatorId,
      targetSubmission: submissionId,
      previousStatus: "accepted",
      newStatus: "rejected",
      userArchived: !!candidateEmail,
      details: {
        reason: "Candidate withdrawal",
        coordinatorNote: req.body.note || "No additional notes",
      },
    });
    await candidateWithdrawalLog.save();

    return res.status(200).json({
      success: true,
      message: "Candidat retiré avec succès",
      data: {
        submission: updatedSubmission,
        userArchived: !!candidateEmail,
      },
    });
  } catch (error) {
    console.error("Erreur lors du retrait du candidat:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors du retrait du candidat",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// In submissionsController.js
export const getReplacementCandidates = async (req, res) => {
  const { formId } = req.params;

  try {
    // Ensure formId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid form ID format",
      });
    }

    // Convert to ObjectId
    const formObjectId = new mongoose.Types.ObjectId(formId);

    // Get all under_review candidates for the same form
    const candidates = await CandidatureSubmission.find({
      form: formObjectId,
      status: "under_review",
    })
      .populate("form")
      .populate({
        path: "answers.field",
        match: {
          $or: [
            { type: "email" },
            { "label.fr": { $regex: /nom|prénom|name/i } },
          ],
        },
      })
      .populate("preselectionEvaluations.coordinatorId")
      .sort({
        "preselectionEvaluations.evaluation": -1,
        createdAt: 1,
      });

    // Format the response
    const formattedCandidates = candidates.map((candidate) => {
      const emailAnswer = candidate.answers.find(
        (a) => a.field?.type === "email"
      );
      const nameAnswer = candidate.answers.find((a) =>
        a.field?.label?.fr?.match(/nom|prénom|name/i)
      );

      return {
        _id: candidate._id,
        email: emailAnswer?.value,
        firstName: nameAnswer?.value?.split(" ")[0] || "Candidat",
        lastName: nameAnswer?.value?.split(" ").slice(1).join(" ") || "",
        phone:
          candidate.answers.find((a) => a.field?.type === "phone")?.value || "",
        submittedAt: candidate.createdAt,
        preselectionEvaluations:
          candidate.preselectionEvaluations?.map((evalu) => ({
            evaluationText: evalu.evaluation,
            date: evalu.date,
          })) || [],
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedCandidates,
    });
  } catch (error) {
    console.error("Error fetching replacement candidates:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching replacement candidates",
      error: error.message,
    });
  }
};
// In submissionsController.js
export const selectReplacementCandidate = async (req, res) => {
  const { submissionId } = req.params;
  const coordinatorId = req.user._id;
  const { note } = req.body; // Optional note from coordinator

  try {
    // 1. Verify the candidate exists and is under review
    const candidate = await CandidatureSubmission.findById(submissionId)
      .populate("form")
      .populate({
        path: "answers.field",
        match: {
          $or: [
            { type: "email" },
            { "label.fr": { $regex: /nom|prénom|name/i } },
            { type: "phone" },
          ],
        },
      })
      .populate("preselectionEvaluations.coordinatorId");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidature non trouvée",
      });
    }

    if (candidate.status !== "under_review") {
      return res.status(400).json({
        success: false,
        message:
          "Seules les candidatures en attente (under_review) peuvent être sélectionnées comme remplaçantes",
      });
    }

    // 2. Get candidate details for email
    const emailField = candidate.answers.find((a) => a.field?.type === "email");
    const nameField = candidate.answers.find((a) =>
      a.field?.label?.fr?.match(/nom|prénom|name/i)
    );
    const phoneField = candidate.answers.find((a) => a.field?.type === "phone");

    const candidateEmail = emailField?.value;
    const candidateName = nameField?.value || "Candidat";
    const candidatePhone = phoneField?.value || "";

    // 3. Update the candidate status to accepted
    const updatedCandidate = await CandidatureSubmission.findByIdAndUpdate(
      submissionId,
      {
        $set: {
          status: "accepted",
          validatedBy: coordinatorId,
          validatedAt: new Date(),
          confirmedBy: coordinatorId,
          confirmedAt: new Date(),
        },
      },
      { new: true }
    );

    // 4. Send acceptance email if email exists
    if (candidateEmail) {
      try {
        const acceptanceEmail = generateUserAcceptanceEmail(
          {
            email: candidateEmail,
            firstName: candidateName.split(" ")[0] || candidateName,
            lastName: candidateName.split(" ").slice(1).join(" ") || "",
          },
          candidate.form,
          getEventDatesText(candidate.form.eventDates)
        );
        await sendEmail(acceptanceEmail);
      } catch (emailError) {
        console.error("Failed to send acceptance email:", emailError);
        // Continue even if email fails
      }
    }

    // 5. Log the replacement with more detailed information
    const statusChangeLog = new CandidateStatusChangeLog({
      action: "REPLACEMENT_SELECTION",
      performedBy: coordinatorId,
      targetSubmission: submissionId,
      previousStatus: "under_review",
      newStatus: "accepted",
      userArchived: false, // Since this is a new acceptance
      details: {
        reason: "Selected as replacement",
        coordinatorNote: note || "No additional notes",
        evaluationScore:
          candidate.preselectionEvaluations[0]?.evaluation || "Not evaluated",
      },
    });
    await statusChangeLog.save();

    // 6. Notify regional coordinator
    try {
      const regionalCoordinator = await RegionalCoordinator.findOne({
        region: candidate.form.region,
      }).populate("user");

      // In the notification email section of selectReplacementCandidate
      if (regionalCoordinator?.user?.email) {
        const notificationEmail = generateReplacementNotificationEmail(
          regionalCoordinator.user,
          {
            replacementCandidate: {
              name: candidateName,
              email: candidateEmail,
              phone: candidatePhone,
              submissionId: candidate._id,
            },
            formTitle: candidate.form.title.fr,
            coordinatorNote: note,
          },
          candidate.form // Pass the entire form object as third parameter
        );
        await sendEmail(notificationEmail);
      }
    } catch (notificationError) {
      console.error(
        "Failed to send coordinator notification:",
        notificationError
      );
    }

    return res.status(200).json({
      success: true,
      message: "Candidat sélectionné comme remplaçant avec succès",
      data: {
        candidate: updatedCandidate,
        emailSent: !!candidateEmail,
        notificationSent: true,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la sélection du remplaçant:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la sélection du remplaçant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
