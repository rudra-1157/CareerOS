from typing import List, Dict

class InstitutionalRAGRetriever:
    def __init__(self):
        self.institutional_documents = [
            {
                "topic": "Operating Systems",
                "title": "Processes, Threads & Concurrency Guide",
                "category": "Core CS",
                "content": "A process is an executing program instance with its own address space. Threads are lightweight units of execution within a process that share memory. Synchronization mechanisms like Semaphores, Mutexes, and Monitors prevent race conditions in critical sections. Classical problems: Producer-Consumer, Dining Philosophers, Readers-Writers."
            },
            {
                "topic": "Data Structures & Algorithms",
                "title": "DSA Core Concepts & Asymptotic Analysis",
                "category": "CS Core",
                "content": "Hash tables provide average O(1) time complexity for search, insert, and delete operations. Balanced search trees (AVL, Red-Black) guarantee O(log n) worst-case. Graph algorithms: Dijkstra uses min-heap priority queue in O((V+E) log V) for shortest paths; Kahn's algorithm performs topological sorting using in-degree arrays."
            },
            {
                "topic": "Database Management Systems",
                "title": "Relational Normalization and Indexing",
                "category": "Databases",
                "content": "Normalization (1NF through BCNF) eliminates update anomalies and data redundancy. ACID properties (Atomicity, Consistency, Isolation, Durability) ensure transactional integrity. B+ Tree indexes speed up range queries and exact matching by keeping keys sorted with all data pointers at the leaf level."
            },
            {
                "topic": "Machine Learning",
                "title": "Supervised Learning, Deep Learning & Evaluation",
                "category": "AI/ML",
                "content": "Supervised learning models include Linear/Logistic Regression, Decision Trees, Random Forests, and Gradient Boosting. Evaluation metrics: Precision, Recall, F1 Score, and ROC-AUC for classification; RMSE/MAE for regression. Deep learning: Convolutional Neural Networks (CNNs) for spatial data, Transformers with self-attention for sequential data."
            },
            {
                "topic": "System Design & Cloud",
                "title": "Scalable Web Architecture & Microservices",
                "category": "Systems",
                "content": "Scalable systems use horizontal scaling, load balancers, caching layers (Redis/Memcached), message queues (Kafka/RabbitMQ), and database sharding. CAP Theorem states a distributed system can guarantee at most two out of Consistency, Availability, and Partition Tolerance."
            }
        ]

    def retrieve(self, query: str, top_k: int = 2) -> List[Dict[str, str]]:
        q_lower = query.lower()
        results = []
        
        # Keyword and topic matching for relevant syllabus sections
        for doc in self.institutional_documents:
            topic_terms = doc["topic"].lower().split()
            content_snippet = doc["content"].lower()
            
            # Check for topic match or content keyword match
            match_score = sum(1 for term in topic_terms if term in q_lower) + \
                          sum(1 for word in q_lower.split() if len(word) > 3 and word in content_snippet)
            
            if match_score > 0:
                results.append((match_score, doc))

        if results:
            results.sort(key=lambda x: x[0], reverse=True)
            return [doc for _, doc in results[:top_k]]
        
        # If no specific match, return empty list so the LLM responds purely with general knowledge
        return []

rag_retriever = InstitutionalRAGRetriever()
