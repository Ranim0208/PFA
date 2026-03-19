import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { statusOptions } from "@/utils/constants";

export const handleExportAll = async (data = []) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Soumissions");

    // Dynamically extract all labels (question fields)
    const allLabels = new Set();
    data.forEach((sub) =>
      sub.answers.forEach((answer) => {
        const field = sub.form.fields.find((f) => f._id === answer.field._id);
        if (field) {
          allLabels.add(field.label.fr);
        }
      })
    );
    const labelArray = Array.from(allLabels);

    // Define columns (headers)
    worksheet.columns = [
      { header: "Titre du formulaire", key: "formTitle", width: 30 },
      { header: "Statut", key: "status", width: 15 },
      { header: "Date de soumission", key: "submittedAt", width: 20 },
      ...labelArray.map((label) => ({
        header: label,
        key: label,
        width: 25,
      })),
    ];

    // Add rows
    data.forEach((sub) => {
      const answerMap = {};
      sub.answers.forEach((answer) => {
        const field = sub.form.fields.find((f) => f._id === answer.field._id);
        if (field) {
          answerMap[field.label.fr] = answer.value;
        }
      });

      const statusLabel = statusOptions[sub.status]?.label || sub.status;
      const row = worksheet.addRow({
        formTitle: sub.form?.title?.fr,
        status: statusLabel,
        submittedAt: new Date(sub.submittedAt).toLocaleDateString(),
        ...answerMap,
      });

      // Choose fill color based on status
      const fillColor =
        sub.status === "accepted"
          ? "C6F6D5" // green
          : sub.status === "rejected"
          ? "FED7D7" // red
          : sub.status === "under_review"
          ? "FEFCBF" // yellow
          : null;

      // Apply color to all cells in the row
      if (fillColor) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: fillColor },
          };
        });
      }
    });

    // Write to file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, "soumissions.xlsx");
    toast.success("Export Excel généré avec couleurs !");
  } catch (error) {
    toast.error("Erreur lors de la génération de l'export");
    console.error(error);
  }
};
