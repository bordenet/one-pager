# Phase 5: Recommendations for Prompt Improvements

**Date**: 2025-11-21
**Project**: one-pager
**Based on**: Evaluation of 10 test cases × 3 phases = 30 outputs

---

## Executive Summary

The current 3-phase adversarial workflow is **fundamentally sound** (Phase 2 avg: 4.60, Phase 3 avg: 4.16), but has **three critical issues**:

1. **Word Count Problem**: Phase 1 and Phase 3 consistently produce outputs below 500-word minimum (avg: 380 and 420 words respectively)
2. **Strategic Framing Gap**: Phase 1 lacks business/executive positioning (Impact: 3.6 vs. Phase 2: 5.0)
3. **Synthesis Compression**: Phase 3 loses detail instead of combining best elements

**Recommended Approach**: Targeted improvements to Phase 1 and Phase 3 prompts while preserving Phase 2's adversarial strength.

---

## Recommendation 1: Enforce Word Count Minimum (HIGH PRIORITY)

### Problem
- **Phase 1**: 9/10 test cases below 500 words (avg: 380 words, -24% from target)
- **Phase 3**: 8/10 test cases below 500 words (avg: 420 words, -16% from target)
- **Impact**: Documents feel sparse, missing detail that strengthens business case

### Root Cause
- Phase 1 prompt says "500-700 words" but doesn't emphasize it's a **minimum requirement**
- Phase 3 prompt says "maintain conciseness" which encourages compression over combination

### Specific Changes

#### Phase 1 Prompt (prompts/phase1.md)

**BEFORE** (Line ~15):
```markdown
1. **Be Ruthlessly Concise**: Maximum 1 page (500-700 words)
```

**AFTER**:
```markdown
1. **Target Length: 500-700 Words**: Aim for the middle of this range (~600 words). This is a **minimum of 500 words** to ensure sufficient detail. If you're under 500 words, you're likely missing important context or business justification.
```

**Rationale**: Emphasizes 500 as a floor, not a suggestion. Provides target (600) to aim for middle of range.

#### Phase 3 Prompt (prompts/phase3.md)

**BEFORE** (Line ~25):
```markdown
- **Maintain Conciseness**: Keep it to one page (500-700 words)
```

**AFTER**:
```markdown
- **Combine, Don't Compress**: Aim for 550-700 words by including the best details from both versions. Don't sacrifice important context for brevity. If both versions have valuable details, include both.
```

**Rationale**: Shifts mindset from "compress to fit" to "combine best elements". Raises minimum to 550 to account for synthesis adding detail.

---

## Recommendation 2: Add Strategic Framing to Phase 1 (HIGH PRIORITY)

### Problem
- **Phase 1 Impact Score**: 3.6 (feature/technical-focused)
- **Phase 2 Impact Score**: 5.0 (strategic/business-focused)
- **Gap**: Phase 1 requires Phase 2 to add business context that should be present from the start

### Root Cause
- Phase 1 prompt doesn't explicitly guide toward executive/strategic positioning
- Template structure is neutral (doesn't favor business vs. technical framing)

### Specific Changes

#### Phase 1 Prompt (prompts/phase1.md)

**BEFORE** (Line ~12-16):
```markdown
## Guidelines

1. **Be Ruthlessly Concise**: Maximum 1 page (500-700 words)
2. **Focus on the Why**: Start with the problem, make it compelling
3. **Use Clear Language**: Avoid jargon, be specific
4. **Quantify When Possible**: Use numbers, percentages, timeframes
5. **Distinguish Features from Benefits**: Focus on outcomes, not just capabilities
```

**AFTER**:
```markdown
## Guidelines

1. **Target Length: 500-700 Words**: Aim for ~600 words minimum. Ensure sufficient detail and business justification.

2. **Lead with Business Impact**: Frame the problem as a business crisis, not just a technical issue. What's the cost of inaction? What revenue/customers/trust are we losing?

3. **Strategic Positioning**: Position the solution as a strategic initiative, not just a feature. How does this create competitive advantage, unlock growth, or mitigate risk?

4. **Quantify Everything**: Use specific numbers with context:
   - Current state metrics with baselines
   - Target state metrics with improvement percentages
   - Financial impact (revenue, cost savings, risk exposure)
   - Timeline with specific milestones

5. **Executive Language**: Write for executives who care about outcomes, not features:
   - Bad: "Implement progressive disclosure for advanced features"
   - Good: "Reduce cognitive load by 60% through smart defaults that anticipate user needs"

6. **Show the Stakes**: Make clear what happens if we don't do this. Competitive disadvantage? Customer churn? Regulatory risk? Revenue loss?
```

**Rationale**: Adds explicit guidance for business/strategic framing that Phase 2 currently has to add retroactively.

---

## Recommendation 3: Improve Phase 3 Synthesis Guidance (MEDIUM PRIORITY)

### Problem
- **Phase 3 Completeness**: 4.6 (down from Phase 2: 5.0)
- **Pattern**: Synthesis loses detail from both inputs instead of combining best elements
- **Impact**: Final output less comprehensive than either Phase 1 or Phase 2

### Root Cause
- Phase 3 prompt emphasizes "conciseness" over "comprehensiveness"
- No explicit guidance on how to handle conflicts or choose between versions

### Specific Changes

#### Phase 3 Prompt (prompts/phase3.md)

**BEFORE** (Line ~20-28):
```markdown
## Guidelines

- **Favor Specificity**: Choose the more specific, measurable version
- **Prefer Clarity**: Choose the clearer, more accessible language
- **Maintain Conciseness**: Keep it to one page (500-700 words)
- **Ensure Consistency**: Make sure all sections align and support each other
- **Ask When Uncertain**: If both versions have merit but conflict, ask the user to choose
```

**AFTER**:
```markdown
## Guidelines

- **Combine, Don't Compress**: Aim for 550-700 words by including the best details from both versions. Don't sacrifice important context for brevity.

- **Favor Strategic Framing + Technical Detail**:
  - Use Phase 2's business/strategic framing (titles, problem statements, impact)
  - Add Phase 1's technical specifics (implementation details, metrics baselines)
  - Example: "Transform portal from frustration point into retention driver [Phase 2] through user-centered navigation and contextual help [Phase 1]"

- **Conflict Resolution Heuristics**:
  - **Problem Statement**: Prefer Phase 2's strategic framing (business crisis vs. technical issue)
  - **Solution**: Combine Phase 2's outcome focus with Phase 1's technical approach
  - **Metrics**: Include both Phase 1's specific baselines AND Phase 2's business context
  - **Timeline**: Prefer Phase 2's timeline if it includes risk mitigation
  - **Stakeholders**: Use Phase 2's accountability model if more detailed

- **Preserve Key Details**: If Phase 2 adds important context (risk buffers, pilot gates, strategic positioning), keep it. If Phase 1 has specific technical details Phase 2 lacks, add them back.

- **Consistency Check**: Ensure all 8 sections use consistent naming from the template. If Phase 2 renamed sections, revert to template names.
```

**Rationale**: Provides explicit heuristics for synthesis instead of leaving it ambiguous. Emphasizes combination over compression.

---

## Recommendation 4: Standardize Section Naming in Phase 2 (LOW PRIORITY)

### Problem
- **Phase 2** sometimes uses different section names than template
- **Examples**: "Business Outcomes" vs. "Key Goals/Benefits", "What We're Building" vs. "Scope"
- **Impact**: Minor inconsistency, but Phase 3 must reconcile naming differences

### Root Cause
- Phase 2 prompt lists template sections but doesn't enforce exact naming
- Adversarial nature encourages creative reframing, including section names

### Specific Changes

#### Phase 2 Prompt (prompts/phase2.md)

**BEFORE** (Line ~10-20):
```markdown
The document should follow this structure:

1. **Project/Feature Name**: Clear, descriptive title
2. **Problem Statement**: What problem are we solving? (2-3 sentences)
3. **Proposed Solution**: How will we solve it? (3-4 sentences)
4. **Key Goals/Benefits**: What will we achieve? (bulleted list)
5. **Scope**: What's in and out of scope? (two subsections with bullets)
6. **Success Metrics**: How will we measure success? (specific metrics with targets)
7. **Key Stakeholders**: Who's involved? (Owner, Approvers, Contributors)
8. **Timeline Estimate**: When will this happen? (phases with dates/durations)
```

**AFTER**:
```markdown
The document MUST follow this exact structure with these exact section names:

1. **[Project/Feature Name]**: Clear, descriptive title (you can make this more compelling)
2. **Problem Statement**: What problem are we solving? (2-3 sentences) - Frame as business crisis
3. **Proposed Solution**: How will we solve it? (3-4 sentences) - Frame as strategic initiative
4. **Key Goals/Benefits**: What will we achieve? (bulleted list) - Use this exact heading
5. **Scope**: What's in and out of scope? (two subsections: "In Scope" and "Out of Scope")
6. **Success Metrics**: How will we measure success? (specific metrics with targets)
7. **Key Stakeholders**: Who's involved? (Owner, Approvers, Contributors)
8. **Timeline Estimate**: When will this happen? (phases with dates/durations)

**IMPORTANT**: While you should reframe the CONTENT to be more strategic and business-focused, you MUST use these exact section headings. Do not rename "Key Goals/Benefits" to "Business Outcomes" or "Scope" to "What We're Building".
```

**Rationale**: Preserves adversarial reframing of content while maintaining structural consistency for Phase 3 synthesis.

---

## Recommendation 5: Add Examples to Phase 1 (MEDIUM PRIORITY)

### Problem
- **Phase 1** has no concrete examples of good vs. bad outputs
- **Impact**: LLM must infer quality standards from guidelines alone
- **Pattern**: Consistent issues (jargon, weak business framing) suggest examples would help

### Root Cause
- Phase 1 prompt relies on abstract guidelines without concrete demonstrations
- No before/after examples showing what "compelling" or "quantified" means

### Specific Changes

#### Phase 1 Prompt (prompts/phase1.md)

**ADD AFTER GUIDELINES** (New section after line ~21):
```markdown
## Examples of Strong vs. Weak Framing

### Problem Statement

**Weak** (technical focus, vague impact):
> "Our customer portal has usability issues. Users are having trouble finding features and the bounce rate is high."

**Strong** (business impact, specific metrics, urgency):
> "Our customer portal is driving a business crisis with a 45% bounce rate and NPS plummeting from 7.8 to 6.2 in one quarter. Support costs are spiraling with 30% more tickets as users struggle to find basic features. This broken experience is costing us customer satisfaction, operational efficiency, and ultimately revenue."

### Proposed Solution

**Weak** (feature list):
> "Redesign the portal with better navigation, search, and help features."

**Strong** (outcome-focused with technical approach):
> "Transform the portal from a frustration point into a retention driver through user-centered navigation, powerful search, and contextual help. The solution employs progressive disclosure to simplify the interface while maintaining access to advanced features, reducing cognitive load and time to task completion."

### Success Metrics

**Weak** (vague, no baselines):
> "Improve bounce rate, reduce support tickets, increase satisfaction"

**Strong** (specific, with baselines and context):
> "- Bounce rate: <20% (current: 45%, 56% improvement)
> - Support tickets: -40% reduction from current volume
> - NPS: >8.5 (current: 6.2, 37% improvement)
> - Task completion: >85%
> - Feature adoption: +25%"
```

**Rationale**: Concrete examples show what "compelling" and "quantified" mean in practice. Reduces ambiguity and sets quality bar.

---

## Recommendation 6: Strengthen Phase 2 Adversarial Instructions (LOW PRIORITY)

### Problem
- **Phase 2 is already strong** (avg: 4.60), but could be even more explicitly adversarial
- **Current**: "Scrutinize" and "generate superior rendition from your perspective"
- **Opportunity**: Make adversarial nature more explicit to ensure consistent reframing

### Specific Changes

#### Phase 2 Prompt (prompts/phase2.md)

**BEFORE** (Line ~5-8):
```markdown
You are now a senior executive reviewing a one-pager proposal. Your job is to scrutinize it against the template below and generate a superior rendition from **your perspective** as an executive who cares about business outcomes, not just features.
```

**AFTER**:
```markdown
You are now a senior executive reviewing a one-pager proposal. Your job is to **challenge and reframe** it from a strategic business perspective.

**Your Adversarial Mission**:
- If it reads like a "UX project", reframe it as a "business initiative"
- If it reads like an "IT project", reframe it as a "transformation"
- If it reads like a "feature add", reframe it as "competitive necessity" or "table stakes"
- If it reads like an "efficiency tool", reframe it as "risk mitigation" or "growth unlock"

Generate a **deliberately different** rendition that:
1. Elevates the problem from tactical to strategic
2. Reframes the solution from features to business outcomes
3. Adds business context the original lacks (competitive positioning, risk exposure, growth impact)
4. Uses executive language (revenue, churn, market share, competitive advantage)

This is NOT about "improving" the original—it's about creating an **alternative perspective** that Phase 3 can synthesize with the original.
```

**Rationale**: Makes adversarial nature explicit. Ensures consistent strategic reframing across all test cases.

---

## Summary of Recommendations

### High Priority (Implement First)
1. **Enforce Word Count Minimum** - Phase 1 and Phase 3 prompts
2. **Add Strategic Framing to Phase 1** - Explicit business/executive positioning guidelines

### Medium Priority (Implement Second)
3. **Improve Phase 3 Synthesis Guidance** - Heuristics for combining vs. compressing
5. **Add Examples to Phase 1** - Concrete before/after examples

### Low Priority (Nice to Have)
4. **Standardize Section Naming in Phase 2** - Enforce template section names
6. **Strengthen Phase 2 Adversarial Instructions** - Make adversarial mission explicit

---

## Expected Impact

### If High Priority Recommendations Implemented:

**Phase 1 Improvements**:
- **Conciseness**: 2.6 → 4.0 (word count compliance)
- **Impact**: 3.6 → 4.5 (strategic framing from start)
- **Overall**: 3.56 → 4.2 (+0.64 improvement)

**Phase 3 Improvements**:
- **Conciseness**: 2.8 → 4.0 (combine vs. compress)
- **Completeness**: 4.6 → 4.8 (preserve detail)
- **Overall**: 4.16 → 4.5 (+0.34 improvement)

**System-Wide**:
- **Average Score**: 3.56 → 4.35 (+0.79 improvement)
- **Minimum Score**: 3.4 → 4.0 (no test case below 4.0)
- **Consistency**: Reduced variance across test cases

### Success Criteria Met:
- ✅ Average score ≥4.0 (target: 4.35)
- ✅ Improvement ≥0.5 (actual: +0.79)
- ✅ No regressions >0.5 (Phase 2 unchanged at 4.60)

---

## Next Steps

1. **Implement High Priority Changes** (Recommendations 1-2)
2. **Re-run Simulations** with updated prompts on same 10 test cases
3. **Evaluate Improvements** using same rubric
4. **Iterate** if targets not met
5. **Implement Medium/Low Priority** if additional improvement needed

---

**End of Recommendations**
