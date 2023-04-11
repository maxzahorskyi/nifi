/* eslint-disable */
import assert from './assert';
import { Result, ResultError, ResultSuccess } from './Result';

type ResponseSuccess = {
  readonly success: true;
  readonly data: unknown;
};

type ResponseError = {
  readonly success: false | undefined;
  readonly message: string;
};

type Response = ResponseSuccess | ResponseError;

function isResponseSuccess(data: unknown): data is ResponseSuccess {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as ResponseSuccess).success === 'boolean' &&
    ((data as ResponseSuccess).success as unknown) === true &&
    typeof (data as ResponseSuccess).data !== 'undefined'
  );
}

function isResponseError(data: unknown): data is ResponseError {
  return (
    typeof data === 'object' && data !== null && typeof (data as ResponseError).message === 'string'
  );
}

function isResponse(data: unknown): data is Response {
  return isResponseSuccess(data) || isResponseError(data);
}

function isString(data: unknown): data is string {
  return typeof data === 'string';
}

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  public static isNullableResponse<T>(
    validator: (validatorData: unknown) => validatorData is T,
  ): (newValidatorData: unknown) => newValidatorData is T | null {
    return (newValidatorData: unknown): newValidatorData is T | null => {
      if (newValidatorData === null) {
        return true;
      }

      return validator(newValidatorData);
    };
  }

  public async request<T, E extends string = string>(
    method: 'GET' | 'POST',
    headers: HeadersInit | undefined,
    body: BodyInit | undefined,
    subUrl: string,
    validator: (data: unknown) => data is T,
    errorValidator: (error: unknown) => error is E,
  ): Promise<Result<T, E>> {
    const response = await fetch(`${this.baseUrl}${subUrl}`, {
      method,
      headers,
      body,
    });

    const result: unknown = await response.json();

    if (!isResponse(result)) {
      throw new Error('Invalid response');
    }

    if (result.success) {
      if (!validator(result.data)) {
        throw new Error('Invalid response');
      }

      return new ResultSuccess(result.data);
    }

    if (errorValidator(result.message)) {
      return new ResultError(result.message);
    }

    console.log('Invalid response:');
    console.log(result.message);

    throw new Error('Invalid response');
  }

  public async requestGet<T, E extends string = string>(
    subUrl: string,
    validator: (data: unknown) => data is T,
    errorValidator: (error: unknown) => error is E,
  ): Promise<Result<T, E>> {
    return await this.request('GET', undefined, undefined, subUrl, validator, errorValidator);
  }

  public async requestPost<T, E extends string = string>(
    subUrl: string,
    input: unknown,
    validator: (data: unknown) => data is T,
    errorValidator: (error: unknown) => error is E,
  ): Promise<Result<T, E>> {
    return await this.request(
      'POST',
      { 'Content-Type': 'application/json' },
      JSON.stringify(input),
      subUrl,
      validator,
      errorValidator,
    );
  }

  public async requestUnwrappedGet<T>(
    subUrl: string,
    validator: (data: unknown) => data is T,
  ): Promise<T> {
    const response = await this.requestGet(subUrl, validator, isString);
    assert(response.success);

    return response.data;
  }

  public async requestUnwrappedPost<T>(
    subUrl: string,
    input: unknown,
    validator: (data: unknown) => data is T,
  ): Promise<T> {
    const response = await this.requestPost(subUrl, input, validator, isString);
    assert(response.success);

    return response.data;
  }
}
