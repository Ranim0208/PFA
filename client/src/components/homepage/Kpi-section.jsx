"use client";
import React, { useEffect, useState, useRef } from "react";

// KPI data
const kpiData = [
  { id: 1, value: 20, suffix: "+", label: "Projets Réalisés" },
  { id: 2, value: 30, suffix: "+", label: "Partenaires" },
  { id: 3, value: 100, suffix: "+", label: "Participants" },
  { id: 4, value: 96, suffix: "%", label: "Taux de Satisfaction" },
];

export default function KpiSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const [counters, setCounters] = useState(kpiData.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const intervals = kpiData.map((kpi, index) => {
      return setInterval(() => {
        setCounters((prev) => {
          const newCounters = [...prev];
          if (newCounters[index] < kpi.value) {
            const increment = Math.max(1, Math.floor(kpi.value / 50));
            newCounters[index] = Math.min(
              newCounters[index] + increment,
              kpi.value
            );
          }
          return newCounters;
        });
      }, 30);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [isVisible]);

  return (
    <section ref={sectionRef} className="py-16 bg-tacir-darkblue text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Résultats</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-80">
            Découvrez l'impact concret de notre programme sur notre communauté
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {kpiData.map((kpi, index) => (
            <div
              key={kpi.id}
              className="p-6 rounded-lg bg-white/10 backdrop-blur-sm"
            >
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {counters[index]}
                {kpi.suffix}
              </div>
              <div className="text-lg opacity-80">{kpi.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
