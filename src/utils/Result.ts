/* eslint-disable max-classes-per-file */
/* eslint-disable no-empty-function */
export class ResultSuccess<T> {
  public readonly success = true;

  constructor(public readonly data: T) {}
}

export class ResultError<E extends string = string> {
  public readonly success = false;

  constructor(public readonly error: E) {}
}

export type Result<T, E extends string = string> = ResultSuccess<T> | ResultError<E>;
