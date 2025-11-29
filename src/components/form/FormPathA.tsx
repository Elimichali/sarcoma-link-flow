import { useState } from "react";
import { FormDataPathA, initialFormDataPathA, PatientContact, DestinationType } from "@/types/form";
import { ProgressIndicator } from "./ProgressIndicator";
import {
  TextField,
  YesNoField,
  ImagingCheckboxes,
  ImagingExamFields,
  NoImagingAlert,
  FileUpload,
  PatientContactFields,
  EPacsNotice,
  EPacsCheckbox,
} from "./FormFields";
import { SuccessDialog } from "./SuccessDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Send, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormPathAProps {
  onBack: () => void;
}

const STEP_LABELS = ["Podezření", "Zobrazení", "Anamnéza", "Histologie", "Přílohy", "Kontakt"];

export const FormPathA = ({ onBack }: FormPathAProps) => {
  const [formData, setFormData] = useState<FormDataPathA>(initialFormDataPathA);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const updateField = <K extends keyof FormDataPathA>(field: K, value: FormDataPathA[K]) => {
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

    if (step === 1 && !formData.suspicionReason.trim()) {
      newErrors.suspicionReason = "Toto pole je povinné";
    }

    if (step === 2) {
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

    if (step === 3) {
      if (!formData.anamnesis.trim()) {
        newErrors.anamnesis = "Toto pole je povinné";
      }
      // Blood thinners is required
      if (formData.hasBloodThinners === null) {
        newErrors.hasBloodThinners = "Toto pole je povinné";
      }
    }

    if (step === 4) {
      // If histology was performed, histology result is required
      if (formData.hasHistology === true && !formData.histologyResult.trim()) {
        newErrors.histologyResult = "Popis výsledku histologie je povinný";
      }
    }

    if (step === 6) {
      // Destination is required
      if (!formData.patientContact.destination) {
        newErrors.contact_destination = "Vyberte místo odeslání";
      }

      const contactFields: (keyof PatientContact)[] = [
        "firstName",
        "lastName",
        "address",
        "insurance",
        "birthNumber",
        "phone",
        "email",
      ];
      contactFields.forEach((field) => {
        if (!formData.patientContact[field].trim()) {
          newErrors[`contact_${field}`] = "Toto pole je povinné";
        }
      });

      if (formData.patientContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientContact.email)) {
        newErrors.contact_email = "Neplatný formát emailu";
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

  const handleSubmit = () => {
    if (validateStep(6)) {
      console.log("Form submitted:", formData);
      setShowSuccessDialog(true);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    // Reset form and go back to path selection
    setFormData(initialFormDataPathA);
    setCurrentStep(1);
    onBack();
  };

  // Show no imaging alert
  if (currentStep === 2 && formData.hasImagingExam === false) {
    return <NoImagingAlert onBack={onBack} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <ProgressIndicator currentStep={currentStep} totalSteps={6} labels={STEP_LABELS} />

      {/* Step 1: Suspicion reason */}
      {currentStep === 1 && (
        <div className="form-section animate-slide-down">
          <h2 className="form-section-title">Důvod podezření na sarkom</h2>
          <TextField
            label="Co vás vede k podezření na sarkom?"
            value={formData.suspicionReason}
            onChange={(v) => updateField("suspicionReason", v)}
            required
            multiline
            rows={4}
            placeholder="Popište příznaky, nálezy a důvody pro podezření..."
            error={errors.suspicionReason}
          />
          <div className="mt-6">
            <YesNoField
              label="Byla provedena sonografie nebo jiné zobrazovací vyšetření?"
              value={formData.hasImagingExam}
              onChange={(v) => updateField("hasImagingExam", v)}
              required
            />
          </div>
        </div>
      )}

      {/* Step 2: Imaging exams */}
      {currentStep === 2 && formData.hasImagingExam && (
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

      {/* Step 3: Anamnesis & Blood thinners */}
      {currentStep === 3 && (
        <div className="form-section animate-slide-down space-y-6">
          <h2 className="form-section-title">Anamnéza a medikace</h2>
          <TextField
            label="Anamnéza"
            value={formData.anamnesis}
            onChange={(v) => updateField("anamnesis", v)}
            required
            multiline
            rows={4}
            placeholder="Uveďte relevantní anamnézu pacienta..."
            error={errors.anamnesis}
          />
          <div className="space-y-4">
            <div className="space-y-2">
              <YesNoField
                label="Léky na ředění krve"
                value={formData.hasBloodThinners}
                onChange={(v) => updateField("hasBloodThinners", v)}
                required
              />
              {errors.hasBloodThinners && (
                <p className="text-xs text-destructive">{errors.hasBloodThinners}</p>
              )}
            </div>
            {formData.hasBloodThinners && (
              <div className="animate-slide-down">
                <TextField
                  label="Specifikujte léky"
                  value={formData.bloodThinnersDetails}
                  onChange={(v) => updateField("bloodThinnersDetails", v)}
                  placeholder="Např. Warfarin, Eliquis..."
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Histology & Next exam */}
      {currentStep === 4 && (
        <div className="form-section animate-slide-down space-y-6">
          <h2 className="form-section-title">Histologie a další vyšetření</h2>

          <div className="space-y-4">
            <YesNoField
              label="Byla provedena histologická verifikace?"
              value={formData.hasHistology}
              onChange={(v) => updateField("hasHistology", v)}
            />
            {formData.hasHistology && (
              <div className="animate-slide-down space-y-4 bg-muted/50 rounded-lg p-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Datum histologie</Label>
                  <div className="relative max-w-xs">
                    <Input
                      type="date"
                      value={formData.histologyDate}
                      onChange={(e) => updateField("histologyDate", e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Výsledek a bližší popis<span className="text-destructive ml-0.5">*</span>
                  </Label>
                  <Textarea
                    value={formData.histologyResult}
                    onChange={(e) => updateField("histologyResult", e.target.value)}
                    placeholder="Popište výsledek histologického vyšetření..."
                    rows={3}
                    className={cn(errors.histologyResult && "border-destructive")}
                  />
                  {errors.histologyResult && (
                    <p className="text-xs text-destructive">{errors.histologyResult}</p>
                  )}
                </div>
              </div>
            )}
          </div>

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
        <div className="form-section animate-slide-down">
          <h2 className="form-section-title">Přílohy</h2>
          <FileUpload files={formData.attachments} onChange={(files) => updateField("attachments", files)} />
          <EPacsCheckbox
            checked={formData.epacsShared}
            onChange={(checked) => updateField("epacsShared", checked)}
          />
        </div>
      )}

      {/* Step 6: Patient contact */}
      {currentStep === 6 && (
        <div className="form-section animate-slide-down space-y-6">
          <PatientContactFields
            contact={formData.patientContact}
            onChange={(contact) => updateField("patientContact", contact)}
            errors={Object.fromEntries(
              Object.entries(errors)
                .filter(([k]) => k.startsWith("contact_"))
                .map(([k, v]) => [k.replace("contact_", ""), v])
            )}
          />
          <EPacsNotice />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? onBack : handlePrev}
          className="gap-2"
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
          <Button onClick={handleSubmit} variant="success" className="gap-2">
            <Send className="w-4 h-4" />
            Odeslat formulář
          </Button>
        )}
      </div>

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={handleCloseSuccessDialog}
        destination={formData.patientContact.destination as DestinationType}
      />
    </div>
  );
};
