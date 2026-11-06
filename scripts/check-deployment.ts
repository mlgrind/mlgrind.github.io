import assert from 'node:assert/strict';
import { loadEnv } from 'vite';
const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env };
for (const field of ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'STORAGE_BUCKET', 'MESSAGING_SENDER_ID', 'APP_ID']) {
  assert(env[`VITE_FIREBASE_${field}`], `Missing VITE_FIREBASE_${field}. Deployment must retain the existing Firebase web configuration.`);
}
assert.equal(env.VITE_FIREBASE_PROJECT_ID, 'ml-coding-lab', 'Refusing to switch existing users to a different Firebase project.');
assert.equal(env.VITE_FIREBASE_AUTH_DOMAIN, 'ml-coding-lab.firebaseapp.com', 'Firebase auth domain changed; review the migration first.');
console.log('Deployment configuration preserves the existing Firebase project and auth domain.');
