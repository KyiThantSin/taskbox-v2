import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemService } from '../services/systemService';
import type { CardDetail } from '../types/card';
import type { AppConfig } from '../types/system';

export function useCardAction<V>(cardId: number, fn: (variables: V) => Promise<CardDetail>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (detail) => {
      queryClient.setQueryData(['card', cardId], detail);
      queryClient.invalidateQueries({ queryKey: ['board', detail.boardId] });
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}

export function useAppConfig() {
  return useQuery<AppConfig>({
    queryKey: ['config'],
    queryFn: systemService.getConfig,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
