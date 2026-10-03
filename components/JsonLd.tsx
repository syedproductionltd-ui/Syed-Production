/**
 * Renders a schema.org JSON-LD block into the document head.
 *
 * `JSON.stringify` output is injected verbatim, so any `<` in a value would
 * terminate the script tag early. Escaping it as \u003c is the standard fix and
 * keeps the JSON valid.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
