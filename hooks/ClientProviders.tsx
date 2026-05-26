"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";
import AppTheme from "@/theme/AppTheme";
import DialogsProvider from "@/hooks/useDialogs/DialogsProvider";
import DashboardLayout from "@/components/DashboardLayout";
import EmotionCacheProvider from "@/utils/EmotionCacheProvider";
import { useAppSelector } from "@/redux/hooks";

import {
  dataGridCustomizations,
  datePickersCustomizations,
  sidebarCustomizations,
  formInputCustomizations,
} from "@/theme/customizations";

const themeComponents = {
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...sidebarCustomizations,
  ...formInputCustomizations,
};

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname ?? '/dashboard')}`);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <EmotionCacheProvider>
        <StyledEngineProvider injectFirst>
          <AppTheme themeComponents={themeComponents}>
            <CssBaseline enableColorScheme />
              <DialogsProvider>
                <DashboardLayout>
                  {children}
                </DashboardLayout>
              </DialogsProvider>
          </AppTheme>
        </StyledEngineProvider>
      </EmotionCacheProvider>
    </>
  );
}