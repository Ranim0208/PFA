import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  Eye,
  UserX,
  Ban,
  CheckCircle,
  Clock,
  UserCheck,
  ChevronDown,
  HelpCircle,
  MoreHorizontal,
} from "lucide-react";
import { statusOptions } from "@/utils/constants";
import { EVALUATION_OPTIONS, getEvaluationConfig } from "./evaluationConfig";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState } from "react";

const EvaluationStatus = ({ hasEvaluation, config, evaluationText }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
          hasEvaluation
            ? `${config.borderColor || "border-tacir-lightgray"} ${
                config.bgColor || "bg-tacir-lightgray"
              }`
            : "border-dashed border-tacir-yellow bg-tacir-yellow/20"
        } ${isHovered ? "ring-2 ring-tacir-lightblue/50" : ""}`}
      >
        {hasEvaluation ? (
          <>
            <span
              className={`text-lg ${config.textColor || "text-tacir-darkblue"}`}
            >
              {config.icon}
            </span>
            <span
              className={`text-sm font-medium ${
                config.textColor || "text-tacir-darkblue"
              }`}
            >
              {evaluationText}
            </span>
          </>
        ) : (
          <>
            <HelpCircle className="h-4 w-4 text-tacir-yellow" />
            <span className="text-sm font-medium text-tacir-yellow">
              Évaluation requise
            </span>
          </>
        )}

        <ChevronDown
          className={`h-4 w-4 ml-2 transition-transform duration-200 ${
            isHovered ? "text-tacir-blue" : "text-tacir-darkgray"
          }`}
        />
      </div>

      {/* Pulsing indicator for unevaluated items */}
      {!hasEvaluation && (
        <div className="absolute -top-1 -right-1">
          <div className="relative">
            <div className="h-3 w-3 bg-tacir-yellow rounded-full animate-ping absolute"></div>
            <div className="h-3 w-3 bg-tacir-yellow rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export const getSubmissionColumns = (
  onPreview,
  onStatusUpdate,
  onEvaluationChange,
  onWithdrawal
) => [
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
    size: 50,
    maxSize: 60,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 font-medium text-white hover:bg-tacir-blue/80 transition-colors"
      >
        Statut
        <ArrowUpDown className="h-3 w-3 ml-1" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.original.status || "submitted";
      const isWithdrawn =
        status === "rejected" && row.original.attendanceStatus === "declined";
      const config = isWithdrawn
        ? {
            label: "Désisté",
            badgeVariant: "destructive",
            icon: <UserX className="h-3 w-3 mr-1" />,
            color: "bg-tacir-pink text-white",
          }
        : statusOptions[status] || statusOptions.submitted;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 px-2 font-normal hover:bg-tacir-lightgray/50 transition-colors"
            >
              <Badge
                variant={config.badgeVariant}
                className={`flex items-center py-1 ${config.color || ""}`}
              >
                {config.icon}
                {config.label}
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 border-tacir-lightgray"
          >
            <DropdownMenuLabel className="text-tacir-darkblue font-semibold">
              Changer le statut
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-tacir-lightgray" />
            {Object.entries(statusOptions).map(
              ([key, { label, icon, color }]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => onStatusUpdate(row.original._id, key)}
                  className={`flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors ${
                    key === status
                      ? "bg-tacir-lightblue/20 text-tacir-blue font-semibold"
                      : "hover:bg-tacir-lightgray"
                  }`}
                >
                  <span
                    className={
                      color?.includes("text-") ? color : "text-tacir-darkblue"
                    }
                  >
                    {icon}
                  </span>
                  <span>{label}</span>
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 140,
    maxSize: 160,
  },
  {
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 font-medium text-white hover:bg-tacir-blue/80 transition-colors"
      >
        Date Soumission
        <ArrowUpDown className="h-3 w-3 ml-1" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-tacir-darkgray">
        {new Date(row.original.submittedAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </div>
    ),
    size: 130,
    maxSize: 140,
  },
  {
    accessorKey: "preselectionEvaluations",
    header: () => (
      <div className="flex items-center gap-2">
        <span className="text-white font-medium">Évaluation</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-tacir-lightgray cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3 bg-white border border-tacir-lightgray shadow-lg">
              <p className="text-sm font-medium text-tacir-darkblue mb-1">
                Comment évaluer
              </p>
              <p className="text-xs text-tacir-darkgray">
                Cliquez sur l&apos;évaluation pour choisir une option. Les
                candidats non évalués sont marqués en orange.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    cell: ({ row }) => {
      const evaluations = row.original.preselectionEvaluations || [];
      const latestEvaluation =
        evaluations.length > 0 ? evaluations[evaluations.length - 1] : null;
      const config = latestEvaluation
        ? getEvaluationConfig(latestEvaluation.evaluationText)
        : {};
      const hasEvaluation = !!latestEvaluation;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-0 font-normal hover:bg-transparent w-full"
            >
              <EvaluationStatus
                hasEvaluation={hasEvaluation}
                config={config}
                evaluationText={latestEvaluation?.evaluationText}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-80 p-3 border-tacir-lightgray"
            align="start"
          >
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-tacir-darkblue text-sm">
                  Évaluation de présélection
                </h4>
                <p className="text-xs text-tacir-darkgray mt-1">
                  Sélectionnez une option pour évaluer ce candidat
                </p>
              </div>

              <DropdownMenuSeparator className="bg-tacir-lightgray" />

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {EVALUATION_OPTIONS.map((option) => {
                  const optionConfig = getEvaluationConfig(option.text);
                  return (
                    <DropdownMenuItem
                      key={option.text}
                      onClick={() =>
                        onEvaluationChange(row.original._id, option.value)
                      }
                      className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                        latestEvaluation?.evaluationText === option.text
                          ? "bg-tacir-lightblue/20 border border-tacir-lightblue"
                          : "hover:bg-tacir-lightgray"
                      }`}
                    >
                      <span
                        className={`text-lg mt-0.5 ${
                          optionConfig.textColor || "text-tacir-darkgray"
                        }`}
                      >
                        {option.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-tacir-darkblue text-sm truncate">
                            {option.text}
                          </p>
                          {latestEvaluation?.evaluationText === option.text && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-tacir-blue text-white border-tacir-blue flex-shrink-0"
                            >
                              Actuel
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-tacir-darkgray mt-1.5 line-clamp-2">
                          {option.description}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 220,
    maxSize: 240,
  },
  {
    accessorKey: "attendanceStatus",
    header: ({ column }) => (
      <div className="text-white font-medium">Statut de présence</div>
    ),
    cell: ({ row }) => {
      const status = row.original.attendanceStatus || "pending";

      const statusConfig = {
        pending: {
          label: "En attente",
          variant: "outline",
          color: "text-tacir-yellow",
          bg: "bg-tacir-yellow/20",
          border: "border-tacir-yellow",
          icon: <Clock className="h-3 w-3 mr-1" />,
        },
        present: {
          label: "Présent",
          variant: "success",
          color: "text-tacir-green",
          bg: "bg-tacir-green/20",
          border: "border-tacir-green",
          icon: <UserCheck className="h-3 w-3 mr-1" />,
        },
        absent: {
          label: "Absent",
          variant: "destructive",
          color: "text-tacir-pink",
          bg: "bg-tacir-pink/20",
          border: "border-tacir-pink",
          icon: <Ban className="h-3 w-3 mr-1" />,
        },
        declined: {
          label: "Refusé",
          variant: "destructive",
          color: "text-tacir-yellow",
          bg: "bg-tacir-yellow/20",
          border: "border-tacir-yellow",
          icon: <UserX className="h-3 w-3 mr-1" />,
        },
      };

      const currentConfig = statusConfig[status] || statusConfig.pending;

      return (
        <div className="flex items-center">
          <Badge
            variant={currentConfig.variant}
            className={`px-2 py-1 rounded-full text-xs font-medium ${currentConfig.bg} ${currentConfig.color} ${currentConfig.border} flex items-center`}
          >
            {currentConfig.icon}
            {currentConfig.label}
          </Badge>
        </div>
      );
    },
    size: 150,
    maxSize: 160,
  },
  {
    id: "actions",
    header: () => (
      <div className="text-white font-medium text-right">Actions</div>
    ),
    cell: ({ row }) => {
      const submission = row.original;
      const isWithdrawn =
        submission.status === "rejected" &&
        submission.attendanceStatus === "declined";

      return (
        <div className="flex items-center justify-end gap-1">
          {/* Preview Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPreview(submission)}
                  className="h-8 w-8 hover:bg-tacir-lightblue/20 hover:text-tacir-blue transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-tacir-darkblue text-white text-xs"
              >
                Voir les détails
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Withdrawal Button */}
          {submission.status === "accepted" && !isWithdrawn && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onWithdrawal(submission)}
                    className="h-8 w-8 hover:bg-tacir-pink/20 hover:text-tacir-pink transition-colors"
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-tacir-darkblue text-white text-xs"
                >
                  Désistement
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Additional Actions Dropdown for Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-tacir-lightgray/50 lg:hidden"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-tacir-lightgray"
            >
              <DropdownMenuLabel className="text-tacir-darkblue font-semibold">
                Actions supplémentaires
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-tacir-lightgray" />

              {/* Status Change Options */}
              <DropdownMenuItem
                onClick={() => onPreview(submission)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Eye className="h-4 w-4 text-tacir-blue" />
                <span>Voir détails</span>
              </DropdownMenuItem>

              {submission.status === "accepted" && !isWithdrawn && (
                <DropdownMenuItem
                  onClick={() => onWithdrawal(submission)}
                  className="flex items-center gap-2 cursor-pointer text-tacir-pink"
                >
                  <UserX className="h-4 w-4" />
                  <span>Désistement</span>
                </DropdownMenuItem>
              )}

              {/* Quick Status Updates */}
              <DropdownMenuSeparator className="bg-tacir-lightgray" />
              <DropdownMenuLabel className="text-tacir-darkblue text-xs font-medium">
                Statut rapide
              </DropdownMenuLabel>

              {Object.entries(statusOptions)
                .slice(0, 3)
                .map(([key, { label, icon }]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => onStatusUpdate(submission._id, key)}
                    className="flex items-center gap-2 cursor-pointer text-xs"
                  >
                    {icon}
                    <span>Marquer comme {label}</span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Indicators */}
          {isWithdrawn && (
            <TooltipProvider>
              <Tooltip>
                <div className="cursor-help">
                  <Ban className="h-4 w-4 text-tacir-darkgray" />
                </div>
                <TooltipContent
                  side="top"
                  className="bg-tacir-darkblue text-white text-xs"
                >
                  Candidat désisté
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {submission.isReplacement && (
            <TooltipProvider>
              <Tooltip>
                <Badge
                  variant="outline"
                  className="bg-tacir-green/20 text-tacir-green border-tacir-green px-2 py-1 text-xs flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  <span className="hidden sm:inline">Remplaçant</span>
                </Badge>
                <TooltipContent
                  side="top"
                  className="bg-tacir-darkblue text-white text-xs"
                >
                  Candidat remplaçant
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      );
    },
    size: 120,
    maxSize: 130,
    enableSorting: false,
  },
];
