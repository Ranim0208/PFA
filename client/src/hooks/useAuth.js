// // hooks/useAuth.js
// import { useState, useEffect, useCallback } from "react";
// import { getClientAuth } from "../utils/auth";
// import { logoutUser } from "../services/auth/logout";

// export function useAuth() {
//   const [auth, setAuth] = useState({
//     user: null,
//     isAuthenticated: false,
//     isLoading: true,
//     error: null,
//   });

//   const checkAuth = useCallback(async () => {
//     try {
//       setAuth((prev) => ({ ...prev, isLoading: true }));
//       const authData = await getClientAuth();
//       console.log("Auth check result:", authData); // Add this

//       setAuth({
//         user: authData.user,
//         isAuthenticated: authData.isAuthenticated,
//         isLoading: false,
//         error: authData.error,
//       });

//       return authData;
//     } catch (error) {
//       console.error("Auth check failed:", error);
//       setAuth({
//         user: null,
//         isAuthenticated: false,
//         isLoading: false,
//         error: error.message,
//       });
//       return { user: null, isAuthenticated: false, error: error.message };
//     }
//   }, []);

//   const logout = useCallback(async () => {
//     try {
//       // Set loading state
//       setAuth((prev) => ({ ...prev, isLoading: true }));

//       await logoutUser();

//       // Update state after logout
//       setAuth({
//         user: null,
//         isAuthenticated: false,
//         isLoading: false,
//         error: null,
//       });
//     } catch (error) {
//       console.error("Logout failed:", error);
//       // Still update local state even if logout request fails
//       setAuth({
//         user: null,
//         isAuthenticated: false,
//         isLoading: false,
//         error: null,
//       });
//     }
//   }, []);

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   return {
//     ...auth,
//     checkAuth,
//     logout,
//     refresh: checkAuth,
//   };
// }
