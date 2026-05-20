// utils/roleMessageGenerator.js

const roleMessages = {
  admin: `Vous avez été nommé administrateur du système.`,
  mentor: `Vous avez été assigné comme mentor.`,
  projectHolder: `Vous êtes maintenant porteur de projet.`,
  GeneralCoordinator: `Vous êtes coordinateur général.`,
  ComponentCoordinator: `Vous êtes coordinateur de composante.`,
  Beneficiary: `Vous êtes bénéficiaire du programme.`,
  RegionalCoordinator: `Vous êtes coordinateur régional.`,
  member: `Vous êtes membre de la plateforme.`,
};

const getRoleMessage = (role, firstName, email, password) => {
  return `
Bonjour ${firstName},

Votre compte pour la plateforme Tacir a été créé.

${roleMessages[role]}

Voici vos identifiants de connexion :
Email: ${email}
Mot de passe temporaire: ${password}

Veuillez vous connecter et changer votre mot de passe dès que possible.

Cordialement,
L'équipe d'administration
  `;
};

export default getRoleMessage;
