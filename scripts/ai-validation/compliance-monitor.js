#!/usr/bin/env node
/**
 * AI Agent Compliance Monitoring Script
 * Rule R26: Compliance Monitoring - Real-time monitoring of rule compliance
 * Adapted for Next.js HSMobility project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AIComplianceMonitor {
  constructor() {
    this.projectRoot = process.cwd();
    this.metrics = {
      compliance_rate: 0,
      test_coverage: 0,
      code_quality: 0,
      security_score: 0,
      performance_score: 0,
      documentation_coverage: 0,
      duplicate_code: 0,
      complexity_score: 0,
      maintainability: 0
    };
    this.thresholds = {
      compliance_rate: 90.0,
      test_coverage: 80.0,
      code_quality: 85.0,
      security_score: 95.0,
      performance_score: 80.0,
      documentation_coverage: 90.0,
      duplicate_code: 5.0,
      complexity_score: 10.0,
      maintainability: 80.0
    };
  }

  async monitor() {
    console.log('📊 AI Agent Compliance Monitoring Starting...');
    
    try {
      await this.calculateComplianceRate();
      await this.calculateTestCoverage();
      await this.calculateCodeQuality();
      await this.calculateSecurityScore();
      await this.calculatePerformanceScore();
      await this.calculateDocumentationCoverage();
      await this.calculateDuplicateCode();
      await this.calculateComplexityScore();
      await this.calculateMaintainability();
      
      this.generateComplianceReport();
      this.checkViolations();
      
    } catch (error) {
      console.error('💥 Compliance monitoring error:', error.message);
      process.exit(1);
    }
  }

  async calculateComplianceRate() {
    console.log('📈 Calculating compliance rate...');
    
    // Check various compliance metrics
    const checks = [
      this.checkESLintCompliance(),
      this.checkTypeScriptCompliance(),
      this.checkPrettierCompliance(),
      this.checkTestCoverageCompliance(),
      this.checkSecurityCompliance()
    ];
    
    const results = await Promise.all(checks);
    const passedChecks = results.filter(result => result).length;
    this.metrics.compliance_rate = (passedChecks / checks.length) * 100;
    
    console.log(`✅ Compliance rate: ${this.metrics.compliance_rate.toFixed(1)}%`);
  }

  async calculateTestCoverage() {
    console.log('🧪 Calculating test coverage...');
    
    try {
      // Run test coverage analysis
      const output = execSync('npm run test:coverage', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const coverageMatch = output.match(/(\d+(?:\.\d+)?)%/);
      if (coverageMatch) {
        this.metrics.test_coverage = parseFloat(coverageMatch[1]);
      }
      
      console.log(`✅ Test coverage: ${this.metrics.test_coverage.toFixed(1)}%`);
    } catch (error) {
      console.error('❌ Test coverage calculation failed');
      this.metrics.test_coverage = 0;
    }
  }

  async calculateCodeQuality() {
    console.log('🔍 Calculating code quality...');
    
    try {
      // Run ESLint analysis
      const output = execSync('npm run lint', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Parse ESLint output for quality metrics
      const lines = output.split('\n');
      const errorCount = lines.filter(line => line.includes('error')).length;
      const warningCount = lines.filter(line => line.includes('warning')).length;
      
      // Calculate quality score (lower errors/warnings = higher quality)
      const totalIssues = errorCount + warningCount;
      this.metrics.code_quality = Math.max(0, 100 - (totalIssues * 2));
      
      console.log(`✅ Code quality: ${this.metrics.code_quality.toFixed(1)}/100`);
    } catch (error) {
      console.error('❌ Code quality calculation failed');
      this.metrics.code_quality = 0;
    }
  }

  async calculateSecurityScore() {
    console.log('🔒 Calculating security score...');
    
    try {
      const output = execSync('npm audit --json', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const auditResult = JSON.parse(output);
      const vulnerabilities = auditResult.metadata?.vulnerabilities || {};
      
      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
      
      // Calculate security score (fewer vulnerabilities = higher score)
      this.metrics.security_score = Math.max(0, 100 - (totalVulns * 5));
      
      console.log(`✅ Security score: ${this.metrics.security_score.toFixed(1)}/100`);
    } catch (error) {
      console.error('❌ Security score calculation failed');
      this.metrics.security_score = 0;
    }
  }

  async calculatePerformanceScore() {
    console.log('⚡ Calculating performance score...');
    
    try {
      // Run build to check performance
      const startTime = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      const buildTime = Date.now() - startTime;
      
      // Calculate performance score based on build time
      // Assuming 60 seconds is optimal build time
      this.metrics.performance_score = Math.max(0, 100 - ((buildTime / 1000) - 60));
      
      console.log(`✅ Performance score: ${this.metrics.performance_score.toFixed(1)}/100`);
    } catch (error) {
      console.error('❌ Performance score calculation failed');
      this.metrics.performance_score = 0;
    }
  }

  async calculateDocumentationCoverage() {
    console.log('📚 Calculating documentation coverage...');
    
    try {
      const srcFiles = this.getSourceFiles();
      const documentedFiles = srcFiles.filter(file => this.hasDocumentation(file));
      
      this.metrics.documentation_coverage = (documentedFiles.length / srcFiles.length) * 100;
      
      console.log(`✅ Documentation coverage: ${this.metrics.documentation_coverage.toFixed(1)}%`);
    } catch (error) {
      console.error('❌ Documentation coverage calculation failed');
      this.metrics.documentation_coverage = 0;
    }
  }

  async calculateDuplicateCode() {
    console.log('🔄 Calculating duplicate code...');
    
    // Simple duplicate code detection
    const srcFiles = this.getSourceFiles();
    let duplicateLines = 0;
    let totalLines = 0;
    
    srcFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      totalLines += lines.length;
      
      // Simple heuristic: count repeated lines
      const lineCounts = {};
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.length > 10) { // Ignore short lines
          lineCounts[trimmed] = (lineCounts[trimmed] || 0) + 1;
        }
      });
      
      Object.values(lineCounts).forEach(count => {
        if (count > 1) duplicateLines += count - 1;
      });
    });
    
    this.metrics.duplicate_code = (duplicateLines / totalLines) * 100;
    
    console.log(`✅ Duplicate code: ${this.metrics.duplicate_code.toFixed(1)}%`);
  }

  async calculateComplexityScore() {
    console.log('🧮 Calculating complexity score...');
    
    // Simple cyclomatic complexity calculation
    const srcFiles = this.getSourceFiles();
    let totalComplexity = 0;
    let fileCount = 0;
    
    srcFiles.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(file, 'utf8');
        const complexity = this.calculateCyclomaticComplexity(content);
        totalComplexity += complexity;
        fileCount++;
      }
    });
    
    const avgComplexity = fileCount > 0 ? totalComplexity / fileCount : 0;
    this.metrics.complexity_score = avgComplexity;
    
    console.log(`✅ Complexity score: ${this.metrics.complexity_score.toFixed(1)}`);
  }

  async calculateMaintainability() {
    console.log('🔧 Calculating maintainability...');
    
    // Calculate maintainability index based on multiple factors
    const factors = [
      this.metrics.code_quality / 100,
      this.metrics.documentation_coverage / 100,
      Math.max(0, 1 - (this.metrics.complexity_score / 20)), // Lower complexity = higher maintainability
      Math.max(0, 1 - (this.metrics.duplicate_code / 10)) // Lower duplication = higher maintainability
    ];
    
    this.metrics.maintainability = (factors.reduce((sum, factor) => sum + factor, 0) / factors.length) * 100;
    
    console.log(`✅ Maintainability: ${this.metrics.maintainability.toFixed(1)}/100`);
  }

  // Helper methods
  getSourceFiles() {
    const srcDir = path.join(this.projectRoot, 'src');
    const files = [];
    
    const walkDir = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx')) {
          files.push(fullPath);
        }
      });
    };
    
    walkDir(srcDir);
    return files;
  }

  hasDocumentation(file) {
    const content = fs.readFileSync(file, 'utf8');
    return content.includes('/**') || content.includes('// TODO') || content.includes('// FIXME');
  }

  calculateCyclomaticComplexity(content) {
    // Simple cyclomatic complexity calculation
    const complexityKeywords = ['if', 'else', 'for', 'while', 'switch', 'case', 'catch', '&&', '||', '?'];
    let complexity = 1; // Base complexity
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  async checkESLintCompliance() {
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async checkTypeScriptCompliance() {
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async checkPrettierCompliance() {
    try {
      execSync('npx prettier --check "src/**/*.{ts,tsx,js,jsx}"', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  async checkTestCoverageCompliance() {
    return this.metrics.test_coverage >= this.thresholds.test_coverage;
  }

  async checkSecurityCompliance() {
    return this.metrics.security_score >= this.thresholds.security_score;
  }

  generateComplianceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'hsmobility-nextjs',
      metrics: this.metrics,
      thresholds: this.thresholds,
      violations: this.getViolations()
    };

    const reportPath = path.join(this.projectRoot, '.artifacts', 'compliance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Compliance report saved to: ${reportPath}`);
  }

  getViolations() {
    const violations = [];
    
    Object.keys(this.metrics).forEach(metric => {
      if (this.metrics[metric] < this.thresholds[metric]) {
        violations.push({
          metric,
          current: this.metrics[metric],
          threshold: this.thresholds[metric],
          severity: this.metrics[metric] < this.thresholds[metric] * 0.8 ? 'critical' : 'warning'
        });
      }
    });
    
    return violations;
  }

  checkViolations() {
    const violations = this.getViolations();
    
    if (violations.length > 0) {
      console.error('❌ Compliance violations detected:');
      violations.forEach(violation => {
        console.error(`  - ${violation.metric}: ${violation.current.toFixed(1)} < ${violation.threshold} (${violation.severity})`);
      });
      
      const criticalViolations = violations.filter(v => v.severity === 'critical');
      if (criticalViolations.length > 0) {
        console.error('💥 Critical violations detected - blocking deployment');
        process.exit(1);
      }
    } else {
      console.log('✅ No compliance violations detected');
    }
  }
}

// Run monitoring if called directly
if (require.main === module) {
  const monitor = new AIComplianceMonitor();
  monitor.monitor().catch(console.error);
}

module.exports = AIComplianceMonitor;