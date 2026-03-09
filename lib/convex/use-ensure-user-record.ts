"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useStoreCurrentUser } from "@/lib/convex/use-platform-data";

export function useEnsureUserRecord() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const storeCurrentUser = useStoreCurrentUser();
  const lastStoredUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user?.id) {
      return;
    }

    if (lastStoredUserId.current === user.id) {
      return;
    }

    let cancelled = false;
    void storeCurrentUser({})
      .then(() => {
        if (!cancelled) {
          lastStoredUserId.current = user.id;
        }
      })
      .catch(() => {
        if (!cancelled) {
          lastStoredUserId.current = null;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, storeCurrentUser, user?.id]);
}