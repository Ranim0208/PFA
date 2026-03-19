"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/Loader";
import Pagination from "@/components/common/CustomPagination";
import {
  getFormsRegions,
  getOpenRegionForms,
} from "@/services/forms/submissionService";
import { validatePostCreathonSubmissions } from "@/services/forms/submissionService";
import { toast } from "react-toastify";

export default function AcceptedCandidatesTab() {
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [acceptedSubmissions, setAcceptedSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch regions for submissions filter
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getFormsRegions();
        const fetchedRegions = response?.data || [];
        setRegions(fetchedRegions);
        if (fetchedRegions.length > 0) {
          setSelectedRegion(fetchedRegions[0]._id);
        }
        setLoadingRegions(false);
      } catch (error) {
        console.error("Error fetching regions:", error);
        setLoadingRegions(false);
        toast.error("Erreur de chargement des régions");
      }
    };

    fetchRegions();
  }, []);

  // Fetch accepted submissions when region changes
  useEffect(() => {
    if (!selectedRegion) return;

    const fetchAcceptedSubmissions = async () => {
      setLoadingSubmissions(true);
      try {
        const { data: submissions = [] } = await getOpenRegionForms(
          selectedRegion,
          {
            status: "accepted",
            attendanceStatus: "present",
          }
        );

        const formattedSubmissions = submissions.map((sub) => {
          // Extract name from answers (Nom / Prénom field)
          const nameField = sub.answers?.find(
            (ans) => ans.field?.label?.fr === "Nom / Prénom"
          );
          const name = nameField?.value || "";

          // Extract email from answers (Adresse e-mail field)
          const emailField = sub.answers?.find(
            (ans) => ans.field?.label?.fr === "Adresse e-mail"
          );
          const email = emailField?.value || "";

          return {
            ...sub,
            name,
            email,
            formTitle: sub?.form?.title?.fr,
          };
        });

        setAcceptedSubmissions(formattedSubmissions.filter((s) => s?._id));
      } catch (err) {
        console.error("Error fetching submissions:", err);
        toast.error("Erreur lors du chargement des candidats acceptés");
        setAcceptedSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    fetchAcceptedSubmissions();
  }, [selectedRegion]);

  const handleSelectSubmission = (submissionId, isChecked) => {
    setSelectedSubmissions((prev) =>
      isChecked
        ? [...prev, submissionId]
        : prev.filter((id) => id !== submissionId)
    );
  };

  const handleSelectAllSubmissions = (isChecked) => {
    setSelectedSubmissions(
      isChecked ? acceptedSubmissions.map((sub) => sub._id) : []
    );
  };

  const handleValidateAfterCreathon = async () => {
    if (selectedSubmissions.length === 0) {
      toast.warning("Veuillez sélectionner au moins un candidat");
      return;
    }

    setIsValidating(true);

    try {
      const response = await validatePostCreathonSubmissions(
        selectedSubmissions
      );

      if (response.success) {
        toast.success(`${response.successfulCount} participants traités`);

        // Refresh data
        const { data: submissions } = await getOpenRegionForms(selectedRegion, {
          status: "accepted",
          attendanceStatus: "present",
        });

        const formattedSubmissions = submissions.map((sub) => {
          const nameField = sub.answers?.find(
            (ans) => ans.field?.label?.fr === "Nom / Prénom"
          );
          const name = nameField?.value || "";

          const emailField = sub.answers?.find(
            (ans) => ans.field?.label?.fr === "Adresse e-mail"
          );
          const email = emailField?.value || "";

          return {
            ...sub,
            name,
            email,
            formTitle: sub?.form?.title?.fr,
          };
        });

        setAcceptedSubmissions(formattedSubmissions.filter((s) => s?._id));
        setSelectedSubmissions([]);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Paginated submissions
  const paginatedSubmissions = acceptedSubmissions.slice(
    (page - 1) * limit,
    page * limit
  );

  return (
    <div className="space-y-4 p-4 rounded-lg">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-tacir-darkblue mb-2">
            Candidats acceptés après créathons
          </h3>
          <p className="text-tacir-darkgray">
            Sélectionnez les candidats à valider après leur participation au
            créathon
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedRegion}
            onValueChange={setSelectedRegion}
            disabled={loadingRegions}
          >
            <SelectTrigger className="w-[250px] border-tacir-blue focus:ring-tacir-blue">
              <SelectValue placeholder="Sélectionnez une région" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region._id} value={region._id}>
                  {region.name.fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleValidateAfterCreathon}
            disabled={selectedSubmissions.length === 0 || isValidating}
            className="bg-tacir-green hover:bg-tacir-green/90 text-white"
          >
            {isValidating ? "Validation..." : "Valider après créathon"}
          </Button>
        </div>
      </div>

      {loadingSubmissions ? (
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      ) : (
        <>
          <div className="rounded-md border border-tacir-lightgray overflow-hidden mt-4">
            <Table>
              <TableHeader className="bg-tacir-lightgray/30">
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedSubmissions.length ===
                          acceptedSubmissions.length &&
                        acceptedSubmissions.length > 0
                      }
                      onCheckedChange={handleSelectAllSubmissions}
                      className="border-tacir-blue data-[state=checked]:bg-tacir-blue"
                    />
                  </TableHead>
                  <TableHead className="text-tacir-darkblue font-semibold">
                    Nom & Prénom
                  </TableHead>
                  <TableHead className="text-tacir-darkblue font-semibold">
                    Email
                  </TableHead>
                  <TableHead className="text-tacir-darkblue font-semibold">
                    Statut Candidature
                  </TableHead>
                  <TableHead className="text-tacir-darkblue font-semibold">
                    Statut Présence
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSubmissions.length > 0 ? (
                  paginatedSubmissions.map((submission) => {
                    let statusVariant;
                    switch (submission.status) {
                      case "accepted":
                        statusVariant = "default";
                        break;
                      case "acceptedAfterCreathon":
                        statusVariant = "success";
                        break;
                      default:
                        statusVariant = "outline";
                    }

                    return (
                      <TableRow
                        key={submission._id}
                        className="hover:bg-tacir-lightgray/20"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedSubmissions.includes(
                              submission._id
                            )}
                            onCheckedChange={(checked) =>
                              handleSelectSubmission(submission._id, checked)
                            }
                            className="border-tacir-blue data-[state=checked]:bg-tacir-blue"
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {submission.name}
                        </TableCell>
                        <TableCell>{submission.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant}
                            className={
                              submission.status === "accepted"
                                ? "bg-tacir-blue"
                                : "bg-tacir-green"
                            }
                          >
                            {submission.status === "accepted"
                              ? "Accepté"
                              : "Accepté après créathon"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" className="bg-tacir-green">
                            Présent
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-tacir-darkgray"
                    >
                      Aucun candidat accepté trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {acceptedSubmissions.length > 0 && (
            <Pagination
              page={page}
              limit={limit}
              total={acceptedSubmissions.length}
              entityName="candidats"
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
