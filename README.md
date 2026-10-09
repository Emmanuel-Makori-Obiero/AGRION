# AgriConnect Nigeria


A USSD and IVR farming advisory service for Nigerian smallholder farmers.
Advisory content lives in a **Neo4j knowledge graph** (sourced from IITA guides
and NiMet forecasts), is translated to local languages via **Featherless**, and
rendered to voice via **ElevenLabs** — all reachable from any basic phone over
**Africa's Talking**.

## Architecture

```
Farmer's phone
   │  USSD  / Voice
   ▼
Africa's Talking gateway
   │  HTTP webhook
   ▼
FastAPI (src/main.py)
   ├── /api/v1/ussd   → ussd.py   ─┐
   └── /api/v1/voice  → ivr.py    ─┤
                                   ▼
        ┌──────────────────────────────────────────┐
        │ graph_service  → Neo4j (deterministic     │
        │                  Cypher: practices, forecast)
        │ llm_service    → Featherless (translation) │
        │ voice_service  → ElevenLabs (TTS + cache)  │
        │ text_formatter → 160-char USSD shaping     │
        └──────────────────────────────────────────┘
```

- **USSD** is stateless: Africa's Talking replays the full `*`-delimited input
  on every request, and `ussd.py` derives menu position from that text.
- **IVR** returns Africa's Talking XML; the first callback plays a DTMF menu and
  later callbacks carry the pressed digit.
- Graph queries are parameterised and read-only, so responses are deterministic
  and safe to serve at telecom latency.

## Project layout

| Path | Purpose |
|------|---------|
| `config/settings.py` | Env-driven config (Pydantic Settings) |
| `config/neo4j_constraints.cypher` | Constraints & indexes |
| `data/raw/*.json` | Structured IITA / NiMet source facts |
| `data/seed_graph.py` | Idempotent JSON → Neo4j loader |
| `src/api/v1/ussd.py` | USSD webhook controller |
| `src/api/v1/ivr.py` | IVR/voice webhook controller |
| `src/api/v1/genui.py` | Generative-UI NDJSON stream for the web dashboard |
| `src/api/v1/webhooks.py` | Multi-channel agent webhooks (USSD/SMS/chat) |
| `src/api/schemas/telecom.py` | Inbound session payload models |
| `src/api/schemas/genui.py` | GenUI block models (mirror frontend `types.ts`) |
| `src/agent/state.py` | `FarmerState` TypedDict (multi-channel graph state) |
| `src/agent/checkpoint.py` | SQLite checkpoint saver keyed by phone number |
| `src/agent/graph.py` | LangGraph assembly + `run_turn` helper |
| `src/agent/rag.py` | ChromaDB RAG pipeline (PDF ingest + retriever) |
| `src/agent/nodes/` | intake, router, expert, and formatter nodes |
| `src/services/` | Graph, LLM, and voice integrations |
| `src/utils/text_formatter.py` | USSD 160-char formatting |
| `tests/` | Route + graph query tests |

## Codebase structure

```
AgriConnect-Nigeria/
├── .github/
│   └── workflows/
│       └── test.yml                  # CI: pytest on push/PR
├── config/
│   ├── settings.py                   # Env-driven config (Pydantic Settings)
│   └── neo4j_constraints.cypher      # Graph constraints & indexes
├── data/
│   ├── raw/
│   │   ├── iita_rice_guide.json      # IITA rice agronomy facts
│   │   └── nimet_forecast.json       # NiMet weather forecast facts
│   └── seed_graph.py                 # Idempotent JSON → Neo4j loader
├── src/
│   ├── api/
│   │   ├── schemas/
│   │   │   ├── telecom.py            # Inbound session payload models
│   │   │   └── genui.py             # GenUI block models (mirror frontend types.ts)
│   │   └── v1/
│   │       ├── ussd.py               # USSD webhook controller
│   │       ├── ivr.py                # IVR/voice webhook controller
│   │       ├── genui.py             # Generative-UI NDJSON stream
│   │       └── webhooks.py           # Multi-channel agent webhooks
│   ├── agent/                        # LangGraph multi-channel agent
│   │   ├── state.py                  # FarmerState TypedDict + channel_type
│   │   ├── checkpoint.py             # SQLite saver (thread_id = phone number)
│   │   ├── llm.py                    # Featherless chat-model factory
│   │   ├── rag.py                    # ChromaDB RAG (PDF ingest + retriever)
│   │   ├── graph.py                  # Graph assembly + run_turn helper
│   │   └── nodes/
│   │       ├── intake.py             # Language detect + crop extraction
│   │       ├── router.py             # Intent classifier + conditional edge
│   │       ├── experts.py            # agronomy (RAG) / climate / finance
│   │       └── formatter.py          # Per-channel formatting + length guard
│   ├── services/
│   │   ├── graph_service.py          # Neo4j Cypher queries
│   │   ├── llm_service.py            # Featherless translation
│   │   └── voice_service.py          # ElevenLabs TTS + cache
│   ├── utils/
│   │   └── text_formatter.py         # USSD 160-char formatting
│   └── main.py                       # FastAPI app entrypoint
├── frontend/                         # React / Tailwind CSS SPA (Lovable Export)
│   ├── src/
│   │   ├── components/
│   │   │   └── genui/                # Pre-built components mapped to AI blocks
│   │   │       ├── WeatherCard.tsx
│   │   │       ├── FinancialYieldChart.tsx
│   │   │       └── ActionAlert.tsx
│   │   ├── hooks/
│   │   │   └── useGenUI.ts           # Fetches and streams UI state from backend
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tailwind.config.js
├── tests/
│   ├── test_ussd_routes.py           # USSD route tests (mocked graph)
│   └── test_graph_queries.py         # Graph query tests (self-skip w/o Neo4j)
├── Dockerfile
├── requirements.txt
└── README.md
```

## Setup

```bash
# 1. Install dependencies
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env   # then fill in Neo4j / Featherless / ElevenLabs keys

# 3. Prepare the graph (Neo4j must be running)
cat config/neo4j_constraints.cypher | cypher-shell -u neo4j -p <password>
python -m data.seed_graph

# 4. Run the API
uvicorn src.main:app --reload
```

Health check: `GET http://localhost:8000/health`

## Webhooks

Point your Africa's Talking application at:

- **USSD callback:** `POST https://<host>/api/v1/ussd`
- **Voice callback:** `POST https://<host>/api/v1/voice`

## Multi-channel agent (LangGraph)

A LangGraph workflow serves the same advisory brain to USSD, SMS, and the web
chatbot, adapting only the final formatting per channel:

```
intake → router ─┬─ agronomy_expert (RAG / ChromaDB) ─┐
                 ├─ climate_expert  ──────────────────┤→ channel_formatter → END
                 └─ finance_expert  ──────────────────┘
```

- **State** (`src/agent/state.py`): `FarmerState` carries `phone_number`,
  `preferred_language`, `crop_focus`, `user_input`, `domain_intent`,
  `expert_reasoning`, `final_ui_response`, and `channel_type`
  (`'ussd' | 'sms' | 'chatbot'`).
- **Checkpointing** (`src/agent/checkpoint.py`): an `AsyncSqliteSaver` subclass
  uses the **phone number as the `thread_id`**, so a dropped USSD session or an
  async SMS reply resumes the same thread.
- **Intake / router**: detect language (incl. Pidgin/English code-switching),
  extract the crop, then classify into `agronomy | climate | finance`.
- **Experts**: reason for accuracy only, ignoring length limits. The agronomy
  expert retrieves grounded context from ChromaDB.
- **Formatter**: the strict editor — SMS ≤160 chars (one action step), USSD
  ≤182 chars (digit menu, `\n` breaks), chatbot unconstrained Markdown — with a
  post-LLM `fit_to_channel` length guard that truncates and logs overflow.

The LLM provider is **Featherless** (OpenAI-compatible) via `langchain-openai`.
Embeddings run locally via `sentence-transformers`, so RAG needs no extra key.

Build the knowledge base, then hit the channel webhooks:

```bash
# Drop PDFs into data/pdfs/ first, then ingest into ChromaDB:
python -m src.agent.rag

# USSD (form POST → 'END '-prefixed string)
curl -X POST localhost:8000/api/v1/webhook/ussd \
  -d 'sessionId=1&phoneNumber=%2B2348012345678&text=my rice leaves are yellow'

# SMS (Africa's Talking / Twilio form POST → plain text)
curl -X POST localhost:8000/api/v1/webhook/sms \
  -d 'from=%2B2348012345678&text=when should I plant maize in Kano'

# Chatbot (JSON → JSON with markdown)
curl -X POST localhost:8000/api/v1/webhook/chat \
  -H 'Content-Type: application/json' \
  -d '{"phone_number":"+2348012345678","message":"best price to sell cassava"}'
```

All three set `channel_type` for you and invoke the graph with the phone number
as the thread id.

## Web dashboard (GenUI)

The `frontend/` SPA renders a generative-UI advisory dashboard. Its `useGenUI`
hook streams blocks from the backend, which emits newline-delimited JSON
(NDJSON) — one `GenUIBlock` per line — so cards paint progressively:

- **GenUI stream:** `GET /api/v1/genui/{session_id}?region=Kano&crop=Rice`
  → `application/x-ndjson`

Block shapes are defined once on each side and kept in sync:
`src/api/schemas/genui.py` (Pydantic) ↔ `frontend/src/components/genui/types.ts`
(TypeScript). In dev, Vite proxies `/api` to the FastAPI server on `:8000`.

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Testing

```bash
pytest tests/ -v
```

Route and schema tests mock the graph service and run anywhere. The graph
integration tests in `test_graph_queries.py` self-skip when no Neo4j instance
is reachable.

## Deployment

```bash
docker build -t agriconnect-nigeria .
docker run -p 8000:8000 --env-file .env agriconnect-nigeria
```
