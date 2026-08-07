// frontend/src/hooks/useProductTypes.js

import { useQuery } from "@tanstack/react-query";
import { getProductTypes } from "../api/productApi";

export const useProductTypes = () => {
  return useQuery({
    queryKey: ["productTypes"],
    queryFn: getProductTypes,
    staleTime: 30 * 60 * 1000, // 30 minutes - types rarely change
    gcTime: 60 * 60 * 1000, // 1 hour cache
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => {
      // Transform data if needed
      return {
        types: data?.types || data || [],
        count: data?.types?.length || data?.length || 0,
      };
    },
  });
};