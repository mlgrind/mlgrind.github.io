import SEO from '../components/SEO/SEO';

export default function PrivacyPage() {
  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Privacy Policy for ML Coding Lab - learn how we handle your data on our machine learning education platform."
        canonical="/privacy"
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> February 1, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
            <p className="text-gray-600 mb-4">
              ML Coding Lab is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, and protect information when you use our Service.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>The short version:</strong> We collect minimal data. Your code stays in your
              browser. We don't track you or sell your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-700 mb-3">Data Stored Locally (Your Browser)</h3>
            <p className="text-gray-600 mb-4">
              The following data is stored only in your browser's localStorage and never sent to our servers:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li><strong>Progress data:</strong> Which problems you've completed</li>
              <li><strong>Saved code:</strong> Your code solutions for each problem</li>
              <li><strong>Scratchpad code:</strong> Code you've written in the Python scratchpad</li>
            </ul>
            <p className="text-gray-600 mb-4">
              This data never leaves your device unless you explicitly export it.
            </p>

            <h3 className="text-lg font-medium text-gray-700 mb-3">Feedback Submissions</h3>
            <p className="text-gray-600 mb-4">
              When you submit feedback through our feedback form, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Your email address (optional, only if you provide it)</li>
              <li>The feedback message you write</li>
            </ul>
            <p className="text-gray-600 mb-4">
              This information is sent via Formspree and is used solely to respond to your feedback
              and improve the Service.
            </p>

            <h3 className="text-lg font-medium text-gray-700 mb-3">Analytics and Hosting</h3>
            <p className="text-gray-600 mb-4">
              ML Coding Lab is hosted on GitHub Pages. GitHub may collect standard server logs
              including IP addresses and page requests. Please refer to{' '}
              <a
                href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
              >
                GitHub's Privacy Statement
              </a>{' '}
              for more information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Information We Do NOT Collect</h2>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>We do not require account registration</li>
              <li>We do not use cookies for tracking</li>
              <li>We do not use third-party analytics services</li>
              <li>We do not collect personal information beyond what you voluntarily provide</li>
              <li>We do not sell or share your data with third parties</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Code Execution</h2>
            <p className="text-gray-600 mb-4">
              All Python code execution happens entirely in your browser using Pyodide (WebAssembly).
              Your code is never sent to any external server for execution. This means:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Your code remains private on your device</li>
              <li>We cannot see or access the code you write</li>
              <li>Execution results stay in your browser</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Retention</h2>
            <p className="text-gray-600 mb-4">
              <strong>Local data:</strong> Data stored in your browser persists until you clear your
              browser's localStorage or use a browser cleaning tool.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Feedback:</strong> Feedback submissions are retained only as long as necessary
              to respond to your inquiry and improve the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Clear your local data at any time through your browser settings</li>
              <li>Use the Service without providing any personal information</li>
              <li>Request deletion of any feedback you've submitted</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              The Service is intended for general audiences interested in learning machine learning.
              We do not knowingly collect personal information from children under 13. Since we don't
              require registration and store data locally, children can use the Service without
              providing any personal information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Changes to This Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update this Privacy Policy from time to time. We will notify users of any
              material changes by updating the "Last updated" date at the top of this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact</h2>
            <p className="text-gray-600 mb-4">
              For questions about this Privacy Policy, please open an issue on our{' '}
              <a
                href="https://github.com/itzsid/ml-coding-lab"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700"
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
