// Helper function to format file size
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "Taille inconnue";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Helper function to get file icon based on mimetype
const getFileIcon = (mimetype, fileName) => {
  if (!mimetype || mimetype === "unknown") {
    // Try to guess from filename
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(ext)) return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "🖼️";
    return "📎";
  }

  if (mimetype.includes("pdf")) return "📄";
  if (mimetype.includes("word") || mimetype.includes("document")) return "📝";
  if (mimetype.includes("image")) return "🖼️";
  return "📎";
};
