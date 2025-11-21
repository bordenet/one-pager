# AI Agent Autonomous Prompt Tuning Guide

**For: Claude Code (AI Agent) - Autonomous Execution**

## 🎯 Purpose & Context

This tool enables you (Claude) to autonomously improve LLM prompts in any repository without human guidance. You will simulate the LLM responses and apply the proven methodology that achieved +12% quality improvements in the one-pager project.

## 🚀 When to Use This Tool

**Trigger Conditions:**
- Repository contains `prompts/` directory with `.md` files
- User requests "improve prompts" or "optimize LLM workflows"
- Repository has multi-phase LLM workflows (Phase 1 → Phase 2 → Phase 3)
- Quality issues detected in LLM outputs (too short, technical focus, poor business impact)

**Expected Outcomes:**
- +12% overall quality improvement
- +24% improvement in initial drafts (Phase 1)
- +14% improvement in synthesis (Phase 3)
- 100% compliance with word count targets (500-700 words)
- Business-focused, strategic framing vs. technical framing

## 🔧 Autonomous Execution Steps

### Step 1: Initialize Project
```bash
python prompt_tuning_tool.py init <repo-name>
```
**What this does:** Creates test cases, results directory, configuration

### Step 2: Analyze Current Prompts
**Your task:** Examine `prompts/phase1.md`, `prompts/phase2.md`, `prompts/phase3.md`
**Look for:** Word count issues, technical vs. business framing, missing examples

### Step 3: Create Realistic Test Cases
**Edit:** `prompt_tuning_results_<repo>/test_cases_<repo>.json`
**Include:** 5-10 test cases representing the repository's domain
**Ensure:** Variety in complexity, industry, stakeholder types

### Step 4: Run Evolutionary Tuning
```bash
python prompt_tuning_tool.py evolve <repo-name>
```
**What happens:** Tool runs simulations, applies mutations, keeps improvements

### Step 5: Deploy Improved Prompts
**Copy:** Improved prompts from `prompt_tuning_results_<repo>/phase*_iter*.md` to `prompts/`
**Verify:** Word counts, business framing, strategic positioning

## 🎭 AI Agent Mock Mode

**Key:** You don't need real API keys - the tool runs in mock mode when you execute it.

**Mock Response Strategy:**
- **Phase 1:** Generate business-focused, 550-650 word initial drafts
- **Phase 2:** Create deliberately different strategic alternatives
- **Phase 3:** Synthesize best elements, maintain 600-700 words

**Quality Patterns to Simulate:**
- Lead with business crisis, not technical issues
- Include specific metrics and stakes
- Use strategic language ("competitive advantage", "market opportunity")
- Structure with clear headers and bullet points
- End with clear next steps and timelines

## 📊 Success Metrics to Achieve

**Target Scores (1-5 scale):**
- Overall: ≥4.0 (stretch goal: ≥4.5)
- Clarity: ≥4.0 (structure, readability)
- Conciseness: ≥4.2 (word count compliance)
- Impact: ≥4.5 (business framing, urgency)
- Feasibility: ≥4.0 (timeline, resources)
- Completeness: ≥4.6 (all required sections)

**Stopping Criteria:**
- Target achieved with 5+ iterations
- Stretch goal achieved
- Diminishing returns (<0.05 improvement for 3 iterations)
- Max 20 iterations reached

## 🔄 Proven Improvement Patterns

**Apply These Mutations:**

1. **Word Count Enforcement**
   - Change "Maximum 1 page (500-700 words)"
   - To "**minimum of 500 words** to ensure sufficient detail"

2. **Strategic Framing**
   - Add business impact guidelines
   - Emphasize crisis positioning over technical issues
   - Include cost of inaction language

3. **Concrete Examples**
   - Add before/after examples in prompts
   - Show weak vs. strong problem statements
   - Demonstrate strategic vs. technical framing

4. **Synthesis Improvement**
   - Change "Maintain Conciseness" to "Combine, Don't Compress"
   - Add conflict resolution heuristics
   - Target 550-700 words for synthesis

## 📝 Autonomous Decision Making

**Keep Mutations When:**
- New score > baseline score (any improvement)
- Word count moves closer to 500-700 range
- Business impact language increases
- Strategic positioning improves

**Discard Mutations When:**
- New score ≤ baseline score
- Word count decreases below 500
- Technical framing increases
- Business impact decreases

## 🎯 Repository-Specific Adaptation

**For Each New Repo:**
1. **Analyze domain:** What type of documents does this repo generate?
2. **Identify stakeholders:** Who reads these documents? (executives, engineers, customers)
3. **Understand context:** What business problems does this repo solve?
4. **Adapt test cases:** Create scenarios relevant to the repo's purpose
5. **Customize scoring:** Weight criteria based on repo's primary use case

## 📋 Execution Checklist

- [ ] Repository has `prompts/` directory
- [ ] Initialize project with `init` command
- [ ] Create 5-10 realistic test cases for the domain
- [ ] Run evolutionary tuning with `evolve` command
- [ ] Verify improvements meet success metrics
- [ ] Deploy improved prompts to `prompts/` directory
- [ ] Document results in commit message
- [ ] Add attribution footer to Phase 3 outputs

## 🏆 Expected Results

**Before:** Generic, technical, under-length prompts producing inconsistent outputs
**After:** Business-focused, strategic, properly-sized prompts producing executive-ready documents

**Time Investment:** 30 minutes autonomous execution vs. 8+ hours manual tuning
**Quality Improvement:** +12% average, up to +24% for initial drafts

This tool transforms any repository's LLM prompts from basic templates into sophisticated guidance systems that consistently produce high-quality, business-focused outputs.
