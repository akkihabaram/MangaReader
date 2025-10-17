"use client";
import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { Next13ProgressBar } from "next13-progressbar";
import { color } from "@/config";
import { UserSyncProvider } from "@/components/UserSyncProvider";

export default function Providers({ children }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextUIProvider>
      <UserSyncProvider>
        {children}
        <Next13ProgressBar
          height="3px"
          color={color}
          options={{ showSpinner: true }}
          showOnShallow
        />
      </UserSyncProvider>
    </NextUIProvider>
  );
}
