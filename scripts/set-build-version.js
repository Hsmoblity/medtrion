#!/usr/bin/env node

/**
 * Build version script that sets the NEXT_PUBLIC_LAST_COMMIT_TIMESTAMP 
 * environment variable based on the last git commit timestamp.
 * 
 * This runs before the build process to ensure the development version
 * reflects the actual last commit time.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Get the last commit timestamp
  const timestamp = execSync('git log -1 --pretty=format:\'%ct\'', { encoding: 'utf8' }).trim();
  
  console.log(`🔧 Setting build version from git commit timestamp: ${timestamp}`);
  
  // Convert to readable date for logging
  const date = new Date(parseInt(timestamp) * 1000);
  console.log(`📅 Last commit date: ${date.toLocaleString()}`);
  
  // Read existing .env.local or create new one
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remove existing NEXT_PUBLIC_LAST_COMMIT_TIMESTAMP if present
  const lines = envContent.split('\n').filter(line => 
    !line.startsWith('NEXT_PUBLIC_LAST_COMMIT_TIMESTAMP=')
  );
  
  // Add the new timestamp
  lines.push(`NEXT_PUBLIC_LAST_COMMIT_TIMESTAMP=${timestamp}`);
  
  // Write back to .env.local
  fs.writeFileSync(envPath, lines.join('\n'));
  
  console.log(`✅ Successfully set NEXT_PUBLIC_LAST_COMMIT_TIMESTAMP=${timestamp} in .env.local`);
  
} catch (error) {
  console.error('❌ Error setting build version:', error.message);
  console.log('📝 Continuing with fallback timestamp...');
  // Don't fail the build, just continue without the environment variable
}