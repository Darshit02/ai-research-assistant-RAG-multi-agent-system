from rank_bm25 import BM25Okapi
import re


def tokenize(text):
    return re.findall(r"\w+", text.lower())


def keyword_search(question, chunks, top_k=5):

    corpus = [chunk["text"] for chunk in chunks]

    tokenized_corpus = [tokenize(doc) for doc in corpus]

    bm25 = BM25Okapi(tokenized_corpus)

    tokenized_query = tokenize(question)

    scores = bm25.get_scores(tokenized_query)

    ranked = sorted(
        zip(chunks, scores),
        key=lambda x: x[1],
        reverse=True
    )

    return [r[0] for r in ranked[:top_k]]