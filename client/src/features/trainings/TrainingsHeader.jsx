"use client";
import { useState } from "react";
import { BookOpen, Plus, GraduationCap, Flame, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import MentoringModal from "@/features/trainings/modals/MentoringModal";
import FormationModal from "@/features/trainings/modals/FormationModal";
import BootcampModal from "@/features/trainings/modals/BootcampModal";

export default function TrainingsHeader({ onTrainingCreated }) {
  const searchParams = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get type from URL params
  const type = searchParams.get("type") || "formation";

  // Type configurations
  const typeConfig = {
    formation: {
      title: "Formations",
      color: "bg-tacir-blue",
      icon: <GraduationCap className="w-5 h-5 text-white" />,
      buttonClass: "bg-tacir-pink hover:bg-tacir-pink/60",
      label: "Formation",
    },
    bootcamp: {
      title: "Bootcamps",
      color: "bg-tacir-lightblue",
      icon: <Flame className="w-5 h-5 text-white" />,
      buttonClass: "bg-tacir-blue hover:bg-tacir-darkblue",
      label: "Bootcamp",
    },
    mentoring: {
      title: "Sessions de Mentorat",
      color: "bg-tacir-orange",
      icon: <UserRound className="w-5 h-5 text-white" />,
      buttonClass: "bg-tacir-green hover:bg-tacir-green/45",
      label: "Session Mentorat",
    },
  };

  const currentType = typeConfig[type] || typeConfig.formation;

  const renderModal = () => {
    switch (type) {
      case "formation":
        return (
          <FormationModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onSuccess={onTrainingCreated}
          />
        );
      case "bootcamp":
        return (
          <BootcampModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onSuccess={onTrainingCreated}
          />
        );
      case "mentoring":
        return (
          <MentoringModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onSuccess={onTrainingCreated}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-6">
        {/* Main header with breadcrumb-like navigation */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-tacir-blue" />
            Formation Hub
          </span>
          <span>/</span>
          <span className="font-medium text-tacir-darkblue capitalize">
            {type}
          </span>
        </div>

        {/* Content header with type indicator and action button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${currentType.color} shadow-md`}
            >
              {currentType.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {currentType.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {type === "formation"
                  ? "Formations professionnelles certifiantes"
                  : type === "bootcamp"
                  ? "Programmes intensifs de formation"
                  : "Sessions individuelles avec nos experts"}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowCreateModal(true)}
            className={`${currentType.buttonClass} text-white transition-all hover:scale-[1.02] group min-w-[180px]`}
          >
            <Plus className="w-4 h-4 mr-2 transition-transform group-hover:rotate-90" />
            Créer {currentType.label}
          </Button>
        </div>
      </div>
      {/* Divider */}
      <div className="mt-6 border-b border-gray-200"></div>

      {renderModal()}
    </div>
  );
}
