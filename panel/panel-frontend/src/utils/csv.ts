/** @format */

export function parseCSVLine(line: string): string[] {
  const tokens: string[] = [];

  let currIndex = 0;
  let token = "";
  let inQuote = false;
  while (currIndex < line.length) {
    const ch = line[currIndex];
    switch (true) {
      // not special char
      case ch !== "," && ch !== '"':
        token += ch;
        break;

      // comma
      case ch === ",":
        if (inQuote) {
          token += ch;
        } else {
          tokens.push(token);
          token = "";
          currIndex++;
          continue;
        }
        break;

      // quote
      case ch === '"':
        const lookahead = line[currIndex + 1];
        if (inQuote) {
          if (lookahead === '"') {
            token += '"';
            currIndex += 2;
            continue;
          } else if (lookahead === "," || lookahead === void 0) {
            inQuote = false;
          } else {
            throw new Error(`Unexpected follow set for '"': ${lookahead}`);
          }
        } else {
          inQuote = true;
        }
        break;

      default:
        throw new Error(`Unexpected char: ${ch}`);
    }
    currIndex++;
  }

  if (inQuote) {
    throw new Error("Unexpected state: quote unclosed");
  }

  tokens.push(token);

  return tokens;
}

export function parseCSV(csv: string): string[][] {
  let delim = "\n";
  if (csv.includes("\r\n")) {
    delim = "\r\n";
  }
  const lines = csv.split(delim);
  return lines.map((line) => parseCSVLine(line));
}

export function generateCSVLine(tokens: string[]): string {
  const escapedTokens = tokens.map((token) => {
    if (token.includes(",") || token.includes('"')) {
      return `"${token.replace(/"/g, '""')}"`;
    }
    return token;
  });
  return escapedTokens.join(",");
}

export function generateCSV(lineTokens: string[][]): string {
  return lineTokens.map((tokens) => generateCSVLine(tokens)).join("\r\n");
}
