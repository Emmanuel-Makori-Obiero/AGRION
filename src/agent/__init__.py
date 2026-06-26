"""LangGraph multi-channel agentic system for AgriConnect Nigeria.

The package wires a small graph:

    triage → {agronomy|climate|finance}_expert → channel_formatter

Sessions are checkpointed to SQLite keyed by phone number, so an asynchronous
SMS reply or a dropped USSD session can be resumed on the next inbound message.
"""
