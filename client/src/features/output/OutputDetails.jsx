import { Calendar, Clock, FileText, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
export const OutputDetails = ({ output }) => {
  return (
    <>
      <div className="text-tacir-darkgray mb-4 break-words">
        {output.description}
      </div>

      {output.instructions && (
        <div className="bg-tacir-lightgray/20 p-4 rounded-lg mb-4 border border-tacir-lightgray/30">
          <h4 className="font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Instructions :
          </h4>
          <p className="text-sm text-tacir-darkgray break-words">
            {output.instructions}
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-tacir-darkgray mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Échéance : {new Date(output.dueDate).toLocaleDateString("fr-FR")}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          Créé le : {new Date(output.createdAt).toLocaleDateString("fr-FR")}
        </div>
        {output.createdBy && (
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Par : {output.createdBy.firstName} {output.createdBy.lastName}
          </div>
        )}
      </div>

      {output.attachments && output.attachments.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-tacir-darkblue mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Pièces jointes :
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {output.attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-tacir-lightgray/30 hover:border-tacir-blue transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1 bg-tacir-blue/20 rounded-md">
                    <FileText className="w-4 h-4 text-tacir-blue" />
                  </div>
                  <span className="text-sm text-tacir-darkblue truncate">
                    {attachment.name}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const baseUrl = "https://incubation.tacir.tn";
                    const fullUrl = attachment.url.startsWith("http")
                      ? attachment.url
                      : attachment.url.startsWith("/api/")
                      ? `${baseUrl}${attachment.url}`
                      : `${baseUrl}/api/uploads${attachment.url.replace(
                          "/uploads",
                          ""
                        )}`;
                    window.open(fullUrl, "_blank");
                  }}
                  className="border-tacir-blue text-tacir-blue hover:bg-tacir-blue hover:text-white ml-2"
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
