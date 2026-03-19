import { Card } from "@/components/ui/card";

export function TrainingStatsCard({
  title,
  value,
  icon: Icon,
  color,
  borderColor,
}) {
  return (
    <Card
      className={`p-6 shadow rounded-lg bg-white border-l-4 border-${borderColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-tacir-darkgray">{title}</p>
          <p className="text-2xl font-bold text-tacir-darkblue mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}/20 text-${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
