#!/usr/bin/env node

/**
 * Build version script that generates a version file based on the last git commit.
 * This file will be committed to the repository so it's available in all environments.
 * 
 * Format: ddmmyyhhmm (e.g., 3009250845 = 30/09/25 08:45)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Get the last commit timestamp
  const timestamp = execSync('git log -1 --format="%ct"', { encoding: 'utf8' }).trim();
  
  console.log('🔧 Last commit timestamp:', timestamp);
  
  // Convert to ddmmyyhhmm format
  const date = new Date(parseInt(timestamp) * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const devVersion = `${day}${month}${year}${hours}${minutes}`;
  
  console.log('📅 Generated devVersion:', devVersion);
  console.log('🕒 Last commit date:', date.toLocaleString());
  
  // Create the version file content
  const versionContent = `// Auto-generated file - DO NOT EDIT MANUALLY
// Generated at build time from last git commit: ${timestamp}
// Generated on: ${new Date().toISOString()}

export const BUILD_VERSION = '${devVersion}';
export const BUILD_TIMESTAMP = ${timestamp};
export const BUILD_DATE = '${date.toISOString()}';
`;

  // Write to the version file
  const versionFilePath = path.join(__dirname, '../src/lib/utils/buildVersion.ts');
  fs.writeFileSync(versionFilePath, versionContent);
  
  console.log('✅ Version file created:', versionFilePath);
  console.log('📦 This file should be committed to git for production builds');
  
} catch (error) {
  console.error('❌ Error generating build version:', error.message);
  
  // Fallback: create a file with current timestamp
  console.log('📝 Creating fallback version...');
  
  const fallbackTimestamp = Math.floor(Date.now() / 1000);
  const date = new Date(fallbackTimestamp * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const devVersion = `${day}${month}${year}${hours}${minutes}`;
  
  const versionContent = `// Auto-generated file - DO NOT EDIT MANUALLY
// Fallback version generated due to git error
// Generated on: ${new Date().toISOString()}

export const BUILD_VERSION = '${devVersion}';
export const BUILD_TIMESTAMP = ${fallbackTimestamp};
export const BUILD_DATE = '${date.toISOString()}';
`;

  const versionFilePath = path.join(__dirname, '../src/lib/utils/buildVersion.ts');
  fs.writeFileSync(versionFilePath, versionContent);
  
  console.log('⚠️  Fallback version file created:', versionFilePath);
}