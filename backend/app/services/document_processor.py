from pdfminer.high_level import extract_text
import io
from typing import BinaryIO


class DocumentProcessor:
    """Process PDF and text documents for RAG"""
    
    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        """
        Extract text from PDF file using pdfminer for better accuracy
        
        Args:
            file_bytes: PDF file content as bytes
            
        Returns:
            Extracted text content
        """
        try:
            # pdfminer expects a file-like object or path. 
            # We use BytesIO to wrap the bytes.
            pdf_file = io.BytesIO(file_bytes)
            return extract_text(pdf_file)
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")
    
    def extract_text_from_txt(self, file_bytes: bytes) -> str:
        """
        Extract text from TXT file
        
        Args:
            file_bytes: Text file content as bytes
            
        Returns:
            Decoded text content
        """
        try:
            return file_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # Try other encodings
            try:
                return file_bytes.decode('latin-1')
            except Exception as e:
                raise Exception(f"Error decoding text file: {str(e)}")
    
    def process_document(self, file_bytes: bytes, filename: str) -> str:
        """
        Process document based on file type
        
        Args:
            file_bytes: File content as bytes
            filename: Original filename to determine type
            
        Returns:
            Extracted text content
        """
        if filename.lower().endswith('.pdf'):
            return self.extract_text_from_pdf(file_bytes)
        elif filename.lower().endswith('.txt'):
            return self.extract_text_from_txt(file_bytes)
        else:
            raise ValueError(f"Unsupported file type: {filename}")
    
    def chunk_text(self, text: str, chunk_size: int = 1000) -> list[str]:
        """
        Split text into chunks for processing
        
        Args:
            text: Full document text
            chunk_size: Maximum characters per chunk
            
        Returns:
            List of text chunks
        """
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0
        
        for word in words:
            word_length = len(word) + 1  # +1 for space
            if current_length + word_length > chunk_size and current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_length = word_length
            else:
                current_chunk.append(word)
                current_length += word_length
        
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        
        return chunks


# Global instance
document_processor = DocumentProcessor()
