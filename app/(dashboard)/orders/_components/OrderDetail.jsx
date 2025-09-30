"use client";

import { useState, useEffect, useCallback } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import PageContainer from '@/components/PageContainer';

export default function OrderDetailPage({ id }) {
  const axiosClient = createAxiosClient();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.get(`/api/v1/vendor/orders/${id}/detail/`);
      setOrder(response.data);
    } catch (error) {
      console.error('Fetch error:', error.response?.data?.detail || error.message);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, []);


    const handleStatusChange = useCallback(async (newStatus) => {
        if (newStatus === order?.status) return;

        const result = await Swal.fire({
        title: 'Confirm Status Update',
        text: `Are you sure you want to update the order status to "${newStatus}"? This will notify the customer.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        setStatusUpdating(true);
        try {
        const response = await axiosClient.put(`/api/v1/vendor/orders/${id}/status/`, { status: newStatus });
        setOrder(response.data);
        await Swal.fire({
            title: 'Success',
            text: 'Order status updated successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
        });
        } catch (err) {
        const errorMessage = err.response?.data?.detail || 'Failed to update status';
        console.error('Status update error:', errorMessage);
        await Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'OK',
        });
        } finally {
        setStatusUpdating(false);
        }
    }, [id, order]);

  const handleBack = useCallback(() => {
    router.push('/orders');
  }, [router]);

  const renderShow = () => {
    if (isLoading) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            m: 1,
          }}
        >
          <CircularProgress />
        </Box>
      );
    }

    return order ? (
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Order Number</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order.order_number} (ID: {order.id})
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Date Ordered</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {dayjs(order.date_created).format('MMMM D, YYYY, h:mm A')}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Amount</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                GHS{order.vendor_total.toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Delivery Cost</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                GHS{order.vendor_delivery_cost.toFixed(2) || 'Not available'}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Payment Method</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order.payment_method.replace('_', ' ').toUpperCase()}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline" sx={{ mr: 3 }}>Status</Typography>
              <Select
                value={order.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusUpdating}
                size="small"
                sx={{ minWidth: 120, mt: 1 }}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
              </Select>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Shipping Information
        </Typography>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Name</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order.address.full_name}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Email</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order.address.email}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Mobile</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order.address.mobile}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Address</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order.address.country}, {order.address.region}, {order.address.town}, {order.address.address}
                {order.address.gps_address && `, GPS: ${order.address.gps_address}`}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Delivery Date Range
        </Typography>
        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Delivery Range</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order.vendor_delivery_date_range || 'Not available'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" gutterBottom>
          Product Details
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Variant</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price (GHS)</TableCell>
                <TableCell>Total (GHS)</TableCell>
                <TableCell>Delivery Option</TableCell>
                <TableCell>Delivery Range</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.order_products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <img
                      width="50"
                      src={
                          product?.variant && product?.variant?.image
                            ? `${product?.variant?.image}`
                            : product?.product?.image
                            ? `${product?.product?.image}`
                            : '/logo-1.png' // Default image as fallback
                        }
                      alt={product.product.title}
                    />
                  </TableCell>
                  <TableCell>{product.product.title}</TableCell>
                  <TableCell>
                    {product.variant 
                      ? [product.variant.size_name, product.variant.color_name].filter(Boolean).join(' / ') || 'None'
                      : 'None'}
                  </TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.price}</TableCell>
                  <TableCell>{product.amount}</TableCell>
                  <TableCell>{product.selected_delivery_option?.name || 'Not selected'}</TableCell>
                  <TableCell>{product.delivery_date_range || 'Not available'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Back
          </Button>
          <a
            href={`${process.env.NEXT_PUBLIC_HOST}/api/v1/order/receipt/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="outlined" color="primary">
              Download Order
            </Button>
          </a>
        </Stack>
      </Box>
    ) : (
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1">Order not found</Typography>
      </Box>
    );
  };

  const pageTitle = `Order ${id}`;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Orders', path: '/orders' },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ display: 'flex', flex: 1, width: '100%' }}>{renderShow()}</Box>
    </PageContainer>
  );
}