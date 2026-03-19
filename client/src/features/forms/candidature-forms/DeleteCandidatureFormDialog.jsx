"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../../../components/ui/alert-dialog";

export default function DeleteFormDialog({
  open,
  onOpenChange,
  form,
  onDelete,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce formulaire ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vous êtes sur le point de supprimer :
            <br />
            <strong>{form?.title?.fr}</strong>
            <br />
            <strong>{form?.title?.ar}</strong>
            <br />
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-tacir-pink hover:bg-tacir-pink/80"
            onClick={onDelete}
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
