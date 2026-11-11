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
            <strong>Last updated:</strong> November 11, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Overview</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              ML Grind is committed to protecting your privacy. This Privacy Policy explains
              how we collect, use, and protect information when you use our Service.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              <strong>The short version:</strong> your Python code runs in your browser, and by default
              your progress and code stay there. If you sign in with Google, your progress and saved code
              are synced to our database. If you ask for AI feedback, that submission is sent to be
              reviewed. Usage analytics (Google Analytics) can be turned off below. We do not sell your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Information We Collect</h2>

            <h3 className="text-lg font-medium text-gray-700 dark:text-dark-100 mb-3">Data Stored Locally (Your Browser)</h3>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              By default, the following data is saved in your browser's localStorage:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li><strong>Progress data:</strong> which problems you've started or solved, when, and in which track (NumPy or PyTorch)</li>
              <li><strong>Saved code:</strong> your code for each problem, in each track</li>
              <li><strong>Scratchpad code:</strong> code you've written in the Python scratchpad</li>
              <li><strong>Flash card progress:</strong> which cards you've reviewed and when each is next due (synced to your account too when you are signed in)</li>
              <li><strong>Preferences:</strong> light or dark theme, your preferred track, which sidebar groups are open, and whether analytics is turned off</li>
              <li><strong>Analytics markers:</strong> your last visit date and whether you've run or passed a first exercise, used to count returning visits and first runs</li>
            </ul>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              Progress and saved code are synced to Google Cloud Firestore only if you sign in (see below).
              Requesting AI feedback sends the current submission for review. Otherwise, everything listed
              here stays in your browser.
            </p>

            <h3 className="text-lg font-medium text-gray-700 dark:text-dark-100 mb-3">Feedback Submissions</h3>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              When you submit feedback through our feedback form, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>The name you enter</li>
              <li>Your email address (optional, only if you provide it)</li>
              <li>The feedback message you write</li>
            </ul>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              This information is sent via Formspree and is used solely to respond to your feedback
              and improve the Service.
            </p>

            <h3 className="text-lg font-medium text-gray-700 dark:text-dark-100 mb-3">Google Sign-In (Optional)</h3>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              If you choose to sign in with Google (through Firebase Authentication), we store the
              following in Google Cloud Firestore to sync your progress across devices:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li><strong>Google profile information:</strong> your name, email address, and profile photo URL</li>
              <li><strong>Progress data:</strong> problem status, saved code for each track, flash card review schedules, and timestamps, plus the time of your last sync</li>
              <li><strong>Sign-in log:</strong> each sign-in records your account ID, name, email, profile photo URL, the time, and your browser&apos;s user-agent string, for security and to understand usage</li>
            </ul>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              Database rules let your signed-in account read and write only your own progress. The site
              operator can also access this data to run and support the Service. You can use every
              feature of ML Grind without signing in; your data then stays in your browser.
            </p>

            <h3 className="text-lg font-medium text-gray-700 dark:text-dark-100 mb-3">Analytics and Hosting</h3>
            <AnalyticsPreference />
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              We use Google Analytics 4 to understand how the Service is used. It records page views
              and usage events: opening exercises and learning paths, running code, passing tests,
              first runs and passes, sharing a challenge, signing in, and returning on another day.
              Events carry exercise, section, and path identifiers and the track you used, never your
              code, test inputs, or results. Google Analytics also collects standard technical data
              such as approximate location, browser and device type, and the referring page, and may
              set cookies. Google signals and ad personalization are turned off. When you are signed
              in, events are associated with a pseudonymous account ID (not your name or email).
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              Analytics does not load at all if you turn it off above or your browser sends Do Not Track.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              ML Grind is hosted on GitHub Pages, loads its fonts from Google Fonts, and downloads the
              Python runtime (Pyodide) from the jsDelivr CDN. These providers receive standard request
              data such as your IP address and browser. GitHub may keep server logs including IP
              addresses and page requests; see{' '}
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
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">What We Don&apos;t Do</h2>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>We do not require an account; signing in is optional</li>
              <li>We do not show ads or use advertising trackers</li>
              <li>We do not sell your data, and we share it only with the service providers named in this policy, to run the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Lecture Videos</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              Section pages offer an optional animated lecture hosted on YouTube. Nothing is loaded from
              YouTube until you press play; the player then uses YouTube&apos;s privacy-enhanced
              (youtube-nocookie.com) mode, and Google&apos;s privacy policy applies to the video.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">AI Feedback (Optional)</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              When you open the AI Feedback tab after running tests, your current code, the exercise
              title and description, and each test&apos;s description, expected value, actual value and
              pass/fail result are sent to our Cloudflare Worker, which forwards them to Anthropic&apos;s
              API to generate the review. We do not store these submissions; Cloudflare and Anthropic
              process them under their own policies. Nothing is sent unless you open that tab.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Code Execution</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              All Python code execution happens entirely in your browser using Pyodide (WebAssembly).
              Your code is never sent to any external server for execution. This means:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>Running Python and tests does not send your code to a server</li>
              <li>Execution output and test results stay in your browser</li>
              <li>Only optional cloud sync and AI feedback transmit the data described above</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Data Retention</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              <strong>Local data:</strong> Data stored in your browser persists until you clear your
              browser's localStorage or use a browser cleaning tool.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              <strong>Synced data:</strong> Progress synced to Firestore and the sign-in log are kept
              until you ask us to delete them.
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
              <li>Turn off usage analytics (above)</li>
              <li>Ask for a copy of, or deletion of, your synced account data and sign-in records by emailing us</li>
              <li>Request deletion of any feedback you've submitted</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">Children's Privacy</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              The Service is intended for general audiences interested in learning machine learning.
              We do not knowingly collect personal information from children under 13. No account is
              required, so the Service can be used without providing any personal information.
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
