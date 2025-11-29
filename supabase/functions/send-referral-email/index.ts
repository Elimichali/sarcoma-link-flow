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

    const destinationName = DESTINATION_NAMES[data.destination] || data.destination;
    const formTypeName = data.formType === 'A' ? 'Nový pacient s podezřením na sarkom' : 'Stávající pacient - konzultace';

    // Build HTML email content
    const htmlContent = `
      <h1>Referenční formulář - Sarkom</h1>
      <h2>${formTypeName}</h2>
      
      <h3>Místo odeslání</h3>
      <p><strong>${destinationName}</strong></p>
      
      <h3>Kontakt na ošetřujícího lékaře</h3>
      <ul>
        <li><strong>Jméno:</strong> ${data.doctorContact.firstName} ${data.doctorContact.lastName}</li>
        <li><strong>Email:</strong> ${data.doctorContact.email}</li>
        <li><strong>Telefon:</strong> ${data.doctorContact.phone}</li>
      </ul>
      
      <h3>Kontakt na pacienta</h3>
      <ul>
        <li><strong>Jméno:</strong> ${data.patientContact.firstName} ${data.patientContact.lastName}</li>
        <li><strong>Adresa:</strong> ${data.patientContact.address}</li>
        <li><strong>Pojišťovna:</strong> ${data.patientContact.insurance}</li>
        <li><strong>Rodné číslo:</strong> ${data.patientContact.birthNumber}</li>
        <li><strong>Telefon:</strong> ${data.patientContact.phone}</li>
        <li><strong>Email:</strong> ${data.patientContact.email}</li>
      </ul>
      
      <h3>Data formuláře</h3>
      <pre>${JSON.stringify(data.formData, null, 2)}</pre>
      
      <p><strong>Snímky sdíleny přes ePACS:</strong> ${data.epacsShared ? 'Ano' : 'Ne'}</p>
    `;

    const emailResponse = await resend.emails.send({
      from: "Sarkom Referral <onboarding@resend.dev>",
      to: ["julovec@deloittece.com"],
      subject: `Nový referenční formulář - ${formTypeName} - ${data.patientContact.firstName} ${data.patientContact.lastName}`,
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
