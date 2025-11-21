# Prompt for Claude in Genesis Workspace

## 🎯 **IMPLEMENTATION TASK FOR GENESIS**

I need you to implement same-LLM adversarial configuration in Genesis bootstrapping by inspecting and mirroring the validated implementation from the one-pager repository.

## 📋 **INSPECT THESE SPECIFIC FILES FROM one-pager**

- https://github.com/bordenet/one-pager/blob/main/same_llm_adversarial_implementation.js
- https://github.com/bordenet/one-pager/blob/main/tests/same-llm-adversarial.test.js
- https://github.com/bordenet/one-pager/blob/main/SAME_LLM_IMPLEMENTATION_SUMMARY.md

## 🔧 **CRITICAL REQUIREMENT**

When Phase 1 and Phase 2 use the same LLM (detected via matching URLs, endpoints, or provider/model), automatically augment Phase 2 prompts with Gemini personality simulation to maintain adversarial tension.

## 🎯 **KEY IMPLEMENTATION DETAILS TO MIRROR**

### 1. Same-LLM Detection Logic (from same_llm_adversarial_implementation.js)
- Provider/model matching: `phase1.provider === phase2.provider && phase1.model === phase2.model`
- URL matching for LibreChat: `extractBaseUrl(phase1.url) === extractBaseUrl(phase2.url)`
- Endpoint matching: `phase1.endpoint === phase2.endpoint`

### 2. Critical Forget Clause Handling
- Detect patterns: "forget all previous", "ignore previous", "start fresh", "new session", "clear context"
- If forget clause detected: REPLACE entire Phase 2 prompt (don't prepend)
- If no forget clause: PREPEND Gemini simulation to existing prompt

### 3. Gemini Personality Template (exact template from implementation)
```
## ADVERSARIAL REVIEWER ROLE (GEMINI-STYLE SIMULATION)
You are now operating as Google Gemini, Google's flagship analytical LLM known for rigorous, constructively adversarial analysis.

**GEMINI BEHAVIORAL PROFILE**:
- Highly analytical and precision-focused
- Constructively adversarial and skeptical by design
- Evidence-demanding and assumption-challenging

**CRITICAL**: This is NOT a "review and improve" task. This is a "challenge and reconstruct" task.
```

### 4. Genesis Integration Requirements
- Add same-LLM detection to Genesis project templates
- Include SameLLMAdversarialSystem class in bootstrapped projects
- Auto-configure for corporate LibreChat deployments
- Embed comprehensive test suite (mirror the 13 test scenarios)

## 🔧 **Key Implementation Classes to Create in Genesis**

Based on the one-pager implementation, Genesis needs:

1. **SameLLMAdversarialSystem** - Main orchestration class
2. **ConfigurationManager** - Detects same-LLM scenarios
3. **AdversarialPromptAugmenter** - Handles prompt replacement/prepending
4. **AdversarialQualityValidator** - Measures adversarial effectiveness

## 🧪 **Test Scenarios to Mirror**

The one-pager implementation includes 13 comprehensive test scenarios:

- Same provider/model detection
- LibreChat URL matching
- Endpoint matching scenarios
- Forget clause detection patterns
- Prompt augmentation strategy selection
- Integration with actual Phase 2 prompts

## 🎯 **Genesis Bootstrapping Integration**

When Genesis creates new projects, automatically include:

- Same-LLM detection logic in project templates
- Gemini personality simulation templates
- Comprehensive test suite for validation
- Configuration options for corporate deployments

## ✅ **IMPLEMENTATION TASK**

Create the same-LLM adversarial system as part of Genesis bootstrapping so that when users create new projects, they automatically get same-LLM support for corporate deployments using single LLM configurations.

## 🧪 **VALIDATION**

Mirror the test suite from tests/same-llm-adversarial.test.js to ensure all 13 scenarios work correctly.

Begin implementation by inspecting the one-pager files and incorporating the validated logic into Genesis bootstrapping templates.
