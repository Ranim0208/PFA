import { apiBaseUrl } from "../../utils/constants";

export async function activateAccount({ userId, newPassword }) {
  const url = apiBaseUrl + "/auth/activate-account";

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "Activation failed" };
    }

    return { success: true, message: data.message };
  } catch (error) {
    console.error("Activation error:", error);
    return { success: false, error: "Une erreur est survenue" };
  }
}
