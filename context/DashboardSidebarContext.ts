import * as React from 'react';

export interface DashboardSidebarContextValue {
  mini: boolean;
  fullyExpanded: boolean;
  fullyCollapsed: boolean;
  hasDrawerTransitions: boolean;
  onPageItemClick: () => void;
}

const DashboardSidebarContext = React.createContext<DashboardSidebarContextValue | undefined>(
  undefined,
);

export default DashboardSidebarContext;