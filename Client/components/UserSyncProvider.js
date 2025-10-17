"use client";

import { useUserSync } from "@/hooks/useUserSync";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

export function UserSyncProvider({ children }) {
  const { isLoaded, userId } = useAuth();
  
  // This hook handles all user syncing
  const { isSynced, syncError } = useUserSync();

  // Log sync status for debugging
  useEffect(() => {
    if (isLoaded && userId && isSynced) {
      console.log("User synced successfully");
    }
    if (syncError) {
      console.error("User sync error:", syncError);
    }
  }, [isLoaded, userId, isSynced, syncError]);

  return children;
}
