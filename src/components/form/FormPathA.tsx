import { useState } from "react";
import { FormDataPathA, initialFormDataPathA, PatientContact, DoctorContact, DestinationType, IMAGING_LABELS, INSURANCE_OPTIONS, DESTINATION_OPTIONS } from "@/types/form";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormPathAProps {
  onBack: () => void;
}

const STEP_LABELS = ["Podezření", "Anamnéza", "Nález", "Přílohy", "Kontakt", "Kontrola"];

export const FormPathA = ({ onBack }: FormPathAProps) => {
  const [formData, setFormData] = useState<FormDataPathA>(initialFormDataPathA);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

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

    // Step 2: Anamnéza
    if (step === 2) {
      if (!formData.anamnesis.trim()) {
        newErrors.anamnesis = "Toto pole je povinné";
      }
      if (formData.hasBloodThinners === null) {
        newErrors.hasBloodThinners = "Toto pole je povinné";
      }
    }

    // Step 3: Nález (Zobrazení + Histologie)
    if (step === 3) {
      if (formData.selectedImagingTypes.length === 0) {
        newErrors.imagingTypes = "Vyberte minimálně 1 zobrazovací vyšetření";
      }
      formData.selectedImagingTypes.forEach((type) => {
        const exam = formData.imagingExams.find((e) => e.type === type);
        if (!exam?.description?.trim()) {
          newErrors[`${type}_description`] = "Popis je povinný";
        }
      });
      if (formData.hasHistology === true && !formData.histologyResult.trim()) {
        newErrors.histologyResult = "Popis výsledku histologie je povinný";
      }
    }

    // Step 4: Přílohy
    if (step === 4) {
      if (!formData.destination) {
        newErrors.destination = "Vyberte místo odeslání";
      }
    }

    // Step 5: Kontakt
    if (step === 5) {
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

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:*/*;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert attachments to base64
      const attachmentsData = await Promise.all(
        formData.attachments.map(async (file) => ({
          filename: file.name,
          content: await fileToBase64(file),
          contentType: file.type,
        }))
      );

      const { data, error } = await supabase.functions.invoke('send-referral-email', {
        body: {
          formType: 'A',
          destination: formData.destination,
          doctorContact: formData.doctorContact,
          patientContact: formData.patientContact,
          epacsShared: formData.epacsShared,
          attachments: attachmentsData,
          formData: {
            suspicionReason: formData.suspicionReason,
            imagingExams: formData.imagingExams,
            anamnesis: formData.anamnesis,
            hasBloodThinners: formData.hasBloodThinners,
            bloodThinnersDetails: formData.bloodThinnersDetails,
            hasHistology: formData.hasHistology,
            histologyDate: formData.histologyDate,
            histologyResult: formData.histologyResult,
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
    setFormData(initialFormDataPathA);
    setCurrentStep(1);
    onBack();
  };

  // Show no imaging alert immediately after step 1 if answer is NO
  if (currentStep > 1 && formData.hasImagingExam === false) {
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

      {/* Step 2: Anamnesis & Blood thinners */}
      {currentStep === 2 && (
        <div className="form-section animate-slide-down space-y-6">
          <h2 className="form-section-title">Anamnéza a medikace</h2>
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
          <div className="space-y-4">
            <div className="space-y-2">
              <YesNoField
                label="Užívá pacient antikoagulancia?"
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

      {/* Step 3: Nález (Zobrazení + Histologie) */}
      {currentStep === 3 && formData.hasImagingExam && (
        <div className="form-section animate-slide-down space-y-8">
          <div>
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

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-foreground">Histologie a další vyšetření</h3>
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
                    placeholder="Popište výsledek histologického vyšetření (můžete vložit zkopírovaný text)..."
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

      {/* Step 4: Attachments */}
      {currentStep === 4 && (
        <div className="form-section animate-slide-down space-y-6">
          <h2 className="form-section-title">Přílohy</h2>
          
          {/* Destination selector - first */}
          <DestinationSelector
            value={formData.destination}
            onChange={(value) => updateField("destination", value)}
            error={errors.destination}
          />
          
          {/* Two-step instructions */}
          <div className="bg-muted/30 rounded-xl p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                1
              </div>
              <div className="flex-1 pt-0.5">
                <Label className="field-label mb-1">Sdílení snímků přes ePACS</Label>
                <p className="text-sm text-muted-foreground">
                  Sdílejte prosím snímky z vyšetření přes systém ePACS.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                2
              </div>
              <div className="flex-1 pt-0.5">
                <FileUpload files={formData.attachments} onChange={(files) => updateField("attachments", files)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Contact info */}
      {currentStep === 5 && (
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

      {/* Step 6: Review */}
      {currentStep === 6 && (
        <div className="form-section animate-slide-down space-y-6">
          <h2 className="form-section-title">Kontrola informací před odesláním</h2>
          
          <div className="space-y-4">
            {/* Suspicion */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Důvod podezření</h4>
              <p className="text-sm text-foreground">{formData.suspicionReason || "—"}</p>
            </div>

            {/* Anamnesis */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Anamnéza</h4>
              <p className="text-sm text-foreground">{formData.anamnesis || "—"}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium">Antikoagulancia:</span> {formData.hasBloodThinners ? `Ano${formData.bloodThinnersDetails ? ` (${formData.bloodThinnersDetails})` : ""}` : "Ne"}
              </div>
            </div>

            {/* Imaging */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Zobrazovací vyšetření</h4>
              {formData.imagingExams.length > 0 ? (
                <div className="space-y-2">
                  {formData.imagingExams.map((exam, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium text-foreground">{IMAGING_LABELS[exam.type]}</span>
                      <span className="text-muted-foreground"> — {exam.date || "bez data"}</span>
                      {exam.description && <p className="text-xs text-muted-foreground mt-0.5">{exam.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
              
              {formData.hasHistology && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs font-medium text-foreground">Histologie:</span>
                  <span className="text-xs text-muted-foreground"> {formData.histologyDate || "bez data"}</span>
                  {formData.histologyResult && <p className="text-xs text-muted-foreground mt-0.5">{formData.histologyResult}</p>}
                </div>
              )}

              {formData.hasNextExam && (
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-xs font-medium text-foreground">Další vyšetření:</span>
                  <span className="text-xs text-muted-foreground"> {formData.nextExamDetails} — {formData.nextExamDate || "bez data"}</span>
                </div>
              )}
            </div>

            {/* Destination */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Místo odeslání</h4>
              <p className="text-sm text-foreground">
                {DESTINATION_OPTIONS.find(d => d.value === formData.destination)?.fullName || "—"}
              </p>
              {formData.attachments.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Přílohy: {formData.attachments.map(f => f.name).join(", ")}
                </p>
              )}
            </div>

            {/* Doctor Contact */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Kontakt na lékaře</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div><span className="text-muted-foreground">Jméno:</span> <span className="text-foreground">{formData.doctorContact.firstName} {formData.doctorContact.lastName}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{formData.doctorContact.email}</span></div>
                <div><span className="text-muted-foreground">Telefon:</span> <span className="text-foreground">{formData.doctorContact.phone}</span></div>
              </div>
            </div>

            {/* Patient Contact */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Kontakt na pacienta</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div><span className="text-muted-foreground">Jméno:</span> <span className="text-foreground">{formData.patientContact.firstName} {formData.patientContact.lastName}</span></div>
                <div><span className="text-muted-foreground">Rodné číslo:</span> <span className="text-foreground">{formData.patientContact.birthNumber}</span></div>
                <div><span className="text-muted-foreground">Adresa:</span> <span className="text-foreground">{formData.patientContact.address}</span></div>
                <div><span className="text-muted-foreground">Pojišťovna:</span> <span className="text-foreground">{INSURANCE_OPTIONS.find(i => i.value === formData.patientContact.insurance)?.label || formData.patientContact.insurance}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{formData.patientContact.email}</span></div>
                <div><span className="text-muted-foreground">Telefon:</span> <span className="text-foreground">{formData.patientContact.phone}</span></div>
              </div>
            </div>
          </div>

          {/* GDPR consent notice */}
          <div className="bg-sarcoma/10 border border-sarcoma/30 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={gdprConsent}
                onCheckedChange={(checked) => setGdprConsent(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm text-foreground">
                Odesíláním formuláře souhlasíte s{" "}
                <a 
                  href="http://sarkomy.cz/gdpr/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sarcoma hover:text-sarcoma/80 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  podmínkami zpracování osobních údajů (GDPR)
                </a>
                .
              </span>
            </label>
          </div>
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
          <Button onClick={handleSubmit} variant="success" className="gap-2" disabled={isSubmitting || !gdprConsent}>
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
