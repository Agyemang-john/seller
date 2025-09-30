'use client';

import React, { useEffect, useState } from 'react';
import { DataGrid, GridActionsCellItem, gridClasses } from '@mui/x-data-grid';

import { IconButton, Avatar, Typography, Box, Skeleton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import { createAxiosClient } from '@/utils/clientFetch';
import toast from 'react-hot-toast';

const ProductReviews = () => {
  const axiosClient = createAxiosClient();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const response = await axiosClient.get('/api/v1/vendor/reviews/');
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setError(error.response?.data?.detail || 'Failed to load reviews.');
        toast.error(error.response?.data?.detail || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, []);

  const handleToggleStatus = async (reviewId, currentStatus) => {
    try {
      const response = await axiosClient.patch(`/api/v1/vendor/reviews/${reviewId}/`, {
        status: !currentStatus,
      });
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, status: response.data.status } : review
        )
      );
      toast.success(`Review ${!currentStatus ? 'published' : 'hidden'} successfully!`);
    } catch (error) {
      console.error('Error updating review status:', error.response?.data || error.message);
      setError(error.response?.data?.detail || 'Failed to update review status.');
      toast.error(error.response?.data?.detail || 'Failed to update review status.');
    }
  };

  const columns = [
    {
      field: 'product',
      headerName: 'Product',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
          <Avatar
            src={params.row.product_image ? `${params.row.product_image}` : '/default-product.jpg'}
            alt={params.value}
            sx={{ marginRight: 1, width: 40, height: 40 }}
          />
          <Typography variant="body2">{params.value || 'Deleted Product'}</Typography>
        </Box>
      ),
    },
    {
      field: 'user_email',
      headerName: 'Customer',
      flex: 0.8,
      minWidth: 150,
      renderCell: (params) => params.row?.user_email || 'Anonymous',
    },
    {
      field: 'review',
      headerName: 'Review',
      flex: 1.2,
      minWidth: 250,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {[...Array(params.value || 0)].map((_, i) => (
            <StarIcon key={i} sx={{ color: '#ffa726', fontSize: 20 }} />
          ))}
          {[...Array(5 - (params.value || 0))].map((_, i) => (
            <StarIcon key={5 + i} sx={{ color: '#e0e0e0', fontSize: 20 }} />
          ))}
        </Box>
      ),
    },
    {
      field: 'action',
      headerName: 'Action',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <IconButton
          color={params.row.status ? 'success' : 'default'}
          onClick={() => handleToggleStatus(params.row.id, params.row.status)}
          title={params.row.status ? 'Hide Review' : 'Publish Review'}
        >
          {params.row.status ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
        <Skeleton variant="text" width="200px" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (reviews.length === 0) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6">No reviews available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', p: { xs: 2, sm: 3 }, maxWidth: '900px' }}>
      {error && (
        <Box sx={{ p: 2, bgcolor: 'error.light', color: 'error.main', borderRadius: 1, mb: 2 }}>
          {error}
        </Box>
      )}
      <Box sx={{ height: 600, width: '100%', flex: 1 }}>
        <DataGrid
          rows={reviews.map((review) => ({
            id: review.id,
            product: review.product_title,
            product_image: review.product_image,
            user_email: review.user_email,
            review: review.review,
            rating: review.rating,
            status: review.status,
          }))}
          columns={columns}
          loading={loading}
          autoHeight
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          pageSizeOptions={[5, 10, 20]}
          disableRowSelectionOnClick
          sx={{
            [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
              outline: 'transparent',
            },
            [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]: {
              outline: 'none',
            },
            [`& .${gridClasses.row}:hover`]: {
              cursor: 'pointer',
            },
          }}
          slotProps={{
            loadingOverlay: {
              variant: 'circular-progress',
              noRowsVariant: 'circular-progress',
            },
            baseIconButton: {
              size: 'small',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default ProductReviews;