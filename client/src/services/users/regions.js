// services/memberService.js
import { apiBaseUrl } from "../../utils/constants";
import { apiClient } from "../../hooks/apiClient";

export async function getRegions() {
  return apiClient(`${apiBaseUrl}/regions/`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
}
