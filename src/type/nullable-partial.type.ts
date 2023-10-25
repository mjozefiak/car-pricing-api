export type NullablePartial<S, T> = T extends keyof S
  ? { [K in T]: S[K] }
  : never;
