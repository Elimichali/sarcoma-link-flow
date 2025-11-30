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

interface AttachmentData {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
}

interface ReferralEmailRequest {
  formType: 'A' | 'B';
  destination: 'praha' | 'brno';
  doctorContact: DoctorContact;
  patientContact: PatientContact;
  formData: Record<string, unknown>;
  epacsShared: boolean;
  attachments?: AttachmentData[];
}

// Helper function to generate unique IDs for FHIR resources
const generateId = (prefix: string): string => {
  return `${prefix}-${crypto.randomUUID()}`;
};

// Build FHIR Bundle from form data
const buildFhirBundle = (data: ReferralEmailRequest): object => {
  const patientId = generateId('pat');
  const observationId = generateId('obs');
  const conditionId = generateId('cond');
  const serviceRequestId = generateId('req');
  
  const formData = data.formData;
  
  // Build clinical findings summary for Observation
  const clinicalFindings: string[] = [];
  if (formData.suspicionReason) {
    clinicalFindings.push(`Důvod podezření: ${formData.suspicionReason}`);
  }
  if (formData.anamnesis) {
    clinicalFindings.push(`Anamnéza: ${formData.anamnesis}`);
  }
  if (formData.hasBloodThinners && formData.bloodThinnersDetails) {
    clinicalFindings.push(`Antikoagulancia: ${formData.bloodThinnersDetails}`);
  }
  
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:${patientId}`,
        resource: {
          resourceType: 'Patient',
          id: patientId,
          identifier: [
            {
              system: 'urn:oid:2.16.840.1.113883.2.4.6.3',
              value: data.patientContact.birthNumber,
            }
          ],
          name: [
            {
              text: `${data.patientContact.firstName} ${data.patientContact.lastName}`,
              family: data.patientContact.lastName,
              given: [data.patientContact.firstName],
            }
          ],
          telecom: [
            {
              system: 'phone',
              value: data.patientContact.phone,
            },
            ...(data.patientContact.email ? [{
              system: 'email',
              value: data.patientContact.email,
            }] : []),
          ],
          address: [
            {
              text: data.patientContact.address,
            }
          ],
        }
      },
      {
        fullUrl: `urn:uuid:${observationId}`,
        resource: {
          resourceType: 'Observation',
          id: observationId,
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '11506-3',
                display: 'Progress note',
              }
            ],
            text: 'Klinický nález',
          },
          subject: {
            reference: `urn:uuid:${patientId}`,
          },
          effectiveDateTime: new Date().toISOString(),
          valueString: clinicalFindings.join('\n'),
        }
      },
      {
        fullUrl: `urn:uuid:${conditionId}`,
        resource: {
          resourceType: 'Condition',
          id: conditionId,
          clinicalStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
                code: 'active',
              }
            ],
          },
          verificationStatus: {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
                code: 'provisional',
              }
            ],
          },
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/condition-category',
                  code: 'encounter-diagnosis',
                }
              ],
            }
          ],
          code: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '424413001',
                display: 'Soft tissue sarcoma',
              }
            ],
            text: 'Podezření na sarkom',
          },
          subject: {
            reference: `urn:uuid:${patientId}`,
          },
          onsetDateTime: new Date().toISOString(),
        }
      },
      {
        fullUrl: `urn:uuid:${serviceRequestId}`,
        resource: {
          resourceType: 'ServiceRequest',
          id: serviceRequestId,
          status: 'active',
          intent: 'order',
          category: [
            {
              coding: [
                {
                  system: 'http://snomed.info/sct',
                  code: '3457005',
                  display: 'Referral',
                }
              ],
            }
          ],
          code: {
            text: 'Referral for sarcoma evaluation',
          },
          subject: {
            reference: `urn:uuid:${patientId}`,
          },
          reasonReference: [
            {
              reference: `urn:uuid:${conditionId}`,
            }
          ],
          requester: {
            display: `${data.doctorContact.firstName} ${data.doctorContact.lastName}`,
          },
          performer: [
            {
              display: DESTINATION_NAMES[data.destination] || data.destination,
            }
          ],
        }
      },
    ],
  };
  
  return bundle;
};

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
    
    // Histology section
    const hasHistology = formData.hasHistology as boolean;
    const histologyDate = formData.histologyDate as string || '';
    const histologyResult = formData.histologyResult as string || '';

    // Blood thinners section
    const hasBloodThinners = formData.hasBloodThinners as boolean;
    const bloodThinnersDetails = formData.bloodThinnersDetails as string || '';

    // Get insurance label
    const insuranceLabel = INSURANCE_LABELS[data.patientContact.insurance] || data.patientContact.insurance;

    // Blood thinners HTML - styled to match review page
    const bloodThinnersHtml = hasBloodThinners
      ? `<div style="margin-top: 12px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 12px;">
          <span style="font-size: 12px; color: #dc2626; font-weight: 600;">⚠️ Antikoagulancia: Ano${bloodThinnersDetails ? ` (${bloodThinnersDetails})` : ''}</span>
        </div>`
      : `<div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
          <span style="font-weight: 500;">Antikoagulancia:</span> Ne
        </div>`;

    // Build imaging list HTML
    let imagingListHtml = '';
    imagingExams.forEach((exam: ImagingExam) => {
      const label = IMAGING_LABELS[exam.type] || exam.type;
      imagingListHtml += `
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 600; color: #1a1a1a;">${label}</span>
          <span style="color: #6b7280;"> — ${exam.date || 'bez data'}</span>
          ${exam.description ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">${exam.description}</p>` : ''}
        </div>
      `;
    });

    // Histology section HTML
    const histologyHtml = hasHistology ? `
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        <span style="font-size: 12px; font-weight: 600; color: #1a1a1a;">Histologie:</span>
        <span style="font-size: 12px; color: #6b7280;"> ${histologyDate || 'bez data'}</span>
        ${histologyResult ? `<p style="font-size: 12px; color: #6b7280; margin: 4px 0 0 0;">${histologyResult}</p>` : ''}
      </div>
    ` : '';

    // Build HTML email content - matching the review page style
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.3), rgba(234, 179, 8, 0.1)); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(234, 179, 8, 0.3);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <span style="background-color: rgba(234, 179, 8, 0.2); color: #92400e; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">Sarkom Referral</span>
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #1a1a1a;">
              ${data.patientContact.firstName} ${data.patientContact.lastName}
            </h1>
            <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">Nový pacient s podezřením na sarkom</p>
          </div>

          <!-- Důvod podezření -->
          <div style="background-color: rgba(0, 0, 0, 0.03); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Důvod podezření</h4>
            <p style="margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.5;">${formData.suspicionReason || '—'}</p>
          </div>

          <!-- Anamnéza -->
          <div style="background-color: rgba(0, 0, 0, 0.03); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Anamnéza</h4>
            <p style="margin: 0; font-size: 14px; color: #1a1a1a; line-height: 1.5;">${formData.anamnesis || '—'}</p>
            ${bloodThinnersHtml}
          </div>

          <!-- Zobrazovací vyšetření -->
          <div style="background-color: rgba(0, 0, 0, 0.03); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Zobrazovací vyšetření</h4>
            ${imagingListHtml || '<p style="margin: 0; font-size: 14px; color: #6b7280;">—</p>'}
            ${histologyHtml}
          </div>

          ${data.epacsShared ? `
          <div style="background-color: rgba(234, 179, 8, 0.1); border-left: 3px solid #eab308; padding: 12px 16px; margin-bottom: 16px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>Poznámka:</strong> Snímky byly odeslány přes ePACS.</p>
          </div>
          ` : ''}

          <!-- Místo odeslání -->
          <div style="background-color: rgba(0, 0, 0, 0.03); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Místo odeslání</h4>
            <p style="margin: 0; font-size: 14px; color: #1a1a1a;">${DESTINATION_NAMES[data.destination] || data.destination}</p>
          </div>

          <!-- Kontakt na lékaře -->
          <div style="background-color: rgba(0, 0, 0, 0.03); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Kontakt na lékaře</h4>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #6b7280; width: 100px;">Jméno:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${data.doctorContact.firstName} ${data.doctorContact.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Email:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${data.doctorContact.email}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Telefon:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${data.doctorContact.phone}</td>
              </tr>
            </table>
          </div>

          <!-- Kontakt na pacienta -->
          <div style="background-color: rgba(0, 0, 0, 0.03); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <h4 style="margin: 0 0 12px 0; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Kontakt na pacienta</h4>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; color: #6b7280; width: 100px;">Jméno:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${data.patientContact.firstName} ${data.patientContact.lastName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Rodné číslo:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${data.patientContact.birthNumber}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Pojišťovna:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${insuranceLabel}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Adresa:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${data.patientContact.address}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Telefon:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${data.patientContact.phone}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #6b7280;">Email:</td>
                <td style="padding: 4px 0; color: #1a1a1a;">${data.patientContact.email || 'neuvedeno'}</td>
              </tr>
            </table>
          </div>

          <!-- Footer -->
          <div style="margin-top: 24px; padding: 16px; background-color: rgba(0, 0, 0, 0.02); border: 1px solid #e5e7eb; border-radius: 8px;">
            <p style="margin: 0; font-size: 11px; color: #6b7280; text-align: center;">
              Tento dokument obsahuje citlivé osobní údaje. Nakládejte s ním v souladu s GDPR.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Prepare attachments for Resend
    const emailAttachments = data.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content, // base64 string
    })) || [];

    // Generate FHIR Bundle and add as attachment (with error handling)
    try {
      const fhirBundle = buildFhirBundle(data);
      const fhirJson = JSON.stringify(fhirBundle, null, 2);
      const fhirBase64 = btoa(fhirJson);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      
      emailAttachments.push({
        filename: `sarkom-fasttrack-referral-fhir-${timestamp}.json`,
        content: fhirBase64,
      });
      
      console.log('FHIR Bundle generated and added as attachment');
    } catch (error) {
      console.error('Error generating FHIR Bundle (email will still be sent):', error);
      // Continue with email sending even if FHIR generation fails
    }

    console.log(`Sending email with ${emailAttachments.length} attachment(s)`);

    const emailResponse = await resend.emails.send({
      from: "Sarkom Referral <onboarding@resend.dev>",
      to: ["eliskamichalicova@gmail.com"],
      subject: `${data.patientContact.firstName} ${data.patientContact.lastName} - léčba`,
      html: htmlContent,
      attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
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
