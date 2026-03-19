// components/ValidationModal.js
"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

export function ValidationModal({ open, onClose, onConfirm }) {
  const [comments, setComments] = useState("");

  const handleConfirm = () => {
    onConfirm(comments);
    setComments("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-tacir-green">
            <CheckCircle className="h-5 w-5" />
            <DialogTitle className="text-tacir-darkblue">
              Valider le créathon
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-tacir-darkgray">
            Vous pouvez ajouter un commentaire (facultatif)
          </p>
          <Input
            placeholder="Ex: Tout est prêt côté logistique..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="border-tacir-lightgray focus:ring-tacir-blue focus:border-tacir-blue"
          />
        </div>
        <DialogFooter className="pt-4 gap-4 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-tacir-darkgray text-tacir-darkgray hover:bg-tacir-lightgray"
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-tacir-green hover:bg-tacir-green/90 text-white"
          >
            Confirmer la validation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
