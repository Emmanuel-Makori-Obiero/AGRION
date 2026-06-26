"""Milestone 3 — RAG pipeline over agricultural PDFs (ChromaDB).

Ingests PDF guides (IITA agronomy manuals, NiMet bulletins, market reports)
into a persistent Chroma vector store, and exposes a retriever the specialist
nodes query.

Embeddings run locally via sentence-transformers so the pipeline needs no
embedding API key. Build the store once:

    python -m src.agent.rag            # ingest data/pdfs/*.pdf

then the experts call `get_retriever()` at query time.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path

from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config.settings import get_settings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "agri_knowledge"


@lru_cache(maxsize=1)
def _embeddings() -> HuggingFaceEmbeddings:
    # Cached so the sentence-transformers model is loaded into memory once per
    # process instead of on every retrieval (a multi-second cold start each).
    settings = get_settings()
    return HuggingFaceEmbeddings(model_name=settings.embedding_model)


def load_and_chunk(pdf_dir: Path) -> list:
    """Load every PDF under ``pdf_dir`` and split it into overlapping chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks: list = []
    for pdf_path in sorted(pdf_dir.glob("*.pdf")):
        logger.info("loading %s", pdf_path.name)
        pages = PyPDFLoader(str(pdf_path)).load()
        for page in pages:
            page.metadata.setdefault("source", pdf_path.name)
        chunks.extend(splitter.split_documents(pages))

    logger.info("produced %d chunks", len(chunks))
    return chunks


def build_vectorstore() -> Chroma:
    """(Re)build the persistent Chroma store from the configured PDF directory."""
    settings = get_settings()
    pdf_dir = Path(settings.agronomy_pdf_dir)
    persist_dir = Path(settings.chroma_persist_dir)
    persist_dir.mkdir(parents=True, exist_ok=True)

    chunks = load_and_chunk(pdf_dir)
    if not chunks:
        logger.warning("no PDFs found in %s; store will be empty", pdf_dir)

    store = Chroma.from_documents(
        documents=chunks,
        embedding=_embeddings(),
        collection_name=COLLECTION_NAME,
        persist_directory=str(persist_dir),
    )
    logger.info("vector store written to %s", persist_dir)
    return store


@lru_cache(maxsize=1)
def get_vectorstore() -> Chroma:
    """Open the existing persistent store (does not ingest).

    Cached: the Chroma client and its collection handle are opened once and
    reused across requests rather than rebuilt on every call.
    """
    settings = get_settings()
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=_embeddings(),
        persist_directory=str(settings.chroma_persist_dir),
    )


@lru_cache(maxsize=4)
def get_retriever(k: int = 4):
    """Return a retriever over the knowledge base, fetching the top-``k`` chunks.

    Cached per ``k`` so repeated calls reuse the same retriever (and the warm
    embedding model and vector store behind it).
    """
    return get_vectorstore().as_retriever(search_kwargs={"k": k})


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    build_vectorstore()
