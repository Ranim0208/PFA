import { Download, Users } from "lucide-react";

export default function DashboardHeader({
  title,
  description,
  onExport,
  exportDisabled,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-tacir-lightgray/30">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-tacir-lightblue rounded-xl shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-tacir-darkblue">{title}</h1>
            <p className="text-tacir-darkgray">{description}</p>
          </div>
        </div>

        <button
          onClick={onExport}
          disabled={exportDisabled}
          className="inline-flex items-center px-4 py-3 bg-tacir-blue text-white rounded-lg hover:bg-tacir-darkblue transition-all duration-200 shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter les données
        </button>
      </div>
    </div>
  );
}
