import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="bg-tacir-lightgray text-tacir-darkblue pt-8 pb-4 w-full"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8 xl:gap-12 mb-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 lg:mb-6">Programme Tacir</h3>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4 text-sm sm:text-base">
              <span className="font-bold text-tacir-blue">T</span>
              <span>alents</span>
              <span className="font-bold text-tacir-pink ml-2">A</span>
              <span>rts</span>
              <span className="font-bold text-tacir-green ml-2">C</span>
              <span>réativité</span>
              <span className="font-bold text-tacir-lightblue ml-2">I</span>
              <span>nclusion</span>
              <span className="font-bold text-tacir-yellow ml-2">R</span>
              <span>echerche</span>
            </div>
            <p className="text-tacir-darkblue font-medium text-sm sm:text-base leading-relaxed max-w-md mx-auto sm:mx-0">
              Nous sommes dédiés à fournir des opportunités innovantes pour les
              talents créatifs et techniques.
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-lg sm:text-xl mb-4 lg:mb-6">Liens Rapides</h4>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { href: "#", label: "Accueil" },
                { href: "#workshops", label: "Workshops" },
                { href: "#partners", label: "Partenaires" },
                { href: "#", label: "À Propos" }
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-700 hover:text-tacir-blue transition-colors duration-200 text-base sm:text-lg block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-lg sm:text-xl mb-4 lg:mb-6">Support</h4>
            <ul className="space-y-3 sm:space-y-4">
              {[
                { href: "#", label: "FAQ" },
                { href: "#", label: "Conditions" },
                { href: "#", label: "Confidentialité" }
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-700 hover:text-tacir-blue transition-colors duration-200 text-base sm:text-lg block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-lg sm:text-xl mb-4 lg:mb-6">Contact</h4>
            <ul className="space-y-3 sm:space-y-4 text-gray-700 text-base sm:text-lg">
              <li className="flex flex-col sm:block">
                <span className="font-medium">Email:</span>
                <span className="text-tacir-blue">contact@organization.com</span>
              </li>
              <li className="flex flex-col sm:block">
                <span className="font-medium">Téléphone:</span>
                <span className="text-tacir-blue">+33 1 23 45 67 89</span>
              </li>
              <li className="flex flex-col sm:block">
                <span className="font-medium">Adresse:</span>
                <span>123 Rue Principale, Tunis</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 pt-6 mt-6 lg:mt-8 text-center">
          <p className="text-gray-600 text-sm sm:text-base">
            &copy; {currentYear} Programme Tacir. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;