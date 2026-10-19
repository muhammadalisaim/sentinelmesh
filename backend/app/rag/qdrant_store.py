import httpx
from typing import List, Dict, Any, Optional
from app.config import settings
from app.rag.embedder import embedder

class QdrantStore:
    def __init__(self):
        self.qdrant_url = settings.QDRANT_URL.rstrip("/")
        self.collection = settings.QDRANT_COLLECTION
        # In-memory fallback documents
        self.memory_store: List[Dict[str, Any]] = []

    def insert_technique(self, technique_id: str, name: str, description: str, tactics: List[str], mitigations: List[str]):
        vec = embedder.embed_text(f"{technique_id} {name} {description}")
        doc = {
            "id": technique_id,
            "name": name,
            "description": description,
            "tactics": tactics,
            "mitigations": mitigations,
            "vector": vec
        }
        self.memory_store.append(doc)

    def search_mitre(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_vec = embedder.embed_text(query)
        scored = []
        for doc in self.memory_store:
            sim = embedder.cosine_similarity(query_vec, doc["vector"])
            # Boost exact technique ID matches
            if doc["id"].lower() in query.lower():
                sim += 0.5
            scored.append((sim, doc))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, doc in scored[:top_k]:
            results.append({
                "technique_id": doc["id"],
                "name": doc["name"],
                "description": doc["description"],
                "tactics": doc["tactics"],
                "mitigations": doc["mitigations"],
                "similarity": round(float(score), 3)
            })
        return results

qdrant_store = QdrantStore()
