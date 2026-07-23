"""Token usage tracker — counts DeepSeek API token consumption."""

from __future__ import annotations

import time
from dataclasses import dataclass, field


@dataclass
class TokenTracker:
    """Tracks token usage for DeepSeek API calls."""

    total_prompt_tokens: int = 0
    total_completion_tokens: int = 0
    total_calls: int = 0
    calls_by_type: dict[str, int] = field(default_factory=dict)
    recent_calls: list[dict] = field(default_factory=list)  # last 50 calls
    started_at: float = field(default_factory=time.time)

    def record(self, call_type: str, prompt_tokens: int, completion_tokens: int) -> None:
        """Record a single API call."""
        self.total_prompt_tokens += prompt_tokens
        self.total_completion_tokens += completion_tokens
        self.total_calls += 1
        self.calls_by_type[call_type] = self.calls_by_type.get(call_type, 0) + 1

        self.recent_calls.append({
            "type": call_type,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total": prompt_tokens + completion_tokens,
            "timestamp": time.time(),
        })
        # Keep last 50
        if len(self.recent_calls) > 50:
            self.recent_calls = self.recent_calls[-50:]

    @property
    def total_tokens(self) -> int:
        return self.total_prompt_tokens + self.total_completion_tokens

    @property
    def estimated_cost_usd(self) -> float:
        """DeepSeek pricing (approx): $0.14/M input, $0.28/M output"""
        input_cost = (self.total_prompt_tokens / 1_000_000) * 0.14
        output_cost = (self.total_completion_tokens / 1_000_000) * 0.28
        return round(input_cost + output_cost, 5)

    @property
    def runtime_seconds(self) -> float:
        return time.time() - self.started_at

    def summary(self) -> dict:
        return {
            "total_tokens": self.total_tokens,
            "prompt_tokens": self.total_prompt_tokens,
            "completion_tokens": self.total_completion_tokens,
            "total_calls": self.total_calls,
            "estimated_cost_usd": self.estimated_cost_usd,
            "calls_by_type": self.calls_by_type,
            "runtime_seconds": round(self.runtime_seconds, 0),
            "recent_calls": self.recent_calls[-10:],
        }


# Global singleton
tracker = TokenTracker()
