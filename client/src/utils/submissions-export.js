// export-excel.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { statusOptions } from "@/utils/constants";

export const handleExportWithDynamicColumns = async (data = []) => {
  try {
    if (!data.length) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Soumissions");

    // Extract ALL unique field labels from all submissions
    const allFieldLabels = new Set();

    data.forEach((submission) => {
      submission.answers?.forEach((answer) => {
        const label = answer.field?.label?.fr;
        if (label) {
          allFieldLabels.add(label);
        }
      });
    });

    const dynamicFieldLabels = Array.from(allFieldLabels).sort();

    // Define static columns with proper widths
    const staticColumns = [
      { header: "ID", key: "id", width: 15 },
      { header: "Titre du Formulaire", key: "formTitle", width: 30 },
      { header: "Région", key: "region", width: 20 },
      { header: "Statut", key: "status", width: 20 },
      {
        header: "Évaluation Coordinateur",
        key: "coordinatorEvaluation",
        width: 25,
      },
      { header: "Évaluation Mentor", key: "mentorEvaluation", width: 25 },
      { header: "Commentaire Mentor", key: "mentorComment", width: 25 },
      { header: "Statut de Présence", key: "attendanceStatus", width: 18 },
      { header: "Date de Soumission", key: "submittedAt", width: 22 },
      { header: "Date de Création", key: "createdAt", width: 20 },
      { header: "Dernière Modification", key: "updatedAt", width: 22 },
    ];

    // Add dynamic columns
    const dynamicColumns = dynamicFieldLabels.map((label) => ({
      header: label,
      key: label,
      width: 25,
    }));

    // Set all columns
    worksheet.columns = [...staticColumns, ...dynamicColumns];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = {
      bold: true,
      color: { argb: "FFFFFF" },
      size: 12,
    };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1E40AF" }, // TACIR blue
    };
    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    headerRow.height = 25;

    // Add data rows
    data.forEach((submission, index) => {
      // Create answer map for dynamic fields
      const answerMap = {};

      dynamicFieldLabels.forEach((fieldLabel) => {
        const answer = submission.answers?.find(
          (ans) => ans.field?.label?.fr === fieldLabel
        );

        let value = "";
        if (answer) {
          if (Array.isArray(answer.value)) {
            value = answer.value.join(", ");
          } else if (
            typeof answer.value === "object" &&
            answer.value !== null
          ) {
            value = JSON.stringify(answer.value);
          } else {
            value = String(answer.value || "");
          }
        }
        answerMap[fieldLabel] = value;
      });

      // Get coordinator evaluation (preselectionEvaluations)
      let coordinatorEvaluation = "";
      if (
        submission.preselectionEvaluations &&
        submission.preselectionEvaluations.length > 0
      ) {
        const latestEvaluation =
          submission.preselectionEvaluations[
            submission.preselectionEvaluations.length - 1
          ];
        coordinatorEvaluation = latestEvaluation.evaluation || "";
      }

      // Get mentor evaluation and comment
      let mentorEvaluation = "";
      let mentorComment = "";
      if (
        submission.mentorEvaluations &&
        submission.mentorEvaluations.length > 0
      ) {
        const latestMentorEvaluation =
          submission.mentorEvaluations[submission.mentorEvaluations.length - 1];
        mentorEvaluation = latestMentorEvaluation.evaluation || "";
        mentorComment = latestMentorEvaluation.comment || "";
      }

      // Format dates
      const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
          return new Date(dateString).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return dateString;
        }
      };

      const rowData = {
        id: submission._id || `sub-${index + 1}`,
        formTitle:
          submission.formTitle || submission.form?.title?.fr || "Sans titre",
        region: regionName,
        status: statusOptions[submission.status]?.label || submission.status,
        coordinatorEvaluation: coordinatorEvaluation,
        mentorEvaluation: mentorEvaluation,
        mentorComment: mentorComment,
        attendanceStatus: getAttendanceStatusLabel(submission.attendanceStatus),
        submittedAt: formatDate(submission.submittedAt),
        createdAt: formatDate(submission.createdAt),
        updatedAt: formatDate(submission.updatedAt),
        ...answerMap,
      };

      const row = worksheet.addRow(rowData);

      // Apply row styling based on status
      applyRowStyling(row, submission.status);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(Math.max(maxLength + 2, column.width), 50);
    });

    // Freeze header row
    worksheet.views = [
      {
        state: "frozen",
        xSplit: 0,
        ySplit: 1,
        activeCell: "A2",
      },
    ];

    // Add filters
    worksheet.autoFilter = {
      from: "A1",
      to: `${String.fromCharCode(65 + worksheet.columnCount - 1)}1`,
    };

    // Write to file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const timestamp = new Date().toISOString().split("T")[0];
    saveAs(blob, `soumissions_completes_${timestamp}.xlsx`);

    toast.success(
      `Export réussi ! ${data.length} soumissions exportées avec ${dynamicFieldLabels.length} champs dynamiques.`
    );
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Erreur lors de la génération de l'export Excel");
  }
};

// Helper function to get attendance status label
function getAttendanceStatusLabel(attendanceStatus) {
  const statusMap = {
    pending: "En attente",
    present: "Présent",
    absent: "Absent",
    declined: "Refusé",
  };
  return statusMap[attendanceStatus] || attendanceStatus || "Non défini";
}

// Helper function to apply row styling based on status
function applyRowStyling(row, status) {
  let fillColor;
  let fontColor = "000000"; // Default black text

  switch (status) {
    case "accepted":
      fillColor = "E8F5E8"; // Light green
      break;
    case "acceptedAfterCreathon":
      fillColor = "E3F2FD"; // Light blue
      break;
    case "rejected":
      fillColor = "FFEBEE"; // Light red
      break;
    case "submitted":
      fillColor = "FFFDE7"; // Light yellow
      break;
    case "under_review":
      fillColor = "FFF3E0"; // Light orange
      break;
    case "draft":
      fillColor = "F5F5F5"; // Light gray
      break;
    default:
      fillColor = "FFFFFF"; // White
  }

  row.eachCell((cell) => {
    // Background color
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: fillColor },
    };

    // Borders
    cell.border = {
      top: { style: "thin", color: { argb: "DDDDDD" } },
      left: { style: "thin", color: { argb: "DDDDDD" } },
      bottom: { style: "thin", color: { argb: "DDDDDD" } },
      right: { style: "thin", color: { argb: "DDDDDD" } },
    };

    // Font and alignment
    cell.font = {
      color: { argb: fontColor },
      size: 10,
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "left",
      wrapText: true,
    };
  });

  // Make status cell bold
  const statusCell = row.getCell("status");
  statusCell.font = { ...statusCell.font, bold: true };
}
