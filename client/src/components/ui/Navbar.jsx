"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking on a link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-lg" : "shadow-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-2">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" onClick={handleLinkClick}>
              <Image
                src="/images/tacir-logo.png"
                alt="tacir-logo"
                width={200}
                height={40}
                className="h-8 w-40 sm:h-10 sm:w-48 md:h-12 md:w-52 lg:h-14 lg:w-56 object-contain transition-all duration-300"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:space-x-10 xl:space-x-12">
            <Link
              href="#"
              className="text-gray-800 hover:text-brand-blue transition-colors duration-200 font-medium text-base xl:text-lg px-2 py-1"
            >
              Accueil
            </Link>
            <Link
              href="#workshops"
              className="text-gray-800 hover:text-brand-blue transition-colors duration-200 font-medium text-base xl:text-lg px-2 py-1"
            >
              Workshops
            </Link>
            <Link
              href="#partners"
              className="text-gray-800 hover:text-brand-blue transition-colors duration-200 font-medium text-base xl:text-lg px-2 py-1"
            >
              Partenaires
            </Link>
            <Link
              href="#contact"
              className="text-gray-800 hover:text-brand-blue transition-colors duration-200 font-medium text-base xl:text-lg px-2 py-1"
            >
              Contact
            </Link>
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden lg:block">
            <Button className="bg-tacir-yellow hover:bg-tacir-orange text-white px-6 py-2 md:px-8 md:py-3 text-sm md:text-base font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg">
              <Link href={"/auth/login"} className="whitespace-nowrap">
                Se Connecter
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-opacity-50 rounded-lg p-2 transition-colors duration-200"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 sm:h-7 sm:w-7" />
              ) : (
                <Menu className="h-6 w-6 sm:h-7 sm:w-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0 pb-0"
          }`}
        >
          <div className="space-y-2 pt-2 pb-3 border-t border-gray-200">
            <Link
              href="#"
              onClick={handleLinkClick}
              className="block text-gray-800 hover:text-brand-blue hover:bg-gray-50 transition-all duration-200 px-4 py-3 rounded-lg text-base font-medium"
            >
              Accueil
            </Link>
            <Link
              href="#workshops"
              onClick={handleLinkClick}
              className="block text-gray-800 hover:text-brand-blue hover:bg-gray-50 transition-all duration-200 px-4 py-3 rounded-lg text-base font-medium"
            >
              Workshops
            </Link>
            <Link
              href="#partners"
              onClick={handleLinkClick}
              className="block text-gray-800 hover:text-brand-blue hover:bg-gray-50 transition-all duration-200 px-4 py-3 rounded-lg text-base font-medium"
            >
              Partenaires
            </Link>
            <Link
              href="#contact"
              onClick={handleLinkClick}
              className="block text-gray-800 hover:text-brand-blue hover:bg-gray-50 transition-all duration-200 px-4 py-3 rounded-lg text-base font-medium"
            >
              Contact
            </Link>
            <div className="pt-3 px-4">
              <Button className="bg-tacir-yellow hover:bg-tacir-orange text-white w-full py-3 text-base font-semibold transition-all duration-200 transform hover:scale-[1.02]">
                <Link href={"/auth/login"} onClick={handleLinkClick}>
                  Se Connecter
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
