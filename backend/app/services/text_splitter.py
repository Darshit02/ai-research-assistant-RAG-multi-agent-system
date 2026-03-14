from langchain_text_splitters import RecursiveCharacterTextSplitter

def split_text(text: str):

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_text(text)
    return chunks

def split_pages(pages):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = []
    for page in pages:
        texts = splitter.split_text(page["text"])
        for t in texts:
            chunks.append({
                "text": t,
                "page": page["page"]
            })
    return chunks