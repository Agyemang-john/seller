// app/components/MenuContent.tsx
"use client";

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Stack, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import AddCardIcon from '@mui/icons-material/AddCard';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ReviewsIcon from '@mui/icons-material/Reviews';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Dashboard', icon: <HomeRoundedIcon />, path: '/dashboard' },
  { text: 'Orders', icon: <AssignmentRoundedIcon />, path: '/orders' },
  { text: 'Products', icon: <AnalyticsRoundedIcon />, path: '/products' },
  { text: 'Payment Method', icon: <AddCardIcon />, path: '/payment' },
  { text: 'Working Hours', icon: <AccessTimeIcon />, path: '/working-hours' },
  { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
  { text: 'Reviews', icon: <ReviewsIcon />, path: '/reviews' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, path: '/settings' },
  { text: 'About', icon: <InfoRoundedIcon />, path: '/about' },
  { text: 'Feedback', icon: <HelpRoundedIcon />, path: '/feedback' },
];

export default function MenuContent() {
  const pathname = usePathname();
  const activePath = pathname;

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={activePath.startsWith(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText className="fw-bold" primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={activePath.startsWith(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText className="fw-bold" primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}