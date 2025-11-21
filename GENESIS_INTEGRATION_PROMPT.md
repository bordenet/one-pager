# Genesis Integration: Same-LLM Adversarial System

## 🎯 **PROMPT FOR CLAUDE IN GENESIS PROJECT**

```
I need you to integrate the validated same-LLM adversarial system from the one-pager project into Genesis bootstrapping. This system automatically maintains adversarial tension in 3-phase workflows even when corporate deployments use a single LLM (LibreChat, internal endpoints, etc.).

CRITICAL REFERENCE: https://github.com/bordenet/one-pager/blob/main/SAME_LLM_IMPLEMENTATION_SUMMARY.md

KEY DISCOVERY: Phase 2 prompts often contain "Forget all previous sessions and context" clauses that nullify prepended instructions. The solution uses complete prompt replacement (not prepending) when same LLM + forget clause detected.

INTEGRATION REQUIREMENTS:

1. **Automatic Detection System**
   - Same provider AND same model (e.g., anthropic + claude-3-sonnet)
   - Identical URLs (LibreChat: https://librechat.company.com/api/chat)
   - Same endpoints (localhost:8080, internal deployments)

2. **Forget Clause Detection**
   - Scan for patterns: "forget all previous", "ignore previous", "start fresh", "new session", "clear context"
   - If detected: Use complete prompt replacement strategy
   - If not detected: Use prepending strategy with Gemini simulation

3. **Gemini Personality Simulation**
   - Analytical and precision-focused behavioral profile
   - Constructively adversarial and skeptical approach
   - Evidence-demanding and assumption-challenging style
   - "Challenge and reconstruct" vs "review and improve" mindset

4. **Quality Validation**
   - Phase 2 output ≥30% semantically different from Phase 1
   - ≥3 adversarial phrases ("however", "but", "challenge", "assumption")
   - ≥2 direct challenges to Phase 1 approach
   - Evidence/clarification demands for Phase 1 claims

IMPLEMENTATION TASK:
Integrate this system into Genesis so all new projects automatically get same-LLM adversarial support. Include the detection logic, prompt replacement strategy, and Gemini simulation template.

VALIDATION: The one-pager implementation has 54/54 tests passing, confirming all logic works correctly.

SUCCESS CRITERIA:
- Genesis projects automatically detect same-LLM configurations
- Adversarial tension maintained regardless of LLM deployment type
- Corporate LibreChat and single-endpoint deployments fully supported
- Quality improvements preserved despite single LLM usage

Begin integration immediately. Focus on embedding the validated detection and replacement logic into Genesis bootstrapping templates.
```

---

## 📋 **Key Files to Reference**

- **Complete Design**: https://github.com/bordenet/one-pager/blob/main/SAME_LLM_ADVERSARIAL_DESIGN_SPEC.md
- **Implementation**: https://github.com/bordenet/one-pager/blob/main/same_llm_adversarial_implementation.js
- **Test Suite**: https://github.com/bordenet/one-pager/blob/main/tests/same-llm-adversarial.test.js
- **Execution Guide**: https://github.com/bordenet/one-pager/blob/main/CORRECTED_SAME_LLM_PROMPT_FOR_PRD_ASSISTANT.md

This integration will ensure all Genesis projects automatically support corporate deployments using single LLM configurations while maintaining the adversarial tension that drives quality improvements.
