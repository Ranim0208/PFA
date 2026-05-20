"use client";
import { apiBaseUrl } from "../../utils/constants";
export const getOpenForms = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/candidatures/open`, {
      credentials: "omit",
    });

    if (!response.ok) {
      const errorText = await response.text(); // capture raw error
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(json.message || "Erreur inconnue.");
    }

    return json.data || [];
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des formulaires ouverts :",
      error.message
    );
    return [];
  }
};

export const submitCandidatureApplication = async (formId, answers) => {
  try {
    console.log("Submitting application:", { formId, answers });

    // Check if there are any file uploads - BETTER DETECTION
    const fileAnswers = answers.filter(
      (answer) =>
        answer.value instanceof File ||
        (answer.value && typeof answer.value === "object" && answer.value.name)
    );
    const hasFiles = fileAnswers.length > 0;

    console.log("File detection:", {
      totalAnswers: answers.length,
      fileAnswersCount: fileAnswers.length,
      fileAnswers: fileAnswers.map((f) => ({
        field: f.field,
        valueType: typeof f.value,
        isFile: f.value instanceof File,
        fileName: f.value?.name || "No name",
      })),
    });

    let response;

    if (hasFiles) {
      console.log("📤 Using FormData for file upload...");

      const formData = new FormData();

      // Separate file and non-file answers
      const nonFileAnswers = [];

      answers.forEach((answer) => {
        if (answer.value instanceof File) {
          // Append file with field ID as the field name
          formData.append(answer.field, answer.value);
          console.log(`✅ Added file: ${answer.field} -> ${answer.value.name}`);
        } else {
          nonFileAnswers.push(answer);
        }
      });

      // Append non-file answers as JSON string
      formData.append("answers", JSON.stringify(nonFileAnswers));
      console.log("Non-file answers count:", nonFileAnswers.length);

      response = await fetch(`${apiBaseUrl}/submissions/submit/${formId}`, {
        method: "POST",
        body: formData,
        // NO Content-Type header for FormData!
        credentials: "omit",
      });
    } else {
      console.log("📝 Using JSON (no files detected)...");
      response = await fetch(`${apiBaseUrl}/submissions/submit/${formId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
        credentials: "omit",
      });
    }

    console.log("Response status:", response.status);

    // Parse response
    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (!response.ok) {
      throw new Error(responseData.message || `HTTP error ${response.status}`);
    }

    if (!responseData.success) {
      throw new Error(responseData.message || "Submission failed");
    }

    return responseData.data;
  } catch (error) {
    console.error("❌ Error submitting application:", error.message);
    throw error;
  }
};
