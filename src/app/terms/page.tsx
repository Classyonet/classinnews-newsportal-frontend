export const runtime = 'edge';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: February 4, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700">
                By accessing and using ClassInNews, you agree to be bound by these Terms of Service and all applicable 
                laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
              <p className="text-gray-700 mb-3">When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Maintaining the security of your account and password</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Content</h2>
              <p className="text-gray-700 mb-3">As a publisher on our platform, you retain ownership of your content. However, by posting content, you grant us:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>A worldwide, non-exclusive license to use, reproduce, and distribute your content</li>
                <li>The right to display your content on our platform</li>
                <li>The right to moderate, remove, or edit content that violates our policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Activities</h2>
              <p className="text-gray-700 mb-3">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Post false, misleading, or defamatory content</li>
                <li>Violate any intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Spam or engage in unauthorized advertising</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated systems to access the service</li>
                <li>Post content that violates any applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content Moderation</h2>
              <p className="text-gray-700">
                We reserve the right to review, moderate, and remove any content that violates these terms or is 
                otherwise objectionable. Content moderation may be performed by automated systems or human moderators.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Publisher Terms</h2>
              <p className="text-gray-700 mb-3">If you are a content publisher:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>You must verify your account and wait for admin approval</li>
                <li>You are responsible for the accuracy of your published content</li>
                <li>You must comply with all applicable journalism ethics and standards</li>
                <li>You agree to our revenue sharing and commission structure</li>
                <li>You can request withdrawal of earned funds according to our withdrawal policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700">
                The ClassInNews name, logo, and all related marks are trademarks of ClassInNews. All content, features, 
                and functionality are owned by ClassInNews and are protected by international copyright, trademark, and 
                other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-gray-700">
                The service is provided "as is" without warranties of any kind, either express or implied. We do not 
                warrant that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-gray-700">
                ClassInNews shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
                resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account and access to the service immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. We will notify users of any material changes 
                by posting the new Terms of Service on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by and construed in accordance with applicable laws, without regard to 
                its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
              <p className="text-gray-700">
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none text-gray-700 space-y-2 mt-3">
                <li><strong>Email:</strong> legal@classinnews.com</li>
                <li><strong>Website:</strong> https://classinnews.com</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
