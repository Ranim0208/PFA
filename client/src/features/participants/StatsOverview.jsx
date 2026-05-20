import { Users, Flame, Clock, Check, BarChart2 } from "lucide-react";
export default function StatsOverview({ stats }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-tacir-lightgray/30">
      <h2 className="text-xl font-semibold text-tacir-darkblue flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-tacir-blue" />
        Aperçu des participants
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-tacir-blue" />}
          title="Total Participants"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-tacir-pink" />}
          title="Formations actives"
          value={stats.byStatus.active}
          color="pink"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-tacir-orange" />}
          title="À venir"
          value={stats.byStatus.upcoming}
          color="orange"
        />
        <StatCard
          icon={<Check className="w-5 h-5 text-tacir-green" />}
          title="Terminées"
          value={stats.byStatus.completed}
          color="green"
        />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    blue: "bg-tacir-lightblue/10 border-tacir-lightblue/30 text-tacir-blue",
    pink: "bg-tacir-pink/10 border-tacir-pink/30 text-tacir-pink",
    orange: "bg-tacir-orange/10 border-tacir-orange/30 text-tacir-orange",
    green: "bg-tacir-green/10 border-tacir-green/30 text-tacir-green",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-tacir-darkgray">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-${color}/20`}>{icon}</div>
      </div>
    </div>
  );
}
