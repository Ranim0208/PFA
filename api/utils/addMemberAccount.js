export const generateAccountCreationEmail = (user, password, role) => {
  // Texte selon le rôle
  const getRoleSpecificText = () => {
    switch (role) {
      case "mentor":
        return `
          <p>En tant que <strong>Mentor TACIR</strong>, vous pourrez :</p>
          <ul>
            <li>Accéder à votre espace mentor dédié</li>
            <li>Guider les porteurs de projets innovants</li>
            <li>Partager votre expertise lors des Créathons</li>
            <li>Suivre l'avancement des projets que vous encadrez</li>
          </ul>
        `;
      case "RegionalCoordinator":
        return `
          <p>En tant que <strong>Coordinateur Régional</strong>, vous pourrez :</p>
          <ul>
            <li>Gérer les Créathons de votre région</li>
            <li>Superviser les participants et mentors</li>
            <li>Valider les inscriptions et projets</li>
          </ul>
        `;
      case "ComponentCoordinator":
        return `
          <p>En tant que <strong>Coordinateur de Composante</strong>, vous pourrez :</p>
          <ul>
            <li>Gérer les projets de votre composante (CREA/INOV)</li>
            <li>Coordonner les équipes de mentors</li>
            <li>Suivre l'avancement des innovations</li>
            <li>Faciliter le processus d'incubation</li>
          </ul>
        `;
      case "admin":
        return `
          <p>En tant qu'<strong>Administrateur</strong>, vous avez un accès complet à :</p>
          <ul>
            <li>La gestion de tous les utilisateurs</li>
          </ul>
        `;
      default:
        return `
          <p>Vous avez été ajouté en tant que membre de la plateforme TACIR avec le rôle <strong>${role}</strong>.</p>
        `;
    }
  };

  return {
    to: user.email,
    subject: `[TACIR] Création de votre compte - Bienvenue ${user.firstName} !`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Création de compte TACIR</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D3773; margin: 0; padding: 0; background-color: #F2F2F2;">
        <div style="max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- En-tête -->
          <div style="background: #2D3773; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
               Bienvenue sur TACIR
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Plateforme d'innovation et de créativité
            </p>
          </div>

          <!-- Contenu principal -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              Bonjour <strong style="color: #2D3773;">${user.firstName} ${
      user.lastName
    }</strong>,
            </p>

            <p style="font-size: 16px; margin-bottom: 25px;">
              Votre compte a été créé avec succès sur la plateforme TACIR. 
              Voici vos identifiants de connexion :
            </p>

            <!-- Identifiants -->
            <div style="background: #F2F2F2; padding: 20px; border-radius: 8px; border-left: 4px solid #04ADBF; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #2D3773;">
                 Vos identifiants :
              </p>
              <p style="margin: 5px 0; font-size: 15px;">
                <strong>Email :</strong> ${user.email}
              </p>
              <p style="margin: 5px 0; font-size: 15px;">
                <strong>Mot de passe temporaire :</strong> 
                <span style="background: #BF1573; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                  ${password}
                </span>
              </p>
            </div>

            <!-- Instructions -->
            <div style="background: #E8F5F6; padding: 20px; border-radius: 8px; border-left: 4px solid #04ADBF; margin-bottom: 25px;">
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #2D3773;">
                 Première connexion :
              </p>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Rendez-vous sur <a href="${
                  process.env.FRONTEND_URL
                }/auth/login" style="color: #04ADBF; text-decoration: none; font-weight: bold;">la page de connexion</a></li>
                <li style="margin-bottom: 8px;">Connectez-vous avec vos identifiants ci-dessus</li>
                <li style="margin-bottom: 8px;">Vous serez invité à changer votre mot de passe</li>
                <li>Complétez votre profil si nécessaire</li>
              </ol>
            </div>

            <!-- Rôle spécifique -->
            <div style="background: #F0F9EB; padding: 20px; border-radius: 8px; border-left: 4px solid #56A632; margin-bottom: 25px;">
              ${getRoleSpecificText()}
            </div>

            <!-- Sécurité -->
            <div style="background: #FFF5F0; padding: 20px; border-radius: 8px; border-left: 4px solid #F29F05; margin-bottom: 25px;">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #2D3773;">
                 Sécurité importante :
              </p>
              <ul style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Changez votre mot de passe dès la première connexion</li>
                <li style="margin-bottom: 8px;">Ne partagez jamais vos identifiants</li>
                <li>Contactez l'administrateur en cas de problème</li>
              </ul>
            </div>

            <p style="font-size: 16px; margin-bottom: 20px;">
              Nous sommes ravis de vous compter parmi nous et avons hâte de 
              découvrir votre contribution à l'écosystème d'innovation TACIR.
            </p>

            <p style="font-size: 16px; margin-bottom: 0;">
              Bien cordialement,<br>
              <strong style="color: #2D3773;">L'équipe TACIR</strong><br>
              <em style="color: #7B797A;">Plateforme d'innovation et de créativité</em>
            </p>
          </div>

          <!-- Pied de page -->
          <div style="background: #2D3773; padding: 20px; text-align: center;">
            <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">
              © 2024 TACIR - Tous droits réservés<br>
              <a href="mailto:support@tacir.org" style="color: #04ADBF; text-decoration: none;">
                support@tacir.org
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
};
