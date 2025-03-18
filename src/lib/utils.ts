import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper function to format inline markdown
 * Supports: bold, italic, links
 * @param text The text to format
 * @returns A React element with formatted HTML
 */
function formatInlineMarkdown(text: string): React.ReactElement {
  // Process bold text (**text** or __text__)
  let formattedText = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, (_, g1, g2) => {
    const content = g1 || g2;
    return `<strong>${content}</strong>`;
  });
  
  // Process italic text (*text* or _text_)
  formattedText = formattedText.replace(/\*(.*?)\*|_(.*?)_/g, (_, g1, g2) => {
    // Skip if this was already processed as bold
    if (_.startsWith('**') || _.startsWith('__')) return _;
    const content = g1 || g2;
    return `<em>${content}</em>`;
  });
  
  // Process links [text](url)
  formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, (_, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline">${text}</a>`;
  });
  
  // Convert to React-safe HTML
  return React.createElement('span', { 
    dangerouslySetInnerHTML: { __html: formattedText } 
  });
}

/**
 * Formats markdown text with comprehensive styling
 * Supports: headers, paragraphs, code blocks, lists, and inline formatting
 * @param markdown The markdown text to format
 * @returns An array of React elements representing the formatted markdown
 */
export function formatMarkdown(markdown: string): React.ReactElement[] {
  // Split the markdown into paragraphs
  const paragraphs = markdown.split('\n\n');
  
  // Process each paragraph
  return paragraphs.map((paragraph, idx) => {
    // Code blocks
    if (paragraph.startsWith('```') && paragraph.endsWith('```')) {
      const codeContent = paragraph.substring(3, paragraph.length - 3);
      const firstLineBreak = codeContent.indexOf('\n');
      const language = firstLineBreak > 0 ? codeContent.substring(0, firstLineBreak).trim() : '';
      const code = firstLineBreak > 0 ? codeContent.substring(firstLineBreak + 1) : codeContent;
      
      return React.createElement('div', {
        key: idx,
        className: "bg-muted p-3 rounded-md font-mono text-sm overflow-x-auto my-4"
      }, [
        language && React.createElement('div', {
          key: 'lang',
          className: "text-xs text-muted-foreground mb-1"
        }, language),
        React.createElement('pre', { key: 'code' }, code)
      ].filter(Boolean));
    } 
    // Header 1
    else if (paragraph.startsWith('# ')) {
      return React.createElement('h1', {
        key: idx,
        className: "text-2xl font-bold mt-6 mb-4"
      }, formatInlineMarkdown(paragraph.substring(2)));
    } 
    // Header 2
    else if (paragraph.startsWith('## ')) {
      return React.createElement('h2', {
        key: idx,
        className: "text-xl font-bold mt-5 mb-3"
      }, formatInlineMarkdown(paragraph.substring(3)));
    } 
    // Header 3
    else if (paragraph.startsWith('### ')) {
      return React.createElement('h3', {
        key: idx,
        className: "text-lg font-bold mt-4 mb-2"
      }, formatInlineMarkdown(paragraph.substring(4)));
    } 
    // Unordered lists
    else if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
      const items = paragraph.split('\n').map(item => 
        item.trim().startsWith('- ') ? item.substring(2) : 
        item.trim().startsWith('* ') ? item.substring(2) : 
        item
      );
      
      return React.createElement('ul', {
        key: idx,
        className: "list-disc pl-5 mb-4 space-y-1"
      }, items.map((item, i) => 
        React.createElement('li', { key: i }, formatInlineMarkdown(item))
      ));
    } 
    // Ordered lists
    else if (/^\d+\.\s/.test(paragraph)) {
      const items = paragraph.split('\n').map(item => {
        const match = item.match(/^\d+\.\s(.*)/);
        return match ? match[1] : item;
      });
      
      return React.createElement('ol', {
        key: idx,
        className: "list-decimal pl-5 mb-4 space-y-1"
      }, items.map((item, i) => 
        React.createElement('li', { key: i }, formatInlineMarkdown(item))
      ));
    } 
    // Regular paragraphs
    else {
      return React.createElement('p', {
        key: idx,
        className: "mb-4"
      }, formatInlineMarkdown(paragraph));
    }
  });
} 