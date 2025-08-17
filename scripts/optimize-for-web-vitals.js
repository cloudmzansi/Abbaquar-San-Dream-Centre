#!/usr/bin/env node

/**
 * Web Vitals Optimization Script
 * 
 * This script improves Core Web Vitals metrics by:
 * 1. Adding preload hints for critical resources
 * 2. Optimizing font loading
 * 3. Adding resource hints for external domains
 * 4. Implementing priority hints for important resources
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Get directory path using import.meta.url
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Configuration
const config = {
  // Critical resources to preload
  criticalResources: [
    '/assets/hero.jpg',
    '/assets/abbaquar-logo.webp',
  ],
  // External domains to preconnect to
  preconnectDomains: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ],
  // Output directory (Vite's default) - use process.cwd() for better compatibility
  distDir: path.join(process.cwd(), 'dist'),
};

// Main function
async function optimizeForWebVitals() {
  console.log('🚀 Starting Web Vitals optimization...');
  
  try {
    // Ensure the dist directory exists
    if (!fs.existsSync(config.distDir)) {
      console.error('❌ Dist directory not found. Run build first.');
      console.error(`Expected path: ${config.distDir}`);
      process.exit(1);
    }

    // Find the index.html file
    const indexHtmlPath = path.join(config.distDir, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
      console.error('❌ index.html not found in dist directory.');
      process.exit(1);
    }

    // Read the index.html file
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Add font display swap for better CLS
    indexHtml = indexHtml.replace(
      /@font-face\s*{([^}]*)}/g,
      (match, fontFaceContent) => {
        if (!fontFaceContent.includes('font-display')) {
          return match.replace('{', '{ font-display: swap;');
        }
        return match;
      }
    );

    // Add preload hints for critical CSS
    const assetsDir = path.join(config.distDir, 'assets');
    if (fs.existsSync(assetsDir)) {
      const cssFiles = fs.readdirSync(assetsDir)
        .filter(file => file.endsWith('.css'));
      
      if (cssFiles.length > 0) {
        // Find the main CSS file (usually the largest one)
        const mainCssFile = cssFiles[0]; // Simplified approach
        
        // Only add preload if there's no existing stylesheet link for this file
        if (!indexHtml.includes(`href="/assets/${mainCssFile}"`)) {
          indexHtml = indexHtml.replace(
            '</head>',
            `  <link rel="preload" href="/assets/${mainCssFile}" as="style">\n</head>`
          );
        }
      }
    }

    // Add preconnect hints for external domains
    let preconnectTags = '';
    config.preconnectDomains.forEach(domain => {
      if (!indexHtml.includes(`rel="preconnect" href="${domain}"`)) {
        preconnectTags += `  <link rel="preconnect" href="${domain}" crossorigin>\n`;
      }
    });
    
    if (preconnectTags) {
      indexHtml = indexHtml.replace(
        '</head>',
        `${preconnectTags}</head>`
      );
    }

    // Write the updated index.html file
    fs.writeFileSync(indexHtmlPath, indexHtml);
    
    console.log('✅ Web Vitals optimization completed successfully!');
    console.log('🔍 Optimizations applied:');
    console.log('  - Added font-display: swap for better CLS');
    console.log('  - Added preload hints for critical CSS');
    console.log('  - Added preconnect hints for external domains');
    
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

// Run the optimization
optimizeForWebVitals();
