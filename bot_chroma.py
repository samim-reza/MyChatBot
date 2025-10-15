"""Main QA Bot implementation with RAG using ChromaDB."""
from typing import List, AsyncGenerator, Dict
import time
import logging
from langchain_core.output_parsers import StrOutputParser

from services.chroma_service import setup_llm, setup_prompt_template, setup_vector_store


class SamimBot:
    """Samim's personal chatbot with RAG and conversation history using ChromaDB."""
    
    def __init__(
        self, 
        prompt_template, 
        personal_store,
        academic_store,
        projects_store,
        style_store,
        llm, 
        max_history: int = 6
    ):
        self.prompt_template = prompt_template
        self.personal_store = personal_store
        self.academic_store = academic_store
        self.projects_store = projects_store
        self.style_store = style_store
        self.llm = llm
        self.max_history = max_history
        self.parser = StrOutputParser()
        self.history: List[str] = []

    async def update_history(self, question: str, answer: str):
        """Update conversation history."""
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
        
        print("🔄 Initializing ChromaDB vector stores...")
        
        # Setup collection stores
        personal_store = await setup_vector_store(collection_name="personal")
        academic_store = await setup_vector_store(collection_name="academic")
        projects_store = await setup_vector_store(collection_name="projects")
        style_store = await setup_vector_store(collection_name="style")
        
        llm = await setup_llm(max_tokens=300)
        prompt_template = await setup_prompt_template()

        print("✅ Bot initialized successfully with ChromaDB")

        return cls(
            prompt_template, 
            personal_store,
            academic_store,
            projects_store,
            style_store,
            llm, 
            max_history
        )

    async def _get_relevant_context(self, question: str) -> str:
        """Retrieve relevant context from all vector stores."""
        logger = logging.getLogger(__name__)
        contexts = []
        
        t_start = time.perf_counter()
        
        # Search each collection sequentially (ChromaDB/SQLite is not thread-safe)
        # This is fast enough - each search takes ~5-10ms
        collections_config = [
            (self.personal_store, "personal", 5),
            (self.academic_store, "academic", 2),
            (self.projects_store, "projects", 2),
            (self.style_store, "style", 1),
        ]
        
        results = []
        for store, name, k in collections_config:
            try:
                docs = store.similarity_search(question, k=k)
                logger.info(f"[TIMING] {name} collection: found {len(docs)} docs")
                results.append((docs, name))
            except Exception as e:
                logger.error(f"[ERROR] {name} collection search failed: {e}")
                import traceback
                logger.error(traceback.format_exc())
                results.append(([], name))
        
        t_end = time.perf_counter()
        
        # Process results
        for docs, name in results:
            for doc in docs:
                contexts.append(doc.page_content)
        
        logger.info(f"[TIMING] Sequential vector search completed in {t_end - t_start:.3f}s")
        
        return "\n\n".join(contexts)

    async def ask_bot(self, question: str) -> AsyncGenerator[Dict[str, str], None]:
        """Ask the bot a question and stream the response."""
        logger = logging.getLogger(__name__)
        start_total = time.perf_counter()

        try:
            logger.info(f"[TIMING] Received question: {question}")

            # Get conversation history
            t0 = time.perf_counter()
            chat_history = await self.get_history()
            t1 = time.perf_counter()
            logger.info(f"[TIMING] History retrieved in {t1 - t0:.3f}s")

            # Retrieve relevant context from all collections
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

            # Stream the response
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

            # Update history
            await self.update_history(question, full_content)

        except Exception as e:
            logger.error(f"[ERROR] ask_bot exception: {e}")
            import traceback
            logger.error(f"[ERROR] Traceback: {traceback.format_exc()}")
            yield {"type": "error", "content": str(e)}
