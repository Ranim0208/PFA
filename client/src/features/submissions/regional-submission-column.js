import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  BanIcon,
  CheckCircleIcon,
  CheckIcon,
  XCircleIcon,
  ClockIcon,
} from "lucide-react";
export const getRegionalSubmissionColumns = (onPreview, onAttendanceUpdate) => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPreview(row.original)}
        className="hover:bg-gray-200"
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
  // regional-submission-columns.js
  {
    accessorKey: "attendanceStatus",
    header: "Présence",
    cell: ({ row }) => {
      const status = row.original.attendanceStatus || "pending";
      const submissionId = row.original._id;

      const statusConfig = {
        pending: {
          label: "En cours",
          variant: "outline",
          className: "text-gray-600 bg-gray-50",
          icon: <ClockIcon className="h-4 w-4 mr-2" />,
        },
        present: {
          label: "Présent",
          variant: "success",
          className: "text-green-600 bg-green-50",
          icon: <CheckCircleIcon className="h-4 w-4 mr-2" />,
        },
        absent: {
          label: "Absent",
          variant: "destructive",
          className: "text-red-600 bg-red-50",
          icon: <XCircleIcon className="h-4 w-4 mr-2" />,
        },
        declined: {
          label: "Refusé",
          variant: "destructive",
          className: "text-amber-600 bg-amber-50",
          icon: <BanIcon className="h-4 w-4 mr-2" />,
        },
      };

      const currentConfig = statusConfig[status] || statusConfig.pending;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={currentConfig.variant}
              size="sm"
              className={`${currentConfig.className} flex items-center`}
            >
              {currentConfig.icon}
              {currentConfig.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[150px]">
            {Object.entries(statusConfig).map(([key, config]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => onAttendanceUpdate(submissionId, key)}
                className={`flex items-center ${
                  key === status ? "font-semibold bg-accent" : ""
                }`}
              >
                <span className="flex items-center">
                  {config.icon}
                  {config.label}
                  {key === status && <CheckIcon className="ml-auto h-4 w-4" />}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
