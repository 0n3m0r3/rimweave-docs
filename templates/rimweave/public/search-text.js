// Plain-text queries use the English index's own Lunr filters and stemmer.
export function searchText(lunr, index, text) {
  const terms = lunr.tokenizer(text)
    .map(token => lunr.trimmer(token))
    .filter(token => token.toString() && lunr.stopWordFilter(token));

  // An empty Lunr query matches every document, which is unhelpful here.
  if (terms.length === 0) return [];

  return index.query(query => {
    for (const term of terms) {
      // The index applies its search pipeline (stemming) exactly once.
      query.term(term.toString(), { presence: lunr.Query.presence.REQUIRED });
    }
  });
}
