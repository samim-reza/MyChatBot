import ReactMarkdown from 'react-markdown';

function trimUrl(url: string): { href: string; trailing: string } {
  const match = url.match(/^(.*?)([),.;:!?]+)$/);
  if (!match) return { href: url, trailing: '' };
  const [, href, trailing] = match;
  if (href.endsWith('/')) return { href: url, trailing: '' };
  return { href, trailing };
}

export function autolinkText(text: string): string {
  return text
    .split(/(!?\[[^\]]*\]\([^)]+\))/)
    .map((part, index) => {
      if (index % 2 === 1) return part;
      return part
        .replace(/\bhttps?:\/\/[^\s<]+/gi, (url) => {
          const { href, trailing } = trimUrl(url);
          return `[${href}](${href})${trailing}`;
        })
        .replace(
          /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
          (email) => `[${email}](mailto:${email})`,
        );
    })
    .join('');
}

export default function ChatMarkdown({
  text,
  onPrimary = false,
}: {
  text: string;
  onPrimary?: boolean;
}) {
  return (
    <ReactMarkdown
      urlTransform={(url) => url}
      components={{
        a: ({ href, children, ...props }) => (
          <a
            {...props}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              onPrimary
                ? 'font-medium break-all text-inherit underline underline-offset-2 hover:opacity-80'
                : 'text-primary font-medium break-all underline underline-offset-2 hover:opacity-80'
            }
          >
            {children}
          </a>
        ),
        p: (props) => <p {...props} className="m-0 leading-relaxed" />,
        ul: (props) => <ul {...props} className="m-0 pl-4" />,
        ol: (props) => <ol {...props} className="m-0 pl-4" />,
        li: (props) => <li {...props} className="m-0" />,
        strong: (props) => <strong {...props} className="font-semibold" />,
      }}
    >
      {autolinkText(text)}
    </ReactMarkdown>
  );
}
