import React from 'react';

export const useFormatAmount = (price: any, roundToTwoDigits: boolean = false) => {
  let newPrice;
  let result;

  roundToTwoDigits
    ? (newPrice = price.toFixed(2).toString().split('.'))
    : (newPrice = Number(price).toString().split('.'));

  newPrice[0] = newPrice[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  if (!price) {
    result = 0;
  } else if (!newPrice[1]) {
    [result] = newPrice;
  } else {
    result = `${newPrice[0]}.${newPrice[1]}`;
  }

  return result;
};

export const useSmallPrice = (price: any) => {
  const newPrice = price.toFixed(2).toString().split('.');

  return (
    <>
      {useFormatAmount(newPrice[0])}.
      <span style={{ fontSize: '0.7em', color: '$textHintColor' }}>{newPrice[1]}</span>
    </>
  );
};
