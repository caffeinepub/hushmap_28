import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { Product } from "../backend";

export function useGetPendingProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ["pendingProducts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.approveProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
    },
  });
}

export function useRejectProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.rejectProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingProducts"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
    },
  });
}
