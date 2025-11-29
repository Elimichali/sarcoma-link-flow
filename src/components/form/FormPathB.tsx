import { useState } from "react";
import { FormDataPathB, initialFormDataPathB, PatientContact, DoctorContact, DestinationType } from "@/types/form";
import { ProgressIndicator } from "./ProgressIndicator";
import {
  TextField,
  YesNoField,
  ImagingCheckboxes,
  ImagingExamFields,
  NoImagingAlert,
  FileUpload,
  PatientContactFields,
  DoctorContactFields,
  DestinationSelector,
} from "./FormFields";
import { SuccessDialog } from "./SuccessDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send, Calendar, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormPathBProps {
  onBack: () => void;
}

const STEP_LABELS = ["Důvod", "Diagnóza", "Nález", "Vyšetření", "Přílohy", "Kontakt"];

export const FormPathB = ({ onBack }: FormPathBProps) => {
  const [formData, setFormData] = useState<FormDataPathB>(initialFormDataPathB);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof FormDataPathB>(field: K, value: FormDataPathB[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1 && !formData.consultationReason.trim()) {
      newErrors.consultationReason = "Toto pole je povinné";
    }

    // Step 2: Diagnóza (anamnesis + diagnosis)
    if (step === 2) {
      if (!formData.anamnesis.trim()) {
        newErrors.anamnesis = "Toto pole je povinné";
      }
      if (!formData.diagnosis.trim()) {
        newErrors.diagnosis = "Toto pole je povinné";
      }
    }

    // Step 3: Nález (imaging)
    if (step === 3) {
      if (formData.selectedImagingTypes.length === 0) {
        newErrors.imagingTypes = "Vyberte minimálně 1 zobrazovací vyšetření";
      }
      formData.selectedImagingTypes.forEach((type) => {
        const exam = formData.imagingExams.find((e) => e.type === type);
        if (!exam?.date) {
          newErrors[`${type}_date`] = "Datum je povinné";
        }
        if (!exam?.description?.trim()) {
          newErrors[`${type}_description`] = "Popis je povinný";
        }
      });
    }

    // Step 5: Přílohy
    if (step === 5) {
      if (!formData.destination) {
        newErrors.destination = "Vyberte místo odeslání";
      }
    }

    if (step === 6) {
      // Doctor contact validation
      const doctorFields: (keyof DoctorContact)[] = ["firstName", "lastName", "email", "phone"];
      doctorFields.forEach((field) => {
        if (!formData.doctorContact[field].trim()) {
          newErrors[`doctor_${field}`] = "Toto pole je povinné";
        }
      });

      if (formData.doctorContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.doctorContact.email)) {
        newErrors.doctor_email = "Neplatný formát emailu";
      }

      // Patient contact validation
      const patientFields: (keyof PatientContact)[] = [
        "firstName",
        "lastName",
        "address",
        "insurance",
        "birthNumber",
        "phone",
        "email",
      ];
      patientFields.forEach((field) => {
        if (!formData.patientContact[field].trim()) {
          newErrors[`patient_${field}`] = "Toto pole je povinné";
        }
      });

      if (formData.patientContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientContact.email)) {
        newErrors.patient_email = "Neplatný formát emailu";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-referral-email', {
        body: {
          formType: 'B',
          destination: formData.destination,
          doctorContact: formData.doctorContact,
          patientContact: formData.patientContact,
          epacsShared: formData.epacsShared,
          formData: {
            consultationReason: formData.consultationReason,
            imagingExams: formData.imagingExams,
            anamnesis: formData.anamnesis,
            diagnosis: formData.diagnosis,
            hasNextExam: formData.hasNextExam,
            nextExamDetails: formData.nextExamDetails,
            nextExamDate: formData.nextExamDate,
          },
        },
      });

      if (error) throw error;

      console.log("Form submitted successfully:", data);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Chyba při odesílání formuláře. Zkuste to prosím znovu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    setFormData(initialFormDataPathB);
    setCurrentStep(1);
    onBack();
  };

  // Show no imaging alert
  if (currentStep === 3 && formData.hasImagingExam === false) {
    return <NoImagingAlert onBack={onBack} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ProgressIndicator currentStep={currentStep} totalSteps={6} labels={STEP_LABELS} />

      {/* Step 1: Consultation reason */}
      {currentStep === 1 && (
        <div className="form-section animate-slide-down">
          <h2 className="form-section-title">Důvod konzultace</h2>
          <TextField
            label="Důvod konzultace"
            value={formData.consultationReason}
            onChange={(v) => updateField("consultationReason", v)}
            required
            multiline
            rows={4}
            placeholder="Popište důvod konzultace nebo nový nález..."
            error={errors.consultationReason}
          />
          <div className="mt-6">
            <YesNoField
              label="Bylo provedeno relevantní zobrazovací vyšetření?"
              value={formData.hasImagingExam}
              onChange={(v) => updateField("hasImagingExam", v)}
              required
            />
          </div>
        </div>
      )}

      {/* Step 2: Anamnesis & Diagnosis */}
      {currentStep === 2 && (
        <div className="form-section animate-slide-down space-y-6">
          <h2 className="form-section-title">Anamnéza a diagnóza</h2>
          <TextField
            label="Anamnéza"
            value={formData.anamnesis}
            onChange={(v) => updateField("anamnesis", v)}
            required
            multiline
            rows={4}
            placeholder="Uveďte relevantní anamnézu pacienta (můžete vložit zkopírovaný text)..."
            error={errors.anamnesis}
          />
          <TextField
            label="Základní diagnóza + diagnostický souhrn"
            value={formData.diagnosis}
            onChange={(v) => updateField("diagnosis", v)}
            required
            multiline
            rows={4}
            placeholder="Uveďte základní diagnózu a diagnostický souhrn..."
            error={errors.diagnosis}
          />
        </div>
      )}

      {/* Step 3: Nález (Imaging exams) */}
      {currentStep === 3 && formData.hasImagingExam && (
        <div className="form-section animate-slide-down">
          <h2 className="form-section-title">Zobrazovací vyšetření</h2>
          <ImagingCheckboxes
            selectedTypes={formData.selectedImagingTypes}
            onChange={(types) => updateField("selectedImagingTypes", types)}
            error={errors.imagingTypes}
          />
          {formData.selectedImagingTypes.length > 0 && (
            <div className="mt-6">
              <ImagingExamFields
                exams={formData.imagingExams}
                selectedTypes={formData.selectedImagingTypes}
                onChange={(exams) => updateField("imagingExams", exams)}
              />
            </div>
          )}
        </div>
      )}

      {/* Step 4: Next exam */}
      {currentStep === 4 && (
        <div className="form-section animate-slide-down space-y-6">
          <h2 className="form-section-title">Další vyšetření</h2>

          <div className="space-y-4">
            <YesNoField
              label="Je pacient objednán na další vyšetření?"
              value={formData.hasNextExam}
              onChange={(v) => updateField("hasNextExam", v)}
            />
            {formData.hasNextExam && (
              <div className="animate-slide-down space-y-4 bg-muted/50 rounded-lg p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Specifikace vyšetření</Label>
                  <Input
                    value={formData.nextExamDetails}
                    onChange={(e) => updateField("nextExamDetails", e.target.value)}
                    placeholder="Např. MRI, biopsie..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Datum vyšetření</Label>
                  <div className="relative max-w-xs">
                    <Input
                      type="date"
                      value={formData.nextExamDate}
                      onChange={(e) => updateField("nextExamDate", e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: Attachments */}
      {currentStep === 5 && (
        <div className="form-section animate-slide-down space-y-6">
          <h2 className="form-section-title">Přílohy</h2>
          
          {/* Destination selector - first */}
          <DestinationSelector
            value={formData.destination}
            onChange={(value) => updateField("destination", value)}
            error={errors.destination}
          />
          
          <p className="text-base text-foreground">
            Sdílejte prosím snímky z vyšetření přes systém ePACS.
          </p>
          
          <FileUpload files={formData.attachments} onChange={(files) => updateField("attachments", files)} />
        </div>
      )}

      {/* Step 6: Contact info */}
      {currentStep === 6 && (
        <div className="form-section animate-slide-down space-y-8">
          {/* Doctor contact */}
          <DoctorContactFields
            contact={formData.doctorContact}
            onChange={(contact) => updateField("doctorContact", contact)}
            errors={Object.fromEntries(
              Object.entries(errors)
                .filter(([k]) => k.startsWith("doctor_"))
                .map(([k, v]) => [k.replace("doctor_", ""), v])
            )}
          />

          {/* Patient contact */}
          <PatientContactFields
            contact={formData.patientContact}
            onChange={(contact) => updateField("patientContact", contact)}
            errors={Object.fromEntries(
              Object.entries(errors)
                .filter(([k]) => k.startsWith("patient_"))
                .map(([k, v]) => [k.replace("patient_", ""), v])
            )}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onBack : handlePrev}
          className="gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="w-4 h-4" />
          {currentStep === 1 ? "Zpět na výběr" : "Předchozí"}
        </Button>

        {currentStep < 6 ? (
          <Button
            onClick={handleNext}
            disabled={currentStep === 1 && formData.hasImagingExam === null}
            className="gap-2"
          >
            Další
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} variant="success" className="gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Odesílám...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Odeslat formulář
              </>
            )}
          </Button>
        )}
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={handleCloseSuccessDialog}
        destination={formData.destination as DestinationType}
      />
    </div>
  );
};
