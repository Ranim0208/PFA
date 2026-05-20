// app/etudiant/candidatures/open/page.js
"use client";

import { useEffect, useState } from "react";
import { getOpenForms } from "../../../services/forms/publicFormService";
import AppelCard from "../../../components/candidatures/AppelCard";
import Navbar from "../../../components/ui/Navbar";
import { Skeleton } from "../../../components/ui/skeleton";
import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "../../../components/ui/input";

export default function OpenCandidaturesPage() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredForms, setFilteredForms] = useState([]);

  useEffect(() => {
    async function fetchOpenForms() {
      try {
        const data = await getOpenForms();
        setForms(data);
        setFilteredForms(data);
      } catch (error) {
        console.error("Error fetching forms:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOpenForms();
  }, []);

  useEffect(() => {
    const filtered = forms.filter(
      (form) =>
        form.title?.fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description?.fr?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredForms(filtered);
  }, [searchTerm, forms]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="container mx-auto py-12 px-4">
            <div className="mb-12 text-center">
              <Skeleton className="h-12 w-96 mx-auto mb-4" />
              <Skeleton className="h-6 w-2/3 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl shadow-lg p-6 space-y-4"
                >
                  <Skeleton className="h-48 w-full rounded-t-xl" />
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-tacir-lightgray">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-tacir-darkblue to-tacir-blue text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Appels à candidatures actifs
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Découvrez les opportunités de formation et d'accompagnement
              disponibles. Postulez avant la date limite pour avoir la chance de
              bénéficier de ces programmes.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-tacir-darkblue h-5 w-5" />
              <Input
                type="text"
                placeholder="Rechercher par titre ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-blue-100 rounded-full focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto py-12 px-4">
          {/* Forms Grid */}
          {filteredForms.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="h-16 w-16 text-tacir-darkgray mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-tacir-darkblue mb-2">
                Aucun appel à candidatures trouvé
              </h3>
              <p className="text-tacir-darkgray">
                {searchTerm
                  ? "Essayez avec d'autres termes de recherche."
                  : "Revenez plus tard pour découvrir de nouvelles opportunités."}
              </p>
            </div>
          ) : (
            <div
              className={`
              grid 
              gap-8
              ${
                filteredForms.length === 1
                  ? "grid-cols-1 max-w-2xl mx-auto"
                  : ""
              }
              ${
                filteredForms.length === 2
                  ? "grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto"
                  : ""
              }
              ${
                filteredForms.length >= 3
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : ""
              }
            `}
            >
              {filteredForms.map((form) => (
                <div
                  key={form._id}
                  className={`
                    ${filteredForms.length === 1 ? "w-full" : ""}
                    ${filteredForms.length === 2 ? "md:w-[500px]" : ""}
                    ${filteredForms.length >= 3 ? "w-full" : ""}
                  `}
                >
                  <AppelCard form={form} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
