import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Deletion Instructions | Restiqa',
  description: 'Learn how to delete your personal data from Restiqa. Follow our step-by-step guide to request data deletion.',
}

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-[#EEF2F6] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="neu-panel p-6 sm:p-8 md:p-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E293B] mb-6">
            Restiqa – Data Deletion Instructions
          </h1>
          
          <p className="text-[#64748B] mb-8 text-base sm:text-lg">
            At Restiqa, your privacy is our priority. If you wish to delete your personal data from our platform, follow the steps below.
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1E293B] mb-4">
                1. Deleting Your Account
              </h2>
              <ul className="list-disc list-inside space-y-2 text-[#64748B]">
                <li>Log in to your Restiqa account.</li>
                <li>Go to Account Settings → Privacy & Security.</li>
                <li>Click on Delete My Account.</li>
                <li>Follow the on-screen instructions to confirm your request.</li>
              </ul>
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 font-medium">
                  ⚠️ Note: Deleting your account will remove all personal information, booking history, and saved preferences permanently. This action cannot be undone.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1E293B] mb-4">
                2. Requesting Data Deletion via Support
              </h2>
              <p className="text-[#64748B] mb-4">
                If you cannot access your account:
              </p>
              <ul className="list-disc list-inside space-y-2 text-[#64748B]">
                <li>Send an email to <a href="mailto:support@restiqa.com" className="text-brand-primary hover:underline">support@restiqa.com</a> with the subject: "Request for Data Deletion".</li>
                <li>Include the email address associated with your Restiqa account.</li>
                <li>Our team will process your request and confirm completion within 30 days.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1E293B] mb-4">
                3. What Data Will Be Deleted
              </h2>
              <ul className="list-disc list-inside space-y-2 text-[#64748B]">
                <li>Personal information (name, email, phone, etc.)</li>
                <li>Booking history and preferences</li>
                <li>Saved payment information</li>
                <li>Any other data associated with your account</li>
              </ul>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 font-medium">
                  🔒 Important: Certain transactional records may be retained for legal, tax, or regulatory purposes, but they will be anonymized.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl sm:text-2xl font-semibold text-[#1E293B] mb-4">
                4. Need Help?
              </h2>
              <p className="text-[#64748B] mb-4">
                If you face any issues or have questions, contact our Privacy Team:
              </p>
              <div className="space-y-2 text-[#64748B]">
                <p>
                  <strong>Email:</strong> <a href="mailto:privacy@restiqa.com" className="text-brand-primary hover:underline">privacy@restiqa.com</a>
                </p>
                <p>
                  <strong>Support link:</strong> <Link href="/support" className="text-brand-primary hover:underline">Contact Support</Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
