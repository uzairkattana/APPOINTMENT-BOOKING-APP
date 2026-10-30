#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Generating fallback routes-manifest.json...');

const routesManifestPath = path.join(process.cwd(), '.next', 'routes-manifest.json');
const buildPath = path.join(process.cwd(), '.next');

// Ensure .next directory exists
if (!fs.existsSync(buildPath)) {
  console.log('📁 Creating .next directory...');
  fs.mkdirSync(buildPath, { recursive: true });
}

// Check if routes-manifest.json already exists
if (fs.existsSync(routesManifestPath)) {
  console.log('✅ routes-manifest.json already exists, skipping generation.');
  process.exit(0);
}

// Generate a comprehensive routes manifest based on app directory structure
const appPath = path.join(process.cwd(), 'app');
const staticRoutes = [];

// Helper function to scan directory for routes
function scanForRoutes(dir, basePath = '') {
  if (!fs.existsSync(dir)) return;
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    if (item.isDirectory()) {
      const fullPath = path.join(dir, item.name);
      const routePath = basePath + '/' + item.name;
      
      // Check if this directory has a page file
      const pageFiles = ['page.tsx', 'page.ts', 'page.jsx', 'page.js'];
      const hasPage = pageFiles.some(file => fs.existsSync(path.join(fullPath, file)));
      
      if (hasPage) {
        staticRoutes.push({
          page: routePath === '/' ? '/' : routePath,
          regex: `^${routePath.replace(/\//g, '\\/')}(?:\\/)?$`,
          routeKeys: {},
          namedRegex: `^${routePath.replace(/\//g, '\\/')}(?:\\/)?$`
        });
      }
      
      // Recursively scan subdirectories (but skip certain directories)
      if (!item.name.startsWith('_') && !item.name.startsWith('[') && item.name !== 'api') {
        scanForRoutes(fullPath, routePath);
      }
    }
  }
}

// Add root route
staticRoutes.push({
  page: "/",
  regex: "^/(?:/)?$",
  routeKeys: {},
  namedRegex: "^/(?:/)?$"
});

// Scan for routes
console.log('🔍 Scanning app directory for routes...');
scanForRoutes(appPath);

// Add common routes that might exist
const commonRoutes = [
  '/admin', '/admin/dashboard', '/admin/analytics', '/admin/calendar', 
  '/admin/auth', '/admin/settings', '/admin/import-export',
  '/patient/dashboard', '/doctor/dashboard',
  '/medical-history', '/calendar-demo', '/chatbot-demo', '/smart-booking-demo',
  '/bashirkhan64', '/bashirkhan64/auth', '/browser-tts'
];

for (const route of commonRoutes) {
  if (!staticRoutes.some(r => r.page === route)) {
    staticRoutes.push({
      page: route,
      regex: `^${route.replace(/\//g, '\\/')}(?:\\/)?$`,
      routeKeys: {},
      namedRegex: `^${route.replace(/\//g, '\\/')}(?:\\/)?$`
    });
  }
}

// Add 404 route
staticRoutes.push({
  page: "/_not-found",
  regex: "^/_not\\\\-found(?:/)?$",
  routeKeys: {},
  namedRegex: "^/_not\\\\-found(?:/)?$"
});

// Create the routes manifest
const routesManifest = {
  version: 3,
  pages404: true,
  caseSensitive: false,
  basePath: "",
  redirects: [
    {
      source: "/:path+/",
      destination: "/:path+",
      internal: true,
      statusCode: 308,
      regex: "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$"
    }
  ],
  headers: [],
  dynamicRoutes: [],
  staticRoutes: staticRoutes,
  dataRoutes: [],
  rsc: {
    header: "RSC",
    varyHeader: "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch",
    prefetchHeader: "Next-Router-Prefetch",
    didPostponeHeader: "x-nextjs-postponed",
    contentTypeHeader: "text/x-component",
    suffix: ".rsc",
    prefetchSuffix: ".prefetch.rsc",
    prefetchSegmentHeader: "Next-Router-Segment-Prefetch",
    prefetchSegmentSuffix: ".segment.rsc",
    prefetchSegmentDirSuffix: ".segments"
  },
  rewriteHeaders: {
    pathHeader: "x-nextjs-rewritten-path",
    queryHeader: "x-nextjs-rewritten-query"
  },
  rewrites: []
};

// Write the routes manifest
fs.writeFileSync(routesManifestPath, JSON.stringify(routesManifest, null, 2));
console.log(`✅ Generated routes-manifest.json with ${staticRoutes.length} routes`);
console.log(`📄 File saved to: ${routesManifestPath}`);
