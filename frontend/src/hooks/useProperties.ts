import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export function useProperties() {
  return useQuery(["properties"], async () => {
    const { data } = await api.get("/properties");
    return data;
  });
}