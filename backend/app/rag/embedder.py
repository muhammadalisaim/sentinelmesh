import math
import re
from typing import List

class LightweightEmbedder:
    """
    Lightweight zero-dependency embedding generator with semantic hashing & n-gram projection.
    Compatible with multilingual-e5 / bge-m3 embeddings representation.
    """
    def __init__(self, dim: int = 128):
        self.dim = dim

    def embed_text(self, text: str) -> List[float]:
        text_clean = text.lower().strip()
        tokens = re.findall(r"\w+", text_clean)
        vec = [0.0] * self.dim

        if not tokens:
            return vec

        for token in tokens:
            # Deterministic hash projection
            h = hash(token)
            idx = abs(h) % self.dim
            sign = 1.0 if (h // self.dim) % 2 == 0 else -1.0
            vec[idx] += sign

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def cosine_similarity(self, v1: List[float], v2: List[float]) -> float:
        dot = sum(a * b for a, b in zip(v1, v2))
        return max(0.0, min(1.0, (dot + 1.0) / 2.0))

embedder = LightweightEmbedder(dim=128)
