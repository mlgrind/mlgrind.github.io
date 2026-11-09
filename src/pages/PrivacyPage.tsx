import AnalyticsPreference from '../components/SEO/AnalyticsPreference';
import SEO from '../components/SEO/SEO';

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for ML Grind - learn how we handle your data on our machine learning education platform."
        canonical="/privacy"
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100 mb-8">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 dark:text-dark-200 mb-6">
            <strong>Last updated:</strong> November 5, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              ML Grind is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, and protect information when you use our Service.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              <strong>The short version:</strong> Python execution happens in your browser. Optional
              sign-in syncs your progress, optional AI feedback sends the code you submit for review,
              and usage analytics can be disabled below. We do not sell your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-700 dark:text-dark-100 mb-3">Data Stored Locally (Your Browser)</h3>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              By default, the following data is saved in your browser's localStorage:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li><strong>Progress data:</strong> Which problems you've completed</li>
              <li><strong>Saved code:</strong> Your code solutions for each problem</li>
              <li><strong>Scratchpad code:</strong> Code you've written in the Python scratchpad</li>
            </ul>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              Saved progress and solutions are synced to Firestore if you sign in. Requesting AI feedback sends the current submission for review. Without those actions, your saved code stays in your browser.
            </p>

            <h3 className="text-lg font-medium text-gray-700 dark:text-dark-100 mb-3">Feedback Submissions</h3>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              When you submit feedback through our feedback form, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>Your email address (optional, only if you provide it)</li>
              <li>The feedback message you write</li>
            </ul>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              This information is sent via Formspree and is used solely to respond to your feedback
              and improve the Service.
            </p>

            <h3 className="text-lg font-medium text-gray-700 dark:text-dark-100 mb-3">Google Sign-In (Optional)</h3>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              If you choose to sign in with Google, we collect and store the following information
              in Google Cloud Firestore to sync your progress across devices:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li><strong>Google profile information:</strong> Your name, email address, and profile photo URL</li>
              <li><strong>Progress data:</strong> Problem completion status, saved code, and timestamps</li>
            </ul>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              This data is stored securely in Firestore and is only accessible by you (authenticated
              via your Google account). You can continue using ML Grind without signing in — all
              features work with local storage only.
            </p>

            <h3 className="text-lg font-medium text-gray-700 dark:text-dark-100 mb-3">Analytics and Hosting</h3>
            <AnalyticsPreference />
            <p className="text-gray-600 dark:text-dark-200 mb-4">Usage events include opening exercises and learning paths, running code, passing tests, first runs and passes, and returning on another day. These events contain exercise identifiers, not your code, test inputs, or results. Browser storage remembers first-use milestones and the last visit date. Google Analytics may use cookies and referral information for usage measurement. Signed-in analytics may be associated with a pseudonymous account identifier.</p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              We use Google Analytics 4 to understand how the Service is used
              and to improve the user experience. Google Analytics collects
              usage data including approximate geographic location, browser type, device
              type, and page views. This data is processed by Google under their data processing
              terms. No personally identifiable information is shared with analytics beyond what
              Google automatically collects from standard web interactions.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              If you sign in with Google, sign-in events are logged with timestamps for security
              and service improvement purposes.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              ML Grind is hosted on GitHub Pages. GitHub may collect standard server logs
              including IP addresses and page requests. Please refer to{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
              >
                GitHub's Privacy Statement
              </a>{' '}
              for more information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Information We Do NOT Collect</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>We do not require account registration</li>
              <li>Google Analytics may use cookies for usage measurement; you can disable it above</li>
              <li>We use Google Analytics for usage insights (see above)</li>
              <li>We do not collect personal information beyond what you voluntarily provide</li>
              <li>We do not sell or share your data with third parties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Lecture Videos</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              Section pages offer an optional video lecture hosted on YouTube. Nothing is loaded from
              YouTube until you press play; the player then uses YouTube&apos;s privacy-enhanced
              (youtube-nocookie.com) mode, and Google&apos;s privacy policy applies to the video.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">AI Feedback (Optional)</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">When you request AI feedback, your current code, the exercise title and description, and test-result summaries are sent to our Cloudflare Worker and Anthropic to generate a response. This is separate from running Python locally. Data processing by those services is subject to their respective policies. Code is not included in our usage analytics.</p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Code Execution</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              All Python code execution happens entirely in your browser using Pyodide (WebAssembly).
              Your code is never sent to any external server for execution. This means:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>Running Python and tests does not send your code to a server for execution</li>
              <li>Optional cloud sync and AI feedback transmit the data described in this policy</li>
              <li>Execution results stay in your browser</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Data Retention</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              <strong>Local data:</strong> Data stored in your browser persists until you clear your
              browser's localStorage or use a browser cleaning tool.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              <strong>Feedback:</strong> Feedback submissions are retained only as long as necessary
              to respond to your inquiry and improve the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Your Rights</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>Clear your local data at any time through your browser settings</li>
              <li>Use the Service without providing any personal information</li>
              <li>Request deletion of any feedback you've submitted</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Children's Privacy</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              The Service is intended for general audiences interested in learning machine learning.
              We do not knowingly collect personal information from children under 13. Since we don't
              require registration and store data locally, children can use the Service without
              providing any personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              We may update this Privacy Policy from time to time. We will notify users of any
              material changes by updating the "Last updated" date at the top of this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Contact</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              For questions about this Privacy Policy, email{' '}
              <a
                href="mailto:sid@mlgrind.dev"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
              >
                sid@mlgrind.dev
              </a>{' '}or open an issue on our{' '}
              <a
                href="https://github.com/mlgrind/mlgrind.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200"
              >
                GitHub repository
              </a>.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
