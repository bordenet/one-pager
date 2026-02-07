/**
 * Document-Specific Templates for One-Pager
 * Pre-filled content for common one-pager use cases
 * @module document-specific-templates
 */

/**
 * @typedef {Object} OnePagerTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} problemStatement - Pre-filled problem statement
 * @property {string} costOfDoingNothing - Pre-filled cost of inaction
 * @property {string} context - Pre-filled context
 * @property {string} proposedSolution - Pre-filled proposed solution
 * @property {string} keyGoals - Pre-filled key goals
 * @property {string} scopeInScope - Pre-filled in-scope items
 * @property {string} scopeOutOfScope - Pre-filled out-of-scope items
 * @property {string} successMetrics - Pre-filled success metrics
 * @property {string} keyStakeholders - Pre-filled stakeholders
 * @property {string} timelineEstimate - Pre-filled timeline
 */

/** @type {Record<string, OnePagerTemplate>} */
export const DOCUMENT_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    problemStatement: '',
    costOfDoingNothing: '',
    context: '',
    proposedSolution: '',
    keyGoals: '',
    scopeInScope: '',
    scopeOutOfScope: '',
    successMetrics: '',
    keyStakeholders: '',
    timelineEstimate: ''
  },
  statusUpdate: {
    id: 'statusUpdate',
    name: 'Status Update',
    icon: '📊',
    description: 'Weekly progress snapshot',
    problemStatement: '[Project Name] - Weekly Status Update for [Week/Date]',
    costOfDoingNothing: 'Stakeholders lack visibility into current progress and blockers',
    context: 'Current roadmap phase: [Phase]\nPrevious week accomplishments: [List]',
    proposedSolution: 'Key activities this week:\n- [Activity 1]\n- [Activity 2]\n- [Activity 3]',
    keyGoals: '- Complete [milestone]\n- Unblock [dependency]\n- Prepare for [upcoming work]',
    scopeInScope: 'This week\'s committed deliverables',
    scopeOutOfScope: 'Deferred items and future phases',
    successMetrics: '- [X] tasks completed\n- [Y] blockers resolved\n- On track for [target date]',
    keyStakeholders: 'Owner: [Name]\nReviewer: [Name]\nInformed: [Team/Group]',
    timelineEstimate: 'Next milestone: [Date]\nTarget completion: [Date]'
  },
  featurePitch: {
    id: 'featurePitch',
    name: 'Feature Pitch',
    icon: '🚀',
    description: 'Propose a new feature',
    problemStatement: 'Customers are experiencing [pain point] when trying to [action], resulting in [negative outcome]',
    costOfDoingNothing: '$[X] lost revenue per [period]\n[Y]% customer churn attributed to this gap\n[Z] support tickets per month',
    context: 'Market gap: [Competitor analysis]\nCustomer feedback: [Data source]\nStrategic alignment: [Initiative]',
    proposedSolution: 'Build [feature] that enables [capability] by [approach]',
    keyGoals: '- Reduce [pain metric] by [X]%\n- Increase [positive metric] by [Y]%\n- Enable [new capability]',
    scopeInScope: '- Core functionality\n- Integration with [system]\n- [Platform] support',
    scopeOutOfScope: '- Advanced analytics (Phase 2)\n- [Other platform] support\n- Legacy migration',
    successMetrics: '- [Metric 1]: Target [value]\n- [Metric 2]: Target [value]\n- Customer satisfaction: [NPS target]',
    keyStakeholders: 'Sponsor: [Exec]\nProduct: [PM]\nEngineering: [Lead]\nDesign: [Designer]',
    timelineEstimate: 'Discovery: [X] weeks\nBuild: [Y] weeks\nLaunch: [Target quarter]'
  },
  budgetAsk: {
    id: 'budgetAsk',
    name: 'Budget Ask',
    icon: '💰',
    description: 'Request resources/budget',
    problemStatement: 'Current capacity constraint: [describe bottleneck]\nImpact: Unable to deliver [X] due to [limitation]',
    costOfDoingNothing: 'Delayed roadmap by [X] months\n$[Y] opportunity cost\n[Z] team burnout risk',
    context: 'Current state: [Team size, tools, infrastructure]\nDemand: [Growth projections, commitments]',
    proposedSolution: 'Request: $[amount] for [headcount/tools/infrastructure]\nBreakdown:\n- [Item 1]: $[cost]\n- [Item 2]: $[cost]',
    keyGoals: '- Unlock [capability]\n- Reduce [bottleneck] by [X]%\n- Enable [strategic initiative]',
    scopeInScope: 'FY[Year] investment\n[Specific roles/tools/resources]',
    scopeOutOfScope: 'Future fiscal years\nContingent requests',
    successMetrics: 'ROI: [X]% in [timeframe]\nPayback period: [months]\nCapacity increase: [Y]%',
    keyStakeholders: 'Requestor: [Name]\nApprover: [Finance/Exec]\nBeneficiary: [Team]',
    timelineEstimate: 'Decision needed: [Date]\nOnboarding/setup: [Duration]\nFull productivity: [Date]'
  },
  techDebtPitch: {
    id: 'techDebtPitch',
    name: 'Tech Debt Pitch',
    icon: '🔧',
    description: 'Target specific technical debt',
    problemStatement: 'SPECIFIC SYSTEM/COMPONENT: [Exact file/module/service name]\nSPECIFIC PROBLEM: [Concrete technical issue - not "messy code" but "N+1 queries in UserService.getProfile() causing 500ms p95 latency"]',
    costOfDoingNothing: 'Quantified impact:\n- [X]ms added latency per request\n- $[Y]/month in infrastructure costs\n- [Z] hours/week developer productivity loss\n- [N] incidents in past [period] traced to this',
    context: 'Root cause: [When/why this was introduced]\nCurrent workarounds: [Band-aids in place]\nEvidence: [Links to metrics, incidents, profiling data]',
    proposedSolution: 'SPECIFIC CHANGE: [Exact refactoring - e.g., "Replace N+1 queries with single JOIN query + caching layer"]\nApproach: [Technical strategy]\nRisks mitigated: [How we\'ll avoid breaking things]',
    keyGoals: '- Reduce [specific metric] from [current] to [target]\n- Eliminate [specific failure mode]\n- Enable [blocked capability]',
    scopeInScope: '- [Specific file/module/service]\n- [Exact boundaries of refactoring]\n- Backward compatibility maintained',
    scopeOutOfScope: '- Related but separate issues (link to separate pitches)\n- "While we\'re here" improvements\n- Broader architectural changes',
    successMetrics: 'Before/After comparison:\n- [Metric 1]: [current] → [target]\n- [Metric 2]: [current] → [target]\n- Incident rate: [current] → [target]',
    keyStakeholders: 'Engineer: [Name]\nTech Lead: [Name]\nProduct (for prioritization): [PM]',
    timelineEstimate: 'Investigation: [X] days\nImplementation: [Y] days\nValidation: [Z] days\nTotal: [N] days'
  },
  riskRegister: {
    id: 'riskRegister',
    name: 'Risk Register',
    icon: '⚠️',
    description: 'Flag project risks early',
    problemStatement: '[Project name] has identified risks that could impact delivery or quality',
    costOfDoingNothing: 'Unmitigated risks could result in:\n- [X]% probability of [outcome]\n- $[Y] potential cost\n- [Z] weeks delay',
    context: 'Project phase: [Current stage]\nKey dependencies: [List]\nPrevious risk events: [Lessons learned]',
    proposedSolution: 'Risk inventory:\n\n1. [Risk name] - Probability: [H/M/L], Impact: [H/M/L]\n   Mitigation: [Action]\n\n2. [Risk name] - Probability: [H/M/L], Impact: [H/M/L]\n   Mitigation: [Action]',
    keyGoals: '- Identify all High/Medium risks\n- Assign mitigation owners\n- Establish monitoring cadence',
    scopeInScope: 'Risks within project control\nMitigation strategies\nContingency plans',
    scopeOutOfScope: 'Organizational risks outside project scope\nLong-term strategic risks',
    successMetrics: '- All High risks have mitigation plans\n- Weekly risk review completed\n- No surprise blockers at launch',
    keyStakeholders: 'Risk Owner: [PM/TPM]\nMitigation Owners: [Names]\nEscalation: [Manager]',
    timelineEstimate: 'Initial assessment: [Date]\nWeekly review: [Day]\nRisk closure target: [Date]'
  },
  experimentPlan: {
    id: 'experimentPlan',
    name: 'Experiment Plan',
    icon: '🧪',
    description: 'A/B test hypothesis',
    problemStatement: 'Hypothesis: [Specific change] will improve [metric] because [reasoning based on data/research]',
    costOfDoingNothing: 'Continue with unvalidated assumptions\nMiss opportunity to improve [metric] by estimated [X]%',
    context: 'Current baseline: [Metric] = [value]\nUser research insight: [Finding]\nCompetitor/industry data: [Benchmark]',
    proposedSolution: 'Experiment design:\n- Control: [Current experience]\n- Treatment: [Proposed change]\n- Traffic split: [X]% / [Y]%\n- Duration: [N] days ([sample size calculation])',
    keyGoals: '- Validate/invalidate hypothesis\n- Measure impact on [primary metric]\n- Understand effect on [secondary metrics]',
    scopeInScope: 'Primary metric: [Metric]\nSecondary metrics: [List]\nUser segment: [Who]',
    scopeOutOfScope: 'Other variations (future experiments)\nLong-term behavior changes\nQualitative feedback',
    successMetrics: 'Success criteria:\n- [Primary metric] improves by ≥[X]%\n- No degradation in [guardrail metrics]\n- Statistical significance: p < 0.05',
    keyStakeholders: 'Experiment owner: [PM/Designer]\nAnalyst: [Name]\nEngineering: [Name]',
    timelineEstimate: 'Setup: [X] days\nRun time: [Y] days\nAnalysis: [Z] days\nDecision: [Date]'
  },
  crossTeamAlignment: {
    id: 'crossTeamAlignment',
    name: 'Cross-Team Alignment',
    icon: '🤝',
    description: 'Coordinate dependencies',
    problemStatement: '[Your team] needs [dependency] from [Other team] to deliver [capability] by [date]',
    costOfDoingNothing: 'Misaligned delivery dates\nDuplicated effort\nIntegration failures at launch',
    context: 'Your team\'s goal: [Objective]\nTheir team\'s goal: [Objective]\nShared dependency: [What]\nCurrent status: [State]',
    proposedSolution: 'Coordination plan:\n- [Team A] delivers [X] by [date]\n- [Team B] delivers [Y] by [date]\n- Integration point: [Where/how]\n- Communication cadence: [Frequency]',
    keyGoals: '- Synchronized delivery dates\n- Clear interface contracts\n- Shared success metrics',
    scopeInScope: 'This project\'s dependencies\nDirect integration points\nShared milestones',
    scopeOutOfScope: 'Future collaboration (separate discussion)\nOrganizational restructuring\nBudget/headcount',
    successMetrics: '- All dependencies delivered on time\n- Zero integration blockers\n- Joint launch success',
    keyStakeholders: 'Your team: [Lead]\nPartner team: [Lead]\nShared exec: [Name]\nTPM: [Name]',
    timelineEstimate: 'Alignment meeting: [Date]\nCheckpoint 1: [Date]\nCheckpoint 2: [Date]\nJoint delivery: [Date]'
  },
  migrationPlan: {
    id: 'migrationPlan',
    name: 'Migration Plan',
    icon: '🔄',
    description: 'Infrastructure/data migration',
    problemStatement: 'Need to migrate [system/data] from [source] to [target] to [achieve outcome]',
    costOfDoingNothing: 'Continued reliance on [legacy system]\n$[X]/month higher costs\n[Y] technical limitations\n[Z] security/compliance risks',
    context: 'Current state: [Architecture]\nTarget state: [Architecture]\nData volume: [Size/scale]\nUser impact: [Who/what]',
    proposedSolution: 'Migration strategy: [Big bang / Phased / Parallel run]\n\nPhases:\n1. [Phase 1]: [Scope] - [Duration]\n2. [Phase 2]: [Scope] - [Duration]\n3. [Phase 3]: [Scope] - [Duration]\n\nRollback plan: [How we revert if needed]',
    keyGoals: '- Zero data loss\n- < [X] minutes downtime\n- Maintain [SLA] throughout\n- Complete by [date]',
    scopeInScope: '[Specific systems/data]\n[User segments]\n[Timeframe]',
    scopeOutOfScope: 'Future migrations (separate plan)\nFeature development during migration\nOrganizational changes',
    successMetrics: '- 100% data integrity verified\n- Performance: [current] → [target]\n- Downtime: < [X] minutes\n- User complaints: < [Y]',
    keyStakeholders: 'Migration lead: [Engineer]\nSRE: [Name]\nProduct: [PM]\nCustomer success: [Name]',
    timelineEstimate: 'Prep: [X] weeks\nMigration: [Y] weeks\nValidation: [Z] weeks\nDecommission old: [Date]'
  },
  vendorEvaluation: {
    id: 'vendorEvaluation',
    name: 'Vendor Evaluation',
    icon: '🏢',
    description: 'Quick vendor comparison',
    problemStatement: 'Need to select [type of tool/service] to solve [specific problem]',
    costOfDoingNothing: 'Continue with [current state]\nOpportunity cost: [X]\nProductivity loss: [Y]',
    context: 'Requirements:\n- Must have: [List]\n- Nice to have: [List]\n- Deal breakers: [List]\n\nBudget: $[X]/[period]\nUsers: [N] people',
    proposedSolution: 'Vendor comparison:\n\n**[Vendor A]**: $[cost]\n✅ Pros: [List]\n❌ Cons: [List]\n\n**[Vendor B]**: $[cost]\n✅ Pros: [List]\n❌ Cons: [List]\n\n**Recommendation**: [Vendor] because [reasoning]',
    keyGoals: '- Meet [X] must-have requirements\n- Stay within budget\n- Minimize integration effort',
    scopeInScope: 'Initial vendor selection\nPOC/trial evaluation\nContract negotiation',
    scopeOutOfScope: 'Long-term vendor strategy\nMulti-year commitments\nCustom development',
    successMetrics: '- Selected vendor meets [X]% of requirements\n- ROI positive within [timeframe]\n- Team adoption > [Y]%',
    keyStakeholders: 'Evaluator: [Name]\nBudget owner: [Manager]\nEnd users: [Team]\nProcurement: [Name]',
    timelineEstimate: 'Research: [X] weeks\nTrials: [Y] weeks\nDecision: [Date]\nImplementation: [Z] weeks'
  },
  toolingProposal: {
    id: 'toolingProposal',
    name: 'Tooling Proposal',
    icon: '🛠️',
    description: 'Propose dev tool changes',
    problemStatement: 'Current [tool/process] creates friction: [Specific pain point]\nImpact: [X] hours/week lost, [Y] developer complaints',
    costOfDoingNothing: '[X] hours/week × [N] developers × $[rate] = $[Y]/year\nDeveloper satisfaction impact\nSlower velocity',
    context: 'Current tool: [Name/version]\nPain points: [Specific issues]\nDeveloper feedback: [Quotes/data]\nIndustry trends: [What others use]',
    proposedSolution: 'Adopt [new tool/process]:\n- Solves: [Specific problems]\n- Migration effort: [X] hours\n- Training needed: [Y] hours\n- Ongoing cost: $[Z]/[period]',
    keyGoals: '- Reduce [friction] by [X]%\n- Improve developer satisfaction\n- Increase velocity by [Y]%',
    scopeInScope: '[Specific team/project]\n[Timeframe]\n[Tool/process scope]',
    scopeOutOfScope: 'Company-wide rollout (start with pilot)\nOther tooling changes\nProcess overhaul',
    successMetrics: 'Developer survey: [current] → [target]\nTime saved: [X] hours/week\nAdoption rate: > [Y]%',
    keyStakeholders: 'Proposer: [Engineer]\nTeam lead: [Name]\nEngineering manager: [Name]\nDevOps: [Name]',
    timelineEstimate: 'Pilot: [X] weeks\nEvaluation: [Y] weeks\nRollout decision: [Date]\nFull adoption: [Z] weeks'
  },
  okrAlignment: {
    id: 'okrAlignment',
    name: 'OKR Alignment',
    icon: '🎯',
    description: 'Map work to objectives',
    problemStatement: '[Project/initiative] needs clear connection to company/team OKRs',
    costOfDoingNothing: 'Work that doesn\'t ladder up to goals\nMisaligned priorities\nUnclear success criteria',
    context: 'Company OKR: [Objective]\nTeam OKR: [Objective]\nCurrent project: [Name]\nAlignment gap: [What\'s unclear]',
    proposedSolution: 'OKR mapping:\n\n**Company O**: [Objective]\n  **KR**: [Key Result] ← This project contributes [X]%\n\n**Team O**: [Objective]\n  **KR**: [Key Result] ← This project delivers [Y]',
    keyGoals: '- Clear line from work to OKRs\n- Quantified contribution to KRs\n- Stakeholder agreement on impact',
    scopeInScope: 'Current quarter OKRs\nThis project\'s contribution\nDirect impact measurement',
    scopeOutOfScope: 'Future quarter planning\nOKR setting process\nOrganizational OKRs',
    successMetrics: '- Project contributes [X]% to [KR]\n- Stakeholders agree on alignment\n- Progress tracked in OKR reviews',
    keyStakeholders: 'Project owner: [Name]\nOKR owner: [Manager]\nExec sponsor: [Name]',
    timelineEstimate: 'Alignment review: [Date]\nQuarterly check-in: [Dates]\nOKR close: [Quarter end]'
  }
};

/**
 * Get a template by ID
 * @param {string} templateId - The template ID
 * @returns {OnePagerTemplate|null} The template or null if not found
 */
export function getTemplate(templateId) {
  return DOCUMENT_TEMPLATES[templateId] || null;
}

/**
 * Get all templates as an array
 * @returns {OnePagerTemplate[]} Array of all templates
 */
export function getAllTemplates() {
  return Object.values(DOCUMENT_TEMPLATES);
}
