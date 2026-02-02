import SEO from '../components/SEO/SEO';

export default function TermsPage() {
  return (
    <>
      <SEO
        title="Terms of Service"
        description="Terms of Service for ML Coding Lab - an interactive platform for learning machine learning through hands-on coding exercises."
        canonical="/terms"
      />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> February 1, 2026
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing and using ML Coding Lab ("the Service"), you accept and agree to be bound
              by these Terms of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Description of Service</h2>
            <p className="text-gray-600 mb-4">
              ML Coding Lab is an educational platform that provides interactive machine learning
              coding exercises, tutorials, and learning materials. The Service allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Read problem descriptions and theoretical introductions</li>
              <li>Write and execute Python code in the browser</li>
              <li>Run tests and receive feedback on solutions</li>
              <li>Track learning progress across sections</li>
              <li>Use a Python scratchpad for experimentation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Intellectual Property Rights</h2>
            <p className="text-gray-600 mb-4">
              <strong>Software Code:</strong> The source code of ML Coding Lab is licensed under the
              MIT License. You may use, modify, and distribute the code in accordance with the terms
              of that license.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Educational Content:</strong> All educational content, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Problem descriptions and explanations</li>
              <li>Solutions and starter code for exercises</li>
              <li>Learning materials and tutorials</li>
              <li>Test cases and examples</li>
            </ul>
            <p className="text-gray-600 mb-4">
              is copyrighted material owned by Siddharth Garg. This content may not be reproduced,
              distributed, modified, or used to create derivative works without explicit written
              permission from the copyright holder.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Permitted Use</h2>
            <p className="text-gray-600 mb-4">You may use the Service for:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Personal learning and educational purposes</li>
              <li>Preparing for interviews or assessments</li>
              <li>Building your machine learning skills</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Prohibited Use</h2>
            <p className="text-gray-600 mb-4">You may NOT:</p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
              <li>Copy, reproduce, or redistribute the educational content</li>
              <li>Use the content for commercial purposes without permission</li>
              <li>Create competing services using our educational materials</li>
              <li>Scrape or bulk download content from the Service</li>
              <li>Remove or alter any copyright notices or attributions</li>
              <li>Attempt to circumvent any security measures</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">6. User Code</h2>
            <p className="text-gray-600 mb-4">
              Code that you write in the code editor is stored locally in your browser. We do not
              collect or store your code on our servers. You retain full ownership of any original
              code you create while using the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600 mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
              ERROR-FREE, OR SECURE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF
              THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to modify these Terms at any time. Changes will be effective
              immediately upon posting. Your continued use of the Service after changes constitutes
              acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Contact</h2>
            <p className="text-gray-600 mb-4">
              For questions about these Terms, please open an issue on our{' '}
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
