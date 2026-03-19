import { Users, Clock } from "lucide-react";
import { typeConfig } from "../trainings/components/style.config";

const StatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Participants Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center">
          <div className="p-3 bg-tacir-darkblue/10 rounded-lg">
            <Users className="h-6 w-6 text-tacir-darkblue" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">
              Total Participants
            </p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Training Type Cards */}
      {Object.entries(stats.byType).map(([type, count]) => {
        const config = typeConfig[type] || typeConfig.formation;
        return (
          <div
            key={type}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 ${config.lightBg} rounded-lg`}>
                <config.icon className={`h-6 w-6 ${config.textColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {config.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
