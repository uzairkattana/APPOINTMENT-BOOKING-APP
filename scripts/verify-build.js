#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Next.js build output...');

const routesManifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json');
const buildPath = path.join(process.cwd(), '.next');

// Check if .next directory exists
if (!fs.existsSync(buildPath)) {
  console.error('❌ .next directory not found! Build may have failed.');
  process.exit(1);
}

// Check if routes-manifest.json exists
if (!fs.existsSync(routesManifestPath)) {
  console.error('❌ routes-manifest.json not found!');
  console.error('📁 .next directory contents:');
  
  try {
    const contents = fs.readdirSync(buildPath);
    contents.forEach(item => {
      console.error(`   - ${item}`);
    });
  } catch (error) {
    console.error('Failed to read .next directory:', error.message);
  }
  
  process.exit(1);
}

// Verify the routes manifest content
try {
  const manifest = JSON.parse(fs.readFileSync(routesManifestPath, 'utf8'));
  console.log('✅ routes-manifest.json found and valid!');
  console.log(`📊 Routes: ${manifest.staticRoutes ? manifest.staticRoutes.length : 0} static, ${manifest.dynamicRoutes ? manifest.dynamicRoutes.length : 0} dynamic`);
  console.log(`📝 Version: ${manifest.version}`);
  
  if (manifest.staticRoutes && manifest.staticRoutes.length > 0) {
    console.log('🎉 Build verification successful!');
    process.exit(0);
  } else {
    console.error('⚠️  Warning: No static routes found in manifest');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Failed to parse routes-manifest.json:', error.message);
  process.exit(1);
}
