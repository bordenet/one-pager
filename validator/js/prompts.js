/**
 * Prompt generation for LLM-based One-Pager scoring
 *
 * IMPORTANT: Scoring categories MUST match validator.js exactly:
 * - Problem Clarity (30 pts)
 * - Solution Quality (25 pts)
 * - Scope Discipline (25 pts)
 * - Completeness (20 pts)
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} onePagerContent - The one-pager content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(onePagerContent) {
  return `You are an expert Product Manager evaluating a One-Pager document.

Score this One-Pager using the following rubric (0-100 points total).

## SCORING RUBRIC (Must match JavaScript validator exactly)

### 1. Problem Clarity (30 points)
- **Problem Statement (10 pts)**: Dedicated problem section with clear ROOT CAUSE, not just symptoms
- **Cost of Doing Nothing (10 pts)**: REQUIRED. Quantified impact with specific $ or % numbers
- **Business Focus (10 pts)**: Problem tied to customer/business value (keywords: customer, user, revenue, market, strategic)

### 2. Solution Quality (25 points)
- **Solution Addresses Problem (10 pts)**: Dedicated solution section that bridges to stated problem
- **Measurable Goals (10 pts)**: Goals with [Baseline] → [Target] format, not vague claims
- **High-Level Approach (5 pts)**: Solution stays strategic (no implementation details like code, API, database)

### 3. Scope Discipline (25 points)
- **In-Scope Defined (8 pts)**: Explicit "in-scope" or "we will" statements with dedicated section
- **Out-of-Scope Defined (9 pts)**: Explicit "out-of-scope" or "we will not" statements
- **SMART Metrics (8 pts)**: Success metrics with [Current] → [Target] by [Date] format

### 4. Completeness (20 points)
- **Required Sections (8 pts)**: Problem, Solution, Goals, Scope, Metrics, Stakeholders, Timeline sections present
- **Stakeholders Identified (6 pts)**: Owner, approvers, RACI roles defined
- **Timeline Phased (6 pts)**: Milestones with dates, phased approach

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

## ONE-PAGER TO EVALUATE

\`\`\`
${onePagerContent}
\`\`\`

<output_rules>
Your response must be EXACTLY in this format - no deviations:
- Start with "**LOGICAL BRIDGE CHECK:**" (no preamble)
- End after "Top 3 Strengths" (no sign-off)
- NO markdown code fences wrapping your response
</output_rules>

## REQUIRED OUTPUT FORMAT

**LOGICAL BRIDGE CHECK: [PASS/FAIL]**
[If FAIL: "Solution is inverse of problem - score capped at 50"]

**TOTAL SCORE: [X]/100**

### Problem Clarity: [X]/30
[2-3 sentence justification. Does it have REQUIRED Cost of Doing Nothing with specific $ or %?]

### Solution Quality: [X]/25
[2-3 sentence justification. Does solution address root cause? Goals in [Baseline] → [Target] format?]

### Scope Discipline: [X]/25
[2-3 sentence justification. In-scope AND out-of-scope defined? SMART metrics with baselines?]

### Completeness: [X]/20
[2-3 sentence justification. All sections present? Stakeholders and timeline defined?]

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
- Scope Discipline: ${currentResult.scope?.score || 0}/25
- Completeness: ${currentResult.completeness?.score || 0}/20

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
   - Problem Clarity: Is the root cause clear? Cost of Doing Nothing quantified?
   - Solution Quality: Does it address root cause? Measurable goals?
   - Scope Discipline: In-scope AND out-of-scope defined? SMART metrics?
   - Completeness: All sections present? Stakeholders and timeline?
3. **Revised One-Pager** - A complete rewrite addressing all issues

<output_rules>
- Start with "## Executive Summary" (no preamble)
- End with the revised one-pager (no sign-off)
- NO markdown code fences wrapping the output
- Revised one-pager must be ready to paste
</output_rules>

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

Create a complete, polished One-Pager that scores 85+ across all dimensions:

**Problem Clarity (30 pts):**
- Root cause problem statement (not symptoms)
- Cost of Doing Nothing with specific $ or % (REQUIRED)
- Business/customer focus

**Solution Quality (25 pts):**
- Solution addresses root cause (not inverse of problem)
- Measurable goals in [Baseline] → [Target] format
- High-level approach (no implementation details)

**Scope Discipline (25 pts):**
- In-scope AND out-of-scope explicitly defined
- SMART metrics: [Current] → [Target] by [Date]

**Completeness (20 pts):**
- All sections: Problem, Solution, Goals, Scope, Metrics, Stakeholders, Timeline
- Owner and approvers identified
- Phased timeline with milestones

**Additional Requirements:**
- Maximum 450 words
- No vague qualifiers, weasel words, marketing fluff
- Passes LOGICAL BRIDGE CHECK (solution ≠ inverse of problem)

<output_rules>
- Output ONLY the rewritten One-Pager
- Start with "# [Project Name]" (no preamble)
- End after Timeline section (no sign-off)
- NO markdown code fences wrapping the output
- Ready to paste directly
</output_rules>`;
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
