"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ParticipantDetails = ({ participant, onClose }) => {
  if (!participant) return null;

  return (
    <Dialog open={!!participant} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {participant.user?.firstName} {participant.user?.lastName}'s Answers
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Email</h3>
              <p>{participant.user?.email || "-"}</p>
            </div>
            <div>
              <h3 className="font-medium">Phone</h3>
              <p>{participant.user?.phone || "-"}</p>
            </div>
          </div>

          {/* Answers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Form Answers</h3>
            <div className="space-y-4">
              {participant.fields?.map((field, index) => (
                <div key={index} className="border rounded p-4">
                  <h4 className="font-medium">{field.label}</h4>
                  {field.isFile ? (
                    <div className="mt-2 space-y-2">
                      {field.value?.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline block"
                        >
                          File {i + 1}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2">{field.value?.toString() || "-"}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParticipantDetails;
