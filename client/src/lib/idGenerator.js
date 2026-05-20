// Simple UUID generator for our form builder
export function generateId() {
  return "id_" + Math.random().toString(36).substring(2, 11);
}

// Fonction pour vérifier si une string est un ObjectId MongoDB valide
export function isValidObjectId(id) {
  if (!id || typeof id !== "string") return false;
  // Un ObjectId MongoDB est une string hexadécimale de 24 caractères
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Fonction pour vérifier si c'est un ID temporaire du frontend
export function isTempId(id) {
  if (!id || typeof id !== "string") return false;
  return id.startsWith("id_");
}

// Fonction pour nettoyer les données avant envoi au backend
export function sanitizeFieldForBackend(field) {
  if (!field || typeof field !== "object") return field;

  const sanitized = { ...field };

  // Supprimer les propriétés temporaires du frontend
  delete sanitized.id;

  // Ne garder _id que si c'est un ObjectId valide
  if (sanitized._id && !isValidObjectId(sanitized._id)) {
    delete sanitized._id;
  }

  // Nettoyer les options
  if (sanitized.options && Array.isArray(sanitized.options)) {
    sanitized.options = sanitized.options.map((option) => {
      if (typeof option !== "object") return option;

      const cleanOption = { ...option };
      delete cleanOption.id;
      delete cleanOption.tempId;

      if (cleanOption._id && !isValidObjectId(cleanOption._id)) {
        delete cleanOption._id;
      }

      return cleanOption;
    });
  }

  return sanitized;
}

// Fonction pour préparer un champ template
export function prepareTemplateField(fieldData, isFromTemplate = false) {
  const baseField = {
    id: generateId(), // Toujours un nouvel ID frontend
    type: fieldData.type,
    label: fieldData.label || { fr: "Nouveau champ", ar: "حقل جديد" },
    name: fieldData.name || `field_${generateId()}`,
    required: fieldData.required ?? false,
    placeholder: fieldData.placeholder || { fr: "", ar: "" },
    isFromTemplate: isFromTemplate,
    templateFieldId: fieldData._id, // Référence au template original
  };

  // Ajouter les options si nécessaire
  if (["select", "radio", "checkbox"].includes(fieldData.type)) {
    baseField.options = (fieldData.options || []).map((option) => ({
      ...option,
      id: generateId(), // Nouvel ID pour chaque option
    }));
  }

  // Ajouter le layout si présent
  if (fieldData.layout) {
    baseField.layout = fieldData.layout;
  }

  return baseField;
}
