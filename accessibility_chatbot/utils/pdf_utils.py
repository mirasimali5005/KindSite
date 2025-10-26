from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.units import inch
from PyPDF2 import PdfReader
import io
import markdown

def create_accessible_pdf(output_path, title, content_markdown, accessibility_notes=""):
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                            rightMargin=inch, leftMargin=inch,
                            topMargin=inch, bottomMargin=inch)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(title, styles['h1']))
    story.append(Spacer(1, 0.2 * inch))

    # Add accessibility notes if provided
    if accessibility_notes:
        story.append(Paragraph("<b>Accessibility Notes:</b>", styles['h3']))
        story.append(Paragraph(accessibility_notes, styles['Normal']))
        story.append(Spacer(1, 0.1 * inch))

    # Convert Markdown content to ReportLab Paragraphs
    # This is a basic conversion; for more complex Markdown,
    # you might need a more robust parser or direct HTML-to-PDF conversion.
    html_content = markdown.markdown(content_markdown)
    for line in html_content.split('\n'):
        if line.strip():
            # Basic styling for paragraphs, lists, etc.
            if line.startswith('<h1'): story.append(Paragraph(line.replace('<h1>','').replace('</h1>',''), styles['h1']))
            elif line.startswith('<h2'): story.append(Paragraph(line.replace('<h2>','').replace('</h2>',''), styles['h2']))
            elif line.startswith('<h3'): story.append(Paragraph(line.replace('<h3>','').replace('</h3>',''), styles['h3']))
            elif line.startswith('<p>'): story.append(Paragraph(line.replace('<p>','').replace('</p>',''), styles['Normal']))
            elif line.startswith('<ul>') or line.startswith('<ol>'):
                # Handle lists - very basic, you might want more sophisticated list handling
                list_style = ParagraphStyle('ListStyle', parent=styles['Normal'],
                                            leftIndent=0.2*inch, firstLineIndent=-0.2*inch)
                list_items = [item.replace('<li>','').replace('</li>','') for item in line.split('<li>') if '<li>' in item]
                for item in list_items:
                    if item.strip():
                        story.append(Paragraph(f"• {item.strip()}", list_style))
            elif line.startswith('<b>') or line.startswith('<strong>'):
                story.append(Paragraph(line, styles['Normal'])) # Will render as bold if markdown correctly converted it

            else:
                story.append(Paragraph(line, styles['Normal']))
            story.append(Spacer(1, 0.05 * inch))


    doc.build(story)
    return output_path

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None