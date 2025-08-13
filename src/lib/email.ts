import { Resend } from 'resend';

// Resend Client initialisieren
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('⚠️  RESEND_API_KEY ist nicht gesetzt. E-Mails werden nicht versendet.');
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

// E-Mail-Templates
export const emailTemplates = {
  invitation: (data: {
    inviterName: string;
    inviterEmail: string;
    inviteUrl: string;
    companyName?: string;
  }) => ({
    subject: `Einladung zu HRMatrix von ${data.inviterName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Einladung zu HRMatrix</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6c757d; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Willkommen bei HRMatrix!</h1>
          </div>
          <div class="content">
            <h2>Du wurdest eingeladen!</h2>
            <p><strong>${data.inviterName}</strong> (${data.inviterEmail}) hat dich eingeladen, dem Team beizutreten.</p>
            
            ${data.companyName ? `<p><strong>Unternehmen:</strong> ${data.companyName}</p>` : ''}
            
            <div style="text-align: center;">
              <a href="${data.inviteUrl}" class="button">
                🚀 Account erstellen
              </a>
            </div>
            
            <div class="warning">
              <strong>⚠️ Wichtig:</strong> Dieser Link ist 24 Stunden gültig. 
              Falls der Link abgelaufen ist, bitte kontaktiere ${data.inviterName}.
            </div>
            
            <p>HRMatrix ist eine moderne Plattform für CV-Management und Recruiting-Prozesse.</p>
          </div>
          <div class="footer">
            <p>Falls du diese Einladung nicht erwartet hast, kannst du sie ignorieren.</p>
            <p>© 2024 HRMatrix. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// E-Mail-Versand-Funktion mit verbesserter Fehlerbehandlung
export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log('📧 E-Mail würde gesendet werden (Resend nicht konfiguriert):');
    console.log('   An:', to);
    console.log('   Betreff:', subject);
    return { success: false, error: 'Resend nicht konfiguriert' };
  }

  try {
    const result = await resend.emails.send({
      from: 'HRMatrix <noreply@hr-matrix.online>', // Deine neue Domain
      to: [to],
      subject,
      html,
    });

    console.log('✅ E-Mail erfolgreich gesendet:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ E-Mail-Versand fehlgeschlagen:', error);
    return { success: false, error };
  }
}

// Spezielle Funktion für Einladungen
export async function sendInvitationEmail(data: {
  email: string;
  inviterName: string;
  inviterEmail: string;
  inviteUrl: string;
  companyName?: string;
}) {
  const template = emailTemplates.invitation(data);
  return await sendEmail(data.email, template.subject, template.html);
}
