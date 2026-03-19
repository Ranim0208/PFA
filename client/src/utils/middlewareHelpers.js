export async function fetchCurrentUserForMiddleware(accessToken, refreshToken) {
  try {
    const response = await fetch(`${apiBaseUrl}/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(refreshToken && { "x-refresh-token": refreshToken }),
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      error: errorData.message || `HTTP ${response.status}`,
    };
  } catch (error) {
    console.error("Middleware fetch user error:", error);
    return { success: false, error: error.message };
  }
}
