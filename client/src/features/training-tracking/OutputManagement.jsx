"use client";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, FileText, Download } from "lucide-react";
import { formatDate } from "@/utils/date";
import { useState } from "react";
import Pagination from "@/components/common/CustomPagination";

export const OutputManagement = ({
  outputs = [],
  participantOutputs = [],
  trainingId,
}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Calculer les données paginées
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedOutputs = outputs.slice(startIndex, endIndex);

  // Calculer les statistiques de soumission pour chaque livrable
  const getOutputStats = (outputId) => {
    const submissions = participantOutputs.filter(
      (po) => po.output?._id.toString() === outputId.toString()
    );

    return {
      total: submissions.length,
      submitted: submissions.filter((po) => po.submitted).length,
      approved: submissions.filter((po) => po.approved).length,
      pending: submissions.filter((po) => po.submitted && !po.approved).length,
    };
  };

  // Déterminer le statut du livrable en fonction de la date d'échéance et des soumissions
  const getOutputStatus = (output) => {
    const now = new Date();
    const dueDate = new Date(output.dueDate);
    const stats = getOutputStats(output._id);

    if (stats.approved === stats.total) return "terminé";
    if (dueDate < now && stats.submitted < stats.total) return "en retard";
    if (stats.submitted > 0) return "en attente";
    return "à venir";
  };

  // Calculer les statistiques globales
  const calculateStats = () => {
    const totalOutputs = outputs.length;
    const completedOutputs = outputs.filter(
      (output) => getOutputStatus(output) === "terminé"
    ).length;
    const pendingOutputs = outputs.filter(
      (output) => getOutputStatus(output) === "en attente"
    ).length;
    const overdueOutputs = outputs.filter(
      (output) => getOutputStatus(output) === "en retard"
    ).length;

    const completionRate =
      totalOutputs > 0
        ? Math.round((completedOutputs / totalOutputs) * 100)
        : 0;

    return {
      totalOutputs,
      completedOutputs,
      pendingOutputs,
      overdueOutputs,
      completionRate,
    };
  };

  const stats = calculateStats();

  const handleExportRecords = async () => {
    try {
      // Créer le contenu CSV
      const csvContent = [
        [
          "Livrable",
          "Type",
          "Date d'échéance",
          "Statut",
          "Approuvés",
          "En attente",
          "Total",
        ].join(","),
        ...outputs.map((output) => {
          const outputStats = getOutputStats(output._id);
          const status = getOutputStatus(output);

          return [
            output.title,
            formatDate(output.dueDate),
            status === "terminé"
              ? "Terminé"
              : status === "en attente"
              ? "En attente"
              : status === "en retard"
              ? "En retard"
              : "À venir",
            outputStats.approved,
            outputStats.pending,
            outputStats.total,
          ].join(",");
        }),
      ].join("\n");

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `enregistrements_livrables_${new Date().getTime()}.csv`
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Erreur lors de l'export des enregistrements :", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-blue/10 rounded-lg">
              <FileText className="w-5 h-5 text-tacir-blue" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">Total des livrables</p>
              <p className="text-2xl font-bold text-tacir-darkblue">
                {stats.totalOutputs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-green/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-tacir-green" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">Terminés</p>
              <p className="text-2xl font-bold text-tacir-green">
                {stats.completedOutputs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-yellow/10 rounded-lg">
              <Clock className="w-5 h-5 text-tacir-yellow" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">En attente</p>
              <p className="text-2xl font-bold text-tacir-yellow">
                {stats.pendingOutputs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-tacir-lightgray">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-tacir-lightblue/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-tacir-lightblue" />
            </div>
            <div>
              <p className="text-sm text-tacir-darkgray">Taux d'achèvement</p>
              <p className="text-2xl font-bold text-tacir-lightblue">
                {stats.completionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white rounded-lg border border-tacir-lightgray">
        <div className="flex justify-between items-center p-4 border-b border-tacir-lightgray">
          <div>
            <h3 className="text-lg font-semibold text-tacir-darkblue">
              Livrables de la formation
            </h3>
            <p className="text-sm text-tacir-darkgray">
              Suivez et gérez tous les livrables et leurs soumissions
            </p>
          </div>
          <Button
            onClick={handleExportRecords}
            className="flex items-center gap-2 bg-tacir-blue text-white hover:bg-tacir-blue/90"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-tacir-darkblue bg-white">
                  Livrable
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Date d'échéance
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Statut
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Soumissions
                </TableHead>
                <TableHead className="text-tacir-darkblue bg-white">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOutputs.length > 0 ? (
                paginatedOutputs.map((output) => {
                  const status = getOutputStatus(output);
                  const stats = getOutputStats(output._id);

                  return (
                    <TableRow key={output._id}>
                      <TableCell className="font-medium text-tacir-darkblue">
                        {output.title}
                      </TableCell>
                      <TableCell className="text-tacir-darkblue">
                        {formatDate(output.dueDate)}
                      </TableCell>
                      <TableCell>
                        {status === "terminé" ? (
                          <Badge className="gap-1 bg-tacir-green text-white">
                            <CheckCircle className="w-3 h-3" /> Terminé
                          </Badge>
                        ) : status === "en attente" ? (
                          <Badge className="gap-1 bg-tacir-yellow text-white">
                            <Clock className="w-3 h-3" /> En attente
                          </Badge>
                        ) : status === "en retard" ? (
                          <Badge className="gap-1 bg-tacir-pink text-white">
                            <XCircle className="w-3 h-3" /> En retard
                          </Badge>
                        ) : (
                          <Badge className="gap-1 border-tacir-blue text-tacir-blue bg-tacir-blue/10">
                            <Clock className="w-3 h-3" /> À venir
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge className="gap-1 bg-tacir-green text-white">
                            {stats.approved} approuvés
                          </Badge>
                          <Badge className="gap-1 bg-tacir-yellow text-white">
                            {stats.pending} en attente
                          </Badge>
                          <Badge className="gap-1 border-tacir-blue text-tacir-blue bg-tacir-blue/10">
                            {stats.total} total
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-tacir-blue hover:bg-tacir-blue/10"
                        >
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 text-tacir-lightgray" />
                      <p className="text-tacir-darkgray">
                        Aucun livrable trouvé
                      </p>
                      <p className="text-sm text-tacir-darkgray">
                        Ajoutez des livrables pour suivre les soumissions des
                        participants
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-tacir-lightgray">
          <Pagination
            page={page}
            limit={limit}
            total={outputs.length}
            entityName="livrables"
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
};
