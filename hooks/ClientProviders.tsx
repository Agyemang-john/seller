"use client";

import * as React from "react";
import { StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "@/theme/AppTheme";
import DialogsProvider from "@/hooks/useDialogs/DialogsProvider";
import DashboardLayout from "@/components/DashboardLayout";
import EmotionCacheProvider from "@/utils/EmotionCacheProvider";

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