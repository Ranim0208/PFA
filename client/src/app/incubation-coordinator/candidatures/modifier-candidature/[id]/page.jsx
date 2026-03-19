// app/general-coordinator/candidatures/liste-formulaire-candidature/[id]/page.tsx
"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import FormBuilder from "@/components/formBuilder/FormBuilder";
import { Loader2 } from "lucide-react";
import { getFormById } from "@/services/forms/formServices";

export default function EditFormPage({ params }) {
  const router = useRouter();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Properly unwrap the params promise
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const form = await getFormById(formId);
        console.log("data", form);
        setFormData(form);
      } catch (error) {
        console.error("Error fetching form:", error);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchForm();
    }
  }, [formId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {formData && <FormBuilder existingFormId={formId} />}
    </div>
  );
}
