import { useEffect, useRef } from 'react';
import katex from 'katex';

interface LatexRendererProps {
  content: string;
  className?: string;
}

export function LatexRenderer({ content, className = '' }: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Parse and render LaTeX in the content
      const processedContent = renderLatex(content);
      containerRef.current.innerHTML = processedContent;
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      containerRef.current.textContent = content;
    }
  }, [content]);

  return <div ref={containerRef} className={className} />;
}

function renderLatex(text: string): string {
  if (!text) return '';

  try {
    // First, handle block math ($$...$$)
    let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch (e) {
        return match;
      }
    });

    // Then handle inline math ($...$)
    // eslint-disable-next-line no-useless-escape
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (match, latex) => {
      try {
        return katex.renderToString(latex.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch (e) {
        return match;
      }
    });

    return processed;
  } catch (error) {
    console.error('Error processing LaTeX:', error);
    return text;
  }
}
