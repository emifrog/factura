import "server-only";
import { Resend } from "resend";

/** Vrai si Resend est configuré (clé API + expéditeur). */
export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

function confirmationHtml(confirmUrl: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, sans-serif; color: #191c1e; max-width: 480px; margin: 0 auto;">
    <h1 style="font-size: 20px; color: #131b2e;">Confirmez votre inscription</h1>
    <p style="font-size: 15px; line-height: 1.6; color: #45464d;">
      Merci de votre intérêt pour Factura. Cliquez sur le bouton ci-dessous
      pour confirmer votre adresse et être prévenu·e du lancement.
    </p>
    <p style="margin: 28px 0;">
      <a href="${confirmUrl}"
         style="background: #006c49; color: #ffffff; text-decoration: none;
                padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Confirmer mon inscription
      </a>
    </p>
    <p style="font-size: 13px; color: #76777d;">
      Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
    </p>
  </div>`;
}

/** Envoie l'email de confirmation double opt-in de la liste d'attente. */
export async function sendWaitlistConfirmation(to: string, confirmUrl: string) {
  if (!isEmailConfigured()) {
    throw new Error("RESEND_API_KEY / RESEND_FROM_EMAIL non configurés.");
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  return resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject: "Confirmez votre inscription à Factura",
    html: confirmationHtml(confirmUrl),
  });
}
