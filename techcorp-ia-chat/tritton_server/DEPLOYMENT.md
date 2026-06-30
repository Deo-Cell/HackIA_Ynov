# Documentation de Déploiement — INFRA

## Choix Technique : Ollama

### Pourquoi Ollama ?

| Critère | Ollama | Triton | Serveur maison |
|---------|--------|--------|----------------|
| Temps de setup | ~5 min | ~1h+ (Docker + GPU) | ~30 min |
| Dépendances | Aucune | Docker, NVIDIA GPU | Python, vLLM/FastAPI |
| Complexité | Faible | Élevée | Moyenne |
| API REST native | ✅ | ✅ | À implémenter |
| Compatible macOS | ✅ | ❌ (Linux/GPU only) | ✅ |
| Gestion modèles | Intégrée | Manuelle | Manuelle |

**Justification :** Ollama offre le meilleur rapport simplicité/fonctionnalité pour un déploiement rapide sur macOS. L'API REST est compatible OpenAI, ce qui facilite l'intégration côté DEV WEB.

---

## Architecture Déployée

```
┌─────────────────────────────────────────────┐
│           Machine INFRA (macOS)             │
│         IP: 10.92.5.104                     │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │         Ollama Server                 │  │
│  │         Port: 11434                   │  │
│  │                                       │  │
│  │  Modèle: phi35-financial              │  │
│  │  Base: phi3.5 (3.8B, Q4_0)           │  │
│  │  Context: 131072 tokens              │  │
│  └───────────────────────────────────────┘  │
│                                             │
└──────────────────────┬──────────────────────┘
                       │
                       │ HTTP REST API
                       │
         ┌─────────────┴─────────────┐
         │                           │
    ┌────▼────┐               ┌──────▼──────┐
    │ DEV WEB │               │  IA (tests) │
    │Interface│               │  Validation │
    └─────────┘               └─────────────┘
```

---

## Modèle Déployé

| Propriété | Valeur |
|-----------|--------|
| Nom | `phi35-financial` |
| Modèle de base | `phi3.5` (Microsoft Phi-3.5-mini-instruct) |
| Taille | 3.8B paramètres |
| Quantization | Q4_0 (optimisé mémoire) |
| Taille disque | ~2.2 GB |
| Context window | 131,072 tokens |
| Rôle | Assistant financier TechCorp Industries |

### Paramètres d'Inférence

| Paramètre | Valeur | Raison |
|-----------|--------|--------|
| temperature | 0.7 | Équilibre créativité/précision pour la finance |
| top_p | 0.9 | Filtre les tokens peu probables |
| top_k | 40 | Limite le vocabulaire de sampling |
| num_predict | 512 | Réponses concises mais complètes |
| repeat_penalty | 1.1 | Évite les répétitions |

---

## Reproduction du Déploiement

### Prérequis

- macOS (ou Linux)
- 4 GB RAM minimum
- Connexion internet (pour le pull initial)

### Étapes

```bash
# 1. Installer Ollama
# macOS : télécharger depuis https://ollama.com/download
# Linux : curl -fsSL https://ollama.com/install.sh | sh

# 2. Télécharger le modèle de base
ollama pull phi3.5

# 3. Créer le modèle financier custom
ollama create phi35-financial -f Modelfile

# 4. Vérifier que le modèle est disponible
ollama list

# 5. Tester
ollama run phi35-financial "What is a P/E ratio?"

# 6. Exposer sur le réseau (macOS)
launchctl setenv OLLAMA_HOST "0.0.0.0"
# Puis redémarrer Ollama
```

---

## Endpoints API

Base URL : `http://10.92.5.104:11434`

### Chat (recommandé pour le DEV WEB)

```bash
POST /api/chat
Content-Type: application/json

{
  "model": "phi35-financial",
  "messages": [
    {"role": "user", "content": "Explain what a hedge fund is"}
  ],
  "stream": false
}
```

### Generate (simple)

```bash
POST /api/generate
Content-Type: application/json

{
  "model": "phi35-financial",
  "prompt": "What is diversification in investing?",
  "stream": false
}
```

### Lister les modèles

```bash
GET /api/tags
```

---

## Sécurité

- Le serveur écoute sur `0.0.0.0:11434` (toutes interfaces)
- Accessible uniquement sur le réseau local (pas exposé sur internet)
- Pas d'authentification native (Ollama n'en supporte pas)
- Recommandation : restreindre à `localhost` après le hackathon

---

## Dépannage

| Problème | Solution |
|----------|----------|
| `connection refused` depuis un autre poste | Vérifier `OLLAMA_HOST=0.0.0.0` et redémarrer Ollama |
| Réponse lente | Normal au premier appel (chargement modèle en RAM). Les suivants sont rapides |
| Modèle non trouvé | `ollama list` pour vérifier, `ollama create phi35-financial -f Modelfile` pour recréer |
| Port déjà utilisé | `lsof -i :11434` pour identifier le processus |
