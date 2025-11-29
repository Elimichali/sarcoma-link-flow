export type FormPath = 'A' | 'B' | null;

export type ImagingType = 'sonografie' | 'mri' | 'ct' | 'pet_ct' | 'pet_mri';

export interface ImagingExam {
  type: ImagingType;
  date: string;
  description: string;
}

export type DestinationType = 'praha' | 'brno';

export const DESTINATION_OPTIONS: { value: DestinationType; label: string; fullName: string }[] = [
  { value: 'praha', label: 'Praha', fullName: 'Fakultní nemocnice Motol' },
  { value: 'brno', label: 'Brno', fullName: 'Masarykův onkologický ústav' },
];

export interface PatientContact {
  firstName: string;
  lastName: string;
  address: string;
  insurance: string;
  birthNumber: string;
  phone: string;
  email: string;
  destination: DestinationType | '';
}

export interface FormDataPathA {
  suspicionReason: string;
  hasImagingExam: boolean | null;
  selectedImagingTypes: ImagingType[];
  imagingExams: ImagingExam[];
  anamnesis: string;
  hasBloodThinners: boolean | null;
  bloodThinnersDetails: string;
  hasHistology: boolean | null;
  histologyDate: string;
  histologyResult: string;
  hasNextExam: boolean | null;
  nextExamDetails: string;
  nextExamDate: string;
  attachments: File[];
  epacsShared: boolean;
  patientContact: PatientContact;
}

export interface FormDataPathB {
  consultationReason: string;
  hasImagingExam: boolean | null;
  selectedImagingTypes: ImagingType[];
  imagingExams: ImagingExam[];
  anamnesis: string;
  diagnosis: string;
  hasNextExam: boolean | null;
  nextExamDetails: string;
  nextExamDate: string;
  attachments: File[];
  epacsShared: boolean;
  patientContact: PatientContact;
}

export const IMAGING_LABELS: Record<ImagingType, string> = {
  sonografie: 'Sonografie',
  mri: 'MRI',
  ct: 'CT',
  pet_ct: 'PET/CT',
  pet_mri: 'PET/MRI',
};

export const INSURANCE_OPTIONS = [
  { value: '111', label: 'VZP (111)' },
  { value: '201', label: 'VoZP (201)' },
  { value: '205', label: 'ČPZP (205)' },
  { value: '207', label: 'OZP (207)' },
  { value: '209', label: 'ZPŠ (209)' },
  { value: '211', label: 'ZPMV (211)' },
  { value: '213', label: 'RBP (213)' },
];

export const initialPatientContact: PatientContact = {
  firstName: '',
  lastName: '',
  address: '',
  insurance: '',
  birthNumber: '',
  phone: '',
  email: '',
  destination: '',
};

export const initialFormDataPathA: FormDataPathA = {
  suspicionReason: '',
  hasImagingExam: null,
  selectedImagingTypes: [],
  imagingExams: [],
  anamnesis: '',
  hasBloodThinners: null,
  bloodThinnersDetails: '',
  hasHistology: null,
  histologyDate: '',
  histologyResult: '',
  hasNextExam: null,
  nextExamDetails: '',
  nextExamDate: '',
  attachments: [],
  epacsShared: false,
  patientContact: { ...initialPatientContact },
};

export const initialFormDataPathB: FormDataPathB = {
  consultationReason: '',
  hasImagingExam: null,
  selectedImagingTypes: [],
  imagingExams: [],
  anamnesis: '',
  diagnosis: '',
  hasNextExam: null,
  nextExamDetails: '',
  nextExamDate: '',
  attachments: [],
  epacsShared: false,
  patientContact: { ...initialPatientContact },
};
