import SEO from '../components/SEO/SEO';

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Terms of Service for ML Grind - an interactive platform for learning machine learning through hands-on coding exercises."
        canonical="/terms"
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-100 mb-8">Terms of Service</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 dark:text-dark-200 mb-6">
            <strong>Last updated:</strong> November 11, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              By accessing and using ML Grind ("the Service"), you accept and agree to be bound
              by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              ML Grind is an educational platform that provides interactive machine learning
              coding exercises, tutorials, and learning materials. The Service allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>Read problem descriptions, section introductions, and watch animated lectures</li>
              <li>Write and run Python code (NumPy or a PyTorch-style API) in the browser</li>
              <li>Run tests, and optionally request AI-generated feedback on a solution</li>
              <li>Track progress, optionally synced across devices by signing in with Google</li>
              <li>Review concepts with flash cards and experiment in a Python scratchpad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">3. Intellectual Property Rights</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              <strong>Software Code:</strong> The source code of ML Grind is licensed under the
              MIT License. You may use, modify, and distribute the code in accordance with the terms
              of that license.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              <strong>Educational Content:</strong> All educational content, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>Problem descriptions and explanations</li>
              <li>Solutions and starter code for exercises</li>
              <li>Learning materials and tutorials</li>
              <li>Test cases and examples</li>
            </ul>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              is copyrighted material owned by Siddharth Choudhary. This content may not be reproduced,
              distributed, modified, or used to create derivative works without explicit written
              permission from the copyright holder.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">4. Permitted Use</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">You may use the Service for:</p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>Personal learning and educational purposes</li>
              <li>Preparing for interviews or assessments</li>
              <li>Building your machine learning skills</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">5. Prohibited Use</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">You may NOT:</p>
            <ul className="list-disc list-inside text-gray-600 dark:text-dark-200 mb-4 space-y-2">
              <li>Copy, reproduce, or redistribute the educational content</li>
              <li>Use the content for commercial purposes without permission</li>
              <li>Create competing services using our educational materials</li>
              <li>Scrape or bulk download content from the Service</li>
              <li>Remove or alter any copyright notices or attributions</li>
              <li>Attempt to circumvent any security measures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">6. User Code</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              Code that you write in the editor is saved in your browser. If you sign in, it is also
              stored in our database so it can sync across your devices, and if you request AI feedback,
              the submission is sent for review as described in the{' '}
              <a href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-300 dark:hover:text-primary-200">
                Privacy Policy
              </a>
              . You retain full ownership of any original code you write while using the Service.
            </p>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              AI feedback is generated automatically and can be wrong. Treat it as a suggestion, not
              as a verdict on your solution; the tests are the reference.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF
              THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              We reserve the right to modify these Terms at any time. Changes will be effective
              immediately upon posting. Your continued use of the Service after changes constitutes
              acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-100 mb-4">10. Contact</h2>
            <p className="text-gray-600 dark:text-dark-200 mb-4">
              For questions about these Terms, email{' '}
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
