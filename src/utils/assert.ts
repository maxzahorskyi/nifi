export default function assert(expression: unknown): asserts expression {
  if (!expression) throw new Error('Assertion fault');
}
