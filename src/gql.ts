/**
 * gql template tag that just returns the query as a string for use in backend
 * tests
 */
export function gql(query: TemplateStringsArray): string {
  return query.join("\n");
}
