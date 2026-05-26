from pathlib import Path
from typing import List, Dict, Any
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.config import settings
from app.services.document_loader import ASLDocumentLoader
from app.services.project_indexer import ProjectIndexer
import logging
import time
import unicodedata

logger = logging.getLogger(__name__)

class RAGEngine:
    _instance = None
    _initialized = False
    _app_workflow_keywords = {
        "app", "web", "website", "signlearn", "signlearno", "workflow", "flow",
        "route", "page", "menu", "button", "click", "tap", "where", "how to use",
        "dashboard", "lesson", "practice", "dictionary", "translator", "leaderboard",
        "login", "register", "signup", "account", "profile", "admin", "user",
        "xp", "streak", "progress", "camera", "done", "next", "back",
        "ung dung", "trang", "luong", "quy trinh", "huong dan", "su dung",
        "dung", "bam", "nhan", "vao dau", "o dau", "cho nao",
        "dang nhap", "dang ky", "tai khoan", "tien do", "diem", "xep hang",
        "bai hoc", "luyen tap", "tu dien", "dich", "nut",
    }

    def __new__(cls):
        if cls._instance is None or not cls._initialized:
            instance = super(RAGEngine, cls).__new__(cls)
            try:
                instance._initialize()
                cls._instance = instance
                cls._initialized = True
            except Exception as e:
                cls._instance = None
                cls._initialized = False
                logger.error(f"RAGEngine initialization failed: {e}")
                raise
        return cls._instance

    def _initialize(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is empty. "
                "Please set it in fastapi_backend/.env, e.g.: GEMINI_API_KEY=AIzaSy..."
            )

        self.chroma_dir = Path(settings.RAG_CHROMA_DIR)
        self.chroma_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"Initializing RAGEngine with ChromaDB at {self.chroma_dir}")

        # Initialize embeddings
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            google_api_key=api_key
        )
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=api_key,
            temperature=0.3
        )
        
        self._initialize_vectorstores()
        
        logger.info("RAGEngine initialized successfully.")
        
        self.system_prompt_template = """
Bạn là Trợ lý SignLearn (SignLearn Assistant), một AI chatbot được tích hợp trong nền tảng SignLearn
— một ứng dụng web để học Ngôn ngữ Ký hiệu Mỹ (ASL).

Bạn có 2 lĩnh vực chuyên môn chính:
1. KIẾN THỨC ASL: Ngữ pháp, từ vựng, cấu trúc câu, đánh vần bằng tay, văn hóa người khiếm thính.
2. KIẾN THỨC PROJECT SIGNLEARN: Bạn hiểu rõ kiến trúc ứng dụng web SignLearn, các trang, component, tính năng, và API.

Ngữ cảnh hiện tại của User:
- User đang truy cập đường dẫn (URL) này: {current_route}
Hãy dựa vào URL này để hiểu User đang ở trang nào, chức năng của trang đó là gì để hỗ trợ chính xác.

Quy tắc:
- BẮT BUỘC trả lời bằng TIẾNG VIỆT một cách tự nhiên, thân thiện.
- Dựa vào đường dẫn hiện tại, hãy chủ động hướng dẫn user cách sử dụng trang hiện tại hoặc cách đi đến trang khác nếu cần.
- Dựa vào [Context] được cung cấp dưới đây để trả lời câu hỏi.
- Nếu thông tin không có trong context, hãy thành thật trả lời là không biết.
- Giữ câu trả lời ngắn gọn, súc tích.
- Khi giải thích dấu hiệu ASL, dùng ký hiệu in hoa (ví dụ: "THANK-YOU").

[Context]:
{context}
"""
        self.system_prompt_template = """
Bạn là SignLearn Assistant, chatbot trong ứng dụng học Ngôn ngữ Ký hiệu Mỹ (ASL).

Phạm vi được phép trả lời:
1. Kiến thức ASL: từ vựng, ngữ pháp, cấu trúc câu, fingerspelling, văn hóa Deaf, cách thực hiện ký hiệu.
2. Workflow của app SignLearn: người dùng nên vào trang nào, bấm nút nào, dùng lesson/practice/dictionary/translator/dashboard ra sao.

Quy tắc bắt buộc:
- Luôn trả lời bằng tiếng Việt, ngắn gọn và trực tiếp.
- Nếu câu hỏi không liên quan đến ASL hoặc cách dùng app SignLearn, hãy từ chối lịch sự và nói rằng bạn chỉ hỗ trợ ASL và SignLearn.
- Với câu hỏi ASL thông thường, được dùng kiến thức chung của bạn; KHÔNG bị giới hạn bởi Context.
- Context chỉ là tài liệu bổ sung về workflow/app. Dùng Context khi nó liên quan, nhưng không cần nhắc nguồn nếu không cần.
- Nếu hỏi cách dùng app, ưu tiên hướng dẫn theo route và nút bấm cụ thể.
- User đang ở route: {current_route}
- Khi giải thích ký hiệu ASL, viết tên ký hiệu dạng in hoa khi phù hợp, ví dụ: THANK-YOU.

[App Workflow Context - optional]:
{context}
"""

    def _initialize_vectorstores(self):
        try:
            self.asl_vectorstore = Chroma(
                collection_name="asl_knowledge",
                embedding_function=self.embeddings,
                persist_directory=str(self.chroma_dir)
            )

            self.project_vectorstore = Chroma(
                collection_name="project_docs",
                embedding_function=self.embeddings,
                persist_directory=str(self.chroma_dir)
            )
        except KeyError as exc:
            if str(exc) != "'_type'":
                raise

            fallback_dir = self.chroma_dir.with_name(f"{self.chroma_dir.name}_v2")
            logger.warning(
                "Detected incompatible Chroma metadata schema in %s. "
                "Switching to new Chroma directory %s and reinitializing collections.",
                self.chroma_dir,
                fallback_dir,
            )

            self.chroma_dir = fallback_dir
            self.chroma_dir.mkdir(parents=True, exist_ok=True)

            self.asl_vectorstore = Chroma(
                collection_name="asl_knowledge",
                embedding_function=self.embeddings,
                persist_directory=str(self.chroma_dir)
            )

            self.project_vectorstore = Chroma(
                collection_name="project_docs",
                embedding_function=self.embeddings,
                persist_directory=str(self.chroma_dir)
            )

    def _normalize_for_match(self, value: str) -> str:
        lowered = value.lower()
        return "".join(
            char
            for char in unicodedata.normalize("NFKD", lowered)
            if not unicodedata.combining(char)
        )

    def _is_app_workflow_question(self, question: str, current_route: str) -> bool:
        normalized_question = self._normalize_for_match(question)
        normalized_route = self._normalize_for_match(current_route)

        if any(keyword in normalized_question for keyword in self._app_workflow_keywords):
            return True

        route_context_tokens = {
            "trang nay", "o day", "man nay", "bam gi", "lam gi",
            "tiep theo", "how", "where", "what should i do",
        }
        return normalized_route != "/" and any(token in normalized_question for token in route_context_tokens)
        
    def ingest_asl_documents(self):
        logger.info("Starting ASL ingestion...")
        loader = ASLDocumentLoader()
        docs = loader.load_documents()
        if docs:
            # We add documents in batches
            batch_size = 100
            for i in range(0, len(docs), batch_size):
                batch = docs[i:i+batch_size]
                self.asl_vectorstore.add_documents(batch)
                if i + batch_size < len(docs):
                    logger.info("Waiting 10s to avoid rate limits...")
                    time.sleep(10)
            logger.info(f"Ingested {len(docs)} ASL chunks.")
        else:
            logger.info("No ASL documents found to ingest.")

    def ingest_project_files(self):
        logger.info("Starting Project code ingestion...")
        indexer = ProjectIndexer()
        docs = indexer.load_project_files()
        if docs:
            batch_size = 100
            for i in range(0, len(docs), batch_size):
                batch = docs[i:i+batch_size]
                self.project_vectorstore.add_documents(batch)
                if i + batch_size < len(docs):
                    logger.info("Waiting 10s to avoid rate limits...")
                    time.sleep(10)
            logger.info(f"Ingested {len(docs)} Project chunks.")
        else:
            logger.info("No Project documents found to ingest.")

    def get_status(self) -> Dict[str, Any]:
        asl_count = self.asl_vectorstore._collection.count()
        project_count = self.project_vectorstore._collection.count()
        return {
            "asl_chunks": asl_count,
            "project_chunks": project_count,
            "ready": asl_count > 0 or project_count > 0
        }

    def ask(self, question: str, history: List[Dict[str, str]], current_route: str) -> Dict[str, Any]:
        all_docs = []
        if self._is_app_workflow_question(question, current_route):
            all_docs = self.project_vectorstore.similarity_search(question, k=settings.RAG_TOP_K)
        
        context_parts = []
        sources = set()
        for i, doc in enumerate(all_docs):
            source = doc.metadata.get("source", "Unknown")
            sources.add(source)
            context_parts.append(f"--- Document {i+1} ({source}) ---\n{doc.page_content}\n")
            
        context_str = "\n".join(context_parts)
        
        sys_msg = self.system_prompt_template.format(
            current_route=current_route,
            context=context_str
        )
        
        messages = [SystemMessage(content=sys_msg)]
        
        # Add history
        for msg in history:
            if msg.get("role") == "user":
                messages.append(HumanMessage(content=msg.get("content", "")))
            elif msg.get("role") == "assistant":
                messages.append(AIMessage(content=msg.get("content", "")))
                
        # Add current question
        messages.append(HumanMessage(content=question))
        
        response = self.llm.invoke(messages)
        
        return {
            "answer": response.content,
            "sources": list(sources)
        }
