"""
LLM Client Wrapper for AI Agent Prompt Tuning
Supports Anthropic Claude, Google Gemini, and OpenAI GPT
"""
import os
import time
import asyncio
from typing import Dict, Any, Optional
from dataclasses import dataclass
from abc import ABC, abstractmethod

# Import LLM clients
try:
    import anthropic
except ImportError:
    anthropic = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    import openai
except ImportError:
    openai = None

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
                max_tokens=kwargs.get('max_tokens', self.config.max_tokens),
                temperature=kwargs.get('temperature', self.config.temperature),
                messages=[{"role": "user", "content": prompt}]
            )

            execution_time = int((time.time() - start_time) * 1000)

            return LLMResponse(
                content=response.content[0].text,
                model=self.config.model,
                provider="anthropic",
                tokens_used=response.usage.output_tokens if hasattr(response, 'usage') else None,
                execution_time_ms=execution_time,
                metadata={"stop_reason": response.stop_reason if hasattr(response, 'stop_reason') else None}
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
                max_output_tokens=kwargs.get('max_tokens', self.config.max_tokens),
                temperature=kwargs.get('temperature', self.config.temperature),
            )

            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )

            execution_time = int((time.time() - start_time) * 1000)

            return LLMResponse(
                content=response.text,
                model=self.config.model,
                provider="google",
                tokens_used=response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') else None,
                execution_time_ms=execution_time,
                metadata={"finish_reason": response.candidates[0].finish_reason if response.candidates else None}
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
                max_tokens=kwargs.get('max_tokens', self.config.max_tokens),
                temperature=kwargs.get('temperature', self.config.temperature),
                messages=[{"role": "user", "content": prompt}]
            )

            execution_time = int((time.time() - start_time) * 1000)

            return LLMResponse(
                content=response.choices[0].message.content,
                model=self.config.model,
                provider="openai",
                tokens_used=response.usage.total_tokens if response.usage else None,
                execution_time_ms=execution_time,
                metadata={"finish_reason": response.choices[0].finish_reason}
            )

        except Exception as e:
            raise RuntimeError(f"OpenAI API error: {str(e)}")


def create_llm_client(config: LLMConfig) -> LLMClientBase:
    """Factory function to create appropriate LLM client"""
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
        return "successful" in response.content.lower()
    except Exception:
        return False
