// "use client";

// import * as React from 'react';
// import { StyledEngineProvider } from '@mui/material/styles';

// import CssBaseline from '@mui/material/CssBaseline';
// import AppTheme from '@/theme/AppTheme';
// import NotificationsProvider from '@/hooks/useNotifications/NotificationsProvider';
// import DialogsProvider from '@/hooks/useDialogs/DialogsProvider';
// import DashboardLayout from '@/components/DashboardLayout';
// import EmotionCacheProvider from "@/utils/EmotionCacheProvider";

// import {
//   dataGridCustomizations,
//   datePickersCustomizations,
//   sidebarCustomizations,
//   formInputCustomizations,
// } from '@/theme/customizations';

// const themeComponents = {
//   ...dataGridCustomizations,
//   ...datePickersCustomizations,
//   ...sidebarCustomizations,
//   ...formInputCustomizations,
// };

// export default function ClientProviders({ children }: { children: React.ReactNode }) {
//   return (
//     <EmotionCacheProvider>
//       <StyledEngineProvider injectFirst>
//         <AppTheme themeComponents={themeComponents}>
//           <CssBaseline enableColorScheme />
//           <NotificationsProvider>
//             <DialogsProvider>
//               <DashboardLayout>
//                 {children}
//               </DashboardLayout>
//             </DialogsProvider>
//           </NotificationsProvider>
//         </AppTheme>
//       </StyledEngineProvider>
//     </EmotionCacheProvider>
//   );
// }


"use client";

import * as React from "react";
import { StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppTheme from "@/theme/AppTheme";
import NotificationsProvider from "@/hooks/useNotifications/NotificationsProvider";
import DialogsProvider from "@/hooks/useDialogs/DialogsProvider";
import DashboardLayout from "@/components/DashboardLayout";
import EmotionCacheProvider from "@/utils/EmotionCacheProvider";
import Provider from "@/redux/provider";
import { Setup } from "@/utils";

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
    <Provider>
      <Setup />
      <EmotionCacheProvider>
        <StyledEngineProvider injectFirst>
          <AppTheme themeComponents={themeComponents}>
            <CssBaseline enableColorScheme />
            <NotificationsProvider>
              <DialogsProvider>
                <DashboardLayout>
                  {children}
                </DashboardLayout>
              </DialogsProvider>
            </NotificationsProvider>
          </AppTheme>
        </StyledEngineProvider>
      </EmotionCacheProvider>
    </Provider>
  );
}