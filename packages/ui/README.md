# @visorhq/ui

Design tokens, fonts and primitives shared by `apps/site` and `apps/web`.

## Writing text

- **Every line starts with a capital letter.** Headlines, paragraphs, buttons, links, list items, table cells and notes are all sentence case. Never start a line in lowercase.
- **Small caps labels come only from `<Label>`.** Use them for section headers, tags, column headers, stat names and badges. Type their text in sentence case too; the component turns it into caps.
- **Code and data stay exactly as they are in code:** commands, routes, commit SHAs, package, file and option names, units and project slugs. Keep them out of `<Label>`, where caps would change them.
- **Proper names keep their own casing:** Visor, Node, Express, GitHub, Slack, Postgres, MCP, SDK, API, CI, npm, p95.
- **Punctuation:** paragraphs, list items and descriptions end with a period. Labels, buttons, links and table cells don't.
- The wordmark is lowercase by design. In text, the product is always "Visor".
