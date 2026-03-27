import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type EmailPayload = {
  to: string;
  subject: string;
  amount: number;
  transactionId: string;
  status: "verified" | "rejected";
  bookingLink?: string;
};

export async function sendPaymentReceiptEmail(payload: EmailPayload) {
  const { to, subject, amount, transactionId, status, bookingLink } = payload;
  
  if (!resend) {
    // Simulated Processing Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const color = status === "verified" ? "\x1b[32m" : "\x1b[31m"; // Green or Red
    const reset = "\x1b[0m";

    console.log(`\n======================================================`);
    console.log(`📧 SIMULATED EMAIL DISPATCH to [${to}]`);
    console.log(`------------------------------------------------------`);
    console.log(`Subject: ${subject}`);
    console.log(`\nHello,`);
    console.log(`Your physical payment for ৳${amount} has been structurally reviewed.`);
    console.log(`Status Updates: ${color}${status.toUpperCase()}${reset}`);
    console.log(`Payment Logs ID: ${transactionId}`);
    
    if (status === "verified" && bookingLink) {
      console.log(`\nCongratulations! Your reservation is perfectly confirmed.`);
      console.log(`View your itinerary here: ${bookingLink}`);
    } else {
      console.log(`\nUnfortunately, our platform administrators could not verify the legitimacy of this distinct transaction. Your booking has been temporarily failed in our systems.`);
      console.log(`Please reach out to support if you successfully believe this to be an error.`);
    }

    console.log(`\nThanks,\nThe Restiqa Trust & Safety Platform`);
    console.log(`======================================================\n`);
    
    return true;
  }

  // Real Email Dispatch via Resend
  try {
    const htmlContent = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; color: #1a202c; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #d32f2f 0%, #8bc1c1 100%); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">Restiqa</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="font-weight: 800; font-size: 20px; margin-bottom: 24px;">Payment ${status === "verified" ? "Verified Successfully" : "Verification Failed"}</h2>
          <p style="line-height: 1.6; color: #4a5568; margin-bottom: 24px;">Hello,</p>
          <p style="line-height: 1.6; color: #4a5568; margin-bottom: 24px;">
            Your payment submission for <strong>৳${amount}</strong> (Transaction ID: <code>${transactionId}</code>) has been reviewed by our team.
          </p>
          
          <div style="background: #f7fafc; padding: 20px; border-radius: 12px; margin-bottom: 32px;">
            <p style="margin: 0; font-weight: 700; color: ${status === "verified" ? "#2f855a" : "#c53030"};">
              Status: ${status === "verified" ? "✅ VERIFIED" : "❌ REJECTED"}
            </p>
          </div>

          ${status === "verified" && bookingLink ? `
            <p style="line-height: 1.6; color: #4a5568; margin-bottom: 32px;">
              Congratulations! Your reservation is now confirmed. You can view your upcoming trip details and itinerary at the link below:
            </p>
            <a href="${bookingLink}" style="display: block; background: #d32f2f; color: white; padding: 16px; border-radius: 12px; text-decoration: none; text-align: center; font-weight: 700; box-shadow: 0 4px 10px rgba(211, 47, 47, 0.23);">
              View My Itinerary
            </a>
          ` : `
            <p style="line-height: 1.6; color: #4a5568; margin-bottom: 24px;">
              Unfortunately, we were unable to verify this transaction. Your booking has been cancelled as a result. If you believe this is an error, please reply to this email or contact support.
            </p>
          `}
          
          <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 40px 0;">
          <p style="font-size: 14px; color: #a0aec0; text-align: center;">
            &copy; ${new Date().getFullYear()} Restiqa Travel Marketplace. All rights reserved.
          </p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Restiqa <noreply@restiqa.com>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Error sending email via Resend:", error);
    return false;
  }
}
