import Link from "next/link";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const benefitsList = [
    {
      title: "Mentors experts",
      description:
        "Apprenez directement auprès de professionnels de l'industrie ayant des années d'expérience.",
    },
    {
      title: "Projets pratiques",
      description:
        "Mettez en application vos connaissances immédiatement grâce à des exercices guidés.",
    },
    {
      title: "Opportunités de réseautage",
      description:
        "Connectez-vous avec des créateurs partageant les mêmes idées et des collaborateurs potentiels.",
    },
    {
      title: "Certificat de réussite",
      description:
        "Recevez une reconnaissance officielle de vos nouvelles compétences et connaissances.",
    },
    {
      title: "Prix honorables",
      description:
        "Des récompenses financières pour les meilleurs projets présentés durant les ateliers.",
    },
  ];

  return (
    <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-blue-50/10 to-white py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* 🖼️ Hero Image */}
          <div className="relative flex justify-center order-first lg:order-last">
            <div className="relative w-full max-w-[500px] sm:max-w-[600px] lg:max-w-[650px] aspect-[4/3] sm:aspect-[5/3] overflow-hidden rounded-xl lg:rounded-2xl shadow-xl transition-transform duration-700 hover:scale-[1.02]">
              <Image
                src="/images/hero.png"
                alt="Programme TACIR - Créativité et innovation"
                fill
                priority
                quality={100}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent lg:hidden" />
            </div>
          </div>

          {/* 💬 Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 sm:space-y-7 w-full">
            <div className="space-y-3 sm:space-y-5 max-w-xl">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-tacir-pink leading-snug">
                Pourquoi nous rejoindre ?
              </h3>

              <div className="flex flex-col gap-3 sm:gap-4">
                {benefitsList.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex gap-3 sm:gap-4 items-start p-2.5 sm:p-3.5 rounded-lg bg-white/40 backdrop-blur-sm hover:bg-white/70 transition-all duration-300 border border-gray-100 shadow-sm hover:shadow-md"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-tacir-lightblue" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-sm sm:text-base md:text-lg text-tacir-blue leading-snug">
                        {benefit.title}
                      </h4>
                      <p className="text-gray-600 mt-1 text-xs sm:text-sm leading-relaxed font-medium">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2 w-full flex justify-center lg:justify-start">
              <Link
                href="/tacir-program/candidature"
                className="w-full sm:w-auto"
              >
                <Button className="bg-tacir-green hover:bg-green-500 text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base md:text-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 w-full sm:w-auto">
                  Postuler maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ✨ Decorative Blurs */}
      <div className="hidden lg:block absolute -right-40 top-20 w-64 h-64 bg-tacir-pink/10 rounded-full blur-3xl"></div>
      <div className="hidden lg:block absolute -left-40 bottom-20 w-64 h-64 bg-tacir-lightblue/10 rounded-full blur-3xl"></div>
    </section>
  );
}
