def estimate_tokens(text: str):
    words = text.split()
    return int(len(words) * 1.3)