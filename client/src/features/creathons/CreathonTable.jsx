import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp, ChevronDown, Eye, Edit, CheckCircle, MapPin, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CreathonTable = ({
  creathons,
  onView,
  onEdit,
  onValidateRequest,
  formatDate,
  sortConfig,
  requestSort,
}) => {
  const getClassNamesFor = (name) => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-md border border-tacir-lightgray overflow-hidden">
        <Table>
          <TableHeader className="bg-tacir-lightgray/30">
            <TableRow>
              <TableHead
                className="text-tacir-darkblue font-semibold cursor-pointer"
                onClick={() => requestSort("title")}
              >
                <div className="flex items-center">
                  Titre
                  {getClassNamesFor("title") === "ascending" ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : getClassNamesFor("title") === "descending" ? (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  ) : null}
                </div>
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold">
                Lieu
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold">
                Dates
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold">
                Participants
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold">
                Statut
              </TableHead>
              <TableHead className="text-tacir-darkblue font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {creathons.length > 0 ? (
              creathons.map((creathon) => {
                const validationStatus =
                  creathon.validations?.componentValidation?.validatedAt;

                return (
                  <TableRow
                    key={creathon._id}
                    className="hover:bg-tacir-lightgray/20"
                  >
                    <TableCell className="font-medium text-tacir-darkblue">
                      {creathon.title}
                    </TableCell>
                    <TableCell className="text-tacir-darkgray">
                      {creathon.location?.venue || "Lieu non spécifié"},{" "}
                      {creathon.location?.city}
                    </TableCell>
                    <TableCell className="text-tacir-darkgray">
                      {formatDate(creathon.dates?.startDate)} -{" "}
                      {formatDate(creathon.dates?.endDate)}
                    </TableCell>
                    <TableCell className="text-tacir-darkgray">
                      {creathon.capacity?.maxParticipants || 0} participants
                    </TableCell>
                    <TableCell>
                      {validationStatus ? (
                        <Badge variant="success" className="bg-tacir-green text-white">
                          Validé
                        </Badge>
                      ) : (
                        <Badge
                          variant="warning"
                          className="bg-tacir-yellow text-white"
                        >
                          À valider
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!validationStatus && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onValidateRequest(creathon)}
                            className="bg-tacir-blue hover:bg-tacir-blue/90"
                          >
                            Valider
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(creathon)}
                          className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(creathon)}
                          className="border-tacir-lightblue text-tacir-lightblue hover:bg-tacir-lightblue hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-tacir-darkgray"
                >
                  Aucun créathon trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3 p-4">
        {creathons.length > 0 ? (
          creathons.map((creathon) => {
            const validationStatus =
              creathon.validations?.componentValidation?.validatedAt;

            return (
              <div
                key={creathon._id}
                className="border border-tacir-lightgray rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  {/* Title and Status */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-tacir-darkblue text-sm flex-1 break-words">
                      {creathon.title}
                    </h3>
                    {validationStatus ? (
                      <Badge variant="success" className="bg-tacir-green text-white text-xs flex-shrink-0">
                        Validé
                      </Badge>
                    ) : (
                      <Badge
                        variant="warning"
                        className="bg-tacir-yellow text-white text-xs flex-shrink-0"
                      >
                        À valider
                      </Badge>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-tacir-darkgray text-xs">
                    <MapPin className="h-3 w-3 text-tacir-blue flex-shrink-0" />
                    <span className="break-words">
                      {creathon.location?.venue || "Lieu non spécifié"}, {creathon.location?.city}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-2 text-tacir-darkgray text-xs">
                    <Calendar className="h-3 w-3 text-tacir-blue flex-shrink-0" />
                    <span>
                      {formatDate(creathon.dates?.startDate)} - {formatDate(creathon.dates?.endDate)}
                    </span>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-2 text-tacir-darkgray text-xs">
                    <Users className="h-3 w-3 text-tacir-blue flex-shrink-0" />
                    <span>{creathon.capacity?.maxParticipants || 0} participants</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-tacir-lightgray">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(creathon)}
                        className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white h-8 w-8 p-0"
                        title="Voir les détails"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(creathon)}
                        className="border-tacir-lightblue text-tacir-lightblue hover:bg-tacir-lightblue hover:text-white h-8 w-8 p-0"
                        title="Modifier"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {!validationStatus && (
                      <Button
                        size="sm"
                        onClick={() => onValidateRequest(creathon)}
                        className="bg-tacir-blue hover:bg-tacir-blue/90 h-8 px-3 text-xs flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Valider
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-tacir-darkgray">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-tacir-darkgray/50" />
            <p className="text-sm">Aucun créathon trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreathonTable;