/**
 * One-Pager Validator - Scoring Logic
 *
 * Scoring Dimensions:
 * 1. Problem Clarity (30 pts) - Problem statement, cost of inaction, customer focus
 * 2. Solution Quality (25 pts) - Solution addresses problem, measurable goals, high-level
 * 3. Scope Discipline (25 pts) - In/out scope, success metrics, SMART criteria
 * 4. Completeness (20 pts) - Required sections, stakeholders, timeline
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// Constants
// ============================================================================

const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(problem|challenge|pain.?point|context)/im, name: 'Problem/Challenge', weight: 2 },
  { pattern: /^#+\s*(solution|proposal|approach|recommendation)/im, name: 'Solution/Proposal', weight: 2 },
  { pattern: /^#+\s*(goal|objective|benefit|outcome)/im, name: 'Goals/Benefits', weight: 2 },
  { pattern: /^#+\s*(scope|in.scope|out.of.scope|boundary|boundaries)/im, name: 'Scope Definition', weight: 2 },
  { pattern: /^#+\s*(success|metric|kpi|measure|success.metric)/im, name: 'Success Metrics', weight: 1 },
  { pattern: /^#+\s*(stakeholder|team|owner|raci|responsible)/im, name: 'Stakeholders/Team', weight: 1 },
  { pattern: /^#+\s*(timeline|milestone|phase|schedule|roadmap)/im, name: 'Timeline/Milestones', weight: 1 }
];

// Problem clarity patterns
const PROBLEM_PATTERNS = {
  problemSection: /^#+\s*(problem|challenge|pain.?point|context|why)/im,
  problemLanguage: /\b(problem|challenge|pain.?point|issue|struggle|difficult|frustrat|current.?state|today|existing)\b/gi,
  costOfInaction: /\b(cost|impact|consequence|risk|without|if.?not|delay|postpone|inaction|doing.?nothing|status.?quo)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value)\b/gi
};

// Solution patterns
const SOLUTION_PATTERNS = {
  solutionSection: /^#+\s*(solution|proposal|approach|recommendation|how)/im,
  solutionLanguage: /\b(solution|approach|proposal|implement|build|create|develop|enable|provide|deliver)\b/gi,
  measurable: /\b(measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal)\b/gi,
  highlevel: /\b(overview|summary|high.?level|architecture|design|flow|process|workflow)\b/gi,
  avoidImplementation: /\b(code|function|class|method|api|database|sql|algorithm|library|framework)\b/gi
};

// Scope patterns
const SCOPE_PATTERNS = {
  inScope: /\b(in.scope|included|within.scope|we.will|we.are|we.provide|we.deliver)\b/gi,
  outOfScope: /\b(out.of.scope|not.included|excluded|we.will.not|won't|outside.scope|future|phase.2|post.mvp|not.in.v1)\b/gi,
  scopeSection: /^#+\s*(scope|boundaries|in.scope|out.of.scope)/im
};

// Success metrics patterns
const METRICS_PATTERNS = {
  smart: /\b(specific|measurable|achievable|relevant|time.bound|smart)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction|request|response)/gi,
  metricsSection: /^#+\s*(success|metric|kpi|measure|success.metric)/im,
  metricsLanguage: /\b(metric|kpi|measure|target|goal|achieve|reach|improve|reduce|increase)\b/gi
};

// Stakeholder patterns - expanded with C-suite from adversarial review compounding
const STAKEHOLDER_PATTERNS = {
  stakeholderSection: /^#+\s*(stakeholder|team|owner|raci|responsible|responsible.accountable)/im,
  stakeholderLanguage: /\b(stakeholder|owner|lead|team|responsible|accountable|raci|sponsor|approver)\b/gi,
  // Extended stakeholder concerns - includes FP&A, People Team, C-suite
  stakeholderConcerns: /\b(finance|fp&a|fp.?&.?a|financial.planning|hr|people.?team|people.?ops|legal|compliance|equity|liability|approval|sign.?off|cfo|cto|ceo|vp|director)\b/gi,
  roleDefinition: /\b(responsible|accountable|consulted|informed|raci)\b/gi
};

// Timeline patterns
const TIMELINE_PATTERNS = {
  timelineSection: /^#+\s*(timeline|milestone|phase|schedule|roadmap)/im,
  datePatterns: /\b(week|month|quarter|q[1-4]|phase|milestone|sprint|release|v\d+)\b/gi,
  phasing: /\b(phase|stage|wave|iteration|sprint|release)\b/gi
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect circular logic: solution is just the inverse of the problem
 * Example: Problem: "We don't have a dashboard" → Solution: "Build a dashboard"
 * This is a CRITICAL penalty - caps score at 50 per prompts.js line 49
 * @param {string} text - Text to analyze
 * @returns {Object} Circular logic detection results
 */
export function detectCircularLogic(text) {
  // Extract problem and solution sections
  const problemSection = text.match(/^#+\s*(problem|challenge|pain.?point|context)[^#]*/im)?.[0] || '';
  const solutionSection = text.match(/^#+\s*(solution|proposal|approach|recommendation)[^#]*/im)?.[0] || '';

  if (!problemSection || !solutionSection) {
    return { isCircular: false, confidence: 0, reason: 'Sections not found' };
  }

  const problemLower = problemSection.toLowerCase();
  const solutionLower = solutionSection.toLowerCase();

  // Patterns that indicate circular logic (problem: no X → solution: add/build/create X)
  const circularPatterns = [
    // "don't have X" / "lack X" → "build/create/add X"
    { problem: /\b(don't|do not|lack|missing|no|without)\s+(\w+)/g, solution: /\b(build|create|add|implement|develop)\s+\2/g },
    // Simple inversion: check if solution just restates problem keywords
    { problem: /\b(need|require|want)\s+(?:a\s+)?(\w+)/g, solution: /\b(build|create|add|implement)\s+(?:a\s+)?(\w+)/g }
  ];

  // Extract key nouns from problem (excluding common words)
  const commonWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'we', 'our', 'and', 'or', 'but', 'if', 'because', 'as', 'until', 'while', 'that', 'this', 'these', 'those', 'it', 'its']);

  // Check for direct keyword reuse (problem mentions X, solution says "build X")
  const problemNouns = problemLower.match(/\b[a-z]{4,}\b/g)?.filter(w => !commonWords.has(w)) || [];
  const actionVerbs = ['build', 'create', 'add', 'implement', 'develop', 'make', 'establish', 'introduce', 'launch'];

  let circularMatches = 0;
  for (const noun of new Set(problemNouns)) {
    for (const verb of actionVerbs) {
      const pattern = new RegExp(`\\b${verb}\\s+(?:a\\s+)?${noun}`, 'i');
      if (pattern.test(solutionLower)) {
        circularMatches++;
      }
    }
  }

  // High confidence if multiple circular matches found
  const isCircular = circularMatches >= 2;
  const confidence = Math.min(100, circularMatches * 25);

  return {
    isCircular,
    confidence,
    matchCount: circularMatches,
    reason: isCircular
      ? `Solution appears to restate the problem (${circularMatches} circular patterns)`
      : 'Solution addresses root cause'
  };
}

/**
 * Detect [Baseline] → [Target] format in metrics
 * Good: "Reduce support tickets from 100/day → 30/day"
 * Bad: "Improve user experience" (vague, no baseline or target)
 * @param {string} text - Text to analyze
 * @returns {Object} Baseline/target detection results
 */
export function detectBaselineTarget(text) {
  // Look for patterns like:
  // - [100] → [30]
  // - from X to Y
  // - currently X, target Y
  // - reduce from X to Y
  // - [Current] → [Target] format
  const arrowPatterns = text.match(/\d+[%$]?\s*[→\->]\s*\d+[%$]?/g) || [];
  const fromToPatterns = text.match(/from\s+\d+[%$]?\s+to\s+\d+[%$]?/gi) || [];
  const currentTargetPatterns = text.match(/currently?\s+\d+[%$]?.*target\s+\d+[%$]?/gi) || [];
  const bracketPatterns = text.match(/\[(?:current|baseline)[^\]]*\]\s*[→\->]\s*\[(?:target|goal)[^\]]*\]/gi) || [];

  const totalMatches = arrowPatterns.length + fromToPatterns.length +
                       currentTargetPatterns.length + bracketPatterns.length;

  // Check for vague metrics (keywords without numbers)
  const vaguePatterns = text.match(/\b(improve|increase|decrease|reduce|enhance|better|more|less|faster|slower)\b(?![^.]*\d)/gi) || [];

  return {
    hasBaselineTarget: totalMatches > 0,
    baselineTargetCount: totalMatches,
    arrowPatterns: arrowPatterns.length,
    fromToPatterns: fromToPatterns.length,
    vagueMetricsCount: vaguePatterns.length,
    hasVagueMetrics: vaguePatterns.length > totalMatches,
    examples: [...arrowPatterns.slice(0, 2), ...fromToPatterns.slice(0, 2)]
  };
}

/**
 * Detect problem statement in text
 * @param {string} text - Text to analyze
 * @returns {Object} Problem detection results
 */
export function detectProblemStatement(text) {
  const hasProblemSection = PROBLEM_PATTERNS.problemSection.test(text);
  const problemMatches = text.match(PROBLEM_PATTERNS.problemLanguage) || [];
  const costMatches = text.match(PROBLEM_PATTERNS.costOfInaction) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const businessMatches = text.match(PROBLEM_PATTERNS.businessFocus) || [];

  return {
    hasProblemSection,
    hasProblemLanguage: problemMatches.length > 0,
    hasCostOfInaction: costMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasBusinessFocus: businessMatches.length > 0,
    indicators: [
      hasProblemSection && 'Dedicated problem section',
      problemMatches.length > 0 && 'Problem framing language',
      costMatches.length > 0 && 'Cost of inaction mentioned',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      businessMatches.length > 0 && 'Business/customer focus'
    ].filter(Boolean)
  };
}

/**
 * Detect cost of inaction in text
 * @param {string} text - Text to analyze
 * @returns {Object} Cost of inaction detection results
 */
export function detectCostOfInaction(text) {
  const costMatches = text.match(PROBLEM_PATTERNS.costOfInaction) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const hasCostSection = /^#+\s*(cost|impact|consequence|risk|why.now|urgency)/im.test(text);

  return {
    hasCostLanguage: costMatches.length > 0,
    costCount: costMatches.length,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasCostSection,
    indicators: [
      costMatches.length > 0 && `${costMatches.length} cost/impact references`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified values`,
      hasCostSection && 'Dedicated cost/impact section'
    ].filter(Boolean)
  };
}

/**
 * Detect solution in text
 * @param {string} text - Text to analyze
 * @returns {Object} Solution detection results
 */
export function detectSolution(text) {
  const hasSolutionSection = SOLUTION_PATTERNS.solutionSection.test(text);
  const solutionMatches = text.match(SOLUTION_PATTERNS.solutionLanguage) || [];
  const measurableMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const highlevelMatches = text.match(SOLUTION_PATTERNS.highlevel) || [];
  const implementationMatches = text.match(SOLUTION_PATTERNS.avoidImplementation) || [];

  return {
    hasSolutionSection,
    hasSolutionLanguage: solutionMatches.length > 0,
    hasMeasurable: measurableMatches.length > 0,
    isHighLevel: highlevelMatches.length > 0 && implementationMatches.length === 0,
    hasImplementationDetails: implementationMatches.length > 0,
    indicators: [
      hasSolutionSection && 'Dedicated solution section',
      solutionMatches.length > 0 && 'Solution language present',
      measurableMatches.length > 0 && 'Measurable outcomes mentioned',
      highlevelMatches.length > 0 && 'High-level approach described',
      implementationMatches.length === 0 && 'No implementation details (good)'
    ].filter(Boolean)
  };
}

/**
 * Detect measurable goals in text
 * @param {string} text - Text to analyze
 * @returns {Object} Measurable goals detection results
 */
export function detectMeasurableGoals(text) {
  const measurableMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const quantifiedMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const goalMatches = text.match(/\b(goal|objective|benefit|outcome|result)\b/gi) || [];

  return {
    hasMeasurable: measurableMatches.length > 0,
    measurableCount: measurableMatches.length,
    hasQuantified: quantifiedMatches.length > 0,
    hasGoals: goalMatches.length > 0,
    goalCount: goalMatches.length,
    indicators: [
      measurableMatches.length > 0 && `${measurableMatches.length} measurable terms`,
      goalMatches.length > 0 && `${goalMatches.length} goal/objective mentions`,
      quantifiedMatches.length > 0 && 'Quantified metrics present'
    ].filter(Boolean)
  };
}

/**
 * Detect scope definitions in text
 * @param {string} text - Text to analyze
 * @returns {Object} Scope detection results
 */
export function detectScope(text) {
  const inScopeMatches = text.match(SCOPE_PATTERNS.inScope) || [];
  const outOfScopeMatches = text.match(SCOPE_PATTERNS.outOfScope) || [];
  const hasScopeSection = SCOPE_PATTERNS.scopeSection.test(text);

  return {
    hasInScope: inScopeMatches.length > 0,
    inScopeCount: inScopeMatches.length,
    hasOutOfScope: outOfScopeMatches.length > 0,
    outOfScopeCount: outOfScopeMatches.length,
    hasBothBoundaries: inScopeMatches.length > 0 && outOfScopeMatches.length > 0,
    hasScopeSection,
    indicators: [
      inScopeMatches.length > 0 && 'In-scope items defined',
      outOfScopeMatches.length > 0 && 'Out-of-scope items defined',
      hasScopeSection && 'Dedicated scope section'
    ].filter(Boolean)
  };
}

/**
 * Detect success metrics in text
 * @param {string} text - Text to analyze
 * @returns {Object} Success metrics detection results
 */
export function detectSuccessMetrics(text) {
  const smartMatches = text.match(METRICS_PATTERNS.smart) || [];
  const quantifiedMatches = text.match(METRICS_PATTERNS.quantified) || [];
  const metricsMatches = text.match(METRICS_PATTERNS.metricsLanguage) || [];
  const hasMetricsSection = METRICS_PATTERNS.metricsSection.test(text);

  return {
    hasMetricsSection,
    hasSmart: smartMatches.length > 0,
    smartCount: smartMatches.length,
    hasQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasMetrics: metricsMatches.length > 0,
    metricsCount: metricsMatches.length,
    indicators: [
      hasMetricsSection && 'Dedicated metrics section',
      smartMatches.length > 0 && 'SMART criteria mentioned',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      metricsMatches.length > 0 && `${metricsMatches.length} metric references`
    ].filter(Boolean)
  };
}

/**
 * Detect sections in text
 * @param {string} text - Text to analyze
 * @returns {Object} Sections found and missing
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}

/**
 * Detect stakeholders in text
 * @param {string} text - Text to analyze
 * @returns {Object} Stakeholder detection results
 */
export function detectStakeholders(text) {
  const stakeholderMatches = text.match(STAKEHOLDER_PATTERNS.stakeholderLanguage) || [];
  const roleMatches = text.match(STAKEHOLDER_PATTERNS.roleDefinition) || [];
  const concernMatches = text.match(STAKEHOLDER_PATTERNS.stakeholderConcerns) || [];
  const hasStakeholderSection = STAKEHOLDER_PATTERNS.stakeholderSection.test(text);

  return {
    hasStakeholderSection,
    hasStakeholders: stakeholderMatches.length > 0,
    stakeholderCount: stakeholderMatches.length,
    hasRoles: roleMatches.length > 0,
    roleCount: roleMatches.length,
    hasConcerns: concernMatches.length > 0,
    concernCount: concernMatches.length,
    indicators: [
      hasStakeholderSection && 'Dedicated stakeholder section',
      stakeholderMatches.length > 0 && `${stakeholderMatches.length} stakeholder references`,
      roleMatches.length > 0 && 'Roles/responsibilities defined',
      concernMatches.length > 0 && `${concernMatches.length} stakeholder concerns addressed (FP&A, legal, C-suite)`
    ].filter(Boolean)
  };
}

/**
 * Detect timeline in text
 * @param {string} text - Text to analyze
 * @returns {Object} Timeline detection results
 */
export function detectTimeline(text) {
  const dateMatches = text.match(TIMELINE_PATTERNS.datePatterns) || [];
  const phasingMatches = text.match(TIMELINE_PATTERNS.phasing) || [];
  const hasTimelineSection = TIMELINE_PATTERNS.timelineSection.test(text);

  return {
    hasTimelineSection,
    hasTimeline: dateMatches.length > 0,
    dateCount: dateMatches.length,
    hasPhasing: phasingMatches.length > 0,
    phasingCount: phasingMatches.length,
    indicators: [
      hasTimelineSection && 'Dedicated timeline section',
      dateMatches.length > 0 && `${dateMatches.length} timeline references`,
      phasingMatches.length > 0 && `${phasingMatches.length} phases/milestones`
    ].filter(Boolean)
  };
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Score problem clarity (30 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreProblemClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  // Problem statement exists and is specific (0-10 pts)
  const problemDetection = detectProblemStatement(text);
  if (problemDetection.hasProblemSection && problemDetection.hasProblemLanguage) {
    score += 10;
    strengths.push('Clear problem statement with dedicated section');
  } else if (problemDetection.hasProblemLanguage) {
    score += 6;
    issues.push('Problem mentioned but lacks dedicated section');
  } else {
    issues.push('Problem statement missing or unclear - define the specific problem');
  }

  // Cost of doing nothing present and quantified (0-10 pts)
  const costDetection = detectCostOfInaction(text);
  if (costDetection.hasCostLanguage && costDetection.isQuantified) {
    score += 10;
    strengths.push('Cost of inaction quantified with specific metrics');
  } else if (costDetection.hasCostLanguage) {
    score += 5;
    issues.push('Cost of inaction mentioned but not quantified - add numbers/percentages');
  } else {
    issues.push('Missing cost of inaction - explain impact of not solving this problem');
  }

  // Problem is customer/business focused (0-10 pts)
  if (problemDetection.hasBusinessFocus) {
    score += 10;
    strengths.push('Problem clearly tied to customer/business value');
  } else {
    issues.push('Strengthen customer/business focus - explain why this matters to stakeholders');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score solution quality (25 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreSolutionQuality(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Solution addresses stated problem (0-10 pts)
  const solutionDetection = detectSolution(text);
  const problemDetection = detectProblemStatement(text);

  if (solutionDetection.hasSolutionSection && problemDetection.hasProblemLanguage) {
    score += 10;
    strengths.push('Solution clearly addresses stated problem');
  } else if (solutionDetection.hasSolutionLanguage) {
    score += 6;
    issues.push('Solution present but connection to problem could be clearer');
  } else {
    issues.push('Solution section missing or unclear');
  }

  // Key goals/benefits are measurable (0-10 pts)
  const goalsDetection = detectMeasurableGoals(text);
  if (goalsDetection.hasMeasurable && goalsDetection.hasGoals) {
    score += 10;
    strengths.push('Goals are measurable and well-defined');
  } else if (goalsDetection.hasGoals) {
    score += 5;
    issues.push('Goals defined but not measurable - add specific metrics');
  } else {
    issues.push('Goals/benefits missing - define what success looks like');
  }

  // Solution is high-level, not implementation (0-5 pts)
  if (solutionDetection.isHighLevel && !solutionDetection.hasImplementationDetails) {
    score += 5;
    strengths.push('Solution stays at appropriate high-level');
  } else if (solutionDetection.hasImplementationDetails) {
    issues.push('Solution includes too much implementation detail - keep it high-level');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score scope discipline (25 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreScopeDiscipline(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // In-scope clearly defined (0-8 pts)
  const scopeDetection = detectScope(text);
  if (scopeDetection.hasInScope && scopeDetection.hasScopeSection) {
    score += 8;
    strengths.push('In-scope items clearly defined');
  } else if (scopeDetection.hasInScope) {
    score += 4;
    issues.push('In-scope items mentioned but lack dedicated section');
  } else {
    issues.push('In-scope not clearly defined - list what you WILL do');
  }

  // Out-of-scope explicitly stated (0-9 pts)
  if (scopeDetection.hasOutOfScope) {
    score += 9;
    strengths.push('Out-of-scope explicitly defined');
  } else {
    issues.push('Out-of-scope missing - explicitly state what you WON\'T do');
  }

  // Success metrics are SMART (0-8 pts)
  const metricsDetection = detectSuccessMetrics(text);
  if (metricsDetection.hasMetricsSection && metricsDetection.hasQuantified) {
    score += 8;
    strengths.push('Success metrics are SMART and quantified');
  } else if (metricsDetection.hasMetrics) {
    score += 4;
    issues.push('Metrics present but not SMART - make them Specific, Measurable, Achievable, Relevant, Time-bound');
  } else {
    issues.push('Success metrics missing - define how you\'ll measure success');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score completeness (20 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreCompleteness(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // All required sections present (0-8 pts)
  const sections = detectSections(text);
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.85) {
    score += 8;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} required sections present`);
  } else if (sectionPercentage >= 0.70) {
    score += 5;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    score += 2;
    issues.push(`Only ${sections.found.length} of ${REQUIRED_SECTIONS.length} sections present`);
  }

  // Stakeholders clearly identified (0-6 pts)
  const stakeholderDetection = detectStakeholders(text);
  if (stakeholderDetection.hasStakeholderSection && stakeholderDetection.hasRoles) {
    score += 6;
    strengths.push('Stakeholders and roles clearly identified');
  } else if (stakeholderDetection.hasStakeholders) {
    score += 3;
    issues.push('Stakeholders mentioned but roles not clearly defined');
  } else {
    issues.push('Stakeholders not identified - list who\'s involved and their roles');
  }

  // Timeline is realistic and phased (0-6 pts)
  const timelineDetection = detectTimeline(text);
  if (timelineDetection.hasTimelineSection && timelineDetection.hasPhasing) {
    score += 6;
    strengths.push('Timeline is phased and realistic');
  } else if (timelineDetection.hasTimeline) {
    score += 3;
    issues.push('Timeline present but lacks clear phasing');
  } else {
    issues.push('Timeline missing - provide realistic milestones and phases');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a one-pager and return comprehensive scoring results
 * @param {string} text - One-pager content
 * @returns {Object} Complete validation results
 */
export function validateOnePager(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      problemClarity: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      solution: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      scope: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      completeness: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  const problemClarity = scoreProblemClarity(text);
  const solution = scoreSolutionQuality(text);
  const scope = scoreScopeDiscipline(text);
  const completeness = scoreCompleteness(text);

  // Circular logic detection - per prompts.js line 49, cap at 50 if detected
  const circularLogic = detectCircularLogic(text);
  const circularIssues = [];
  if (circularLogic.isCircular) {
    circularIssues.push(
      'CIRCULAR LOGIC DETECTED: Solution is just the inverse of the problem. Address the ROOT CAUSE instead.'
    );
  }

  // Baseline→Target format detection
  const baselineTarget = detectBaselineTarget(text);
  const baselineIssues = [];
  if (baselineTarget.hasVagueMetrics && !baselineTarget.hasBaselineTarget) {
    baselineIssues.push(
      'Vague metrics without baselines. Use [Current] → [Target] format (e.g., "100/day → 30/day")'
    );
  }

  // AI slop detection - executive summaries should be crisp and specific
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // Apply penalty to total score (max 5 points for one-pagers)
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  let rawScore = problemClarity.score + solution.score + scope.score + completeness.score - slopDeduction;

  // CRITICAL: Cap at 50 if circular logic detected (per prompts.js line 49)
  const isCircularCapped = circularLogic.isCircular && rawScore > 50;
  const totalScore = Math.max(0, isCircularCapped ? 50 : rawScore);

  return {
    totalScore,
    problemClarity,
    solution,
    scope,
    completeness,
    // Dimension mappings for app.js compatibility
    dimension1: problemClarity,
    dimension2: solution,
    dimension3: scope,
    dimension4: completeness,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    },
    // New detections from self-prompting experiment
    circularLogic: {
      ...circularLogic,
      capped: isCircularCapped,
      issues: circularIssues
    },
    baselineTarget: {
      ...baselineTarget,
      issues: baselineIssues
    }
  };
}
