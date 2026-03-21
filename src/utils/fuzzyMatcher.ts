export function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9/\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshteinDistance(left: string, right: string) {
  const rows = left.length + 1;
  const columns = right.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(columns).fill(0));

  for (let row = 0; row < rows; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column < columns; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row < rows; row += 1) {
    for (let column = 1; column < columns; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost
      );
    }
  }

  return matrix[rows - 1][columns - 1];
}

export function fuzzyMatchScore(input: string, expected: string) {
  const normalizedInput = normalizeForMatch(input);
  const normalizedExpected = normalizeForMatch(expected);

  if (!normalizedInput || !normalizedExpected) {
    return 0;
  }

  if (normalizedInput === normalizedExpected) {
    return 1;
  }

  if (
    normalizedExpected.includes(normalizedInput) ||
    normalizedInput.includes(normalizedExpected)
  ) {
    return 0.9;
  }

  const distance = levenshteinDistance(normalizedInput, normalizedExpected);
  return Math.max(0, 1 - distance / Math.max(normalizedInput.length, normalizedExpected.length));
}
