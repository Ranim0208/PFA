import { Button } from "@/components/ui/button";
export const getMentorSubmissionColumns = (setPreviewSubmission) => {
  // Helper function to find answer by field label/description
  const findAnswerByFieldLabel = (submission, searchTerms) => {
    if (!submission.answers || !Array.isArray(submission.answers)) {
      return null;
    }

    return submission.answers.find((answer) => {
      if (!answer.field || !answer.field.label) return false;

      let fieldLabel = "";

      // Handle different label structures
      if (typeof answer.field.label === "string") {
        fieldLabel = answer.field.label;
      } else if (typeof answer.field.label === "object") {
        // Try French first, then English, then Arabic
        fieldLabel =
          answer.field.label.fr ||
          answer.field.label.en ||
          answer.field.label.ar ||
          "";
      }

      if (!fieldLabel || typeof fieldLabel !== "string") return false;

      const normalizedLabel = fieldLabel.toLowerCase();
      return searchTerms.some((term) =>
        normalizedLabel.includes(term.toLowerCase())
      );
    });
  };

  return [
    {
      accessorKey: "candidateName",
      header: "Nom Candidat",
      cell: ({ row }) => {
        const answer = findAnswerByFieldLabel(row.original, [
          "nom candidat",
          "nom",
          "candidat",
          "name",
        ]);
        return <div className="font-medium">{answer?.value || "N/A"}</div>;
      },
    },
    {
      accessorKey: "Titre provisoire",
      header: "Titre provisoire",
      cell: ({ row }) => {
        const answer = findAnswerByFieldLabel(row.original, [
          "Titre provisoire",
          "titre",
        ]);
        return (
          <div className="max-w-xs truncate" title={answer?.value}>
            {answer?.value || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "Descriptif du projet ",
      header: "Descriptif du projet ",
      cell: ({ row }) => {
        const answer = findAnswerByFieldLabel(row.original, [
          "Descriptif du projet ",
          "description",
        ]);
        return (
          <div className="max-w-xs truncate" title={answer?.value}>
            {answer?.value || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "Activité",
      header: "Activité",
      cell: ({ row }) => {
        const answer = findAnswerByFieldLabel(row.original, [
          "Votre Activité",
          "Activité",
        ]);
        return (
          <div className="max-w-xs truncate" title={answer?.value}>
            {answer?.value || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "Aventure entrepreneuriale",
      header: "Aventure entrepreneuriale",
      cell: ({ row }) => {
        const answer = findAnswerByFieldLabel(row.original, [
          "aventure entrepreneuriale",
          "aventure",
          "entrepreneuriale",
        ]);
        return (
          <div className="max-w-xs truncate" title={answer?.value}>
            {answer?.value || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "Capsule du projet",
      header: "Capsule du projet",
      cell: ({ row }) => {
        const answer = findAnswerByFieldLabel(row.original, [
          "capsule du projet",
        ]);
        return (
          <div className="max-w-xs truncate" title={answer?.value}>
            {answer?.value || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "Liens traveaux / portfolio",
      header: "Liens traveaux / portfolio",
      cell: ({ row }) => {
        const answer = findAnswerByFieldLabel(row.original, [
          "Liens traveaux / portfolio",
          "Liens",
          "traveaux",
          "portfolio",
        ]);
        return (
          <div className="max-w-xs truncate" title={answer?.value}>
            {answer?.value || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "Contact",
      header: "Contact",
      cell: ({ row }) => {
        const emailAnswer = findAnswerByFieldLabel(row.original, [
          "email",
          "e-mail",
          "mail",
          "contact",
        ]);
        const phoneAnswer = findAnswerByFieldLabel(row.original, [
          "téléphone",
          "telephone",
          "phone",
          "tel",
        ]);

        return (
          <div className="text-sm">
            {emailAnswer?.value && <div>{emailAnswer.value}</div>}
            {phoneAnswer?.value && <div>{phoneAnswer.value}</div>}
            {!emailAnswer?.value && !phoneAnswer?.value && "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "Evaluations",
      header: "Evaluation",
      cell: ({ row }) => {
        const evaluations = row.original.mentorEvaluations || [];
        const yourEvaluation = evaluations[0]; // Assuming one evaluation per mentor

        if (!yourEvaluation) {
          return <span className="text-gray-400">Not evaluated</span>;
        }

        const evaluationText =
          yourEvaluation.evaluationText || yourEvaluation.evaluation;
        const evaluationColors = {
          "Très bien": "text-green-600 font-medium",
          Bien: "text-blue-600 font-medium",
          Moyen: "text-yellow-600 font-medium",
          Faible: "text-red-600 font-medium",
        };

        return (
          <span className={evaluationColors[evaluationText] || "font-medium"}>
            {evaluationText}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreviewSubmission(row.original)}
          className="hover:bg-blue-50"
        >
          Review
        </Button>
      ),
    },
  ];
};
