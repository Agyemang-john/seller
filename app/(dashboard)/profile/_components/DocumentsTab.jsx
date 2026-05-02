'use client';

import { useRef, useState } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import toast from 'react-hot-toast';

function getDocumentList(vendorType) {
  return [
    {
      key: 'government_issued_id',
      label: 'Government-Issued ID',
      description: 'National ID card, passport, or driver\'s licence. Must show your full name and photo clearly.',
      required: vendorType === 'non_student',
      relevant: vendorType === 'non_student',
      accepts: 'image/*,.pdf',
    },
    {
      key: 'student_id',
      label: 'Student ID',
      description: 'Valid institutional student ID card. Must clearly show your name and institution name.',
      required: vendorType === 'student',
      relevant: vendorType === 'student',
      accepts: 'image/*,.pdf',
    },
    {
      key: 'proof_of_address',
      label: 'Proof of Address',
      description: 'Utility bill, bank statement, or official letter dated within the last 6 months showing your current address.',
      required: true,
      relevant: true,
      accepts: 'image/*,.pdf',
    },
    {
      key: 'license',
      label: 'Business Licence',
      description: 'Business registration certificate or operating licence (optional, but improves verification speed).',
      required: false,
      relevant: true,
      accepts: 'image/*,.pdf',
    },
  ];
}

export default function DocumentsTab({ account, onRefresh }) {
  const [uploading, setUploading] = useState({});
  const vendorType = account?.vendor_type || 'non_student';
  const documents = getDocumentList(vendorType);

  const uploadDocument = async (key, file) => {
    if (!file) return;
    const MAX_MB = 10;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_MB} MB.`);
      return;
    }

    setUploading(prev => ({ ...prev, [key]: true }));
    const fd = new FormData();
    fd.append(key, file);
    try {
      const axiosClient = createAxiosClient();
      await axiosClient.put('/api/v1/vendor/account/', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const doc = documents.find(d => d.key === key);
      toast.success(`${doc?.label || 'Document'} uploaded successfully.`);
      onRefresh();
    } catch (err) {
      const data = err.response?.data || {};
      const msg = data[key]?.[0] || data.detail || data.non_field_errors?.[0] || 'Upload failed. Please try again.';
      toast.error(msg);
    } finally {
      setUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const missingRequired = documents.filter(d => d.required && !account?.[d.key]);

  return (
    <Stack spacing={3}>
      {/* Header info */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>Verification Documents</Typography>
          <Typography variant="body2" color="text.secondary">
            Upload or replace the documents needed for your seller account verification.
            Re-uploading documents after approval may trigger a re-review by our team.
          </Typography>
          {missingRequired.length > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              {missingRequired.length === 1
                ? `Missing required document: ${missingRequired[0].label}`
                : `${missingRequired.length} required documents are missing.`}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Document cards */}
      {documents.map(doc => (
        <DocumentCard
          key={doc.key}
          doc={doc}
          currentFile={account?.[doc.key]}
          isUploading={uploading[doc.key] || false}
          onUpload={uploadDocument}
        />
      ))}
    </Stack>
  );
}

function DocumentCard({ doc, currentFile, isUploading, onUpload }) {
  const inputRef = useRef(null);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: doc.required && !currentFile ? 'error.main' : 'divider',
        opacity: doc.relevant ? 1 : 0.6,
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'flex-start' }}
          justifyContent="space-between"
        >
          {/* Left: description */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.75 }}>
              <Typography variant="subtitle1" fontWeight={600}>{doc.label}</Typography>
              <Chip
                label={doc.required ? 'Required' : 'Optional'}
                size="small"
                color={doc.required ? 'error' : 'default'}
                variant="outlined"
                sx={{ height: 20, fontSize: 10 }}
              />
              {!doc.relevant && (
                <Chip label="Not applicable for your type" size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
              {doc.description}
            </Typography>

            {/* Status row */}
            {currentFile ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <CheckCircleIcon sx={{ fontSize: 15, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  Document on file
                </Typography>
                <Tooltip title="View current document">
                  <IconButton
                    size="small"
                    component="a"
                    href={currentFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ p: 0.25 }}
                  >
                    <OpenInNewIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <ErrorOutlineIcon sx={{ fontSize: 15, color: doc.required ? 'error.main' : 'text.disabled' }} />
                <Typography variant="caption" color={doc.required ? 'error.main' : 'text.disabled'} fontWeight={500}>
                  {doc.required ? 'Not uploaded — required for verification' : 'Not uploaded'}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* Right: upload button */}
          <Box sx={{ flexShrink: 0, alignSelf: { xs: 'flex-start', sm: 'flex-start' } }}>
            <input
              ref={inputRef}
              type="file"
              accept={doc.accepts}
              style={{ display: 'none' }}
              onChange={e => { onUpload(doc.key, e.target.files?.[0]); e.target.value = ''; }}
            />
            <Button
              variant={currentFile ? 'outlined' : 'contained'}
              size="small"
              color={currentFile ? 'inherit' : 'primary'}
              startIcon={
                isUploading
                  ? <CircularProgress size={14} color="inherit" />
                  : currentFile
                  ? <RefreshIcon />
                  : <UploadFileIcon />
              }
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              sx={{ minWidth: 100 }}
            >
              {isUploading ? 'Uploading…' : currentFile ? 'Replace' : 'Upload'}
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
