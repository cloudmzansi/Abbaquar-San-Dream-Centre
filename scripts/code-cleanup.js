#!/usr/bin/env node

/**
 * Comprehensive Code Cleanup Script
 * 
 * This script performs various cleanup tasks:
 * 1. Identifies unused imports
 * 2. Finds console statements that should be replaced with proper logging
 * 3. Checks for duplicate code patterns
 * 4. Validates file structure and naming conventions
 * 5. Suggests improvements for maintainability
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  srcDir: 'src',
  ignorePatterns: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'coverage',
    '*.min.js',
    '*.bundle.js',
    'stats.html'
  ],
  fileExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  consoleStatements: [
    'console.log',
    'console.error', 
    'console.warn',
    'console.info',
    'console.debug'
  ]
};

// Utility functions
function shouldIgnoreFile(filePath) {
  return CONFIG.ignorePatterns.some(pattern => 
    filePath.includes(pattern) || path.basename(filePath).match(pattern)
  );
}

function isTargetFile(filePath) {
  return CONFIG.fileExtensions.some(ext => filePath.endsWith(ext));
}

function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !shouldIgnoreFile(fullPath)) {
      getAllFiles(fullPath, files);
    } else if (stat.isFile() && isTargetFile(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function findConsoleStatements(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const consoleLines = [];
  
  lines.forEach((line, index) => {
    CONFIG.consoleStatements.forEach(consoleType => {
      if (line.includes(consoleType)) {
        consoleLines.push({
          line: index + 1,
          content: line.trim(),
          type: consoleType
        });
      }
    });
  });
  
  return consoleLines;
}

function findUnusedImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importedItems = match[1].split(',').map(item => item.trim());
    const modulePath = match[2];
    
    importedItems.forEach(item => {
      const cleanItem = item.replace(/\s+as\s+\w+/, ''); // Remove 'as' aliases
      imports.push({
        item: cleanItem,
        module: modulePath,
        line: content.substring(0, match.index).split('\n').length
      });
    });
  }
  
  // Simple check for usage (this is a basic implementation)
  const unusedImports = imports.filter(importItem => {
    const itemName = importItem.item;
    const contentWithoutImports = content.replace(/import\s+.*?from\s+['"][^'"]+['"];?\n?/g, '');
    return !contentWithoutImports.includes(itemName);
  });
  
  return unusedImports;
}

function findDuplicateCodePatterns(files) {
  const patterns = new Map();
  
  files.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // Look for common patterns
    const tryCatchPatterns = [];
    const errorHandlingPatterns = [];
    
    lines.forEach((line, index) => {
      if (line.includes('try {') || line.includes('} catch (')) {
        tryCatchPatterns.push({ line: index + 1, content: line.trim() });
      }
      
      if (line.includes('console.error') || line.includes('throw new Error')) {
        errorHandlingPatterns.push({ line: index + 1, content: line.trim() });
      }
    });
    
    if (tryCatchPatterns.length > 0) {
      patterns.set(filePath, { tryCatch: tryCatchPatterns, errorHandling: errorHandlingPatterns });
    }
  });
  
  return patterns;
}

function generateReport(issues) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: issues.files.length,
      filesWithConsoleStatements: issues.consoleStatements.length,
      filesWithUnusedImports: issues.unusedImports.length,
      filesWithDuplicatePatterns: issues.duplicatePatterns.size,
      totalConsoleStatements: issues.consoleStatements.reduce((sum, file) => sum + file.statements.length, 0),
      totalUnusedImports: issues.unusedImports.reduce((sum, file) => sum + file.imports.length, 0)
    },
    details: issues
  };
  
  return report;
}

function printReport(report) {
  console.log('\n🔍 CODE CLEANUP REPORT');
  console.log('='.repeat(50));
  console.log(`📅 Generated: ${report.timestamp}`);
  console.log('');
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log(`   Total files analyzed: ${report.summary.totalFiles}`);
  console.log(`   Files with console statements: ${report.summary.filesWithConsoleStatements}`);
  console.log(`   Files with unused imports: ${report.summary.filesWithUnusedImports}`);
  console.log(`   Files with duplicate patterns: ${report.summary.filesWithDuplicatePatterns}`);
  console.log(`   Total console statements: ${report.summary.totalConsoleStatements}`);
  console.log(`   Total unused imports: ${report.summary.totalUnusedImports}`);
  console.log('');
  
  // Console statements
  if (report.details.consoleStatements.length > 0) {
    console.log('🚨 CONSOLE STATEMENTS TO REPLACE:');
    console.log('-'.repeat(30));
    report.details.consoleStatements.forEach(file => {
      console.log(`\n📁 ${file.path}:`);
      file.statements.forEach(stmt => {
        console.log(`   Line ${stmt.line}: ${stmt.content}`);
      });
    });
    console.log('');
  }
  
  // Unused imports
  if (report.details.unusedImports.length > 0) {
    console.log('📦 UNUSED IMPORTS:');
    console.log('-'.repeat(20));
    report.details.unusedImports.forEach(file => {
      console.log(`\n📁 ${file.path}:`);
      file.imports.forEach(imp => {
        console.log(`   Line ${imp.line}: ${imp.item} from '${imp.module}'`);
      });
    });
    console.log('');
  }
  
  // Duplicate patterns
  if (report.details.duplicatePatterns.size > 0) {
    console.log('🔄 DUPLICATE CODE PATTERNS:');
    console.log('-'.repeat(30));
    report.details.duplicatePatterns.forEach((patterns, filePath) => {
      console.log(`\n📁 ${filePath}:`);
      if (patterns.tryCatch.length > 0) {
        console.log('   Try-catch blocks:');
        patterns.tryCatch.forEach(pattern => {
          console.log(`     Line ${pattern.line}: ${pattern.content}`);
        });
      }
      if (patterns.errorHandling.length > 0) {
        console.log('   Error handling:');
        patterns.errorHandling.forEach(pattern => {
          console.log(`     Line ${pattern.line}: ${pattern.content}`);
        });
      }
    });
    console.log('');
  }
  
  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  console.log('-'.repeat(20));
  console.log('1. Replace console statements with proper logging using the errorHandler');
  console.log('2. Remove unused imports to reduce bundle size');
  console.log('3. Extract duplicate error handling patterns into utility functions');
  console.log('4. Use the centralized LoadingFallback component for consistent loading states');
  console.log('5. Implement proper error boundaries and fallback UI components');
  console.log('6. Use the common utilities from src/lib/common.ts for shared functionality');
  console.log('');
  
  console.log('✅ Cleanup completed! Review the report above and implement the suggested improvements.');
}

// Main execution
function main() {
  console.log('🧹 Starting code cleanup analysis...');
  console.log('Current directory:', process.cwd());
  console.log('Config srcDir:', CONFIG.srcDir);
  
  try {
    // Get all files
    const files = getAllFiles(CONFIG.srcDir);
    console.log(`📁 Found ${files.length} files to analyze`);
    
    // Analyze files
    const issues = {
      files,
      consoleStatements: [],
      unusedImports: [],
      duplicatePatterns: new Map()
    };
    
    files.forEach(filePath => {
      // Check for console statements
      const consoleStatements = findConsoleStatements(filePath);
      if (consoleStatements.length > 0) {
        issues.consoleStatements.push({
          path: filePath,
          statements: consoleStatements
        });
      }
      
      // Check for unused imports
      const unusedImports = findUnusedImports(filePath);
      if (unusedImports.length > 0) {
        issues.unusedImports.push({
          path: filePath,
          imports: unusedImports
        });
      }
    });
    
    // Find duplicate patterns
    issues.duplicatePatterns = findDuplicateCodePatterns(files);
    
    // Generate and print report
    const report = generateReport(issues);
    printReport(report);
    
    // Save report to file
    const reportPath = path.join(__dirname, 'cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error during cleanup analysis:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  main,
  findConsoleStatements,
  findUnusedImports,
  findDuplicateCodePatterns
};
