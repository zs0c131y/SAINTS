import { describe, expect, it } from 'vitest';
import { parseCSV } from './csv';

describe('parseCSV', () => {
  it('splits simple rows', () => {
    expect(parseCSV('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });
  it('handles quoted commas, escaped quotes and embedded newlines', () => {
    expect(parseCSV('a,b\n"x, y","say ""hi""\nthere"')).toEqual([['a', 'b'], ['x, y', 'say "hi"\nthere']]);
  });
  it('accepts CRLF line endings and a missing trailing newline', () => {
    expect(parseCSV('a,b\r\n1,2\r\n')).toEqual([['a', 'b'], ['1', '2']]);
  });
  it('keeps empty cells', () => {
    expect(parseCSV('a,,c')).toEqual([['a', '', 'c']]);
  });
});
