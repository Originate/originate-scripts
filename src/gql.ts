/**
 * gql template tag that just returns the query as a string for use in backend
 * tests
 */
export function gql(
  query: TemplateStringsArray,
  ...interpolations: string[]
): string {
  return query
    .flatMap((string, index) => [string, interpolations[index]])
    .join("");
}
