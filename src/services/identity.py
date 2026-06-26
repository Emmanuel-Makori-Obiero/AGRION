"""Phone-number minimisation.

The platform never persists raw MSISDNs. Every phone number is reduced to a
salted, truncated SHA-256 hash at the API boundary, so a graph/checkpoint leak
cannot directly expose a farmer's number (NDPA 2023 data-minimisation).

The hash is deterministic, so it still works as a stable per-farmer key for
session continuity and observation ownership. Matches the scheme used by the
legacy ``agrion-backend`` so identities line up across both stacks.
"""

from __future__ import annotations

import hashlib

from config.settings import get_settings


def hash_phone(phone_number: str) -> str:
    """Return a salted, truncated hash of an MSISDN (or any stable id)."""
    salt = get_settings().phone_hash_salt
    digest = hashlib.sha256(f"{salt}:{phone_number}".encode("utf-8")).hexdigest()
    return digest[:16]
