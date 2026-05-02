/**
 * BulkUploadButton.jsx
 *
 * Drop this button anywhere in your ProductList header area.
 * It's subscription-aware: shows as disabled with a tooltip when the vendor
 * doesn't have the can_access_bulk_upload feature flag.
 *
 * Usage:
 *   import BulkUploadButton from './BulkUploadButton';
 *   <BulkUploadButton canBulkUpload={vendor?.plan?.can_access_bulk_upload} />
 *
 * Props:
 *   canBulkUpload  boolean  — pass from your subscription/vendor context
 *   size           string   — MUI Button size prop (default 'medium')
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button, Tooltip, Stack, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function BulkUploadButton({ canBulkUpload = false, size = 'medium' }) {
  const router = useRouter();

  if (!canBulkUpload) {
    return (
      <Tooltip
        title={
          <Stack spacing={0.25}>
            <Typography sx={{ fontSize: 12, fontWeight: 700 }}>Pro feature</Typography>
            <Typography sx={{ fontSize: 11 }}>Upgrade to Pro to bulk upload products.</Typography>
          </Stack>
        }
        arrow
        placement="top"
      >
        {/* Wrapper span because disabled buttons don't fire tooltip events */}
        <span>
          <Button
            disabled
            size={size}
            startIcon={<LockOutlinedIcon sx={{ fontSize: 16 }} />}
            variant="outlined"
            sx={{
              borderRadius: '10px',
              borderColor: 'divider',
              fontSize: 13,
              fontWeight: 600,
              color: 'text.disabled',
              cursor: 'not-allowed',
            }}
          >
            Bulk upload
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button
      size={size}
      startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
      variant="outlined"
      onClick={() => router.push('/products/bulk-upload')}
      sx={{
        borderRadius: '10px',
        borderColor: 'divider',
        fontSize: 13,
        fontWeight: 600,
        color: 'text.primary',
        '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
      }}
    >
      Bulk upload
    </Button>
  );
}