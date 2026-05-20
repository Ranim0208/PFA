"use client";

import { Checkbox } from "../../components/ui/checkbox";
import { DataTableColumnHeader } from "../../components/common/table/DataTableColumnHeader";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Archive, ArchiveRestore, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export const userColumns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="h-4 w-4 !m-0 !p-0 data-[state=checked]:bg-tacir-darkblue data-[state=checked]:text-white data-[state=checked]:border-tacir-darkblue"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="h-4 w-4 !m-0 !p-0 data-[state=checked]:bg-tacir-darkblue data-[state=checked]:text-white data-[state=checked]:border-tacir-darkblue"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const isArchived = row.getValue("isArchived");
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.getValue("email")}</span>
          {isArchived && (
            <span className="text-xs text-tacir-darkgray mt-1">(Archivé)</span>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 250,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Prénom" />
    ),
    cell: ({ row }) => <span>{row.getValue("firstName")}</span>,
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nom" />
    ),
    cell: ({ row }) => <span>{row.getValue("lastName")}</span>,
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },
  {
    accessorKey: "roles",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rôles" />
    ),
    cell: ({ row }) => {
      const roles = row.getValue("roles");
      const roleConfig = {
        admin: {
          label: "Admin",
          color: "bg-purple-100 text-purple-800 border-purple-200",
        },
        mentor: {
          label: "Mentor",
          color: "bg-blue-100 text-blue-800 border-blue-200",
        },
        projectHolder: {
          label: "Porteur Projet",
          color: "bg-green-100 text-green-800 border-green-200",
        },
        IncubationCoordinator: {
          label: "Coord. Incubation",
          color: "bg-red-100 text-red-800 border-red-200",
        },
        ComponentCoordinator: {
          label: "Coord. Composante",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        },
        RegionalCoordinator: {
          label: "Coord. Régional",
          color: "bg-pink-100 text-pink-800 border-pink-200",
        },
        GeneralCoordinator: {
          label: "Coord. Général",
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        },
      };

      return (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(roles) ? (
            roles.map((role, index) => (
              <Badge
                key={index}
                variant="outline"
                className={`text-xs font-medium border ${
                  roleConfig[role]?.color ||
                  "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                {roleConfig[role]?.label || role}
              </Badge>
            ))
          ) : (
            <Badge
              variant="outline"
              className={`text-xs font-medium border ${
                roleConfig[roles]?.color ||
                "bg-gray-100 text-gray-800 border-gray-200"
              }`}
            >
              {roleConfig[roles]?.label || roles}
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 200,
  },
  {
    accessorKey: "isConfirmed",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Confirmé" />
    ),
    cell: ({ row }) => {
      const isConfirmed = row.getValue("isConfirmed");
      return (
        <Badge
          variant={isConfirmed ? "default" : "secondary"}
          className={
            isConfirmed
              ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
              : "bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
          }
        >
          {isConfirmed ? "Confirmé" : "En attente"}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 120,
  },
  {
    accessorKey: "isArchived",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Statut" />
    ),
    cell: ({ row }) => {
      const isArchived = row.getValue("isArchived");
      return (
        <Badge
          variant={isArchived ? "destructive" : "default"}
          className={
            isArchived
              ? "bg-tacir-pink/20 text-tacir-pink border-tacir-pink/30 hover:bg-tacir-pink/20"
              : "bg-tacir-green/20 text-tacir-green border-tacir-green/30 hover:bg-tacir-green/20"
          }
        >
          {isArchived ? "Archivé" : "Actif"}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 120,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Créé le" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="flex flex-col">
          <span className="text-sm">{date.toLocaleDateString("fr-FR")}</span>
          <span className="text-xs text-tacir-darkgray">
            {date.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
    size: 150,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const user = row.original;
      const isArchived = user.isArchived;

      // Get the archive/unarchive functions from the table meta
      const meta = table.options.meta;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isArchived ? (
              <DropdownMenuItem
                onClick={() => meta?.onArchive?.(user._id)}
                className="text-tacir-pink focus:text-tacir-pink focus:bg-tacir-pink/10"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archiver
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => meta?.onUnarchive?.(user._id)}
                className="text-tacir-green focus:text-tacir-green focus:bg-tacir-green/10"
              >
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Désarchiver
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 80,
  },
];
