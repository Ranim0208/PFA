import {
  Eye,
  Pencil,
  Trash2,
  FileText,
  Copy,
  Star,
  CheckCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { DataTableColumnHeader } from "../../../components/common/table/DataTableColumnHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { frontBaseUrl } from "@/utils/constants";
import { Badge } from "../../../components/ui/badge";

export const getCandidatureFormColumns = ({
  onPreview,
  onConfirmDelete,
  basePath = `${frontBaseUrl}/incubation-coordinator/candidatures/modifier-candidature`,
  onSaveAsTemplate,
  onUseAsTemplate,
}) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
        className="border-white data-[state=checked]:bg-tacir-lightblue data-[state=checked]:border-tacir-lightblue"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
        className="data-[state=checked]:bg-tacir-blue data-[state=checked]:border-tacir-blue"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 30,
  },
  {
    accessorKey: "title.fr",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre FR" />
    ),
    cell: ({ row }) => (
      <div className="font-medium text-tacir-darkblue max-w-xs truncate">
        {row.original.title?.fr || "Sans titre"}
      </div>
    ),
  },
  {
    accessorKey: "title.ar",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre AR" />
    ),
    cell: ({ row }) => (
      <div
        className="text-right text-tacir-darkblue max-w-xs truncate"
        dir="rtl"
      >
        {row.original.title?.ar || "بدون عنوان"}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de création" />
    ),
    cell: ({ row }) => (
      <div className="text-tacir-darkgray">
        {new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    ),
  },
  {
    accessorKey: "fields",
    header: "Champs",
    cell: ({ row }) => (
      <Badge className="bg-tacir-lightgray text-tacir-darkblue border-0 font-medium">
        {row.original.fields?.length || 0}
      </Badge>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const form = row.original;
      const isTemplate = form.isTemplate;
      const isValidated = form.validated;
      const isPublished = form.published;

      // Template badge
      if (isTemplate) {
        return (
          <Badge className="bg-tacir-pink text-white border-0 text-xs font-medium">
            <Star className="w-3 h-3 mr-1" />
            Modèle
          </Badge>
        );
      }

      // Published and validated
      if (isValidated && isPublished) {
        return (
          <Badge className="bg-tacir-green text-white border-0 text-xs font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé & Publié
          </Badge>
        );
      }

      // Only validated
      if (isValidated && !isPublished) {
        return (
          <Badge className="bg-tacir-blue text-white border-0 text-xs font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </Badge>
        );
      }

      // Draft (not validated or not published)
      return (
        <Badge className="bg-tacir-yellow text-white border-0 text-xs font-medium">
          <Clock className="w-3 h-3 mr-1" />
          Brouillon
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 140,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const form = row.original;

      return (
        <div className="flex items-center gap-1">
          {/* Preview */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPreview(form)}
            className="hover:bg-tacir-lightblue/10 transition-colors"
            title="Aperçu"
          >
            <Eye className="w-4 h-4 text-tacir-lightblue" />
          </Button>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hover:bg-tacir-green/10 transition-colors"
          >
            <Link href={`${basePath}/${form._id}`} title="Modifier">
              <Pencil className="w-4 h-4 text-tacir-green" />
            </Link>
          </Button>

          {/* Use as Template */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onUseAsTemplate(form)}
            title="Utiliser comme modèle"
            className="hover:bg-tacir-blue/10 transition-colors"
          >
            <Copy className="w-4 h-4 text-tacir-blue" />
          </Button>

          {/* Save as Template */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSaveAsTemplate(form)}
            title="Enregistrer comme modèle"
            className="hover:bg-tacir-pink/10 transition-colors"
          >
            <Star className="w-4 h-4 text-tacir-pink" />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onConfirmDelete(form)}
            title="Supprimer"
            className="hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-tacir-pink" />
          </Button>
        </div>
      );
    },
  },
];
