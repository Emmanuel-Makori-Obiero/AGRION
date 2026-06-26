"""Environment-driven application configuration.

All runtime settings are loaded from environment variables (or a local `.env`
file) via Pydantic Settings, so the same image can be promoted across
environments without code changes.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_env: str = Field(default="development")
    log_level: str = Field(default="info")

    # Neo4j
    neo4j_uri: str = Field(default="bolt://localhost:7687")
    neo4j_user: str = Field(default="neo4j")
    neo4j_password: str = Field(default="changeme")
    neo4j_database: str = Field(default="neo4j")

    # Featherless (LLM / translation)
    featherless_api_key: str = Field(default="")
    featherless_base_url: str = Field(default="https://api.featherless.ai/v1")
    featherless_model: str = Field(
        default="meta-llama/Meta-Llama-3.1-8B-Instruct"
    )

    # Vision LLM (MMS diagnostics) — OpenAI-compatible vision endpoint
    vision_api_key: str = Field(default="")
    vision_base_url: str = Field(default="https://api.openai.com/v1")
    vision_model: str = Field(default="gpt-4o")
    vision_request_timeout: float = Field(default=30.0)
    vision_min_confidence: float = Field(default=0.45)
    # Local enhancement / quality-gate tuning
    vision_blur_threshold: float = Field(default=60.0)  # Laplacian-variance floor
    vision_min_brightness: float = Field(default=35.0)  # mean luma floor (0-255)
    vision_min_edge: int = Field(default=200)  # min shorter-side pixels
    vision_target_long_edge: int = Field(default=1024)
    vision_jpeg_quality: int = Field(default=90)
    # Optional basic-auth for fetching MMS media (Twilio media URLs require it).
    twilio_account_sid: str = Field(default="")
    twilio_auth_token: str = Field(default="")

    # ElevenLabs (text-to-speech)
    elevenlabs_api_key: str = Field(default="")
    elevenlabs_voice_id: str = Field(default="")  # default/fallback voice
    elevenlabs_base_url: str = Field(default="https://api.elevenlabs.io/v1")
    # Per-dialect voice ids; blank values fall back to elevenlabs_voice_id.
    elevenlabs_voice_hausa: str = Field(default="")
    elevenlabs_voice_yoruba: str = Field(default="")
    elevenlabs_voice_igbo: str = Field(default="")
    elevenlabs_voice_pidgin: str = Field(default="")
    elevenlabs_voice_english: str = Field(default="")

    # Speech-to-text (voice bridge) — OpenAI-compatible Whisper endpoint
    stt_api_key: str = Field(default="")
    stt_base_url: str = Field(default="https://api.openai.com/v1")
    stt_model: str = Field(default="whisper-1")

    # Public base URL Africa's Talking can reach to play back audio (e.g. an
    # ngrok/CDN host). Falls back to the request's own base URL when blank.
    public_base_url: str = Field(default="")

    # --- Privacy (item 2) ------------------------------------------------ #
    # Salt for hashing MSISDNs before they touch the graph/checkpointer. Set a
    # strong, secret value in production (NDPA data-minimisation).
    phone_hash_salt: str = Field(default="agrion-dev-salt")

    # --- Webhook hardening / SSRF (item 3) ------------------------------- #
    # Comma-separated domain suffixes the server may fetch media/recordings
    # from. Empty disables the allowlist (public-IP guard still applies).
    media_host_allowlist: str = Field(
        default="africastalking.com,twilio.com,amazonaws.com"
    )
    # Comma-separated CIDRs allowed to call the telephony webhooks. Empty
    # disables IP filtering (logs a warning).
    telephony_ip_allowlist: str = Field(default="")

    # --- USSD latency guard (item 4) ------------------------------------- #
    # Hard ceiling on the agent turn for USSD before we return a deterministic
    # fallback, so a slow LLM never kills the USSD session.
    ussd_agent_timeout: float = Field(default=8.0)

    # --- Externalised state (item 5) ------------------------------------- #
    # Redis URL for voice-session state; blank uses an in-process store.
    redis_url: str = Field(default="")
    # S3 bucket for synthesised audio; blank serves audio from local disk.
    audio_s3_bucket: str = Field(default="")
    audio_s3_region: str = Field(default="us-east-1")
    audio_s3_public_base: str = Field(default="")  # CDN/base in front of bucket

    # Africa's Talking
    at_username: str = Field(default="sandbox")
    at_api_key: str = Field(default="")

    # Audio cache
    audio_cache_dir: str = Field(default="./.cache/audio")

    # LangGraph agent
    checkpoint_db_path: str = Field(default="./.cache/checkpoints.sqlite")
    chroma_persist_dir: str = Field(default="./.cache/chroma")
    agronomy_pdf_dir: str = Field(default="./data/pdfs")
    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2"
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
