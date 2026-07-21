import hashlib
import re
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path

from docx import Document
from pypdf import PdfReader


MAX_CHUNK_CHARACTERS = 4_000


@dataclass(frozen=True)
class ExtractedSection:
    text: str
    page_number: int | None = None
    heading: str = ''


class _TextHTMLParser(HTMLParser):
    BLOCK_TAGS = {'article', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'p', 'section'}

    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in self.BLOCK_TAGS:
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in self.BLOCK_TAGS:
            self.parts.append('\n')

    def handle_data(self, data):
        self.parts.append(data)

    def text(self):
        return ''.join(self.parts)


def extract_sections(document):
    extension = Path(document.original_filename).suffix.lower()
    with document.file.open('rb') as source:
        if extension == '.pdf':
            reader = PdfReader(source)
            return [
                ExtractedSection(text=page.extract_text() or '', page_number=index)
                for index, page in enumerate(reader.pages, start=1)
            ]
        if extension == '.docx':
            parsed = Document(source)
            sections = []
            current_heading = ''
            paragraphs = []
            for paragraph in parsed.paragraphs:
                text = paragraph.text.strip()
                if not text:
                    continue
                if paragraph.style and paragraph.style.name.startswith('Heading'):
                    if paragraphs:
                        sections.append(ExtractedSection('\n\n'.join(paragraphs), heading=current_heading))
                        paragraphs = []
                    current_heading = text
                else:
                    paragraphs.append(text)
            if paragraphs or current_heading:
                sections.append(ExtractedSection('\n\n'.join(paragraphs), heading=current_heading))
            return sections
        raw = source.read().decode('utf-8-sig')
        if extension in {'.html', '.htm'}:
            parser = _TextHTMLParser()
            parser.feed(raw)
            raw = parser.text()
        return [ExtractedSection(raw)]


def chunk_sections(sections, max_characters=MAX_CHUNK_CHARACTERS):
    chunks = []
    for section in sections:
        paragraphs = [
            re.sub(r'\s+', ' ', paragraph).strip()
            for paragraph in re.split(r'\n\s*\n|(?<=\.)\s+(?=[A-Z])', section.text)
        ]
        paragraphs = [paragraph for paragraph in paragraphs if paragraph]
        current = []
        current_length = 0
        for paragraph in paragraphs:
            if current and current_length + len(paragraph) + 2 > max_characters:
                chunks.append(_make_chunk(current, section))
                current = []
                current_length = 0
            if len(paragraph) > max_characters:
                if current:
                    chunks.append(_make_chunk(current, section))
                    current = []
                    current_length = 0
                for offset in range(0, len(paragraph), max_characters):
                    chunks.append(_make_chunk([paragraph[offset:offset + max_characters]], section))
                continue
            current.append(paragraph)
            current_length += len(paragraph) + 2
        if current:
            chunks.append(_make_chunk(current, section))
    return chunks


def _make_chunk(parts, section):
    content = '\n\n'.join(parts)
    return {
        'page_number': section.page_number,
        'heading': section.heading,
        'content': content,
        'content_hash': hashlib.sha256(content.encode('utf-8')).hexdigest(),
        'character_count': len(content),
        'metadata': {},
    }
