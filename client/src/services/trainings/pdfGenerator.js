import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { loadImage } from "@/utils/loadImage";
import base64Font from "../../../public/fonts/base64Font";

// Utility to convert ArrayBuffer to Base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

// Function to load Arslan font
const loadArslanFont = async (doc) => {
  try {
    const Arslanfont = base64Font;
    doc.addFileToVFS("Arslan.ttf", Arslanfont);
    doc.addFont("Arslan.ttf", "Arslan", "normal");
    doc.setFont("Arslan", "normal");
    return true;
  } catch (error) {
    console.error("Error loading Arslan font:", error);
    doc.setFont("helvetica", "normal");
    return false;
  }
};

// Utility to detect Arabic text
const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

// Translation object for French and Arabic
const translations = {
  fr: {
    present: "Présent",
    absent: "Absent",
    signed: "Signé",
    participants: "Présents",
    absentees: "Absents",
    attendanceRate: "Taux de présence",
    generatedOn: "Document généré le",
    at: "à",
    instructor: "Intervenant: Mekni Ali",
    companyInfo: "TACIR • Dar Bach Hamba, Rue Kouttab Ouazir, Tunis",
    contact: "Tél: 52 771 241 • tacir.amavi@gmail.com",
    day: "Jour",
    of: "sur",
    singleSession: "Session unique",
  },
  ar: {
    present: "حاضر",
    absent: "غائب",
    signed: "موقّع",
    participants: "الحاضرون",
    absentees: "الغائبون",
    attendanceRate: "نسبة الحضور",
    generatedOn: "تم إنشاء المستند في",
    at: "الساعة",
    instructor: "المدرب: مكني علي",
    companyInfo: "تاسير • دار باش حامبة، شارع قطب وزير، تونس",
    contact: "الهاتف: 52 771 241 • tacir.amavi@gmail.com",
    day: "اليوم",
    of: "من",
    singleSession: "جلسة واحدة",
  },
};

// Common function to add header and footer
const addHeaderFooter = (doc, pageWidth, fontLoaded, language, training, logoImg) => {
  const { instructor, companyInfo, contact, generatedOn, at } = translations[language];
  const headerY = 12;
  const startY = logoImg ? headerY + 15 : headerY;

  // Header with logo
  if (logoImg) {
    try {
      doc.addImage(logoImg, "PNG", 14, headerY, 25, 8);
    } catch (error) {
      console.error("Error adding logo:", error);
    }
  }

  // Company info
  doc.setFontSize(9);
  doc.setTextColor(100);
  if (language === "ar" && fontLoaded) {
    doc.setFont("Arslan", "normal");
    doc.text(doc.processArabic(companyInfo), pageWidth - 14, startY, { align: "right" });
    doc.text(doc.processArabic(contact), pageWidth - 14, startY + 5, { align: "right" });
  } else {
    doc.setFont("helvetica", "normal");
    doc.text(companyInfo, pageWidth - 14, startY, { align: "right" });
    doc.text(contact, pageWidth - 14, startY + 5, { align: "right" });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, footerY, pageWidth, 20, "F");

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const now = new Date();
  const generatedDate = now.toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR");
  const generatedTime = now.toLocaleTimeString(language === "ar" ? "ar-TN" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (language === "ar" && fontLoaded) {
    doc.setFont("Arslan", "normal");
    doc.text(doc.processArabic(instructor), 14, footerY + 5);
    doc.text(doc.processArabic(`${generatedOn} ${generatedDate} ${at} ${generatedTime}`), 14, footerY + 10);
    doc.text(doc.processArabic(companyInfo), pageWidth - 14, footerY + 5, { align: "right" });
    doc.text(doc.processArabic(contact), pageWidth - 14, footerY + 10, { align: "right" });
  } else {
    doc.setFont("helvetica", "normal");
    doc.text(instructor, 14, footerY + 5);
    doc.text(`${generatedOn} ${generatedDate} ${at} ${generatedTime}`, 14, footerY + 10);
    doc.text(companyInfo, pageWidth - 14, footerY + 5, { align: "right" });
    doc.text(contact, pageWidth - 14, footerY + 10, { align: "right" });
  }

  return startY;
};

export const generateDailyAttendanceReport = async (training, sessions, trainingType, dayNumber, dayDate, language = "fr") => {
  const doc = new jsPDF();
  const fontLoaded = await loadArslanFont(doc);
  const pageWidth = doc.internal.pageSize.getWidth();
  const isBootcamp = trainingType === "bootcamp";

  // Load company logo
  let logoImg = null;
  try {
    logoImg = await loadImage("/images/logo.png");
  } catch (error) {
    console.error("Error loading logo:", error);
  }

  // Add header and footer
  const startY = addHeaderFooter(doc, pageWidth, fontLoaded, language, training, logoImg);

  // Training info header
  doc.setFillColor(241, 245, 249);
  doc.rect(0, startY + 10, pageWidth, 30, "F");

  doc.setFontSize(12);
  doc.setFont(fontLoaded && language === "ar" ? "Arslan" : "helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  if (language === "ar" && fontLoaded) {
    doc.text(doc.processArabic(training.title), pageWidth / 2, startY + 18, { align: "center" });
  } else {
    doc.text(training.title, pageWidth / 2, startY + 18, { align: "center" });
  }

  doc.setFontSize(10);
  doc.setFont(fontLoaded && language === "ar" ? "Arslan" : "helvetica", "normal");
  doc.setTextColor(100, 116, 139);

  // Daily session info
  const { day, of, singleSession } = translations[language];
  const dayInfo = isBootcamp
    ? `${day} ${dayNumber} ${of} ${training.duration || "N/A"}`
    : singleSession;

  const dateText = dayDate.toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const locationDisplay = training.location === "online" ? (language === "ar" ? "فيديو" : "Visio") : training.location;

  if (language === "ar" && fontLoaded) {
    doc.text(doc.processArabic(dayInfo), pageWidth / 2, startY + 25, { align: "center" });
    doc.text(doc.processArabic(`${dateText} • ${training.time || ""} • ${locationDisplay}`), pageWidth / 2, startY + 30, { align: "center" });
  } else {
    doc.text(dayInfo, pageWidth / 2, startY + 25, { align: "center" });
    doc.text(`${dateText} • ${training.time || ""} • ${locationDisplay}`, pageWidth / 2, startY + 30, { align: "center" });
  }

  // Prepare table data (set signature to empty string when present to prevent default text)
  const columns = language === "ar"
    ? ["#", "المشارك", "المجموعة", "الحضور", "التوقيع"]
    : ["#", "Participant", "Cohorte", "Présence", "Signature"];
  const tableData = sessions.map((session, index) => [
    index + 1,
    "",
    session.cohort.includes("/") ? session.cohort.split("/")[0].trim() : session.cohort,
    session.attendance === "present" ? translations[language].present : translations[language].absent,
    session.signature ? "" : "", // Empty string when signature exists, otherwise empty
  ]);

  autoTable(doc, {
    startY: startY + 45,
    head: [columns],
    body: tableData,
    theme: "grid",
    styles: {
      font: fontLoaded && language === "ar" ? "Arslan" : "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: [15, 23, 42],
      fillColor: [255, 255, 255],
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
      halign: language === "ar" ? "right" : "left",
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 58, 138],
      fontStyle: "bold",
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 70, halign: language === "ar" ? "right" : "left" },
      2: { cellWidth: 30, halign: language === "ar" ? "right" : "left" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 35, halign: "center" },
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      const session = sessions[data.row.index];

      // Participant name (use Arslan for Arabic, Helvetica for non-Arabic)
      if (data.column.index === 1 && session.participantName) {
        const name = session.participantName;
        doc.setTextColor(0, 0, 0);
        doc.setFont(fontLoaded && isArabic(name) ? "Arslan" : "helvetica", "normal");
        const processedName = fontLoaded && isArabic(name)
          ? doc.splitTextToSize(doc.processArabic(name), data.cell.width - 4)
          : name;
        doc.text(processedName, data.cell.x + (language === "ar" ? data.cell.width - 2 : 2), data.cell.y + 6, {
          align: language === "ar" ? "right" : "left",
          maxWidth: data.cell.width - 4,
        });
      }

      // Presence
      if (data.column.index === 3) {
        const isPresent = session.attendance === "present";
        if (isPresent) {
          doc.setTextColor(21, 128, 61);
          doc.text("✓", data.cell.x + (language === "ar" ? 5 : data.cell.width - 5), data.cell.y + 10);
        }
      }

      // Signature (only image, no text when signature exists)
      if (data.column.index === 4 && session?.signature) {
        try {
          doc.addImage(session.signature, "PNG", data.cell.x + 2, data.cell.y + 3, 20, 8);
        } catch (error) {
          console.error("Error adding signature:", error);
        }
      }
    },
  });

  // Statistics
  const { participants, absentees, attendanceRate } = translations[language];
  const totalParticipants = sessions.length;
  const presentCount = sessions.filter((s) => s.attendance === "present").length;
  const statsY = doc.lastAutoTable.finalY + 10;

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  if (language === "ar" && fontLoaded) {
    doc.setFont("Arslan", "normal");
    doc.text(doc.processArabic(`${participants}: ${presentCount}`), pageWidth - 20, statsY, { align: "right" });
    doc.text(doc.processArabic(`${absentees}: ${totalParticipants - presentCount}`), pageWidth - 20, statsY + 5, { align: "right" });
    doc.text(doc.processArabic(`${attendanceRate}: ${Math.round((presentCount / totalParticipants) * 100)}%`), 20, statsY, { align: "left" });
  } else {
    doc.setFont("helvetica", "normal");
    doc.text(`${participants}: ${presentCount}`, 20, statsY);
    doc.text(`${absentees}: ${totalParticipants - presentCount}`, 20, statsY + 5);
    doc.text(`${attendanceRate}: ${Math.round((presentCount / totalParticipants) * 100)}%`, pageWidth - 20, statsY, { align: "right" });
  }

  // Save with appropriate filename
  const fileName = `presence_${training.title.replace(/\s+/g, "_")}_${isBootcamp ? `jour${dayNumber}` : "formation"}.pdf`;
  doc.save(fileName);
};

export const generateTrainingReport = async (training, sessions, language = "fr") => {
  const doc = new jsPDF();
  const fontLoaded = await loadArslanFont(doc);
  const pageWidth = doc.internal.pageSize.getWidth();

  // Load company logo
  let logoImg = null;
  try {
    logoImg = await loadImage("/images/logo.png");
  } catch (error) {
    console.error("Error loading logo:", error);
  }

  // Add header and footer
  const startY = addHeaderFooter(doc, pageWidth, fontLoaded, language, training, logoImg);

  // Training info header
  doc.setFillColor(241, 245, 249);
  doc.rect(0, startY + 10, pageWidth, 25, "F");

  doc.setFontSize(12);
  doc.setFont(fontLoaded && language === "ar" ? "Arslan" : "helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  if (language === "ar" && fontLoaded) {
    doc.text(doc.processArabic(training.title), pageWidth / 2, startY + 18, { align: "center" });
  } else {
    doc.text(training.title, pageWidth / 2, startY + 18, { align: "center" });
  }

  doc.setFontSize(10);
  doc.setFont(fontLoaded && language === "ar" ? "Arslan" : "helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  const trainingDate = new Date(training.startDate).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR");
  const locationDisplay = training.sessionDetails?.sessionType === "online" ? (language === "ar" ? "فيديو" : "Visio") : training.location;

  if (language === "ar" && fontLoaded) {
    doc.text(doc.processArabic(`${trainingDate} • ${training.time || ""} • ${locationDisplay}`), pageWidth / 2, startY + 25, { align: "center" });
  } else {
    doc.text(`${trainingDate} • ${training.time || ""} • ${locationDisplay}`, pageWidth / 2, startY + 25, { align: "center" });
  }

  // Prepare table data (set signature to empty string when present to prevent default text)
  const columns = language === "ar"
    ? ["#", "التاريخ", "الوقت", "المجموعة", "المشارك", "الحضور", "التوقيع"]
    : ["#", "Date", "Heure", "Cohorte", "Participant", "Présence", "Signature"];
  const tableData = sessions.map((session, index) => [
    index + 1,
    new Date(session.date).toLocaleDateString(language === "ar" ? "ar-TN" : "fr-FR"),
    `${session.startTime} - ${session.endTime}`,
    session.cohort.includes("/") ? session.cohort.split("/")[0].trim() : session.cohort,
    "",
    session.attendance === "present" ? translations[language].present : translations[language].absent,
    session.signature ? "" : "", // Empty string when signature exists, otherwise empty
  ]);

  autoTable(doc, {
    startY: startY + 40,
    head: [columns],
    body: tableData,
    theme: "grid",
    styles: {
      font: fontLoaded && language === "ar" ? "Arslan" : "helvetica",
      fontSize: 9,
      cellPadding: 3,
      textColor: [15, 23, 42],
      fillColor: [255, 255, 255],
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
      halign: language === "ar" ? "right" : "left",
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 58, 138],
      fontStyle: "bold",
      lineColor: [226, 232, 240],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 30, halign: language === "ar" ? "right" : "left" },
      4: { cellWidth: 40, halign: language === "ar" ? "right" : "left" },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: 25, halign: "center" },
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      const session = sessions[data.row.index];

      // Participant name (use Arslan for Arabic, Helvetica for non-Arabic)
      if (data.column.index === 4 && session.participantName) {
        const name = session.participantName;
        doc.setTextColor(0, 0, 0);
        doc.setFont(fontLoaded && isArabic(name) ? "Arslan" : "helvetica", "normal");
        const processedName = fontLoaded && isArabic(name)
          ? doc.splitTextToSize(doc.processArabic(name), data.cell.width - 4)
          : name;
        doc.text(processedName, data.cell.x + (language === "ar" ? data.cell.width - 3 : 3), data.cell.y + 6, {
          align: language === "ar" ? "right" : "left",
          maxWidth: data.cell.width - 4,
        });
      }

      // Presence
      if (data.column.index === 5) {
        const isPresent = session.attendance === "present";
        if (isPresent) {
          doc.setTextColor(21, 128, 61);
          doc.text("✓", data.cell.x + (language === "ar" ? 5 : data.cell.width - 5), data.cell.y + 10);
        }
      }

      // Signature (only image, no text when signature exists)
      if (data.column.index === 6 && session?.signature) {
        try {
          doc.addImage(session.signature, "PNG", data.cell.x + 2, data.cell.y + 3, 20, 8);
        } catch (error) {
          console.error("Error adding signature:", error);
        }
      }
    },
  });

  // Save
  doc.save(`presence_${training.title.replace(/\s+/g, "_")}.pdf`);
};