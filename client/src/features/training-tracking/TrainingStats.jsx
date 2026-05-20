"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const TrainingStats = ({ icon, title, value }) => {
  return (
    <Card className="border-tacir-lightgray">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-tacir-darkgray">
          {title}
        </CardTitle>
        {React.cloneElement(icon, { className: "w-5 h-5 text-tacir-blue" })}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-tacir-darkblue">{value}</div>
      </CardContent>
    </Card>
  );
};
