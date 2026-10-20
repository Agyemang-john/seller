'use client';

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import Container, { ContainerProps } from '@mui/material/Container';
import MuiLink from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import Link from 'next/link';

const PageContentHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5, 2),
}));

const PageHeaderBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(0.5, 0),
    fontSize: 13,
  },
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

const PageHeaderToolbar = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  // Ensure the toolbar is always on the right side, even after wrapping
  marginLeft: 'auto',
  [theme.breakpoints.down('sm')]: {
    // On phones actions drop under the title and share the full width.
    width: '100%',
    marginLeft: 0,
    '& > *': { flex: '1 1 auto' },
  },
}));

export interface Breadcrumb {
  title: string;
  path?: string;
}
export interface PageContainerProps extends ContainerProps {
  children?: React.ReactNode;
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
}

export default function PageContainer(props: PageContainerProps) {
  const { children, breadcrumbs, title, actions = null } = props;

  return (
    <Container sx={{ flex: 1, display: 'flex', flexDirection: 'column', px: { xs: 1.5, sm: 3 }, minWidth: 0 }}>
      <Stack sx={{ flex: 1, my: { xs: 1.5, sm: 2 } }} spacing={{ xs: 1.5, sm: 2 }}>
        <Stack>
          <PageHeaderBreadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextRoundedIcon fontSize="small" />}
          >
            {breadcrumbs
              ? breadcrumbs.map((breadcrumb, index) => {
                  return breadcrumb.path ? (
                    <Link key={index} href={breadcrumb.path}>
                      <MuiLink underline="hover" color="inherit" component="span">
                        {breadcrumb.title}
                      </MuiLink>
                    </Link>
                  ) : (
                    <Typography
                      key={index}
                      sx={{ color: 'text.primary', fontWeight: 600 }}
                    >
                      {breadcrumb.title}
                    </Typography>
                  );
                })
              : null}
          </PageHeaderBreadcrumbs>
          <PageContentHeader>
            {title ? (
              <Typography variant="h4" sx={{ fontSize: { xs: 20, sm: 24 }, minWidth: 0 }}>
                {title}
              </Typography>
            ) : null}
            {actions ? <PageHeaderToolbar>{actions}</PageHeaderToolbar> : null}
          </PageContentHeader>
        </Stack>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {children}
        </Box>
      </Stack>
    </Container>
  );
}
