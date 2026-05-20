import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, CheckCircle, Clock, TrendingUp } from "lucide-react";

export const OutputStats = ({ stats, loading = false }) => {
  const statsData = [
    {
      label: "Total Outputs",
      value: stats?.totalOutputs || 0,
      icon: FileText,
      color: "tacir-blue",
      bgColor: "bg-tacir-blue/10",
    },
    {
      label: "Total Submissions",
      value: stats?.totalSubmissions || 0,
      icon: Upload,
      color: "tacir-lightblue",
      bgColor: "bg-tacir-lightblue/10",
    },
    {
      label: "Approved",
      value: stats?.totalApproved || 0,
      icon: CheckCircle,
      color: "tacir-green",
      bgColor: "bg-tacir-green/10",
    },
    {
      label: "Pending Review",
      value: stats?.totalPending || 0,
      icon: Clock,
      color: "tacir-yellow",
      bgColor: "bg-tacir-yellow/10",
    },
  ];

  const completionRate =
    stats?.totalSubmissions > 0
      ? Math.round((stats.totalApproved / stats.totalSubmissions) * 100)
      : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-tacir-lightgray rounded w-20"></div>
                  <div className="h-8 bg-tacir-lightgray rounded w-12"></div>
                </div>
                <div className="w-12 h-12 bg-tacir-lightgray rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className="hover:shadow-md transition-shadow duration-200"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-tacir-darkgray">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-bold text-${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Rate Card */}
      {stats?.totalSubmissions > 0 && (
        <Card className="border-l-4 border-l-tacir-green">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-tacir-darkgray">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-tacir-green">
                  {completionRate}%
                </p>
                <p className="text-xs text-tacir-darkgray mt-1">
                  {stats.totalApproved} of {stats.totalSubmissions} submissions
                  approved
                </p>
              </div>
              <div className="p-3 bg-tacir-green/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-tacir-green" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
