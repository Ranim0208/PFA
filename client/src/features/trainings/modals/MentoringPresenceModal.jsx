// src/features/trainings/components/MentoringPresenceModal.jsx
"use client";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle, Calendar, Clock, User, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { apiClient } from "@/hooks/apiClient";
import { apiBaseUrl } from "@/utils/constants";
import { generateTrainingReport } from "@/services/trainings/pdfGenerator";

const MentoringPresenceModal = ({ 
  open, 
  onOpenChange, 
  training 
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const sigCanvas = useRef(null);

  // Format date function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Fetch sessions for this training and user
  useEffect(() => {
    if (!open || !training ) return;
    
    const fetchSessions = async () => {
      try {
        setSessionLoading(true);
        const response = await  apiClient(
                `${apiBaseUrl}/trainingsTracking/sessions/by-training-user/${training?._id}`
        );

          setSessions(response.sessions);
          // Select the first upcoming session by default
          const upcoming = response.sessions.find(
            s => new Date(s.date) >= new Date()
          );
          setSelectedSession(upcoming || response.data.sessions[0]);
        }
       catch (error) {
        console.error("Error fetching sessions:", error);
        toast.error("Erreur lors du chargement des sessions");
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSessions();
  }, [open, training]);

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const saveSignature = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      toast.error("Veuillez signer pour confirmer votre présence");
      return;
    }

    if (!selectedSession) {
      toast.error("Veuillez sélectionner une session");
      return;
    }

    try {
      setIsSaving(true);
      
      // Get signature as base64 data
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      
      // Choose the correct endpoint based on whether we're editing or creating
      const endpoint = isEditing 
        ? `${apiBaseUrl}/trainingsTracking/sessions/${selectedSession._id}/update-signature`
        : `${apiBaseUrl}/trainingsTracking/sessions/${selectedSession._id}/confirm-presence`;
      
      // Save to backend
      const response = await apiClient(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature: signatureData })
      });

      if (response.success) {
        const successMessage = isEditing 
          ? "Signature modifiée avec succès" 
          : "Présence enregistrée avec succès";
        toast.success(successMessage);
        
        // Update local state
        setSessions(prev => prev.map(s => 
          s._id === selectedSession._id 
            ? { 
                ...s, 
                signature: signatureData,
                ...(isEditing 
                  ? { signatureUpdatedAt: new Date().toISOString() }
                  : { status: "confirmed", presenceConfirmedAt: new Date().toISOString() }
                )
              } 
            : s
        ));
        
        // Update selected session
        setSelectedSession(prev => ({
          ...prev,
          signature: signatureData,
          ...(isEditing 
            ? { signatureUpdatedAt: new Date().toISOString() }
            : { status: "confirmed", presenceConfirmedAt: new Date().toISOString() }
          )
        }));
        
        setIsEditing(false);
        setActiveTab("details");
      } else {
        throw new Error(response.message || "Failed to save signature");
      }
    } catch (error) {
      console.error("Error saving signature:", error);
      const errorMessage = isEditing 
        ? "Erreur lors de la modification de la signature"
        : "Erreur lors de l'enregistrement de la présence";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSignature = () => {
    setIsEditing(true);
    setActiveTab("presence");
  };

  const handleSelectSession = (session) => {
    setSelectedSession(session);
    setIsEditing(false);
    
    // If session has no signature, switch to presence tab
    if (!session.signature && session.status !== "confirmed") {
      setActiveTab("presence");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-tacir-darkblue">
            {training?.title} - Sessions de Mentorat
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full bg-white shadow-sm rounded-lg border border-tacir-lightgray">
            <TabsTrigger value="details" className="data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white">
              Détails
            </TabsTrigger>
            <TabsTrigger value="presence" className="data-[state=active]:bg-tacir-darkblue data-[state=active]:text-white">
              {selectedSession?.signature ? "Signature" : "Confirmer présence"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="p-4">
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold text-tacir-darkblue">
                  {training?.title}
                </h2>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-tacir-green text-white">
                  Session en ligne
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-tacir-darkblue flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Date et heure
                  </h3>
                  <p>
                    {training?.startDate ? formatDate(training?.startDate) : 'Non spécifié'} • {training?.time || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-tacir-darkblue flex items-center gap-2">
                    <User className="w-4 h-4" /> Formateur(s)
                  </h3>
                  <p>
                    {training?.trainers?.map(t => t.personalInfo?.fullName).join(", ") || 'Non spécifié'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-medium text-tacir-darkblue">Description</h3>
                  <p className="text-sm text-tacir-darkgray">
                    {training?.description || 'Aucune description disponible'}
                  </p>
                </div>
                {training?.onlineLink && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-tacir-darkblue">Lien de connexion</h3>
                    <a 
                      href={training?.onlineLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-tacir-blue hover:underline break-all"
                    >
                      {training?.onlineLink}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-tacir-darkblue mb-3">
                  Vos sessions de mentorat
                </h3>
                
                {sessionLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-tacir-blue" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="bg-tacir-lightblue p-4 rounded-lg">
                    <p className="text-tacir-darkblue">
                      Aucune session programmée pour cette formation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div 
                        key={session._id}
                        className={`p-4 rounded-lg border ${
                          session._id === selectedSession?._id 
                            ? 'border-tacir-green bg-tacir-lightgreen' 
                            : 'border-tacir-lightgray'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium">
                              {formatDate(session.date)} • {session.startTime} - {session.endTime}
                            </p>
                            <p className="text-sm text-tacir-darkgray">
                              Statut: 
                              <span className={`ml-2 font-medium ${
                                session.status === 'confirmed' ? 'text-tacir-green' :
                                session.status === 'completed' ? 'text-tacir-green' :
                                session.status === 'cancelled' ? 'text-red-600' : 'text-tacir-blue'
                              }`}>
                                {session.status === 'scheduled' ? 'Planifiée' :
                                 session.status === 'confirmed' ? 'Présence confirmée' :
                                 session.status === 'completed' ? 'Terminée' : 'Annulée'}
                              </span>
                            </p>
                            {session.presenceConfirmedAt && (
                              <p className="text-sm text-tacir-darkgray">
                                Confirmé le: {formatDate(session.presenceConfirmedAt)}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            {session.signature ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSelectSession(session)}
                                  className="border-tacir-green text-tacir-green hover:bg-tacir-green hover:text-white"
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Voir signature
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSession(session);
                                    handleEditSignature();
                                  }}
                                  className="bg-tacir-blue hover:bg-tacir-darkblue"
                                >
                                  Modifier signature
                                </Button>
                              </>
                            ) : session.status === 'scheduled' && (
                              <Button
                                size="sm"
                                onClick={() => handleSelectSession(session)}
                                className="bg-tacir-green hover:bg-tacir-darkgreen"
                              >
                                Confirmer présence
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presence" className="p-4">
            <div className="space-y-6">
              <div className="bg-tacir-lightblue p-4 rounded-lg">
                {selectedSession?.signature && !isEditing ? (
                  <div>
                    <p className="text-tacir-darkblue font-medium mb-2">
                      Votre signature pour cette session
                    </p>
                    <p className="text-sm text-tacir-darkgray">
                      Session du {selectedSession ? formatDate(selectedSession.date) : ''} • 
                      {selectedSession?.startTime} - {selectedSession?.endTime}
                    </p>
                    {selectedSession.presenceConfirmedAt && (
                      <p className="text-sm text-tacir-darkgray mt-1">
                        Présence confirmée le: {formatDate(selectedSession.presenceConfirmedAt)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-tacir-darkblue font-medium">
                      {isEditing ? "Modifiez votre signature ci-dessous" : "Veuillez signer dans le cadre ci-dessous pour confirmer votre présence à cette session de mentorat."}
                    </p>
                    
                    {selectedSession && (
                      <p className="mt-2 font-medium">
                        Session du {formatDate(selectedSession.date)} • {selectedSession.startTime} - {selectedSession.endTime}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedSession?.signature && !isEditing ? (
                <div className="border border-tacir-lightgray rounded-lg p-4 bg-white text-center">
                  <img 
                    src={selectedSession.signature} 
                    alt="Signature" 
                    className="max-w-full h-48 mx-auto border border-gray-200 rounded"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div className="border border-tacir-lightgray rounded-lg p-2 bg-white">
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      width: "100%",
                      height: 200,
                      className: "border border-tacir-lightgray rounded-md bg-white"
                    }}
                    penColor="black"
                  />
                </div>
              )}

              <div className="flex justify-between">
                {selectedSession?.signature && !isEditing ? (
                  <Button
                    onClick={handleEditSignature}
                    className="bg-tacir-blue hover:bg-tacir-darkblue"
                  >
                    Modifier la signature
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={clearSignature}
                      disabled={isSaving}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Effacer
                    </Button>
                    
                    <Button
                      onClick={saveSignature}
                      disabled={isSaving || !selectedSession}
                      className="bg-tacir-green hover:bg-tacir-darkgreen"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        isEditing ? "Sauvegarder la modification" : "Confirmer la présence"
                      )}
                    </Button>
                  </>
                )}
              </div>

              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="w-full"
                >
                  Annuler la modification
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MentoringPresenceModal;