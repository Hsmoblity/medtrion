#!/usr/bin/env node
/**
 * AI Agent Rule Validator
 * Rule R25: Automated Validation - All rule violations must be caught by automated validation
 * Rule R67: Rule Validation Engine - Implement a validation engine that can adapt to any technology stack
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AIRuleValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.rulesConfig = this.loadRulesConfig();
    this.violations = [];
    this.complianceScore = 0;
  }

  async validateAllRules() {
    console.log('🔍 AI Agent Rule Validation Starting...');
    
    try {
      // Validate all rule categories
      await this.validateArtifactRules();
      await this.validatePlanningRules();
      await this.validateCoordinationRules();
      await this.validateQualityRules();
      await this.validateSecurityRules();
      await this.validatePerformanceRules();
      await this.validateDocumentationRules();
      
      // Generate compliance report
      this.generateComplianceReport();
      
      // Return validation result
      return {
        passed: this.violations.length === 0,
        violations: this.violations,
        complianceScore: this.complianceScore
      };
      
    } catch (error) {
      console.error('💥 Rule validation error:', error.message);
      return {
        passed: false,
        violations: [{ rule: 'VALIDATION_ERROR', message: error.message }],
        complianceScore: 0
      };
    }
  }

  loadRulesConfig() {
    const configPath = path.join(this.projectRoot, '.ai_rulebook', 'validation-config.yaml');
    if (!fs.existsSync(configPath)) {
      throw new Error('AI rulebook validation config not found');
    }
    // In a real implementation, you'd parse YAML here
    return {
      thresholds: {
        compliance_rate: 90.0,
        test_coverage: 80.0,
        code_quality: 85.0,
        security_score: 95.0
      },
      enforcement: 'moderate'
    };
  }

  // Rule R1-R4: Core Artifact & Evolution
  async validateArtifactRules() {
    console.log('📄 Validating artifact rules...');
    
    // Check if .artifacts directory exists
    const artifactsDir = path.join(this.projectRoot, '.artifacts');
    if (!fs.existsSync(artifactsDir)) {
      this.addViolation('R1', '.artifacts directory does not exist');
    }
    
    // Check if checkpoints directory exists
    const checkpointsDir = path.join(this.projectRoot, '.artifacts', 'checkpoints');
    if (!fs.existsSync(checkpointsDir)) {
      this.addViolation('R4', 'Checkpoints directory does not exist');
    }
    
    // Check for recent artifacts (should have artifacts from recent work)
    const recentArtifacts = this.getRecentArtifacts();
    if (recentArtifacts.length === 0) {
      this.addViolation('R1', 'No recent artifacts found - work may not be properly documented');
    }
  }

  // Rule R5-R7: Deliberation & Planning
  async validatePlanningRules() {
    console.log('📋 Validating planning rules...');
    
    // Check if deliberation notes exist
    const deliberationFile = path.join(this.projectRoot, '.tracking', 'deliberation_notes.md');
    if (!fs.existsSync(deliberationFile)) {
      this.addViolation('R7', 'Deliberation notes file does not exist');
    }
    
    // Check if active work tracking exists
    const activeWorkFile = path.join(this.projectRoot, '.tracking', 'active_work.md');
    if (!fs.existsSync(activeWorkFile)) {
      this.addViolation('R11', 'Active work tracking file does not exist');
    }
  }

  // Rule R11-R13: Coordination & Synchronization
  async validateCoordinationRules() {
    console.log('🔄 Validating coordination rules...');
    
    // Check if sync points exist
    const syncPointsFile = path.join(this.projectRoot, '.tracking', 'sync_points.md');
    if (!fs.existsSync(syncPointsFile)) {
      this.addViolation('R12', 'Sync points file does not exist');
    }
    
    // Check if task management directory exists
    const tasksDir = path.join(this.projectRoot, '.tasks');
    if (!fs.existsSync(tasksDir)) {
      this.addViolation('R11', 'Task management directory does not exist');
    }
  }

  // Rule R14-R15: Quality & Testing
  async validateQualityRules() {
    console.log('🧪 Validating quality rules...');
    
    try {
      // Check test coverage
      const coverageResult = execSync('npm run test:coverage', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const coverageMatch = coverageResult.match(/(\d+(?:\.\d+)?)%/);
      if (coverageMatch) {
        const coverage = parseFloat(coverageMatch[1]);
        if (coverage < this.rulesConfig.thresholds.test_coverage) {
          this.addViolation('R14', `Test coverage ${coverage}% is below threshold ${this.rulesConfig.thresholds.test_coverage}%`);
        }
      }
    } catch (error) {
      this.addViolation('R14', 'Test coverage check failed');
    }
    
    // Check if tests directory exists
    const testsDir = path.join(this.projectRoot, 'tests');
    if (!fs.existsSync(testsDir)) {
      this.addViolation('R14', 'Tests directory does not exist');
    }
  }

  // Rule R29-R32: Security & Privacy
  async validateSecurityRules() {
    console.log('🔒 Validating security rules...');
    
    try {
      // Run security audit
      const auditResult = execSync('npm audit --json', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const auditData = JSON.parse(auditResult);
      const vulnerabilities = auditData.metadata?.vulnerabilities || {};
      const totalVulns = Object.values(vulnerabilities).reduce((sum, count) => sum + count, 0);
      
      if (totalVulns > 0) {
        this.addViolation('R29', `Found ${totalVulns} security vulnerabilities`);
      }
    } catch (error) {
      this.addViolation('R29', 'Security audit failed');
    }
  }

  // Rule R33-R36: Performance & Scalability
  async validatePerformanceRules() {
    console.log('⚡ Validating performance rules...');
    
    try {
      // Check build performance
      const startTime = Date.now();
      execSync('npm run build', { stdio: 'pipe' });
      const buildTime = Date.now() - startTime;
      
      // If build takes more than 2 minutes, it's a performance issue
      if (buildTime > 120000) {
        this.addViolation('R33', `Build time ${buildTime/1000}s exceeds performance threshold`);
      }
    } catch (error) {
      this.addViolation('R33', 'Build performance check failed');
    }
  }

  // Rule R47-R49: Documentation & Standards
  async validateDocumentationRules() {
    console.log('📚 Validating documentation rules...');
    
    // Check if README exists and has content
    const readmeFile = path.join(this.projectRoot, 'README.md');
    if (!fs.existsSync(readmeFile)) {
      this.addViolation('R47', 'README.md does not exist');
    } else {
      const readmeContent = fs.readFileSync(readmeFile, 'utf8');
      if (readmeContent.length < 500) {
        this.addViolation('R47', 'README.md is too short - needs more comprehensive documentation');
      }
    }
    
    // Check if AI rulebook documentation exists
    const rulebookFile = path.join(this.projectRoot, '.ai_rulebook', 'alignment-summary.md');
    if (!fs.existsSync(rulebookFile)) {
      this.addViolation('R47', 'AI rulebook documentation is missing');
    }
  }

  addViolation(ruleId, message) {
    this.violations.push({
      rule: ruleId,
      message: message,
      severity: this.getSeverity(ruleId),
      timestamp: new Date().toISOString()
    });
  }

  getSeverity(ruleId) {
    // Critical rules that should always block
    const criticalRules = ['R1', 'R4', 'R11', 'R12', 'R14', 'R29'];
    return criticalRules.includes(ruleId) ? 'critical' : 'warning';
  }

  getRecentArtifacts() {
    const artifactsDir = path.join(this.projectRoot, '.artifacts');
    if (!fs.existsSync(artifactsDir)) return [];
    
    const files = fs.readdirSync(artifactsDir);
    return files.filter(file => {
      const filePath = path.join(artifactsDir, file);
      const stats = fs.statSync(filePath);
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      return stats.mtime.getTime() > oneDayAgo;
    });
  }

  generateComplianceReport() {
    const totalRules = 70; // Total rules in the system
    const passedRules = totalRules - this.violations.length;
    this.complianceScore = (passedRules / totalRules) * 100;
    
    const report = {
      timestamp: new Date().toISOString(),
      project: 'hsmobility-nextjs',
      validation_type: 'ai_rule_validation',
      compliance_score: this.complianceScore,
      total_rules: totalRules,
      passed_rules: passedRules,
      violations: this.violations,
      threshold: this.rulesConfig.thresholds.compliance_rate,
      status: this.complianceScore >= this.rulesConfig.thresholds.compliance_rate ? 'PASSED' : 'FAILED'
    };

    const reportPath = path.join(this.projectRoot, '.artifacts', 'rule-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Rule validation report saved to: ${reportPath}`);
    console.log(`📈 Compliance Score: ${this.complianceScore.toFixed(1)}%`);
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new AIRuleValidator();
  validator.validateAllRules().then(result => {
    if (result.passed) {
      console.log('✅ All AI rules validation passed');
      process.exit(0);
    } else {
      console.error('❌ AI rules validation failed');
      console.error('Violations:', result.violations);
      process.exit(1);
    }
  }).catch(error => {
    console.error('💥 Validation error:', error);
    process.exit(1);
  });
}

module.exports = AIRuleValidator;