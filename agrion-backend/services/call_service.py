"""
Africa's Talking outbound voice call trigger.

This implements Stage 2 ("Backend Initiates Call") of the Hybrid USSD-IVR
Bridge from the proposal: when a farmer presses the "Voice Assistance"
option in the USSD menu, this places an outbound call back to their phone.
Once they answer, Africa's Talking routes the call to your configured
Voice callback URL (the IVR webhook), landing them in a spoken menu.

Requires the `africastalking` package (add to requirements.txt) and a
voice-enabled Africa's Talking number (AT_VOICE_NUMBER) — a sandbox/test
number works for demo purposes, see https://account.africastalking.com.
"""
import os
import logging

logger = logging.getLogger(__name__)

_at_initialized = False


def _ensure_at_initialized() -> None:
    global _at_initialized
    if _at_initialized:
        return
    import africastalking

    username = os.getenv("AT_USERNAME", "sandbox")
    api_key = os.getenv("AT_API_KEY")
    if not api_key:
        raise RuntimeError("AT_API_KEY not configured")
    africastalking.initialize(username, api_key)
    _at_initialized = True


def trigger_voice_callback(phone_number: str) -> bool:
    """Place an outbound call to `phone_number` so the farmer lands on the
    IVR voice menu.

    Returns True if Africa's Talking accepted the call request, False on
    any failure (missing credentials, no voice-enabled number configured,
    AT API/network error). Callers should show an apologetic USSD message
    on False rather than let the exception propagate — this is exactly the
    kind of external-dependency call that must never crash a webhook.
    """
    try:
        _ensure_at_initialized()
        import africastalking

        call_from = os.getenv("AT_VOICE_NUMBER")
        if not call_from:
            logger.error("AT_VOICE_NUMBER not configured; cannot place outbound call")
            return False

        voice = africastalking.Voice
        voice.call(call_from, [phone_number])
        return True
    except Exception as exc:
        logger.error(f"[call_service] failed to trigger voice callback to {phone_number}: {exc}")
        return False
