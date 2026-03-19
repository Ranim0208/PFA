import { Eye, CheckCircle, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { DataTableColumnHeader } from "../../../components/common/table/DataTableColumnHeader";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";

export const getCandidatureColumns = ({ onPreview }) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
        className="border-tacir-darkgray data-[state=checked]:bg-tacir-blue data-[state=checked]:border-tacir-blue"
      />
    ),
    cell: ({ row }) => {
      const isValidated = row.original.validated;
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
          disabled={isValidated}
          className={`data-[state=checked]:bg-tacir-blue data-[state=checked]:border-tacir-blue ${
            isValidated ? "cursor-not-allowed opacity-50" : ""
          }`}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: "title.fr",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre FR" className="text-white" />
    ),
    cell: ({ row }) => (
      <div className="font-semibold text-tacir-darkblue max-w-xs truncate">
        {row.original.title?.fr || "Sans titre"}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    size: 250,
  },
  {
    accessorKey: "title.ar",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Titre AR" className="text-white" />
    ),
    cell: ({ row }) => (
      <div className="text-right text-tacir-darkblue max-w-xs truncate" dir="rtl">
        {row.original.title?.ar || "بدون عنوان"}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    size: 250,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date de création" className="text-white" />
    ),
    cell: ({ row }) => (
      <div className="text-tacir-darkgray text-sm">
        {new Date(row.getValue("createdAt")).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: "fields",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Champs" className="text-white" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline" className="bg-tacir-lightgray text-tacir-darkblue border-tacir-lightgray font-medium">
        {row.original.fields?.length || 0}
      </Badge>
    ),
    enableSorting: false,
    enableHiding: true,
    size: 100,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" className="text-white" />
    ),
    cell: ({ row }) => {
      const isValidated = row.original.validated;
      const isPublished = row.original.published;

      if (isValidated && isPublished) {
        return (
          <Badge className="bg-tacir-green text-white border-0 text-xs font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé & Publié
          </Badge>
        );
      }

      if (isValidated && !isPublished) {
        return (
          <Badge className="bg-tacir-blue text-white border-0 text-xs font-medium">
            <CheckCircle className="w-3 h-3 mr-1" />
            Validé
          </Badge>
        );
      }

      return (
        <Badge className="bg-tacir-yellow text-white border-0 text-xs font-medium">
          <Clock className="w-3 h-3 mr-1" />
          En attente
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 140,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Aperçu" className="text-white" />
    ),
    cell: ({ row }) => {
      const form = row.original;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPreview(form)}
            className="hover:bg-tacir-lightblue/10 transition-colors"
            title="Aperçu du formulaire"
          >
            <Eye className="w-4 h-4 text-tacir-blue" />
            <span className="sr-only">Aperçu</span>
          </Button>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 80,
  },
];
