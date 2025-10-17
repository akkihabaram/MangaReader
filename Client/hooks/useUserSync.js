"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

export function useUserSync() {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [userRole, setUserRole] = useState(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [syncError, setError] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !userId) {
        return;
      }

      try {
        setIsSyncing(true);
        setError(null);

        // Call our API to sync/create user in MongoDB
        const response = await axios.post(
          "/api/clerk/user",
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.user) {
          setUserRole(response.data.user.role);
          setIsFirstUser(response.data.user.isFirstUser || false);
        }

        setIsSynced(true);
      } catch (error) {
        console.error("Failed to sync user:", error);
        setError(error.message);
        // Still mark as synced if user already exists
        if (error.response?.status === 409) {
          setIsSynced(true);
        }
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [isLoaded, userId]);

  // Try to fetch user role if not available
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!isLoaded || !userId || isSynced) {
        return;
      }

      try {
        const response = await axios.get("/api/clerk/user");
        if (response.data) {
          setUserRole(response.data.role);
          setIsFirstUser(response.data.isFirstUser || false);
          setIsSynced(true);
        }
      } catch (error) {
        console.error("Failed to fetch user role:", error);
      }
    };

    fetchUserRole();
  }, [isLoaded, userId, isSynced]);

  const isAdmin = userRole === "admin" || userRole === "owner";

  return {
    userId,
    userRole,
    isAdmin,
    isFirstUser,
    isSynced,
    isSyncing,
    syncError,
  };
}
