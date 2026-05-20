"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const WithdrawalManager = ({
  withdrawalDialogOpen,
  setWithdrawalDialogOpen,
  replacementDialogOpen,
  setReplacementDialogOpen,
  selectedWithdrawal,
  replacementCandidates,
  selectedReplacement,
  setSelectedReplacement,
  isProcessing,
  onConfirmWithdrawal,
  onSelectReplacement,
}) => {
  const [withdrawalNote, setWithdrawalNote] = useState("");

  const handleConfirmWithdrawal = () => {
    onConfirmWithdrawal(withdrawalNote);
    setWithdrawalNote("");
  };

  return (
    <>
      {/* Withdrawal Confirmation Dialog */}
      <Dialog
        open={withdrawalDialogOpen}
        onOpenChange={(open) => {
          if (!open) setWithdrawalNote("");
          setWithdrawalDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-tacir-darkblue">
              Confirmer le désistement
            </DialogTitle>
            <DialogDescription className="text-tacir-darkgray">
              Êtes-vous sûr de vouloir retirer {selectedWithdrawal?.firstName}{" "}
              {selectedWithdrawal?.lastName}? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Ajouter une note ou un commentaire (optionnel)"
              value={withdrawalNote}
              onChange={(e) => setWithdrawalNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWithdrawalDialogOpen(false)}
              disabled={isProcessing}
              className="border-tacir-blue text-tacir-blue hover:bg-tacir-lightgray"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmWithdrawal}
              disabled={isProcessing}
              className="bg-tacir-pink hover:bg-tacir-pink/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Confirmer le désistement"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Replacement Selection Dialog */}
      <Dialog
        open={replacementDialogOpen}
        onOpenChange={setReplacementDialogOpen}
      >
        <DialogContent className="!max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-tacir-darkblue">
              Sélectionner un remplaçant
            </DialogTitle>
            <DialogDescription className="text-tacir-darkgray">
              Choisissez un candidat sous réserve pour remplacer{" "}
              {selectedWithdrawal?.firstName} {selectedWithdrawal?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="max-h-[70vh] overflow-y-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-tacir-lightgray sticky top-0">
                  <TableRow>
                    <TableHead className="text-tacir-darkblue">Nom</TableHead>
                    <TableHead className="text-tacir-darkblue">Email</TableHead>
                    <TableHead className="text-tacir-darkblue">
                      Date de soumission
                    </TableHead>
                    <TableHead className="text-tacir-darkblue">
                      Évaluation
                    </TableHead>
                    <TableHead className="text-tacir-darkblue">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {replacementCandidates.length > 0 ? (
                    replacementCandidates.map((candidate) => (
                      <TableRow
                        key={candidate._id}
                        className={
                          selectedReplacement === candidate._id
                            ? "bg-tacir-lightblue/20"
                            : ""
                        }
                      >
                        <TableCell>
                          {candidate.firstName} {candidate.lastName}
                        </TableCell>
                        <TableCell>{candidate.email || "-"}</TableCell>
                        <TableCell>
                          {new Date(candidate.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {candidate.preselectionEvaluations?.[0]
                            ?.evaluationText || "Non évalué"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={
                              selectedReplacement === candidate._id
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setSelectedReplacement(candidate._id)
                            }
                            className={
                              selectedReplacement === candidate._id
                                ? "bg-tacir-blue hover:bg-tacir-blue/90"
                                : "border-tacir-blue text-tacir-blue hover:bg-tacir-lightgray"
                            }
                          >
                            Sélectionner
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-tacir-darkgray"
                      >
                        Aucun candidat disponible pour le remplacement
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplacementDialogOpen(false)}
              disabled={isProcessing}
              className="border-tacir-blue text-tacir-blue hover:bg-tacir-lightgray"
            >
              Annuler
            </Button>
            <Button
              onClick={onSelectReplacement}
              disabled={!selectedReplacement || isProcessing}
              className="bg-tacir-blue hover:bg-tacir-blue/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                "Confirmer le remplaçant"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WithdrawalManager;
