from app.services.pdf_loader import extract_text_from_pdf

text = extract_text_from_pdf("uploads/random.pdf")
print(text[:500])   