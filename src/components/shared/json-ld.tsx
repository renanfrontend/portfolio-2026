/** Insere dados estruturados (Schema.org) na página. */
export function JsonLd({ data }: { data: string }) {
  // O JSON vem de objetos montados no servidor; "<" é escapado para não fechar a tag script.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: data.replace(/</g, "\\u003c") }} />;
}
