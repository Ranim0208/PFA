// utils/emailHelpers.js*
import { getEmailStyles } from "../helpers/emailHelpers.js";
export const generateTrainingOutputEmail = (user, trainingOutput, training) => {
  const styles = getEmailStyles();
  const dueDate = new Date(trainingOutput.dueDate).toLocaleDateString("fr-FR");

  return {
    to: user.email,
    subject: `[TACIR] Nouvelle sortie de formation disponible : ${trainingOutput.title}`,
    html: `
      <div style="${styles.container}">
        <h2 style="${
          styles.header
        }">Nouvelle sortie de formation disponible</h2>
        
        <p>Bonjour ${user.firstName || ""} ${user.lastName || ""},</p>
        
        <p>Une nouvelle sortie de formation a été publiée pour la formation <strong>${
          training.title
        }</strong>.</p>
        
        <div style="${styles.highlightBox}">
          <h3 style="${styles.sectionHeader}">${trainingOutput.title}</h3>
          <p>${trainingOutput.description}</p>
          
          <p><strong>Date limite :</strong> ${dueDate}</p>
          
          ${
            trainingOutput.instructions
              ? `
            <div style="margin-top: 15px;">
              <h4 style="margin-bottom: 5px;">Instructions :</h4>
              <p>${trainingOutput.instructions}</p>
            </div>
          `
              : ""
          }
          
          ${
            trainingOutput.attachments.length > 0
              ? `
            <div style="margin-top: 15px;">
              <h4 style="margin-bottom: 5px;">Pièces jointes (${
                trainingOutput.attachments.length
              }) :</h4>
              <ul style="margin-top: 5px; padding-left: 20px;">
                ${trainingOutput.attachments
                  .map(
                    (att) =>
                      `<li><a href="${
                        process.env.FRONTEND_URL || "http://localhost:3000"
                      }${att.url}" target="_blank">${att.name}</a></li>`
                  )
                  .join("")}
              </ul>
            </div>
          `
              : ""
          }
        </div>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/trainings/${training._id}/outputs"
             style="background-color: #2563eb; color: white;
                    padding: 12px 24px; text-decoration: none;
                    border-radius: 6px; display: inline-block;
                    font-weight: bold; font-size: 16px;">
            📚 Voir les détails sur la plateforme
          </a>
        </div>
        
        <div style="${styles.footer}">
          <p>Cet email a été envoyé automatiquement. Veuillez ne pas y répondre.</p>
          <p>Cordialement,<br>L'équipe TACIR</p>
        </div>
      </div>
    `,
  };
};
