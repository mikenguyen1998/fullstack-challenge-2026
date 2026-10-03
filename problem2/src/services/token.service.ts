import { api } from '@/lib/axios';
import type { TokenPrice } from '@/types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

export const tokenService = {
  async getPrices(signal?: AbortSignal) {
    const { data } = await api.get<TokenPrice[]>(PRICES_URL, { signal });
    return data;
  },
};
