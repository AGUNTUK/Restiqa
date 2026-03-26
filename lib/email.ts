/**
 * Unified scalable module for dispatching automated transactional emails.
 * Currently configured to intelligently log stunning receipts directly to the console
 * perfectly mimicking production traffic until a strict RESEND_API_KEY is furnished.
 */

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
  
  // Simulated Processing Delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const color = status === "verified" ? "\x1b[32m" : "\x1b[31m"; // Green or Red
  const reset = "\x1b[0m";

  console.log(`\n======================================================`);
  console.log(`📧 NEW EMAIL DISPATCHED to [${to}]`);
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
  
  // NOTE: In production, simply swap the console.log payload above perfectly into an awaiting Resend or SendGrid hook.
  return true;
}
