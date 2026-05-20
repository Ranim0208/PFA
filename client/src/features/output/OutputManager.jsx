import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { OutputStats } from "./OutputStats";
import { CreateOutputDialog } from "./CreateOutputDialog";
import { OutputCard } from "./OutputCard";
import { EvaluationDialog } from "./EvaluationDialog";
import {
  createTrainingOutput,
  getTrainingOutputs,
  evaluateParticipantOutput,
} from "../services/outputService";

export const OutputManager = ({
  trainingId,
  userRole = "mentor",
  currentUser,
}) => {
  const [outputs, setOutputs] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState({
    totalOutputs: 0,
    totalSubmissions: 0,
    totalApproved: 0,
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evaluationDialog, setEvaluationDialog] = useState({
    open: false,
    submission: null,
  });

  useEffect(() => {
    if (trainingId) {
      loadOutputs();
    }
  }, [trainingId]);

  const loadOutputs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTrainingOutputs(trainingId);
      const outputsData = response.data || [];

      setOutputs(outputsData);

      // Calculate statistics
      const totalOutputs = outputsData.length;
      const totalSubmissions = outputsData.reduce(
        (acc, output) =>
          acc +
          (output.participantSubmissions?.filter((s) => s.submitted).length ||
            0),
        0
      );
      const totalApproved = outputsData.reduce(
        (acc, output) =>
          acc +
          (output.participantSubmissions?.filter((s) => s.approved).length ||
            0),
        0
      );
      const totalPending = outputsData.reduce(
        (acc, output) =>
          acc +
          (output.participantSubmissions?.filter(
            (s) => s.submitted && !s.approved
          ).length || 0),
        0
      );

      setStats({
        totalOutputs,
        totalSubmissions,
        totalApproved,
        totalPending,
      });
    } catch (error) {
      console.error("Error loading outputs:", error);
      setError(error.message || "Failed to load training outputs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOutput = async (outputData, attachments = []) => {
    try {
      await createTrainingOutput(trainingId, outputData, attachments);
      await loadOutputs(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error("Error creating output:", error);
      throw error;
    }
  };

  const handleEvaluateSubmission = async (submissionId, evaluationData) => {
    try {
      await evaluateParticipantOutput(submissionId, evaluationData);
      await loadOutputs(); // Refresh the list
      setEvaluationDialog({ open: false, submission: null });
    } catch (error) {
      console.error("Error evaluating submission:", error);
      throw error;
    }
  };

  const handleViewSubmission = (submission) => {
    if (submission.fileUrl) {
      window.open(submission.fileUrl, "_blank");
    }
  };

  const openEvaluationDialog = (submission) => {
    setEvaluationDialog({ open: true, submission });
  };

  const closeEvaluationDialog = () => {
    setEvaluationDialog({ open: false, submission: null });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-l-4 border-l-tacir-blue">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tacir-blue rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-tacir-darkblue">
                    Training Outputs
                  </CardTitle>
                  <CardDescription className="text-tacir-darkgray">
                    Loading...
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tacir-blue"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-l-4 border-l-tacir-blue">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tacir-blue rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-tacir-darkblue">
                    Training Outputs
                  </CardTitle>
                  <CardDescription className="text-tacir-darkgray">
                    Error loading outputs
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={loadOutputs}
                variant="outline"
                className="border-tacir-blue text-tacir-blue"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Alert className="border-tacir-pink">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-tacir-pink">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-tacir-blue bg-gradient-to-r from-tacir-lightgray to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tacir-blue rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-tacir-darkblue">
                  Training Outputs
                </CardTitle>
                <CardDescription className="text-tacir-darkgray">
                  {userRole === "mentor"
                    ? "Manage assignments and track submissions"
                    : "View your assignments and submit work"}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={loadOutputs}
                variant="outline"
                className="border-tacir-lightblue text-tacir-lightblue hover:bg-tacir-lightblue hover:text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>

              {userRole === "mentor" && (
                <CreateOutputDialog
                  trainingId={trainingId}
                  participants={participants}
                  onOutputCreated={handleCreateOutput}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics - Only for mentors */}
      {userRole === "mentor" && outputs.length > 0 && (
        <OutputStats stats={stats} loading={loading} />
      )}

      {/* Outputs List */}
      <div className="space-y-6">
        {outputs.length === 0 ? (
          <Card className="border-dashed border-2 border-tacir-lightblue">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-16 h-16 text-tacir-lightblue mb-4" />
              <h3 className="text-lg font-semibold text-tacir-darkblue mb-2">
                No Outputs Created Yet
              </h3>
              <p className="text-tacir-darkgray text-center mb-4">
                {userRole === "mentor"
                  ? "Create your first training output to get started with assignments."
                  : "No assignments have been created for this training yet."}
              </p>
              {userRole === "mentor" && (
                <CreateOutputDialog
                  trainingId={trainingId}
                  participants={participants}
                  onOutputCreated={handleCreateOutput}
                  loading={loading}
                />
              )}
            </CardContent>
          </Card>
        ) : (
          outputs.map((output) => (
            <OutputCard
              key={output._id}
              output={output}
              userRole={userRole}
              onEvaluate={openEvaluationDialog}
              onViewSubmission={handleViewSubmission}
            />
          ))
        )}
      </div>

      {/* Evaluation Dialog */}
      <EvaluationDialog
        isOpen={evaluationDialog.open}
        onClose={closeEvaluationDialog}
        submission={evaluationDialog.submission}
        onEvaluate={handleEvaluateSubmission}
      />
    </div>
  );
};
