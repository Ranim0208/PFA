"use client";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../../components/ui/dialog";
import { toast } from "react-toastify";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Button } from "../../../components/ui/button";
import {
  Loader2,
  Calendar,
  MapPin,
  Award,
  FileText,
  Download,
  X,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { submitCandidatureApplication } from "../../../services/forms/publicFormService";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Textarea } from "../../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { useState } from "react";

const CandidatureFormDialog = ({ form, open, onOpenChange }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm();

  const formatDate = (dateString, locale = "fr-FR") => {
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderDescriptionWithLinks = (text, isArabic = false) => {
    const paragraphClass = isArabic ? "text-right arabic-text" : "";
    return text.split("\n").map((paragraph, index) => (
      <p key={index} className={`mb-3 ${paragraphClass}`}>
        {paragraph.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
          part.match(/^https?:\/\//) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tacir-blue hover:text-tacir-darkblue hover:underline font-medium"
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </p>
    ));
  };
  const onSubmit = async (data) => {
    try {
      console.log("📋 Form data keys:", Object.keys(data));

      const answers = form.fields.map((field) => {
        let value = data[field._id];

        console.log(`Field ${field._id} (${field.type}):`, {
          value,
          isFile: value instanceof File,
          type: typeof value,
        });

        // Handle checkbox values
        if (field.type === "checkbox" && Array.isArray(value)) {
          value = value.filter((v) => v !== false && v !== undefined);
        }

        return {
          field: field._id,
          value: value,
        };
      });

      // Check if file field exists
      const fileField = answers.find(
        (a) => a.field === "6915e8f7aaa45ca685a8ded4"
      );
      console.log("📎 File field in answers:", fileField);

      await submitCandidatureApplication(form._id, answers);

      toast.success("Candidature soumise avec succès", {
        description: "Votre dossier de candidature a bien été enregistré",
      });

      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Échec de la soumission", {
        description: error.message || "Erreur lors de l'envoi du formulaire",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl min-w-[60vw] max-h-[96vh] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Form Preview</DialogTitle>
        </VisuallyHidden>
        <ScrollArea className="h-[calc(96vh-1px)]">
          <div className="space-y-6 p-6 bg-tacir-lightgray/20">
            {/* Image Header */}
            {form.imageUrl && (
              <div className="w-full h-56 overflow-hidden rounded-lg mb-6 border-2 border-white shadow-md">
                <img
                  src={form.imageUrl}
                  alt="Form header"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Main Title */}
            <div className="grid grid-cols-2 gap-6 pb-6">
              <div>
                <div className="w-12 h-1 bg-tacir-pink mb-2"></div>
                <h1 className="text-2xl font-bold text-tacir-darkblue">
                  {form.title?.fr}
                </h1>
              </div>
              <div className="text-right">
                <div className="w-12 h-1 bg-tacir-pink ml-auto mb-2"></div>
                <h1 className="text-2xl font-bold text-tacir-darkblue arabic-text">
                  {form.title?.ar}
                </h1>
              </div>
            </div>

            {/* Programme Description */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-tacir-lightblue/10 rounded-full">
                    <FileText className="h-4 w-4 text-tacir-lightblue" />
                  </div>
                  <h2 className="text-lg font-semibold text-tacir-darkblue">
                    Contexte du Programme
                  </h2>
                </div>
                <div className="text-sm text-tacir-darkgray">
                  {renderDescriptionWithLinks(form.description?.fr)}
                </div>
              </div>
              <div className="space-y-3 border-l border-tacir-lightgray lg:pl-6">
                <div className="flex items-center gap-2 mb-3 justify-end">
                  <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                    سياق البرنامج
                  </h2>
                  <div className="p-1.5 bg-tacir-lightblue/10 rounded-full">
                    <FileText className="h-4 w-4 text-tacir-lightblue" />
                  </div>
                </div>
                <div className="text-sm text-tacir-darkgray">
                  {renderDescriptionWithLinks(form.description?.ar, true)}
                </div>
              </div>
            </section>

            {/* Event Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dates */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-tacir-yellow/10 rounded-full">
                      <Calendar className="h-4 w-4 text-tacir-yellow" />
                    </div>
                    <h2 className="text-lg font-semibold text-tacir-darkblue">
                      Dates Importantes
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                      التواريخ المهمة
                    </h2>
                    <div className="p-1.5 bg-tacir-yellow/10 rounded-full">
                      <Calendar className="h-4 w-4 text-tacir-yellow" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {form.eventDates?.map((event, index) => (
                    <div
                      key={index}
                      className="border-l-3 border-tacir-yellow/50 pl-4 py-1"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-base font-medium text-tacir-darkblue">
                            {formatDate(event.date, "fr-FR")}
                          </p>
                          <p className="text-sm text-tacir-darkgray">
                            {event.description?.fr}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-medium text-tacir-darkblue arabic-text">
                            {formatDate(event.date, "ar-TN")}
                          </p>
                          <p className="text-sm text-tacir-darkgray arabic-text">
                            {event.description?.ar}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Location */}
              <section className="bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-tacir-green/10 rounded-full">
                      <MapPin className="h-4 w-4 text-tacir-green" />
                    </div>
                    <h2 className="text-lg font-semibold text-tacir-darkblue">
                      Lieu de l'Événement
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                      مكان الحدث
                    </h2>
                    <div className="p-1.5 bg-tacir-green/10 rounded-full">
                      <MapPin className="h-4 w-4 text-tacir-green" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <p className="text-sm text-tacir-darkgray">
                    {form.eventLocation?.fr}
                  </p>
                  <p className="text-sm text-tacir-darkgray text-right arabic-text">
                    {form.eventLocation?.ar}
                  </p>
                </div>
              </section>
            </div>

            {/* Prizes */}
            {form.prizes && form.prizes.length > 0 && (
              <section className="bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-tacir-pink/10 rounded-full">
                      <Award className="h-4 w-4 text-tacir-pink" />
                    </div>
                    <h2 className="text-lg font-semibold text-tacir-darkblue">
                      Prix et Récompenses
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                      الجوائز
                    </h2>
                    <div className="p-1.5 bg-tacir-pink/10 rounded-full">
                      <Award className="h-4 w-4 text-tacir-pink" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {form.prizes?.map((prize, index) => (
                    <div
                      key={index}
                      className="bg-tacir-lightgray/20 p-4 rounded-lg border border-tacir-lightgray"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-tacir-darkblue">
                            {prize.amount} DT
                          </p>
                          <p className="text-sm text-tacir-darkgray">
                            {prize.description?.fr}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-tacir-darkblue arabic-text">
                            {prize.amount} دينار
                          </p>
                          <p className="text-sm text-tacir-darkgray arabic-text">
                            {prize.description?.ar}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Application Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <section className="bg-white p-6 rounded-xl shadow-sm border border-tacir-lightgray">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-tacir-blue/10 rounded-full">
                      <FileText className="h-4 w-4 text-tacir-blue" />
                    </div>
                    <h2 className="text-lg font-semibold text-tacir-darkblue">
                      Formulaire de Candidature
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-tacir-darkblue arabic-text">
                      استمارة الترشح
                    </h2>
                    <div className="p-1.5 bg-tacir-blue/10 rounded-full">
                      <FileText className="h-4 w-4 text-tacir-blue" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {form.fields?.map((field, index) => (
                    <div
                      key={index}
                      className="bg-tacir-lightgray/20 p-4 rounded-lg border border-tacir-lightgray"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-tacir-darkblue">
                            {field.label.fr}
                            {field.required && (
                              <span className="text-tacir-pink ml-1">*</span>
                            )}
                          </label>
                          <label className="block text-sm font-medium text-tacir-darkblue arabic-text">
                            {field.label.ar}
                            {field.required && (
                              <span className="text-tacir-pink ml-1">*</span>
                            )}
                          </label>
                        </div>
                        <FormFieldRenderer
                          field={field}
                          register={register}
                          errors={errors}
                          setValue={setValue}
                          watch={watch}
                          trigger={trigger}
                        />
                        {errors[field._id] && (
                          <p className="text-tacir-pink text-xs mt-1">
                            {errors[field._id].message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Submission Buttons */}
              <div className="sticky bottom-0 bg-white p-4 mt-4 border-t border-tacir-lightgray shadow-md rounded-b-xl">
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      onOpenChange(false);
                    }}
                    className="text-sm px-4 py-4 border-tacir-blue text-tacir-blue hover:bg-tacir-lightgray"
                  >
                    <div className="flex flex-col">
                      <span>Annuler</span>
                      <span className="arabic-text text-xs mt-0.5">إلغاء</span>
                    </div>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-sm px-4 py-4 bg-tacir-blue hover:bg-tacir-darkblue"
                  >
                    {isSubmitting ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <div className="flex flex-col">
                        <span>Soumettre</span>
                        <span className="arabic-text text-xs mt-0.5">
                          تقديم
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            {/* Closing */}
            <div className="text-center border-t border-tacir-lightgray pt-6">
              <p className="text-lg font-semibold text-tacir-darkblue mb-2">
                Nous sommes impatient·e·s de vous rencontrer !
              </p>
              <p className="text-lg font-semibold text-tacir-darkblue arabic-text">
                نتطلع بشغف للقاءكم!
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

const FormFieldRenderer = ({
  field,
  register,
  errors,
  setValue,
  watch,
  trigger,
}) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  // Phone validation function
  const validatePhone = (value) => {
    if (!value && !field.required) return true;
    if (!value && field.required) return "Le numéro de téléphone est requis";
    return (
      /^[0-9]{8}$/.test(value) ||
      "Le numéro de téléphone doit contenir exactement 8 chiffres"
    );
  };

  // Age validation function
  const validateAge = (value) => {
    if (!value && !field.required) return true;
    if (!value && field.required) return "L'âge est requis";
    const age = parseInt(value);
    return (age >= 16 && age <= 120) || "Vous devez avoir au moins 16 ans";
  };

  // Birthdate validation function
  const validateBirthdate = (value) => {
    if (!value && !field.required) return true;
    if (!value && field.required) return "La date de naissance est requise";

    const birthDate = new Date(value);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 16);

    return birthDate <= minDate || "Vous devez avoir au moins 16 ans";
  };

  // File validation function
  const validateFile = (file) => {
    if (!file && !field.required) return true;
    if (!file && field.required) return "Le fichier est requis";

    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (file.size > maxSize) {
        return "La taille du fichier doit être inférieure à 10MB";
      }

      if (!allowedTypes.includes(file.type)) {
        return "Le fichier doit être une image (JPEG, PNG, GIF) ou un document (PDF, DOC, DOCX)";
      }
    }

    return true;
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError !== true) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    setUploadedFile({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    });

    setValue(field._id, file, { shouldValidate: true });
  };

  const removeFile = () => {
    setUploadedFile(null);
    setValue(field._id, null, { shouldValidate: true });
  };

  const downloadFile = () => {
    if (uploadedFile?.file) {
      const url = URL.createObjectURL(uploadedFile.file);
      const a = document.createElement("a");
      a.href = url;
      a.download = uploadedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getValidationRules = () => {
    const rules = {
      required: field.required && "Ce champ est requis",
    };

    // Add type-specific validations
    switch (field.type) {
      case "email":
        rules.pattern = {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "Format d'email invalide",
        };
        break;

      case "phone":
        rules.validate = validatePhone;
        break;

      case "number":
        // Check if it's an age field
        const isAgeField =
          field.label?.fr?.toLowerCase().includes("age") ||
          field.label?.ar?.toLowerCase().includes("عمر");
        if (isAgeField) {
          rules.validate = validateAge;
          rules.min = {
            value: 16,
            message: "Vous devez avoir au moins 16 ans",
          };
          rules.max = {
            value: 120,
            message: "Veuillez entrer un âge valide",
          };
        }
        break;

      case "date":
        // Check if it's a birthdate field
        const isBirthdateField =
          field.label?.fr?.toLowerCase().includes("naissance") ||
          field.label?.ar?.toLowerCase().includes("ميلاد");
        if (isBirthdateField) {
          rules.validate = validateBirthdate;
        }
        break;

      case "file":
        rules.validate = validateFile;
        break;

      case "textarea":
        rules.maxLength = {
          value: 1000,
          message: "Le texte doit contenir moins de 1000 caractères",
        };
        break;
    }

    return rules;
  };

  const commonProps = {
    ...register(field._id, getValidationRules()),
  };

  // For checkbox handling
  const checkboxValues = watch(field._id) || [];

  const handleCheckboxChange = (optionValue, isChecked) => {
    const currentValues = checkboxValues || [];
    let newValues;

    if (isChecked) {
      newValues = [...currentValues, optionValue];
    } else {
      newValues = currentValues.filter((value) => value !== optionValue);
    }

    setValue(field._id, newValues, { shouldValidate: true });
  };

  // Phone input state
  const [phoneValue, setPhoneValue] = useState("");

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 8);
    setPhoneValue(value);
    setValue(field._id, value, { shouldValidate: true });
  };

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          {...commonProps}
          placeholder={field.placeholder?.fr || `Entrez ${field.label.fr}`}
          className="w-full p-2 text-sm border border-tacir-darkgray rounded-md focus:ring-1 focus:ring-tacir-blue focus:border-transparent"
          rows={3}
        />
      );

    case "select":
      return (
        <Select onValueChange={(value) => setValue(field._id, value)}>
          <SelectTrigger className="w-full border border-tacir-darkgray rounded-md focus:ring-1 focus:ring-tacir-blue focus:border-transparent">
            <SelectValue
              placeholder={field.placeholder?.fr || "Sélectionnez une option"}
            />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex flex-col">
                  <span>{option.label.fr}</span>
                  <span className="text-xs text-tacir-darkgray">
                    {option.label.ar}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "radio":
      return (
        <RadioGroup
          onValueChange={(value) => setValue(field._id, value)}
          className={
            field.layout === "inline" ? "flex gap-4 flex-wrap" : "space-y-2"
          }
        >
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`${field._id}-${option.value}`}
                className="text-tacir-blue border-tacir-lightgray/50"
              />
              <Label
                htmlFor={`${field._id}-${option.value}`}
                className="flex flex-col cursor-pointer"
              >
                <span className="text-sm text-tacir-darkblue">
                  {option.label.fr}
                </span>
                <span className="text-xs text-tacir-darkgray">
                  {option.label.ar}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "checkbox":
      return (
        <div
          className={
            field.layout === "inline" ? "flex gap-4 flex-wrap" : "space-y-2"
          }
        >
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${field._id}-${option.value}`}
                checked={checkboxValues.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(option.value, checked)
                }
                className="text-tacir-blue border-tacir-lightgray/50 data-[state=checked]:bg-tacir-blue"
              />
              <Label
                htmlFor={`${field._id}-${option.value}`}
                className="flex flex-col cursor-pointer"
              >
                <span className="text-sm text-tacir-darkblue">
                  {option.label.fr}
                </span>
                <span className="text-xs text-tacir-darkgray">
                  {option.label.ar}
                </span>
              </Label>
            </div>
          ))}
        </div>
      );

    case "phone":
      return (
        <div className="space-y-1">
          <Input
            type="tel"
            value={phoneValue}
            onChange={handlePhoneChange}
            placeholder={field.placeholder?.fr || "e.g., 12345678"}
            className="w-full p-2 text-sm border border-tacir-darkgray rounded-md focus:ring-1 focus:ring-tacir-blue focus:border-transparent"
            maxLength={8}
          />
          <p className="text-xs text-tacir-darkgray">
            {phoneValue.length}/8 chiffres
          </p>
        </div>
      );

    case "file":
      return (
        <div className="space-y-3">
          {!uploadedFile ? (
            <div className="space-y-2">
              <Input
                type="file"
                onChange={handleFileChange}
                className="w-full p-2 text-sm border border-tacir-darkgray rounded-md focus:ring-1 focus:ring-tacir-blue focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-tacir-blue file:text-white hover:file:bg-tacir-darkblue"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
              />
              <p className="text-xs text-tacir-darkgray">
                Formats supportés: JPEG, PNG, GIF, PDF, DOC, DOCX (Max 10MB)
                {field.required && (
                  <span className="text-tacir-pink ml-1">
                    * Ce champ est requis
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div className="border border-tacir-green/30 rounded-lg p-4 bg-tacir-green/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-tacir-green" />
                  <div>
                    <p className="text-sm font-medium text-tacir-darkblue">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-tacir-darkgray">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadFile}
                    className="text-tacir-blue hover:text-tacir-darkblue"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    className="text-tacir-pink hover:text-tacir-pink"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          )}
          {errors[field._id] && (
            <p className="text-tacir-pink text-xs mt-1">
              {errors[field._id].message}
            </p>
          )}
        </div>
      );
    case "section":
      return (
        <div className="py-3">
          <div className="border-t border-tacir-lightgray/30"></div>
        </div>
      );

    case "divider":
      return (
        <div className="py-2">
          <div className="border-t border-tacir-lightgray/50 border-dashed"></div>
        </div>
      );

    default:
      return (
        <Input
          type={field.type}
          {...commonProps}
          placeholder={field.placeholder?.fr || `Entrez ${field.label.fr}`}
          className="w-full p-2 text-sm border border-tacir-darkgray rounded-md focus:ring-1 focus:ring-tacir-blue focus:border-transparent"
        />
      );
  }
};

export default CandidatureFormDialog;
