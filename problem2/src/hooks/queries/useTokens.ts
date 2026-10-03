import { useQuery } from '@tanstack/react-query';

import { toTokenMap } from '@/lib/swap';
import { tokenService } from '@/services';

export const useTokens = () =>
  useQuery({
    queryKey: ['prices'],
    queryFn: ({ signal }) => tokenService.getPrices(signal),
    select: toTokenMap,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
