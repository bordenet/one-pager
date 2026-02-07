/**
 * Prompt generation for LLM-based One-Pager scoring
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} onePagerContent - The one-pager content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(onePagerContent) {
  return `You are an expert Product Manager evaluating a One-Pager document.

Score this One-Pager using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Problem Clarity (30 points)
- **Problem Statement (10 pts)**: Clear ROOT CAUSE, not just symptoms. Not circular.
- **Cost of Doing Nothing (10 pts)**: REQUIRED. Quantified impact with specific $ or %
- **Business Focus (10 pts)**: Problem tied to customer/business value, not just technical

### 2. Solution Quality (25 points)
- **Logical Bridge (10 pts)**: Solution addresses root cause. NOT just inverse of problem.
- **Measurable Goals (10 pts)**: Goals in [Baseline] → [Target] format, not vague
- **Alternatives Considered (5 pts)**: Why this over "do nothing" or Solution B?

### 3. Investment Logic (20 points)
- **The Ask (10 pts)**: Clear effort + cost required (headcount, budget, time)
- **ROI Evidence (10 pts)**: Does the Investment justify the Cost of Doing Nothing?

### 4. Risks & Assumptions (15 points)
- **Key Assumptions (7 pts)**: What must be true for this to work?
- **Top Risks (8 pts)**: What could kill this project? Mitigation identified?

### 5. Scope & Metrics (10 points)
- **Scope Discipline (5 pts)**: In-scope AND out-of-scope clearly defined (brief, not padded)
- **SMART Metrics (5 pts)**: [Current] → [Target] by [Date]

## ⚠️ CRITICAL: LOGICAL BRIDGE CHECK

**Before scoring, answer this question:**
> Is the solution simply the inverse of the problem?
> Example: Problem: "We don't have a dashboard" → Solution: "Build a dashboard"

If YES, this is CIRCULAR LOGIC. Cap total score at 50 maximum regardless of other scores.

A valid solution addresses the ROOT CAUSE:
> Problem: "Support tickets increased 40% due to lack of visibility into order status"
> Solution: "Provide real-time order tracking to reduce support burden by 30%"

## CALIBRATION GUIDANCE
- Be HARSH. Most one-pagers score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for executive decision-making.
- One-pagers should fit on ONE PAGE (450 words max) - deduct points for verbosity.
- Deduct points for EVERY vague qualifier without [Baseline] → [Target] metrics.
- Deduct points for weasel words ("should be able to", "might", "could potentially").
- Deduct points for marketing fluff ("best-in-class", "cutting-edge", "world-class").
- Deduct points for superlative adjectives ("revolutionary", "seamless", "groundbreaking").
- Reward explicit scope boundaries (brief, not padded for points).
- Reward quantified metrics with baselines AND targets.
- Deduct points for missing Cost of Doing Nothing (REQUIRED section).
- Deduct points for missing Investment/The Ask section.

## ONE-PAGER TO EVALUATE

\`\`\`
${onePagerContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**LOGICAL BRIDGE CHECK: [PASS/FAIL]**
[If FAIL: "Solution is inverse of problem - score capped at 50"]

**TOTAL SCORE: [X]/100**

### Problem Clarity: [X]/30
[2-3 sentence justification. Does it have REQUIRED Cost of Doing Nothing with specific $ or %?]

### Solution Quality: [X]/25
[2-3 sentence justification. Does solution address root cause? Goals in [Baseline] → [Target] format?]

### Investment Logic: [X]/20
[2-3 sentence justification. Clear effort/cost? Does ROI make sense?]

### Risks & Assumptions: [X]/15
[2-3 sentence justification. Key assumptions identified? Top risks with mitigations?]

### Scope & Metrics: [X]/10
[2-3 sentence justification. Brief scope? SMART metrics with baselines?]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} onePagerContent - The one-pager content to critique
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(onePagerContent, currentResult) {
  const issuesList = [
    ...(currentResult.problemClarity?.issues || []),
    ...(currentResult.solution?.issues || []),
    ...(currentResult.scope?.issues || []),
    ...(currentResult.completeness?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are a senior Product Manager providing detailed feedback on a One-Pager.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Problem Clarity: ${currentResult.problemClarity?.score || 0}/30
- Solution Quality: ${currentResult.solution?.score || 0}/25
- Investment Logic: ${currentResult.investmentLogic?.score || 0}/20
- Risks & Assumptions: ${currentResult.risksAssumptions?.score || 0}/15
- Scope & Metrics: ${currentResult.scopeMetrics?.score || 0}/10

Key issues detected:
${issuesList || '- None detected by automated scan'}

## ONE-PAGER TO CRITIQUE

\`\`\`
${onePagerContent}
\`\`\`

## YOUR TASK

First, perform the LOGICAL BRIDGE CHECK:
> Is the solution simply the inverse of the problem? (e.g., "No dashboard" → "Build dashboard")
> If YES, this is the primary issue to fix.

Then provide:
1. **Executive Summary** (2-3 sentences on overall one-pager quality)
2. **Detailed Critique** by dimension:
   - What works well
   - What needs improvement
   - Specific suggestions with examples
3. **Revised One-Pager** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Keep it to 450 words max. Make it ready for executive decision-making.`;
}

/**
 * Generate rewrite prompt
 * @param {string} onePagerContent - The one-pager content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(onePagerContent, currentResult) {
  return `You are a senior Product Manager rewriting a One-Pager to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL ONE-PAGER

\`\`\`
${onePagerContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished One-Pager that:
1. Fits in 450 words max (concise, executive-focused)
2. Has all required sections:
   - Problem Statement (root cause, not symptoms)
   - Cost of Doing Nothing (REQUIRED - specific $ or %)
   - Proposed Solution & Alternatives (why this over alternatives?)
   - Key Goals/Benefits (outcomes in [Baseline] → [Target] format)
   - The Investment (effort + cost)
   - Risks & Assumptions (key assumption + top risk with mitigation)
   - Scope (brief in-scope AND out-of-scope)
   - Success Metrics ([Current] → [Target] by [Date])
   - Key Stakeholders (owner + approvers)
   - Timeline (milestones with dates)
3. Passes LOGICAL BRIDGE CHECK - solution addresses root cause, not inverse of problem
4. Passes ROI SANITY CHECK - Investment proportional to Cost of Doing Nothing
5. All metrics have [Baseline] → [Target] → [Timeline]
6. No vague qualifiers, weasel words, marketing fluff, or superlative adjectives
7. Stays high-level (no implementation details)

Output ONLY the rewritten One-Pager in markdown format. No commentary.`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  // Remove common prefixes
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');

  // Extract content from markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  return cleaned.trim();
}
