const round = (number: number, precision: number) => {
  const coefficient = 10 ** precision;
  return Math.round(number * coefficient) / coefficient;
};

export default round;
