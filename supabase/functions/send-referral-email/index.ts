import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DoctorContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PatientContact {
  firstName: string;
  lastName: string;
  address: string;
  insurance: string;
  birthNumber: string;
  phone: string;
  email: string;
}

interface ReferralEmailRequest {
  formType: 'A' | 'B';
  destination: 'praha' | 'brno';
  doctorContact: DoctorContact;
  patientContact: PatientContact;
  formData: Record<string, unknown>;
  epacsShared: boolean;
}

const DESTINATION_NAMES: Record<string, string> = {
  praha: 'Fakultní nemocnice Motol',
  brno: 'Masarykův onkologický ústav',
};

const IMAGING_LABELS: Record<string, string> = {
  sonografie: 'Sonografie',
  mri: 'MRI',
  ct: 'CT',
  pet_ct: 'PET/CT',
  pet_mri: 'PET/MRI',
};

const INSURANCE_LABELS: Record<string, string> = {
  '111': 'VZP (111)',
  '201': 'VoZP (201)',
  '205': 'ČPZP (205)',
  '207': 'OZP (207)',
  '209': 'ZPŠ (209)',
  '211': 'ZPMV (211)',
  '213': 'RBP (213)',
};

interface ImagingExam {
  type: string;
  date: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReferralEmailRequest = await req.json();
    
    console.log("Received referral form submission:", {
      formType: data.formType,
      destination: data.destination,
      doctorEmail: data.doctorContact.email,
      patientName: `${data.patientContact.firstName} ${data.patientContact.lastName}`,
    });

    const formData = data.formData as Record<string, unknown>;
    const imagingExams = (formData.imagingExams as ImagingExam[]) || [];
    
    // Build imaging examinations section - only show those that were done
    let imagingSection = '';
    imagingExams.forEach((exam: ImagingExam) => {
      const label = IMAGING_LABELS[exam.type] || exam.type;
      imagingSection += `<li><strong>${label}:</strong> Ano (${exam.date})${exam.description ? ` – ${exam.description}` : ''}</li>\n`;
    });

    // Histology section
    const hasHistology = formData.hasHistology as boolean;
    const histologyDate = formData.histologyDate as string || '';
    const histologyResult = formData.histologyResult as string || '';
    const histologyText = hasHistology 
      ? `Ano${histologyDate ? ` (${histologyDate})` : ''}${histologyResult ? ` – ${histologyResult}` : ''}`
      : 'Ne';

    // Blood thinners section
    const hasBloodThinners = formData.hasBloodThinners as boolean;
    const bloodThinnersDetails = formData.bloodThinnersDetails as string || '';

    // Get insurance label
    const insuranceLabel = INSURANCE_LABELS[data.patientContact.insurance] || data.patientContact.insurance;

    // Blood thinners HTML - red if yes, green if no
    const bloodThinnersHtml = hasBloodThinners
      ? `<div style="background-color: #fee2e2; border: 2px solid #dc2626; border-radius: 8px; padding: 12px; margin: 15px 0;">
          <strong style="color: #dc2626;">⚠️ Pacient užívá léky na ředění krve – ${bloodThinnersDetails || 'neuvedeno'}</strong>
        </div>`
      : `<div style="background-color: #dcfce7; border: 2px solid #16a34a; border-radius: 8px; padding: 12px; margin: 15px 0;">
          <strong style="color: #16a34a;">✓ Pacient NE-užívá léky na ředění krve</strong>
        </div>`;

    // Histology as list item (same format as imaging)
    const histologyListItem = `<li><strong>Histologická verifikace:</strong> ${histologyText}</li>`;

    // Build HTML email content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">1. KLINICKÝ NÁLEZ A ANAMNÉZA</h2>
        <ul style="line-height: 1.8;">
          <li><strong>Důvod podezření:</strong> ${formData.suspicionReason || formData.consultationReason || 'neuvedeno'}</li>
          <li><strong>Anamnéza:</strong> ${formData.anamnesis || 'neuvedeno'}</li>
        </ul>
        
        ${bloodThinnersHtml}

        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-top: 30px;">2. PROVEDENÁ VYŠETŘENÍ</h2>
        <ul style="line-height: 1.8;">
          ${imagingSection || ''}
          ${histologyListItem}
        </ul>
        
        ${data.epacsShared ? '<p style="background-color: #e6f3ff; padding: 10px; border-left: 4px solid #0066cc; margin-top: 15px;"><strong>Poznámka:</strong> Snímky byly odeslány přes ePACS. Ověřte jejich přijetí v systému.</p>' : ''}

        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-top: 30px;">3. IDENTIFIKACE OŠETŘUJÍCÍHO LÉKAŘE</h2>
        <ul style="line-height: 1.8;">
          <li><strong>Jméno a příjmení:</strong> ${data.doctorContact.firstName} ${data.doctorContact.lastName}</li>
          <li><strong>E-mail:</strong> ${data.doctorContact.email}</li>
          <li><strong>Telefon:</strong> ${data.doctorContact.phone}</li>
        </ul>

        <h2 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-top: 30px;">IDENTIFIKACE PACIENTA</h2>
        <ul style="line-height: 1.8;">
          <li><strong>Jméno a příjmení:</strong> ${data.patientContact.firstName} ${data.patientContact.lastName}</li>
          <li><strong>Rodné číslo:</strong> ${data.patientContact.birthNumber}</li>
          <li><strong>Pojišťovna:</strong> ${insuranceLabel}</li>
          <li><strong>Adresa:</strong> ${data.patientContact.address}</li>
          <li><strong>Telefon:</strong> ${data.patientContact.phone}</li>
          <li><strong>E-mail:</strong> ${data.patientContact.email || 'neuvedeno'}</li>
        </ul>

        <p style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border: 1px solid #ddd; font-size: 12px; color: #666;">
          <em>Tento dokument obsahuje citlivé osobní údaje. Nakládejte s ním v souladu s GDPR.</em>
        </p>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sarkom Referral <onboarding@resend.dev>",
      to: ["eliskamichalicova@gmail.com"],
      subject: `${data.patientContact.firstName} ${data.patientContact.lastName} - léčba`,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-referral-email function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
