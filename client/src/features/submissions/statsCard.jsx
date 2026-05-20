import { Card } from "@/components/ui/card";

export function StatsCard({ title, value, icon: Icon, color, percentage }) {
  const colorClasses = {
    "tacir-lightblue": {
      bg: "bg-tacir-lightblue/15",
      text: "text-tacir-lightblue",
      border: "border-tacir-lightblue",
    },
    "tacir-yellow": {
      bg: "bg-tacir-yellow/15",
      text: "text-tacir-yellow",
      border: "border-tacir-yellow",
    },
    "tacir-green": {
      bg: "bg-tacir-green/15",
      text: "text-tacir-green",
      border: "border-tacir-green",
    },
    "tacir-blue": {
      bg: "bg-tacir-blue/15",
      text: "text-tacir-blue",
      border: "border-tacir-blue",
    },
    "tacir-pink": {
      bg: "bg-tacir-pink/15",
      text: "text-tacir-pink",
      border: "border-tacir-pink",
    },
  };

  const colorClass = colorClasses[color] || colorClasses["tacir-lightblue"];

  return (
    <Card
      className={`p-4 shadow-sm rounded-xl  ${colorClass.border} transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-xs font-medium text-tacir-darkgray mb-1">
            {title}
          </p>
          <p className="text-xl font-bold text-tacir-darkblue">{value}</p>
          {percentage !== undefined && (
            <span className={`text-xs font-medium mt-1 ${colorClass.text}`}>
              {percentage}%
            </span>
          )}
        </div>
        <div className={`p-2 rounded-lg ${colorClass.bg} ${colorClass.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
}
