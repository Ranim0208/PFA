import { formatDate } from "@/utils/date";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, X } from "lucide-react";

export const RejectionModal = ({
  isOpen,
  onClose,
  training,
  rejectReason,
  setRejectReason,
  isProcessing,
  onReject,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-tacir-pink">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-tacir-darkblue">
            <X className="w-5 h-5 text-tacir-pink" />
            Refuser la demande
          </DialogTitle>
        </DialogHeader>

        {training && (
          <div className="space-y-4">
            <div className="p-3 bg-tacir-lightgray rounded-lg border border-tacir-lightblue">
              <h3 className="font-medium text-tacir-darkblue">
                {training.title}
              </h3>
              <p className="text-sm text-tacir-darkgray">
                {formatDate(training.startDate)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-tacir-darkblue">
                Motif du refus <span className="text-tacir-pink">*</span>
              </label>
              <Textarea
                placeholder="Expliquez pourquoi cette demande est refusée (minimum 10 caractères)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="border-tacir-darkblue focus:ring-tacir-blue"
                minLength={10}
              />
              <p className="text-xs text-tacir-darkgray">
                Minimum 10 caractères requis
              </p>
            </div>

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
                variant="destructive"
                className="bg-tacir-pink hover:bg-tacir-darkblue"
                onClick={onReject}
                disabled={
                  isProcessing ||
                  !rejectReason ||
                  rejectReason.trim().length < 10
                }
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Refuser"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
