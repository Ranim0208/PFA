"use client";
import { apiClient } from "../../hooks/apiClient";
import { apiBaseUrl } from "../../utils/constants";

export const createForm = async (formData) => {
  console.log("formData", formData);
  const data = await apiClient(`${apiBaseUrl}/candidatures/add`, {
    method: "POST",
    body: JSON.stringify(formData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
};
// Récupérer tous les templates
export const getTemplates = async () => {
  try {
    const data = await apiClient(`${apiBaseUrl}/candidatures/templates`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des templates :",
      error.message
    );
    return [];
  }
};

// Récupérer un formulaire par ID
export const getFormById = async (id) => {
  try {
    const data = await apiClient(`${apiBaseUrl}/candidatures/${id}`, {
      method: "GET",
    });
    return data;
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du formulaire :",
      error.message
    );
    return null;
  }
};

// Mettre à jour un formulaire
export const updateForm = async (id, formData) => {
  try {
    console.log("Updating form with data:", formData);

    // Extract only the necessary data for the update
    const updatePayload = {
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      eventLocation: formData.eventLocation,
      region: formData.region,
      prizes: formData.prizes || [],
      eventDates: formData.eventDates || [],
      fields: formData.fields || [], // Make sure fields are included
    };

    console.log("Sending update payload:", {
      fieldsCount: updatePayload.fields?.length,
      fields: updatePayload.fields,
    });

    const data = await apiClient(`${apiBaseUrl}/candidatures/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(updatePayload),
    });

    if (!data || typeof data !== "object") {
      console.warn("Réponse inattendue après mise à jour :", data);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error.message);
    return null;
  }
};

// Récupérer tous les formulaires
export const getAllForms = async (params = {}) => {
  try {
    // Add template filter parameter if provided
    const queryParams = new URLSearchParams();

    // Add all params to the query string
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const response = await apiClient(
      `${apiBaseUrl}/candidatures?${queryParams.toString()}`
    );
    console.log("response", response);
    return {
      data: response.data || [],
      pagination: response.pagination || { total: 0 },
    };
  } catch (error) {
    console.error("Error fetching forms:", error);
    return {
      data: [],
      pagination: { total: 0 },
    };
  }
};
// Récupérer tous les template fields
export const getTemplateFields = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const response = await apiClient(
      `${apiBaseUrl}/candidatures/template-fields?${queryParams}`
    );
    // The backend returns { success, data, pagination } structure
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
    console.warn("Unexpected response structure:", response);
    return [];
  } catch (error) {
    console.error("Error fetching template fields:", error.message);
    return [];
  }
};

// Supprimer un formulaire par ID
export const deleteFormById = async (id) => {
  try {
    const response = await apiClient(`${apiBaseUrl}/candidatures/${id}`, {
      method: "DELETE",
    });

    if (!response || !response.success) {
      throw new Error(response?.message || "Erreur lors de la suppression");
    }

    return response;
  } catch (error) {
    console.error(
      "Erreur lors de la suppression du formulaire :",
      error.message
    );
    throw error;
  }
};

// Publier un ou plusieurs formulaires
export const validateForms = async (ids = []) => {
  try {
    const response = await apiClient(`${apiBaseUrl}/candidatures/validate`, {
      method: "PATCH",
      body: JSON.stringify({ ids: ids }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response) {
      throw new Error("Réponse invalide du serveur.");
    }

    if (!response.success && response.modifiedCount === 0) {
      throw new Error(response.message || "Aucun formulaire n'a été validé.");
    }

    return response;
  } catch (err) {
    throw new Error(err.message || "Erreur réseau");
  }
};

// Publier un ou plusieurs formulaires validés
export const publishValidatedForms = async (ids = []) => {
  try {
    const response = await apiClient(
      `${apiBaseUrl}/candidatures/publish-validated`,
      {
        method: "PATCH",
        body: JSON.stringify({ formIds: ids }),
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response) {
      throw new Error("Réponse invalide du serveur.");
    }

    if (!response.success && response.modifiedCount === 0) {
      throw new Error(response.message || "Aucun formulaire n'a été validé.");
    }

    return response;
  } catch (err) {
    throw new Error(err.message || "Erreur réseau");
  }
};

// services/forms/formServices.js

export const saveFormAsTemplate = async (formId, templateData) => {
  const response = await apiClient(
    `${apiBaseUrl}/candidatures/${formId}/save-as-template`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    }
  );

  if (!response.success) {
    throw new Error(response.message || "Échec de la sauvegarde du modèle");
  }

  return response;
};

export const getAllTemplates = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const response = await apiClient(
    `${apiBaseUrl}/candidatures/templates?${queryParams}`,
    {
      method: "GET",
    }
  );

  if (!response.success) {
    throw new Error(response.message || "Échec du chargement des modèles");
  }

  return response;
};

export const createFormFromTemplate = async (templateId, formData) => {
  const response = await apiClient(
    `${apiBaseUrl}/candidatures/create-from-template/${templateId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    }
  );

  if (!response.success) {
    throw new Error(response.message || "Échec de la création du formulaire");
  }

  return response;
};
