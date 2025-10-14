"""Main QA Bot implementation with RAG and chat history."""
from typing import List, AsyncGenerator, Dict
import time
import logging
from langchain_core.output_parsers import StrOutputParser

from services.llm_service import setup_llm, setup_prompt_template, setup_vector_store


class SamimBot:
    """Samim's personal chatbot with RAG and conversation history."""
    
    def __init__(
        self, 
        prompt_template, 
        messages_store,
        personal_store,
        academic_store,
        projects_store,
        style_store,
        llm, 
        max_history: int = 6
    ):
        self.prompt_template = prompt_template
        self.messages_store = messages_store
        self.personal_store = personal_store
        self.academic_store = academic_store
        self.projects_store = projects_store
        self.style_store = style_store
        self.llm = llm
        self.max_history = max_history
        self.parser = StrOutputParser()
        self.history: List[str] = []

    async def update_history(self, question: str, answer: str):
        """
        Update conversation history.
        If the history list is higher than max_history, delete 2 previous items.
        """
        if len(self.history) > self.max_history:
            del self.history[:2]

        self.history.extend([f"HUMAN: {question}", f"AI: {answer}"])

    async def get_history(self) -> str:
        """Returns the formatted history string."""
        return "\n".join([chat for chat in self.history])

    @classmethod
    async def create(cls):
        """Factory method to create a fully configured bot instance."""
        max_history = 6
        
        # Setup multiple namespace stores
        messages_store = await setup_vector_store(namespace="messages")
        personal_store = await setup_vector_store(namespace="personal")
        academic_store = await setup_vector_store(namespace="academic")
        projects_store = await setup_vector_store(namespace="projects")
        style_store = await setup_vector_store(namespace="style")
        
        llm = await setup_llm(max_tokens=300)
        prompt_template = await setup_prompt_template()

        return cls(
            prompt_template, 
            messages_store,
            personal_store,
            academic_store,
            projects_store,
            style_store,
            llm, 
            max_history
        )

    def _decode_text(self, text: str) -> str:
        """Decode potentially mojibake Bengali text."""
        if not text:
            return text
        try:
            if any(ord(c) > 127 for c in text):
                try:
                    return text.encode('latin1').decode('utf-8')
                except Exception:
                    try:
                        return text.encode('windows-1252').decode('utf-8')
                    except Exception:
                        pass
            return text
        except Exception:
            return text

    async def _get_relevant_context(self, question: str) -> str:
        """Retrieve relevant context from all vector stores (optimized with parallel search)."""
        import time
        import asyncio
        logger = logging.getLogger(__name__)
        contexts = []
        
        t_start = time.perf_counter()
        
        # Run all searches in parallel for speed
        # Increased personal k=3 to catch more contact info (email, facebook, linkedin, etc.)
        # Skip messages namespace (empty, wastes 14s)
        search_tasks = [
            self.personal_store.asimilarity_search(question, k=2),
            self.academic_store.asimilarity_search(question, k=1),
            self.projects_store.asimilarity_search(question, k=1),
            self.style_store.asimilarity_search(question, k=1),
        ]
        
        results = await asyncio.gather(*search_tasks, return_exceptions=True)
        t_end = time.perf_counter()
        
        # Process results
        namespace_names = ["personal", "academic", "projects", "style"]
        for i, (docs, name) in enumerate(zip(results, namespace_names)):
            if isinstance(docs, Exception):
                logger.error(f"[ERROR] {name} namespace search failed: {docs}")
                continue
            logger.info(f"[TIMING] {name} namespace: found {len(docs)} docs")
            for doc in docs:
                content = self._decode_text(doc.page_content)
                contexts.append(content)
        
        logger.info(f"[TIMING] Parallel vector search completed in {t_end - t_start:.3f}s (was 33s serial)")
        
        return "\n\n".join(contexts)

    async def ask_bot(self, question: str) -> AsyncGenerator[Dict[str, str], None]:
        """
        Ask the bot a question and stream the response.
        
        Yields:
            Dict with 'type' and 'content' keys for streaming chunks.
        """
        logger = logging.getLogger(__name__)
        start_total = time.perf_counter()

        try:
            logger.info(f"[TIMING] Received question: {question}")

            # Get conversation history
            t0 = time.perf_counter()
            chat_history = await self.get_history()
            t1 = time.perf_counter()
            logger.info(f"[TIMING] History retrieved in {t1 - t0:.3f}s")

            # Retrieve relevant context from all namespaces (vector DB search - now parallel!)
            docs_content = await self._get_relevant_context(question)
            print(f"\n{'='*80}")
            print(f"[DEBUG] QUESTION: {question}")
            print(f"[DEBUG] RETRIEVED CONTEXT:")
            print(docs_content[:1000])  # Print first 1000 chars
            print(f"{'='*80}\n")
            logger.info(f"[DEBUG] Retrieved {len(docs_content)} chars of context")

            # Format the prompt
            message = self.prompt_template.invoke({
                "chat_history": chat_history,
                "context": docs_content,
                "question": question
            })

            logger.info(f"[TIMING] Prompt formatted")

            # Stream the response and measure LLM latency to first chunk
            full_content = ""
            first_chunk_time = None
            llm_start = time.perf_counter()
            chunk_count = 0
            async for chunk in self.llm.astream(message):
                chunk_count += 1
                now = time.perf_counter()
                if first_chunk_time is None:
                    first_chunk_time = now - llm_start
                    logger.info(f"[TIMING] LLM first chunk after {first_chunk_time:.3f}s")

                if chunk.content:
                    full_content += chunk.content
                    yield {"type": "chunk", "content": chunk.content}

            end_total = time.perf_counter()
            logger.info(f"[TIMING] LLM streaming finished: chunks={chunk_count}, total_time={end_total - start_total:.3f}s")

            # Update history with the complete response
            await self.update_history(question, full_content)

        except Exception as e:
            logger.error(f"[ERROR] ask_bot exception: {e}")
            yield {"type": "error", "content": str(e)}
