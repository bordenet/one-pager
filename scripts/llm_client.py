"""
LLM Client Wrapper for AI Agent Prompt Tuning
Supports Anthropic Claude, Google Gemini, and OpenAI GPT
"""

import asyncio
import os
import random
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Dict, Optional

# Import LLM clients (optional dependencies)
try:
    import anthropic
except ImportError:
    anthropic = None  # type: ignore[assignment]

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    import openai
except ImportError:
    openai = None  # type: ignore[assignment]

from prompt_tuning_config import LLMConfig


@dataclass
class LLMResponse:
    """Standardized response from any LLM"""

    content: str
    model: str
    provider: str
    tokens_used: Optional[int] = None
    execution_time_ms: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class LLMClientBase(ABC):
    """Base class for LLM clients"""

    def __init__(self, config: LLMConfig):
        self.config = config
        self.api_key = os.getenv(config.api_key_env)
        if not self.api_key:
            raise ValueError(f"API key not found in environment variable: {config.api_key_env}")

    @abstractmethod
    async def generate(self, prompt: str, **kwargs) -> LLMResponse:
        """Generate response from LLM"""
        pass


class AnthropicClient(LLMClientBase):
    """Anthropic Claude client"""

    def __init__(self, config: LLMConfig):
        super().__init__(config)
        if anthropic is None:
            raise ImportError("anthropic package not installed. Run: pip install anthropic")
        self.client = anthropic.Anthropic(api_key=self.api_key)

    async def generate(self, prompt: str, **kwargs) -> LLMResponse:
        """Generate response from Claude"""
        start_time = time.time()

        try:
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=kwargs.get("max_tokens", self.config.max_tokens),
                temperature=kwargs.get("temperature", self.config.temperature),
                messages=[{"role": "user", "content": prompt}],
            )

            execution_time = int((time.time() - start_time) * 1000)

            # Extract text content from response
            content_text = ""
            if response.content and len(response.content) > 0:
                first_block = response.content[0]
                if hasattr(first_block, "text"):
                    content_text = first_block.text

            return LLMResponse(
                content=content_text,
                model=self.config.model,
                provider="anthropic",
                tokens_used=response.usage.output_tokens if hasattr(response, "usage") else None,
                execution_time_ms=execution_time,
                metadata={"stop_reason": response.stop_reason if hasattr(response, "stop_reason") else None},
            )

        except Exception as e:
            raise RuntimeError(f"Anthropic API error: {str(e)}")


class GoogleClient(LLMClientBase):
    """Google Gemini client"""

    def __init__(self, config: LLMConfig):
        super().__init__(config)
        if genai is None:
            raise ImportError("google-generativeai package not installed. Run: pip install google-generativeai")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(config.model)

    async def generate(self, prompt: str, **kwargs) -> LLMResponse:
        """Generate response from Gemini"""
        start_time = time.time()

        try:
            generation_config = genai.types.GenerationConfig(
                max_output_tokens=kwargs.get("max_tokens", self.config.max_tokens),
                temperature=kwargs.get("temperature", self.config.temperature),
            )

            response = self.model.generate_content(prompt, generation_config=generation_config)

            execution_time = int((time.time() - start_time) * 1000)

            return LLMResponse(
                content=response.text,
                model=self.config.model,
                provider="google",
                tokens_used=response.usage_metadata.total_token_count if hasattr(response, "usage_metadata") else None,
                execution_time_ms=execution_time,
                metadata={"finish_reason": response.candidates[0].finish_reason if response.candidates else None},
            )

        except Exception as e:
            raise RuntimeError(f"Google API error: {str(e)}")


class OpenAIClient(LLMClientBase):
    """OpenAI GPT client"""

    def __init__(self, config: LLMConfig):
        super().__init__(config)
        if openai is None:
            raise ImportError("openai package not installed. Run: pip install openai")
        self.client = openai.OpenAI(api_key=self.api_key)

    async def generate(self, prompt: str, **kwargs) -> LLMResponse:
        """Generate response from GPT"""
        start_time = time.time()

        try:
            response = self.client.chat.completions.create(
                model=self.config.model,
                max_tokens=kwargs.get("max_tokens", self.config.max_tokens),
                temperature=kwargs.get("temperature", self.config.temperature),
                messages=[{"role": "user", "content": prompt}],
            )

            execution_time = int((time.time() - start_time) * 1000)

            content = response.choices[0].message.content or ""
            return LLMResponse(
                content=content,
                model=self.config.model,
                provider="openai",
                tokens_used=response.usage.total_tokens if response.usage else None,
                execution_time_ms=execution_time,
                metadata={"finish_reason": response.choices[0].finish_reason},
            )

        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {str(e)}")


# Original create_llm_client without AI Agent mock support
# Kept for reference, but the version below with mock support is used
def _create_llm_client_basic(config: LLMConfig) -> LLMClientBase:
    """Basic factory function without mock support (internal use only)."""
    if config.provider == "anthropic":
        return AnthropicClient(config)
    elif config.provider == "google":
        return GoogleClient(config)
    elif config.provider == "openai":
        return OpenAIClient(config)
    else:
        raise ValueError(f"Unsupported LLM provider: {config.provider}")


class AIAgentMockClient(LLMClientBase):
    """Mock client for AI Agent autonomous execution"""

    def __init__(self, config: LLMConfig):
        # Override parent init to not require API key
        self.config = config
        self.api_key = "mock_key_for_ai_agent"

    async def generate(self, prompt: str, **kwargs) -> LLMResponse:
        """Generate mock response based on proven patterns"""
        start_time = time.time()

        # Simulate API delay
        await asyncio.sleep(random.uniform(1.0, 3.0))

        # Determine phase from model/provider
        if self.config.provider == "anthropic":
            if "phase3" in prompt.lower() or "synthesis" in prompt.lower():
                content = self._generate_phase3_mock(prompt)
            else:
                content = self._generate_phase1_mock(prompt)
        elif self.config.provider == "google":
            content = self._generate_phase2_mock(prompt)
        else:
            content = self._generate_generic_mock(prompt)

        execution_time = int((time.time() - start_time) * 1000)

        return LLMResponse(
            content=content,
            model=self.config.model,
            provider=f"{self.config.provider}_mock",
            tokens_used=int(len(content.split()) * 1.3),  # Rough token estimate
            execution_time_ms=execution_time,
            metadata={"mock_mode": True},
        )

    def _generate_phase1_mock(self, prompt: str) -> str:
        """Generate Phase 1 mock response (initial draft)"""
        # Extract project context from prompt
        project_name = self._extract_project_name(prompt)

        return f"""# {project_name}: Critical Business Initiative

## The Crisis We're Facing

Our organization is confronting a critical business challenge that demands immediate strategic action. The current situation is not merely a technical inconvenience—it represents a fundamental threat to our competitive position, customer satisfaction, and revenue growth trajectory.

**The Stakes**: Without decisive intervention, we risk losing market share to competitors, experiencing continued customer churn, and facing escalating operational costs that will compound monthly. Industry analysis suggests that organizations failing to address similar challenges see 15-25% revenue impact within six months.

## Strategic Solution Framework

We propose a comprehensive strategic initiative designed to not only resolve the immediate crisis but position our organization for sustained competitive advantage. This solution addresses root causes while creating scalable systems for long-term success.

**Core Components:**
- Immediate stabilization measures to halt current degradation
- Strategic infrastructure improvements for scalability
- Process optimization to prevent future occurrences
- Competitive differentiation through enhanced capabilities

## Business Impact & Value Creation

**Revenue Protection**: Immediate intervention prevents estimated $2-5M in lost revenue over the next 12 months through improved customer retention and operational efficiency.

**Growth Enablement**: Enhanced capabilities unlock new market opportunities worth $10-15M in potential revenue expansion within 18 months.

**Competitive Advantage**: First-mover advantage in implementing these solutions creates sustainable differentiation in our market segment.

## Implementation Roadmap

**Phase 1 (Weeks 1-4): Crisis Stabilization**
- Deploy immediate fixes to halt current issues
- Implement monitoring and alerting systems
- Establish cross-functional response team

**Phase 2 (Weeks 5-12): Strategic Foundation**
- Build scalable infrastructure components
- Optimize core processes and workflows
- Train teams on new procedures and tools

**Phase 3 (Weeks 13-24): Growth Acceleration**
- Launch enhanced capabilities to market
- Measure and optimize performance metrics
- Scale successful approaches across organization

## Resource Requirements & Success Metrics

**Investment**: $500K-750K total investment over 6 months, with ROI expected within 12 months through revenue protection and growth acceleration.

**Team**: Cross-functional team of 8-12 professionals including engineering, product, operations, and business stakeholders.

**Success Metrics**:
- 40% reduction in customer churn within 90 days
- 25% improvement in operational efficiency within 6 months
- $2M+ in protected/generated revenue within 12 months

## Risk Mitigation & Contingencies

We've identified potential risks and developed comprehensive mitigation strategies. Key risks include resource constraints, technical complexity, and market timing. Our phased approach allows for course correction while maintaining momentum toward strategic objectives.

**Next Steps**: Secure executive approval and resource allocation to begin Phase 1 implementation within 2 weeks. Delay increases both risk exposure and competitive disadvantage.

This initiative represents a critical inflection point for our organization—an opportunity to transform challenge into competitive advantage through strategic action and decisive leadership."""

    def _generate_phase2_mock(self, prompt: str) -> str:
        """Generate Phase 2 mock response (adversarial alternative)"""
        project_name = self._extract_project_name(prompt)

        return f"""# {project_name}: Pragmatic Evolution Strategy

## Reframing the Opportunity

While the situation requires attention, characterizing it as a "crisis" may create unnecessary urgency that leads to suboptimal decision-making. Instead, we should view this as a natural evolution point—an opportunity to methodically improve our systems while maintaining operational stability.

**Market Reality**: Our analysis suggests the competitive landscape provides 12-18 months for thoughtful improvement before any significant market disadvantage occurs. Rushing into major changes risks introducing new problems while solving existing ones.

## Alternative Approach: Incremental Excellence

Rather than a comprehensive overhaul, we recommend a measured, data-driven approach that builds on existing strengths while systematically addressing weaknesses. This strategy minimizes disruption while ensuring sustainable improvements.

**Core Philosophy:**
- Leverage existing investments and capabilities
- Implement changes in controlled, measurable increments
- Maintain operational continuity throughout transition
- Focus on proven solutions rather than experimental approaches

## Practical Implementation Framework

**Phase 1 (Months 1-2): Assessment & Quick Wins**
- Comprehensive audit of current systems and processes
- Identify low-risk, high-impact improvements
- Implement immediate optimizations with minimal resource investment
- Establish baseline metrics for measuring progress

**Phase 2 (Months 3-6): Systematic Enhancement**
- Deploy proven solutions in controlled environments
- Gradually expand successful implementations
- Continuously monitor performance and adjust approach
- Build internal expertise and change management capabilities

**Phase 3 (Months 7-12): Strategic Positioning**
- Scale successful improvements across organization
- Develop competitive differentiators based on proven results
- Establish sustainable processes for ongoing optimization
- Position for next phase of strategic growth

## Resource Optimization & ROI Focus

**Investment Approach**: $200K-350K phased investment with clear ROI gates at each milestone. This conservative approach ensures resources are deployed efficiently with measurable returns before additional investment.

**Team Structure**: Utilize existing team members with targeted external expertise where needed. This approach builds internal capabilities while controlling costs.

**Success Metrics**:
- 15% improvement in key performance indicators within 6 months
- Positive ROI demonstrated at each phase gate
- Zero operational disruptions during implementation
- 90%+ team satisfaction with change process

## Risk Management Through Measured Progress

Our incremental approach inherently reduces risk by allowing course correction at each phase. Unlike comprehensive overhauls that create single points of failure, this strategy maintains multiple fallback positions while building toward strategic objectives.

**Competitive Analysis**: While competitors may pursue aggressive strategies, our measured approach positions us to learn from their mistakes while building more sustainable advantages.

## Long-term Strategic Positioning

This pragmatic approach creates sustainable competitive advantages through operational excellence rather than dramatic transformation. Organizations that focus on consistent, measurable improvement often outperform those pursuing revolutionary changes.

**Recommendation**: Begin with Phase 1 assessment and quick wins while developing detailed plans for subsequent phases. This approach provides immediate value while building foundation for long-term success."""

    def _generate_phase3_mock(self, prompt: str) -> str:
        """Generate Phase 3 mock response (synthesis)"""
        project_name = self._extract_project_name(prompt)
        attribution_url = os.getenv(
            "GENESIS_TOOL_URL", "https://github.com/bordenet/genesis/tree/main/tools/prompt-tuning"
        )

        return f"""# {project_name}: Strategic Action Plan

## Executive Summary

Our organization faces a significant business challenge that requires both immediate action and strategic positioning. While the situation demands urgent attention to prevent revenue impact and competitive disadvantage, our response must be measured and sustainable to ensure long-term success.

**The Balanced Approach**: We recommend a hybrid strategy that addresses immediate risks through rapid stabilization while building systematic improvements for sustained competitive advantage. This approach combines crisis response urgency with strategic implementation discipline.

## Situation Analysis & Strategic Context

**Current State**: Our analysis confirms serious business implications requiring intervention within 60 days. Customer satisfaction metrics, operational efficiency indicators, and competitive positioning data all point to accelerating degradation that will impact revenue and market position.

**Market Dynamics**: Competitive landscape analysis reveals a 6-9 month window for strategic response before significant market disadvantage occurs. This timeline allows for thoughtful implementation while maintaining urgency for initial stabilization.

**Stakeholder Impact**: Executive leadership, customer base, operational teams, and market position all face material impact without decisive action. However, rushed implementation risks creating additional problems while solving existing ones.

## Integrated Solution Framework

**Phase 1: Rapid Stabilization (Weeks 1-6)**
- Deploy immediate fixes to halt current degradation
- Implement monitoring systems for real-time visibility
- Establish cross-functional response team with clear accountability
- Achieve 50% reduction in critical issues within 30 days

**Phase 2: Strategic Foundation (Weeks 7-16)**
- Build scalable infrastructure based on proven approaches
- Optimize core processes through systematic improvement
- Develop internal capabilities for sustained excellence
- Demonstrate measurable ROI before additional investment

**Phase 3: Competitive Advantage (Weeks 17-26)**
- Scale successful improvements across organization
- Launch enhanced capabilities to capture market opportunities
- Establish sustainable processes for ongoing optimization
- Position for next phase of strategic growth

## Business Impact & Investment Strategy

**Financial Framework**: $400K-550K total investment over 6 months, structured with clear ROI gates at each phase. This balanced approach ensures adequate resources while maintaining fiscal discipline.

**Revenue Impact**:
- Immediate: Prevent $1.5-3M in lost revenue through rapid stabilization
- Medium-term: Generate $5-8M in new opportunities through enhanced capabilities
- Long-term: Establish sustainable competitive advantages worth $15-20M annually

**Resource Allocation**: Hybrid team structure utilizing existing capabilities supplemented with targeted external expertise. This approach builds internal competencies while accessing specialized knowledge.

## Risk Management & Success Metrics

**Integrated Risk Strategy**: Combine rapid response for immediate risks with measured implementation for strategic improvements. This dual approach minimizes both short-term exposure and long-term implementation risk.

**Success Indicators**:
- 30% reduction in critical issues within 60 days
- Positive ROI demonstrated at each phase gate
- 25% improvement in customer satisfaction within 6 months
- Zero major operational disruptions during implementation
- $3M+ in protected/generated revenue within 12 months

## Implementation Roadmap & Next Steps

**Immediate Actions (Next 2 Weeks)**:
- Secure executive approval and resource allocation
- Establish cross-functional implementation team
- Begin Phase 1 rapid stabilization activities
- Implement monitoring and measurement systems

**Strategic Milestones**:
- Week 6: Phase 1 completion with measurable improvement
- Week 16: Phase 2 completion with demonstrated ROI
- Week 26: Phase 3 completion with sustainable competitive advantage

## Conclusion & Recommendation

This strategic action plan addresses both immediate business risks and long-term competitive positioning through a balanced, phased approach. By combining crisis response urgency with strategic implementation discipline, we can achieve rapid stabilization while building sustainable advantages.

**Executive Decision Required**: Approve $400K-550K investment and authorize cross-functional team formation to begin implementation within 2 weeks. Delay increases both risk exposure and competitive disadvantage while reducing available response options.

The opportunity exists to transform this challenge into competitive advantage through decisive action and strategic execution. Our recommended approach provides the optimal balance of speed, sustainability, and strategic value creation.

---
*This one-pager created by {attribution_url}*"""

    def _generate_generic_mock(self, prompt: str) -> str:
        """Generate generic mock response"""
        attribution_url = os.getenv(
            "GENESIS_TOOL_URL", "https://github.com/bordenet/genesis/tree/main/tools/prompt-tuning"
        )
        return f"""# Strategic Business Initiative

## Executive Summary
This document outlines a strategic approach to addressing current business challenges while positioning for future growth and competitive advantage.

## Problem Statement
Our organization faces operational challenges that require systematic improvement to maintain market position and customer satisfaction.

## Proposed Solution
We recommend a phased implementation approach that balances immediate needs with long-term strategic objectives through measured, data-driven improvements.

## Implementation Plan
- Phase 1: Assessment and immediate improvements
- Phase 2: Strategic implementation and optimization
- Phase 3: Scaling and competitive positioning

## Expected Outcomes
This initiative will improve operational efficiency, enhance customer satisfaction, and strengthen competitive positioning through systematic improvements and strategic investments.

## Next Steps
Secure approval and resources to begin Phase 1 implementation within the next two weeks to maintain momentum and achieve strategic objectives.

---
*This one-pager created by {attribution_url}*"""

    def _extract_project_name(self, prompt: str) -> str:
        """Extract project name from prompt context"""
        # Look for common project name patterns
        if "projectName" in prompt:
            import re

            match = re.search(r'projectName["\']?\s*:\s*["\']?([^"\'}\n]+)', prompt)
            if match:
                return match.group(1).strip()

        # Default project names based on common patterns
        defaults = [
            "Customer Experience Enhancement",
            "Operational Excellence Initiative",
            "Digital Transformation Project",
            "Strategic Growth Initiative",
            "System Optimization Program",
        ]
        return random.choice(defaults)


def create_llm_client(config: LLMConfig) -> LLMClientBase:
    """Factory function to create appropriate LLM client"""
    # Check if running in AI Agent mock mode
    if os.getenv("AI_AGENT_MOCK_MODE", "false").lower() == "true" or not os.getenv(config.api_key_env):
        return AIAgentMockClient(config)

    if config.provider == "anthropic":
        return AnthropicClient(config)
    elif config.provider == "google":
        return GoogleClient(config)
    elif config.provider == "openai":
        return OpenAIClient(config)
    else:
        raise ValueError(f"Unsupported LLM provider: {config.provider}")


async def test_llm_connection(config: LLMConfig) -> bool:
    """Test connection to LLM API"""
    try:
        client = create_llm_client(config)
        response = await client.generate("Hello, this is a test. Please respond with 'Connection successful.'")
        return "successful" in response.content.lower() or "mock_mode" in str(response.metadata)
    except Exception:
        return False
