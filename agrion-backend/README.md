# Agrion Backend — 2-Day MVP Build

This is a scoped-down build of the full Agrion proposal, sized to actually
finish in ~2 days with Lovable (web frontend) + Neo4j AuraDB + Featherless AI.

## What's IN this build (the demoable core loop)

```
Farmer question (USSD text or Lovable web form)
        │
        ▼
  Flask backend  ──reads context──▶  Neo4j knowledge graph (crops, pests, regions)
        │
        ▼
  Featherless AI (OpenAI-compatible) generates a short, plain-language answer
        │
        ▼
  Answer returned via USSD "END" text / SMS JSON / web JSON
```

- USSD webhook (`/ussd`) — menu-driven crop Q&A, Africa's Talking format
- SMS webhook (`/sms`) — free-text crop Q&A
- Web API (`/api/advice`, `/api/consent`, `/api/health`) — for your Lovable frontend
- Neo4j knowledge graph — crops ↔ pests ↔ regions, seeded via `scripts/seed_neo4j.py`
- NDPA-lite consent — phone numbers are hashed before storage, never stored raw;
  consent is checked before the web channel will serve advice

## What's CUT for now (be upfront about this with judges)

These are real, valuable parts of your original proposal — they just don't
fit in 2 days alongside everything else, and trying to half-build them is
worse for a demo than clearly scoping them as "next sprint":

| Feature | Why it's cut | Effort if you wanted it |
|---|---|---|
| Hybrid USSD→IVR voice bridge | Needs Africa's Talking Voice product + call-handling state machine | ~1 day alone |
| Speech-to-Text on the IVR call | Depends on the above being live first | half day on top |
| ElevenLabs local-dialect TTS | New API integration + dialect testing | half day |
| MMS photo → vision pipeline (upscaling + vision LLM) | Needs image storage, an upscaling model, and a vision-LLM call chain | ~1 day alone |
| Multi-dialect NLU / "tribe-validation gate" | Needs labelled dialect data you don't have yet | open-ended |

**Pitch framing that still works:** present what's built as a working
proof of the core advisory loop, and present the cut features as an
architecture that's *designed for* them (the code already has hooks —
e.g. `routes/ussd.py` option "2" for voice is a stub, not missing).
Judges tend to respect "here's what works end-to-end" over "here's six
half-wired integrations."

## Running it

```bash
cd agrion-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in real Neo4j + Featherless credentials
python scripts/seed_neo4j.py   # populate the knowledge graph once
python app.py           # starts on :5000
```

Smoke test (works even with placeholder/no credentials — everything
degrades gracefully to a fallback message instead of crashing):

```bash
python tests/test_smoke.py
```

## Wiring up Lovable

Point your Lovable web app's form submit at:

```
POST https://<your-deployed-backend>/api/advice
Body: { "phone": "+234...", "crop": "Maize", "question": "...", "language": "Hausa" }
```

Call `/api/consent` once (e.g. on first visit / a consent checkbox) before
calling `/api/advice` for a given phone/session — otherwise you'll get a
403 `consent_required`.

## Wiring up Africa's Talking (USSD/SMS)

1. Create a free sandbox app at https://account.africastalking.com
2. Deploy this backend somewhere reachable over HTTPS (Render, Railway, or
   even an ngrok tunnel for the demo)
3. Set your sandbox's USSD callback URL to `https://<your-host>/ussd`
   and SMS callback URL to `https://<your-host>/sms`
4. Test by dialling your sandbox shortcode from the AT simulator

## Known limitations to mention if asked (don't hide these — own them)

- `has_consented()` fails OPEN if Neo4j is unreachable, so the demo
  doesn't break mid-pitch. A real deployment should fail CLOSED.
- USSD/SMS channels currently treat continuing past the first message
  as implicit consent, since a feature phone can't show a checkbox.
  A real deployment needs an explicit opt-in step (e.g. "Reply YES to
  agree to data processing under NDPA 2023").
- No outbound SMS sending is wired yet (`/sms` returns JSON instead of
  calling Africa's Talking's Send SMS API) — straightforward to add
  once you have live AT credentials, intentionally deferred so the
  core logic could be finished and tested first.
