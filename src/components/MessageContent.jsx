import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

const MessageContent = ({ content, className = "", isDark = false }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  // Function to copy code to clipboard
  const copyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Function to detect and format code blocks
  const formatContent = (text) => {
    // Split by code blocks (```language or just ```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let codeBlockIndex = 0;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        parts.push(
          <span key={`text-${match.index}`}>
            {formatInlineElements(beforeText)}
          </span>
        );
      }

      // Add code block
      const language = match[1] || 'text';
      const code = match[2].trim();
      
      parts.push(
        <div key={`code-${codeBlockIndex}`} className="my-4 relative group">
          <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {language}
            </span>
            <button
              onClick={() => copyCode(code, codeBlockIndex)}
              className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white rounded transition-colors cursor-pointer"
            >
              {copiedCode === codeBlockIndex ? (
                <><Check size={14} /> Copied</>
              ) : (
                <><Copy size={14} /> Copy</>
              )}
            </button>
          </div>
          <SyntaxHighlighter
            language={language}
            style={isDark ? oneDark : oneLight}
            customStyle={{
              margin: 0,
              borderRadius: '0 0 0.5rem 0.5rem',
              fontSize: '14px',
              lineHeight: '1.5',
              backgroundColor: isDark ? '#1e1e1e' : '#fafafa',
            }}
            showLineNumbers={true}
            wrapLines={true}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      );

      lastIndex = match.index + match[0].length;
      codeBlockIndex++;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(
        <span key={`text-end`}>
          {formatInlineElements(remainingText)}
        </span>
      );
    }

    return parts.length > 0 ? parts : [formatInlineElements(text)];
  };

  // Function to format inline elements (bold, italic, inline code, etc.)
  const formatInlineElements = (text) => {
    const parts = [];
    let currentText = text;
    let keyIndex = 0;

    // Handle inline code first (single backticks)
    const inlineCodeRegex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;

    while ((match = inlineCodeRegex.exec(currentText)) !== null) {
      // Add text before inline code
      if (match.index > lastIndex) {
        const beforeText = currentText.slice(lastIndex, match.index);
        parts.push(formatTextFormatting(beforeText, keyIndex++));
      }

      // Add inline code
      parts.push(
        <code
          key={`inline-code-${keyIndex++}`}
          className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-green-400 rounded text-sm font-mono border border-gray-200 dark:border-gray-700"
        >
          {match[1]}
        </code>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < currentText.length) {
      const remainingText = currentText.slice(lastIndex);
      parts.push(formatTextFormatting(remainingText, keyIndex++));
    }

    return parts.length > 0 ? parts : [formatTextFormatting(currentText, keyIndex++)];
  };

  // Function to handle bold, italic, etc.
  const formatTextFormatting = (text, key) => {
    // Split into paragraphs and preserve line breaks
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, pIndex) => {
      const lines = paragraph.split('\n');
      
      return (
        <div key={`${key}-p-${pIndex}`} className={pIndex > 0 ? 'mt-4' : ''}>
          {lines.map((line, lIndex) => (
            <span key={`${key}-p-${pIndex}-l-${lIndex}`}>
              {formatBoldItalic(line)}
              {lIndex < lines.length - 1 && <br />}
            </span>
          ))}
        </div>
      );
    });
  };

  // Function to handle bold and italic formatting
  const formatBoldItalic = (text) => {
    // Handle **bold** and *italic*
    const parts = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      // Add text before formatting
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      const matched = match[1];
      if (matched.startsWith('**') && matched.endsWith('**')) {
        // Bold
        parts.push(
          <strong key={`bold-${keyIndex++}`} className="font-semibold">
            {matched.slice(2, -2)}
          </strong>
        );
      } else if (matched.startsWith('*') && matched.endsWith('*')) {
        // Italic
        parts.push(
          <em key={`italic-${keyIndex++}`} className="italic">
            {matched.slice(1, -1)}
          </em>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
        {formatContent(content)}
      </div>
    </div>
  );
};

export default MessageContent;
