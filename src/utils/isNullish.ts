type NullishValues = undefined | null;

const isNullish = <T extends any>(value: T | NullishValues): value is NullishValues => {
  return value === null || value === undefined || Number.isNaN(value);
};

export default isNullish;
