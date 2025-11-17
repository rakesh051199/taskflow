#!/usr/bin/env node

/**
 * Generate a test JWT token for development/testing
 * 
 * Usage:
 *   node scripts/generate-token.js
 *   node scripts/generate-token.js --user-id 507f1f77bcf86cd799439010 --role Admin
 */

import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Parse command line arguments
const args = process.argv.slice(2);
const userId = args.find(arg => arg.startsWith('--user-id'))?.split('=')[1] || '507f1f77bcf86cd799439010';
const role = args.find(arg => arg.startsWith('--role'))?.split('=')[1] || 'Admin';
const email = args.find(arg => arg.startsWith('--email'))?.split('=')[1] || 'admin@example.com';

// Create token payload
const payload = {
  id: userId,
  userId: userId, // Support both 'id' and 'userId'
  email: email,
  role: role,
};

// Generate token (expires in 24 hours)
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('\n=== JWT Token Generated ===\n');
console.log('Token:', token);
console.log('\nPayload:', JSON.stringify(payload, null, 2));
console.log('\n=== Usage in Postman ===');
console.log('Authorization Header: Bearer', token);
console.log('\n');

