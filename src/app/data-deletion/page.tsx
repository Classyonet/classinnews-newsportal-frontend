export const runtime = 'edge'


export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">User Data Deletion</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: February 4, 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Delete Your Data</h2>
              <p className="text-gray-700">
                We respect your right to control your personal data. If you wish to delete your account and all 
                associated data from ClassInNews, please follow the instructions below.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Request Data Deletion</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
                <h3 className="font-bold text-blue-900 mb-2">Option 1: Delete from Your Account Settings</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>Log in to your ClassInNews account</li>
                  <li>Go to Account Settings</li>
                  <li>Click on "Delete Account"</li>
                  <li>Confirm your decision</li>
                </ol>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 my-6">
                <h3 className="font-bold text-green-900 mb-2">Option 2: Email Request</h3>
                <p className="text-gray-700 mb-3">Send an email to <strong>privacy@classinnews.com</strong> with:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Subject: "Data Deletion Request"</li>
                  <li>Your full name</li>
                  <li>Your registered email address</li>
                  <li>Reason for deletion (optional)</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 my-6">
                <h3 className="font-bold text-purple-900 mb-2">Option 3: Facebook App Data Deletion</h3>
                <p className="text-gray-700 mb-3">If you logged in via Facebook:</p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2 ml-4">
                  <li>Go to your Facebook Settings & Privacy</li>
                  <li>Click Settings</li>
                  <li>Go to Apps and Websites</li>
                  <li>Find "ClassInNews_Web" and remove it</li>
                  <li>Then send us an email at privacy@classinnews.com to delete your ClassInNews account data</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What Data Will Be Deleted</h2>
              <p className="text-gray-700 mb-3">When you request deletion, we will permanently remove:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Your profile information (name, email, profile picture)</li>
                <li>Your account credentials</li>
                <li>Your reading history and preferences</li>
                <li>Your comments and interactions</li>
                <li>Any other personal data associated with your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">For Publishers</h2>
              <p className="text-gray-700">
                If you are a content publisher, please note that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
                <li>Your published articles may remain on the platform (attributed to "Anonymous Author")</li>
                <li>Your personal account data will still be deleted</li>
                <li>Any pending earnings will be processed before deletion</li>
                <li>If you want your articles removed as well, please specify this in your deletion request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Time</h2>
              <p className="text-gray-700">
                Data deletion requests are typically processed within <strong>30 days</strong>. You will receive 
                a confirmation email once your data has been permanently deleted from our systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Retention</h2>
              <p className="text-gray-700">
                In some cases, we may be required to retain certain data for legal, regulatory, or security purposes. 
                This includes data needed for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-3">
                <li>Completing financial transactions</li>
                <li>Complying with legal obligations</li>
                <li>Resolving disputes</li>
                <li>Enforcing our agreements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about data deletion, please contact us:
              </p>
              <ul className="list-none text-gray-700 space-y-2 mt-3">
                <li><strong>Email:</strong> privacy@classinnews.com</li>
                <li><strong>Subject:</strong> Data Deletion Inquiry</li>
              </ul>
            </section>

            <div className="bg-gray-100 rounded-lg p-6 mt-8">
              <p className="text-gray-700 text-center">
                <strong>Note:</strong> Once your data is deleted, this action cannot be undone. Please ensure you 
                have backed up any information you wish to keep before proceeding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
