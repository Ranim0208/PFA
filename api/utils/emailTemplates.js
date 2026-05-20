export const getEventDatesText = (eventDates) => {
  return eventDates
    .map((date) => `${date.date.toLocaleDateString()} - ${date.description.fr}`)
    .join("\n");
};

// Email pour les candidats acceptés
export const generateUserAcceptanceEmail = (user, form, eventDatesText) => {
  return {
    to: user.email,
    subject: `[TACIR] Félicitations ! Votre candidature pour ${form.title.fr} a été acceptée`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <p>Bonjour ${user.firstName},</p>

        <p>Nous avons le plaisir de vous informer que votre candidature pour le Créathon 
        <strong>"${form.title.fr}"</strong> a été retenue !</p>

        <h3>Détails pratiques :</h3>
        <p><strong>📅 Dates :</strong><br>${eventDatesText}</p>
        <p><strong>📍 Lieu :</strong> ${form.eventLocation.fr}</p>

        <h3>Prochaines étapes :</h3>
        <ol>
          <li>Le coordinateur régional vous contactera par téléphone pour confirmer votre présence</li>
          <li>Préparez votre projet et soyez prêt à pitcher votre idée</li>
        </ol>

        <p>Nous sommes impatients de découvrir votre projet et de vous accueillir lors de cet événement.</p>

        <p>Cordialement,<br>L'équipe TACIR<br><em>Plateforme d'innovation et de créativité</em></p>
      </div>
    `,
  };
};

// Email pour le coordinateur régional
export const generateRegionalCoordinatorEmail = (
  coordinator,
  form,
  submissions,
  eventDatesText
) => {
  const coordinatorName = coordinator.firstName || "Coordinateur";
  const usersList = submissions
    .map(
      (s) => `
        <li>
          <strong>${s.firstName || "Participant"} ${
        s.lastName || ""
      }</strong><br>
          📧 ${s.email}<br>
          📞 ${s.phone || "[Numéro à compléter]"}
        </li>`
    )
    .join("");

  return {
    to: coordinator.email,
    subject: `[TACIR] Liste des participants acceptés pour ${form.title.fr}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <p>Bonjour ${coordinatorName},</p>

        <p>Voici la liste des candidats retenus pour le Créathon 
        <strong>"${form.title.fr}"</strong> :</p>

        <ul>${usersList}</ul>

        <h3>Votre mission :</h3>
        <ul>
          <li>☎ Contacter chaque participant par téléphone pour :
            <ul>
              <li>Confirmer leur présence</li>
              <li>Répondre à leurs questions</li>
              <li>Vérifier leurs disponibilités</li>
            </ul>
          </li>
        </ul>

        <h3>Détails de l'événement :</h3>
        <p><strong>📅 Dates :</strong><br>${eventDatesText}</p>
        <p><strong>📍 Lieu :</strong> ${form.eventLocation.fr}</p>

        <p>Merci de nous confirmer une fois cette étape accomplie.</p>

        <p>Cordialement,<br>L'équipe TACIR<br><em>Plateforme d'innovation et de créativité</em></p>
      </div>
    `,
  };
};

// Email pour les coordinateurs généraux
export const generateGeneralCoordinatorEmail = (
  coordinator,
  form,
  submissions,
  eventDatesText
) => {
  const count = submissions.length;
  const regionalCoordinator = submissions[0]?.form?.region?.name || "";

  return {
    to: coordinator.email,
    subject: `[TACIR] Validation des candidatures pour ${form.title.fr}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <p>Bonjour ${coordinator.firstName},</p>

        <p>Les candidatures pour le Créathon <strong>"${
          form.title.fr
        }"</strong> (${regionalCoordinator}) ont été validées avec succès.</p>

        <h3>Résumé :</h3>
        <ul>
          <li>✅ ${count} participants sélectionnés</li>
          <li>📅 Dates : ${form.startDate.toLocaleDateString()} au ${form.endDate.toLocaleDateString()}</li>
          <li>📍 Lieu : ${form.eventLocation.fr}</li>
        </ul>

        <h3>Prochaines étapes :</h3>
        <ul>
          <li>Le coordinateur régional contactera les participants</li>
          <li>Préparation des supports logistiques</li>
          <li>Envoi du kit participant 48h avant l'événement</li>
        </ul>

        <p>Vous pouvez consulter la liste complète des participants sur la plateforme TACIR.</p>

        <p>Cordialement,<br>L'équipe TACIR<br><em>Plateforme d'innovation et de créativité</em></p>
      </div>
    `,
  };
};

export const generateInvitationEmail = (
  member,
  tempPassword,
  creathon,
  type
) => {
  const role = type === "mentors" ? "mentor" : "membre du jury";
  const hasPassword = !!tempPassword;

  return {
    to: member.email,
    subject: `[TACIR] Invitation au Créathon ${creathon.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Invitation au Créathon ${
          creathon.title
        }</h2>

        <p>Bonjour ${member.firstName || ""},</p>

        <p>Vous avez été invité(e) à participer au Créathon <strong>${
          creathon.title
        }</strong>
        en tant que <strong>${role}</strong>.</p>

        ${
          hasPassword
            ? `
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Nouveau compte créé</strong></p>
              <p>Vos identifiants de connexion :</p>
              <ul>
                <li><strong>Email :</strong> ${member.email}</li>
                <li><strong>Mot de passe temporaire :</strong> <code style="background-color: #e5e7eb; padding: 2px 4px; border-radius: 3px;">${tempPassword}</code></li>
              </ul>
              <p style="color: #dc2626; font-size: 14px;">
                ⚠️ Veuillez changer votre mot de passe après votre première connexion pour des raisons de sécurité.
              </p>
            </div>
          `
            : `
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="color: #065f46; margin: 0;">
                ✅ Votre compte existant a été associé à cet événement. Utilisez vos identifiants habituels pour vous connecter.
              </p>
            </div>
          `
        }

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Détails de l'événement</h3>
          <p><strong>📅 Dates :</strong></p>
          <ul style="margin: 5px 0 15px 20px;">
            <li>Début : ${new Date(creathon.dates.startDate).toLocaleDateString(
              "fr-FR"
            )}</li>
            <li>Fin : ${new Date(creathon.dates.endDate).toLocaleDateString(
              "fr-FR"
            )}</li>
          </ul>

          <p><strong>📍 Lieu :</strong> ${creathon.location.venue}, ${
      creathon.location.city
    }</p>
          <p><strong>👥 Votre rôle :</strong> ${role}</p>
        </div>

        <div style="margin: 30px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login"
             style="background-color: #2563eb; color: white;
                    padding: 12px 24px; text-decoration: none;
                    border-radius: 6px; display: inline-block;
                    font-weight: bold; font-size: 16px;">
            🚀 Accéder à la plateforme
          </a>
        </div>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          <p style="color: #6b7280; font-size: 14px;">
            Si vous avez des questions concernant cet événement, n'hésitez pas à contacter l'équipe d'organisation.
          </p>
          <p>Cordialement,<br><strong>L'équipe d'organisation du Créathon</strong></p>
        </div>
      </div>
    `,
  };
};

// In emailTemplates.js
export const generateReplacementNotificationEmail = (
  coordinator,
  { replacementCandidate, formTitle, coordinatorNote },
  form // Added as separate parameter
) => {
  return {
    to: coordinator.email,
    subject: `[TACIR] Remplacement candidat - ${formTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">Notification de remplacement</h2>

        <p>Bonjour ${coordinator.firstName},</p>

        <p>Un nouveau candidat a été sélectionné pour remplacer un participant désisté dans le cadre du Créathon <strong>${formTitle}</strong>.</p>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #1e40af;">Nouveau participant</h3>
          <p><strong>👤 Nom :</strong> ${
            replacementCandidate.name || "Non spécifié"
          }</p>
          <p><strong>📧 Email :</strong> ${
            replacementCandidate.email || "Non fourni"
          }</p>
          <p><strong>📞 Téléphone :</strong> ${
            replacementCandidate.phone || "[Numéro à compléter]"
          }</p>
        </div>

        ${
          coordinatorNote
            ? `
        <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin-top: 0; color: #92400e;">Note du coordinateur</h4>
          <p>${coordinatorNote}</p>
        </div>
        `
            : ""
        }

        <h3 style="color: #1e40af;">Détails de la formation</h3>
        <p><strong>📅 Dates :</strong><br>${
          form.eventDates
            ? getEventDatesText(form.eventDates)
            : "Dates non spécifiées"
        }</p>
        <p><strong>📍 Lieu :</strong> ${
          form.eventLocation?.fr || "Lieu non spécifié"
        }</p>

        <h3 style="color: #1e40af;">Actions requises</h3>
        <ol>
          <li>Contacter le nouveau participant par téléphone pour confirmer sa présence</li>
          <li>Vérifier ses disponibilités pour les dates de l'événement</li>
          <li>Lui envoyer les informations pratiques par email</li>
        </ol>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 0.9em; color: #6b7280;">
            Cette notification a été générée automatiquement par la plateforme TACIR.
          </p>
        </div>

        <p>Cordialement,<br>L'équipe TACIR<br><em>Plateforme d'innovation et de créativité</em></p>
      </div>
    `,
  };
};

export const generateMentorInvitationEmail = (
  mentor,
  creathon,
  tempPassword = null
) => {
  const email = mentor.user?.email || mentor.email;
  const firstName = mentor.user?.firstName || mentor.firstName;
  const lastName = mentor.user?.lastName || mentor.lastName;

  if (!email) throw new Error("No email address found for mentor");

  const invitationLink = `${process.env.FRONTEND_URL}/mentor/onboarding?token=${mentor.invitationToken}`;
  const hasPassword = !!tempPassword;

  return {
    to: email,
    subject: `Invitation à participer comme mentor - ${creathon.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">Invitation en tant que mentor</h2>
        
        <p>Bonjour ${firstName} ${lastName},</p>
        
        <p>Vous avez été sélectionné comme mentor pour le créathon <strong>${
          creathon.title
        }</strong>.</p>
        
        ${
          hasPassword
            ? `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nouveau compte créé</strong></p>
            <p>Vos identifiants de connexion :</p>
            <ul>
              <li><strong>Email :</strong> ${email}</li>
              <li><strong>Mot de passe temporaire :</strong> 
                <code style="background-color: #e5e7eb; padding: 2px 4px; border-radius: 3px;">${tempPassword}</code>
              </li>
            </ul>
            <p style="color: #dc2626; font-size: 14px;">
              ⚠️ Veuillez changer votre mot de passe après votre première connexion.
            </p>
          </div>
        `
            : `
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="color: #065f46; margin: 0;">
              ✅ Votre compte existant a été associé à cet événement.
            </p>
          </div>
        `
        }
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Détails de l'événement</h3>
          <p><strong>📅 Dates :</strong></p>
          <ul style="margin: 5px 0 15px 20px;">
            <li>Début : ${new Date(creathon.dates.startDate).toLocaleDateString(
              "fr-FR"
            )}</li>
            <li>Fin : ${new Date(creathon.dates.endDate).toLocaleDateString(
              "fr-FR"
            )}</li>
          </ul>
          <p><strong>📍 Lieu :</strong> ${
            creathon.location?.venue || "Lieu à confirmer"
          }, ${creathon.location?.city || ""}</p>
        </div>
        
        <p style="margin-bottom: 20px;">Veuillez compléter votre profil en cliquant sur le lien ci-dessous :</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${invitationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Compléter mon profil
          </a>
        </div>
        
        <p style="font-size: 0.9em; color: #6b7280;">
          <em>Ce lien expirera dans 7 jours.</em>
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>Cordialement,<br>L'équipe TACIR</p>
        </div>
      </div>
    `,
  };
};

export const generateJuryInvitationEmail = (
  juryMember,
  creathon,
  tempPassword = null
) => {
  const email = juryMember.user?.email || juryMember.email;
  const firstName = juryMember.user?.firstName || juryMember.firstName;
  const lastName = juryMember.user?.lastName || juryMember.lastName;

  if (!email) throw new Error("No email address found for jury member");

  const invitationLink = `${process.env.FRONTEND_URL}/jury/confirmation?token=${juryMember.invitationToken}`;
  const hasPassword = !!tempPassword;

  return {
    to: email,
    subject: `Invitation à participer comme juré - ${creathon.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">Invitation en tant que juré</h2>
        
        <p>Bonjour ${firstName},</p>
        
        <p>Vous avez été sélectionné comme juré pour le créathon <strong>${
          creathon.title
        }</strong>.</p>
        
        ${
          hasPassword
            ? `
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nouveau compte créé</strong></p>
            <p>Vos identifiants de connexion :</p>
            <ul>
              <li><strong>Email :</strong> ${email}</li>
              <li><strong>Mot de passe temporaire :</strong> 
                <code style="background-color: #e5e7eb; padding: 2px 4px; border-radius: 3px;">${tempPassword}</code>
              </li>
            </ul>
            <p style="color: #dc2626; font-size: 14px;">
              ⚠️ Veuillez changer votre mot de passe après votre première connexion.
            </p>
          </div>
        `
            : `
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="color: #065f46; margin: 0;">
              ✅ Votre compte existant a été associé à cet événement.
            </p>
          </div>
        `
        }
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin-top: 0; color: #1e40af;">Détails du créathon</h3>
          <p><strong>📅 Dates :</strong></p>
          <ul style="margin: 5px 0 15px 20px;">
            <li>Début : ${new Date(creathon.dates.startDate).toLocaleDateString(
              "fr-FR"
            )}</li>
            <li>Fin : ${new Date(creathon.dates.endDate).toLocaleDateString(
              "fr-FR"
            )}</li>
          </ul>
          <p><strong>📍 Lieu :</strong> ${
            creathon.location?.venue || "Lieu à confirmer"
          }, ${creathon.location?.city || ""}</p>
          <p><strong>👨‍⚖️ Rôle :</strong> Membre du jury</p>
        </div>
        
        <p style="margin-bottom: 20px;">Veuillez confirmer votre participation en cliquant sur le lien ci-dessous :</p>
        
        <div style="text-align: center; margin: 25px 0;">
          <a href="${invitationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Confirmer ma participation
          </a>
        </div>
        
        <p style="font-size: 0.9em; color: #6b7280;">
          <em>Ce lien expirera dans 7 jours.</em>
        </p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>Cordialement,<br>L'équipe TACIR</p>
        </div>
      </div>
    `,
  };
};

export const generateTrainingCreationNotification = (
  training,
  coordinator,
  creator
) => {
  return {
    to: coordinator.email,
    subject: `Nouvelle formation à valider - ${training.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #2563eb;">Nouvelle formation en attente de validation</h2>
        
        <p>Bonjour ${coordinator.firstName},</p>
        
        <p>Vous avez été désigné comme coordinateur d'incubation pour la formation suivante :</p>
        <h3 style="color: #1e40af;">${training.title}</h3>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p><strong>📅 Période :</strong> ${new Date(
            training.startDate
          ).toLocaleDateString("fr-FR")} au ${
      training.endDate
        ? new Date(training.endDate).toLocaleDateString("fr-FR")
        : "Non spécifiée"
    }</p>
          <p><strong>🕒 Heure :</strong> ${training.time}</p>
          <p><strong>Créée par :</strong> ${creator.firstName} ${
      creator.lastName
    } (${creator.email})</p>
        </div>

        <p>Merci de vous connecter à la plateforme pour consulter les détails complets et valider la formation si tout est conforme.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href=${
            process.env.FRONTEND_URL
          }/component-coordinator/trainings?type=formation" 
             style="background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
            Consulter et valider la formation
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p>Cordialement,<br>L'équipe TACIR</p>
        </div>
      </div>
    `,
  };
};
