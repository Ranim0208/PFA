// utils/storage.js
export function getStoredUserRegion() {
  if (typeof window === "undefined") return null;

  try {
    const regionId = localStorage.getItem("userRegionId");
    const regionName = localStorage.getItem("regionName");

    console.log("🔍 Retrieved from localStorage:", {
      userRegionId: regionId,
      regionName: regionName,
    });

    if (!regionId) return null;

    return {
      id: regionId,
      name: regionName,
    };
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
}

export function clearUserData() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("userRegionId");
  localStorage.removeItem("regionName");
  localStorage.removeItem("userComponent");
}
