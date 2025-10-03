#!/usr/bin/env node
/**
 * AI Agent Pre-Commit Validation Script
 * Rule R58: Pre-Commit Validation - All code changes must pass validation before commit
 * Adapted for Next.js HSMobility project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AIPreCommitValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.configPath = path.join(this.projectRoot, 'validation-config.yaml');
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async validate() {
    console.log('🔍 AI Agent Pre-Commit Validation Starting...');
    
    try {
      // Load validation config
      const config = this.loadConfig();
      
      // Run validation checks
      await this.runESLintCheck();
      await this.runTypeScriptCheck();
      await this.runPrettierCheck();
      await this.runSecurityCheck();
      
      // Generate report
      this.generateReport();
      
      if (this.results.failed > 0) {
        console.error('❌ Pre-commit validation failed');
        process.exit(1);
      } else {
        console.log('✅ Pre-commit validation passed');
        process.exit(0);
      }
    } catch (error) {
      console.error('💥 Validation error:', error.message);
      process.exit(1);
    }
  }

  loadConfig() {
    if (!fs.existsSync(this.configPath)) {
      throw new Error('validation-config.yaml not found');
    }
    // In a real implementation, you'd parse YAML here
    return { enforcement: 'moderate' };
  }

  async runESLintCheck() {
    console.log('📝 Running ESLint check...');
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      this.results.passed++;
      console.log('✅ ESLint check passed');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push('ESLint validation failed');
      console.error('❌ ESLint check failed');
    }
  }

  async runTypeScriptCheck() {
    console.log('🔧 Running TypeScript check...');
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.results.passed++;
      console.log('✅ TypeScript check passed');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push('TypeScript validation failed');
      console.error('❌ TypeScript check failed');
    }
  }

  async runPrettierCheck() {
    console.log('🎨 Running Prettier check...');
    try {
      execSync('npx prettier --check "src/**/*.{ts,tsx,js,jsx}"', { stdio: 'pipe' });
      this.results.passed++;
      console.log('✅ Prettier check passed');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push('Prettier validation failed');
      console.error('❌ Prettier check failed');
    }
  }

  async runSecurityCheck() {
    console.log('🔒 Running security check...');
    try {
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
      this.results.passed++;
      console.log('✅ Security check passed');
    } catch (error) {
      this.results.failed++;
      this.results.errors.push('Security validation failed');
      console.error('❌ Security check failed');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'hsmobility-nextjs',
      validation_type: 'pre-commit',
      results: this.results,
      config: 'validation-config.yaml'
    };

    const reportPath = path.join(this.projectRoot, '.artifacts', 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Validation report saved to: ${reportPath}`);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new AIPreCommitValidator();
  validator.validate().catch(console.error);
}

module.exports = AIPreCommitValidator;