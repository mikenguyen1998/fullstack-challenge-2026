/** One entry of the price feed (https://interview.switcheo.com/prices.json). */
export type TokenPrice = {
  currency: string;
  date: string;
  price: number;
};

export type TokenData = {
  price: number;
  icon: string;
};
