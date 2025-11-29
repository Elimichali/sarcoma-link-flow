import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ImagingType, IMAGING_LABELS, ImagingExam, INSURANCE_OPTIONS, PatientContact, DoctorContact, DESTINATION_OPTIONS, DestinationType } from "@/types/form";
import { AlertTriangle, Calendar, Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  error?: string;
}

export const TextField = ({ 
  label, 
  value, 
  onChange, 
  required, 
  placeholder, 
  multiline = false,
  rows = 3,
  error 
}: TextFieldProps) => {
  const InputComponent = multiline ? Textarea : Input;
  
  return (
    <div className="space-y-1.5">
      <Label className="field-label">
        {label}
        {required && <span className="field-required">*</span>}
      </Label>
      <InputComponent
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        className={cn(error && "border-destructive focus-visible:ring-destructive")}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

interface YesNoFieldProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  required?: boolean;
}

export const YesNoField = ({ label, value, onChange, required }: YesNoFieldProps) => {
  return (
    <div className="space-y-3">
      <Label className="field-label">
        {label}
        {required && <span className="field-required">*</span>}
      </Label>
      <RadioGroup
        value={value === null ? undefined : value ? 'yes' : 'no'}
        onValueChange={(v) => onChange(v === 'yes')}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id={`${label}-yes`} />
          <Label htmlFor={`${label}-yes`} className="font-normal cursor-pointer">Ano</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id={`${label}-no`} />
          <Label htmlFor={`${label}-no`} className="font-normal cursor-pointer">Ne</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

interface ImagingCheckboxesProps {
  selectedTypes: ImagingType[];
  onChange: (types: ImagingType[]) => void;
  error?: string;
}

export const ImagingCheckboxes = ({ selectedTypes, onChange, error }: ImagingCheckboxesProps) => {
  const imagingTypes: ImagingType[] = ['sonografie', 'mri', 'ct', 'pet_ct', 'pet_mri'];

  const handleToggle = (type: ImagingType) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter(t => t !== type));
    } else {
      onChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="field-label">
        Vyberte provedená zobrazovací vyšetření
        <span className="field-required">*</span>
      </Label>
      <p className="field-description">Vyberte minimálně 1 možnost</p>
      <div className="flex flex-wrap gap-3">
        {imagingTypes.map((type) => (
          <label
            key={type}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all",
              selectedTypes.includes(type)
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-background hover:border-primary/50"
            )}
          >
            <Checkbox
              checked={selectedTypes.includes(type)}
              onCheckedChange={() => handleToggle(type)}
            />
            <span className="text-sm font-medium">{IMAGING_LABELS[type]}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

interface ImagingExamFieldsProps {
  exams: ImagingExam[];
  selectedTypes: ImagingType[];
  onChange: (exams: ImagingExam[]) => void;
}

export const ImagingExamFields = ({ exams, selectedTypes, onChange }: ImagingExamFieldsProps) => {
  const updateExam = (type: ImagingType, field: 'date' | 'description', value: string) => {
    const existingExam = exams.find(e => e.type === type);
    if (existingExam) {
      onChange(exams.map(e => e.type === type ? { ...e, [field]: value } : e));
    } else {
      onChange([...exams, { type, date: '', description: '', [field]: value }]);
    }
  };

  const getExamValue = (type: ImagingType, field: 'date' | 'description') => {
    const exam = exams.find(e => e.type === type);
    return exam ? exam[field] : '';
  };

  return (
    <div className="space-y-4 animate-slide-down">
      {selectedTypes.map((type) => (
        <div key={type} className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-sm text-foreground">{IMAGING_LABELS[type]}</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Datum vyšetření<span className="field-required">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="date"
                  value={getExamValue(type, 'date')}
                  onChange={(e) => updateExam(type, 'date', e.target.value)}
                  className="pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-muted-foreground">
                Popis výsledku<span className="field-required">*</span>
              </Label>
              <Textarea
                  value={getExamValue(type, 'description')}
                  onChange={(e) => updateExam(type, 'description', e.target.value)}
                  placeholder="Popište výsledek vyšetření a uveďte v jakém pracovišti bylo provedeno (můžete vložit zkopírovaný text)…"
                  rows={2}
                />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface NoImagingAlertProps {
  onBack: () => void;
}

export const NoImagingAlert = ({ onBack }: NoImagingAlertProps) => {
  return (
    <div className="form-section animate-fade-in">
      <div className="bg-warning/10 border border-warning/30 rounded-xl p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Zobrazovací vyšetření je vyžadováno
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Pro pokračování ve formuláři je nutné nejprve provést alespoň jedno zobrazovací vyšetření 
          (sonografie, MRI, CT, PET/CT nebo PET/MRI).
        </p>
        <Button variant="outline" onClick={onBack}>
          Zpět na výběr
        </Button>
      </div>
    </div>
  );
};

interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export const FileUpload = ({ files, onChange }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <Label className="field-label">Zde volitelně nahrajte jakékoli doplňující dokumenty (např. zprávy od lékaře)</Label>
      <p className="field-description">Podporované formáty: PDF, JPG, PNG (max. 10 MB)</p>
      
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
      >
        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Klikněte pro nahrání nebo přetáhněte soubory sem
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-background rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface DestinationSelectorProps {
  value: DestinationType | '';
  onChange: (value: DestinationType) => void;
  error?: string;
}

export const DestinationSelector = ({ value, onChange, error }: DestinationSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="field-label">
        Místo odeslání (kam chcete pacienta objednat)<span className="field-required">*</span>
      </Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as DestinationType)}
        className="flex flex-col sm:flex-row gap-3"
      >
        {DESTINATION_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all flex-1",
              value === option.value
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-background hover:border-primary/50"
            )}
          >
            <RadioGroupItem value={option.value} id={`destination-${option.value}`} />
            <div>
              <span className="font-medium">{option.label}</span>
              <p className="text-xs text-muted-foreground">{option.fullName}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

interface DoctorContactFieldsProps {
  contact: DoctorContact;
  onChange: (contact: DoctorContact) => void;
  errors?: Partial<Record<keyof DoctorContact, string>>;
}

export const DoctorContactFields = ({ contact, onChange, errors = {} }: DoctorContactFieldsProps) => {
  const updateField = (field: keyof DoctorContact, value: string) => {
    onChange({ ...contact, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="form-section-title">Kontakt na lékaře</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="field-label">
            Jméno<span className="field-required">*</span>
          </Label>
          <Input
            type="text"
            name="doctorFirstName"
            required
            autoComplete="given-name"
            value={contact.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder="Jan"
            className={cn(errors.firstName && "border-destructive")}
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="field-label">
            Příjmení<span className="field-required">*</span>
          </Label>
          <Input
            type="text"
            name="doctorLastName"
            required
            autoComplete="family-name"
            value={contact.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            placeholder="Novák"
            className={cn(errors.lastName && "border-destructive")}
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="field-label">
            Email<span className="field-required">*</span>
          </Label>
          <Input
            type="email"
            name="doctorEmail"
            required
            autoComplete="email"
            value={contact.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="jan.novak@nemocnice.cz"
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="field-label">
            Telefon<span className="field-required">*</span>
          </Label>
          <Input
            type="tel"
            name="doctorPhone"
            required
            inputMode="tel"
            autoComplete="tel"
            pattern="^(\+420 ?)?\d{3} ?\d{3} ?\d{3}$"
            title="Zadejte telefon ve formátu +420 123 456 789 nebo 123 456 789"
            value={contact.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+420 123 456 789"
            className={cn(errors.phone && "border-destructive")}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-2">
        Budeme Vás kontaktovat jen v urgentních případech.
      </p>
    </div>
  );
};

interface PatientContactFieldsProps {
  contact: PatientContact;
  onChange: (contact: PatientContact) => void;
  errors?: Partial<Record<keyof PatientContact, string>>;
}

export const PatientContactFields = ({ contact, onChange, errors = {} }: PatientContactFieldsProps) => {
  const updateField = (field: keyof PatientContact, value: string) => {
    onChange({ ...contact, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="form-section-title">Kontaktní údaje pacienta</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="field-label">
            Jméno<span className="field-required">*</span>
          </Label>
          <Input
            type="text"
            name="patientFirstName"
            required
            autoComplete="given-name"
            value={contact.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            placeholder="Jan"
            className={cn(errors.firstName && "border-destructive")}
          />
          {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="field-label">
            Příjmení<span className="field-required">*</span>
          </Label>
          <Input
            type="text"
            name="patientLastName"
            required
            autoComplete="family-name"
            value={contact.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            placeholder="Novák"
            className={cn(errors.lastName && "border-destructive")}
          />
          {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="field-label">
          Adresa<span className="field-required">*</span>
        </Label>
        <Input
          type="text"
          name="patientAddress"
          required
          autoComplete="street-address"
          value={contact.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder="Ulice 123, 110 00 Praha"
          className={cn(errors.address && "border-destructive")}
        />
        {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="field-label">
            Pojišťovna<span className="field-required">*</span>
          </Label>
          <Select
            value={contact.insurance}
            onValueChange={(value) => updateField('insurance', value)}
            required
          >
            <SelectTrigger className={cn(errors.insurance && "border-destructive")}>
              <SelectValue placeholder="Vyberte pojišťovnu" />
            </SelectTrigger>
            <SelectContent>
              {INSURANCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.insurance && <p className="text-xs text-destructive">{errors.insurance}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="field-label">
            Rodné číslo<span className="field-required">*</span>
          </Label>
          <Input
            type="text"
            name="birthNumber"
            required
            inputMode="numeric"
            maxLength={11}
            pattern="^\d{6}\/?\d{3,4}$"
            title="Zadejte rodné číslo ve tvaru 123456/7890 nebo 1234567890"
            value={contact.birthNumber}
            onChange={(e) => updateField('birthNumber', e.target.value)}
            placeholder="123456/7890"
            className={cn(errors.birthNumber && "border-destructive")}
          />
          {errors.birthNumber && <p className="text-xs text-destructive">{errors.birthNumber}</p>}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="field-label">
            Telefon<span className="field-required">*</span>
          </Label>
          <Input
            type="tel"
            name="patientPhone"
            required
            inputMode="tel"
            autoComplete="tel"
            pattern="^(\+420 ?)?\d{3} ?\d{3} ?\d{3}$"
            title="Zadejte telefon ve formátu +420 123 456 789 nebo 123 456 789"
            value={contact.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+420 123 456 789"
            className={cn(errors.phone && "border-destructive")}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="field-label">
            Email<span className="field-required">*</span>
          </Label>
          <Input
            type="email"
            name="patientEmail"
            required
            autoComplete="email"
            value={contact.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="jan.novak@email.cz"
            className={cn(errors.email && "border-destructive")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>
    </div>
  );
};

interface EPacsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const EPacsCheckbox = ({ checked, onChange }: EPacsCheckboxProps) => {
  return (
    <div className="mt-6">
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="mt-0.5">
          <Checkbox
            checked={checked}
            onCheckedChange={(value) => onChange(value === true)}
            className="h-5 w-5 rounded-none border-2"
          />
        </div>
        <span className="text-sm font-medium text-foreground">
          Snímky byly sdíleny přes systém ePACS
        </span>
      </label>
    </div>
  );
};
