import { useEffect } from "react";
import { formatDate } from "@/utils/date";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Check } from "lucide-react";

export const ApprovalModal = ({
  isOpen,
  onClose,
  training,
  sessionType,
  setSessionType,
  location,
  setLocation,
  meetingLink,
  setMeetingLink,
  isProcessing,
  onApprove,
}) => {
  // Determine if session type should be locked
  const isSessionTypeLocked =
    training?.sessionType === "online" || training?.sessionType === "in-person";

  // Reset meetingLink if modal opens with "online" type
  useEffect(() => {
    if (isOpen && sessionType === "online") {
      setMeetingLink("");
    }
  }, [isOpen, sessionType, setMeetingLink]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-tacir-blue">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-tacir-darkblue">
            <Check className="w-5 h-5 text-tacir-green" />
            Valider la demande
          </DialogTitle>
        </DialogHeader>

        {training && (
          <div className="space-y-4">
            {/* Training Info */}
            <div className="p-3 bg-tacir-lightgray rounded-lg border border-tacir-lightblue">
              <h3 className="font-medium text-tacir-darkblue">
                {training.title}
              </h3>
              <p className="text-sm text-tacir-darkgray">
                {formatDate(training.startDate)}
              </p>
            </div>

            {/* Session Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-tacir-darkblue">
                Type de session <span className="text-tacir-pink">*</span>
              </label>
              <Select
                value={sessionType}
                onValueChange={(value) => {
                  if (!isSessionTypeLocked) {
                    setSessionType(value);
                    if (value === "online") {
                      setLocation("");
                      setMeetingLink(""); 
                  
                    }
                  }
                }}
                disabled={isSessionTypeLocked}
              >
                <SelectTrigger className="border-tacir-darkblue focus:ring-tacir-blue">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent className="border-tacir-lightblue">
                  <SelectItem value="in-person">En présentiel</SelectItem>
                  <SelectItem value="online">En ligne</SelectItem>
                </SelectContent>
              </Select>
              {isSessionTypeLocked && (
                <p className="text-xs text-tacir-darkgray italic">
                  Le type de session est verrouillé sur "
                  {sessionType === "online" ? "En ligne" : "En présentiel"}" pour
                  cette formation
                </p>
              )}
            </div>

            {/* Location (only for in-person) */}
            {sessionType === "in-person" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-tacir-darkblue">
                  Adresse <span className="text-tacir-pink">*</span>
                </label>
                <Textarea
                  placeholder="Saisir l'adresse complète de la session en présentiel"
                  value={location || training.proposedLocation || ""}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-tacir-darkblue focus:ring-tacir-blue"
                />
              </div>
            )}

            {/* Comment Section */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-tacir-darkblue">
                Commentaires (optionnel)
              </label>
              <Textarea
                placeholder="Ajoutez des commentaires ou instructions..."
                className="border-tacir-darkblue focus:ring-tacir-blue"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                className="border-tacir-darkblue text-tacir-darkblue hover:bg-tacir-lightgray"
                onClick={onClose}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                className="bg-tacir-green hover:bg-tacir-darkblue"
                onClick={onApprove}
                disabled={
                  isProcessing ||
                  (sessionType === "in-person" &&
                    !location &&
                    !training.proposedLocation)
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validation...
                  </>
                ) : (
                  "Valider"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
