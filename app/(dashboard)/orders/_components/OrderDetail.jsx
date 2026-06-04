"use client";

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';
import { createAxiosClient } from '@/utils/clientFetch';
import { SHIPMENT_STATUS, getStatusEntry } from '@/theme/designTokens';
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
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import PageContainer from '@/components/PageContainer';

// Shipment status colours now come from the single design base (SHIPMENT_STATUS).

const TRACKING_EVENT_STATUSES = [
  { value: 'info',               label: 'Info Received'         },
  { value: 'in_transit',         label: 'In Transit'            },
  { value: 'out_for_delivery',   label: 'Out for Delivery'      },
  { value: 'delivered',          label: 'Delivered'             },
  { value: 'exception',          label: 'Delivery Exception'    },
  { value: 'failed_attempt',     label: 'Failed Delivery Attempt'},
  { value: 'returned_to_sender', label: 'Returned to Sender'    },
];

// ─── Progress steps (for visual stepper) ─────────────────────────────────────
const PROGRESS_STEPS = [
  { key: 'label_created',    label: 'Confirmed' },
  { key: 'in_transit',       label: 'In Transit' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
];
const STEP_ORDER = { label_created: 1, in_transit: 2, out_for_delivery: 3, delivered: 4 };

// ─── Shipment Panel ───────────────────────────────────────────────────────────
function ShipmentPanel({ orderId, existingShipments, onShipmentUpdated }) {
  const theme = useTheme();
  const axiosClient = createAxiosClient();
  const [shipments, setShipments] = useState(existingShipments || []);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [eventForms, setEventForms] = useState({});  // keyed by shipment_id
  const [expandedShipment, setExpandedShipment] = useState(null);

  const [form, setForm] = useState({
    carrier: '',
    carrier_code: '',
    tracking_number: '',
    tracking_url: '',
    status: 'label_created',
    estimated_delivery_date: '',
    is_international: false,
  });

  const defaultEventForm = {
    status: 'in_transit',
    description: '',
    location: '',
    city: '',
    country: '',
    event_date: dayjs().format('YYYY-MM-DDTHH:mm'),
  };

  const handleCreateShipment = async () => {
    if (!form.carrier) {
      Swal.fire('Missing field', 'Carrier name is required.', 'warning');
      return;
    }
    // Guard: each vendor can only have one shipment per order
    if (shipments.length > 0) {
      Swal.fire('Already Exists', 'You already have a shipment for this order. Update it instead of creating a new one.', 'info');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axiosClient.post(`/api/v1/vendor/orders/${orderId}/shipment/`, form);
      const created = res.data;
      setShipments((prev) => [...prev, created]);
      setShowCreateForm(false);
      setForm({ carrier: '', carrier_code: '', tracking_number: '', tracking_url: '', status: 'label_created', estimated_delivery_date: '', is_international: false });
      onShipmentUpdated && onShipmentUpdated();
      Swal.fire({ title: 'Shipment Created', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      // Handle 409 Conflict from backend duplicate check
      if (err.response?.status === 409) {
        Swal.fire('Already Exists', err.response.data?.error || 'Shipment already exists for this order.', 'info');
      } else {
        Swal.fire('Error', err.response?.data?.error || 'Could not create shipment.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEvent = async (shipmentId) => {
    const ef = eventForms[shipmentId] || defaultEventForm;
    if (!ef.description || !ef.event_date) {
      Swal.fire('Missing field', 'Description and event date are required.', 'warning');
      return;
    }
    try {
      const res = await axiosClient.post(
        `/api/v1/vendor/orders/${orderId}/shipment/${shipmentId}/event/`,
        ef
      );
      const newEvent = res.data;  // ← now safe since backend returns the event
      setShipments((prev) =>
        prev.map((sh) =>
          sh.shipment_id === shipmentId
            ? { ...sh, tracking_events: [newEvent, ...(sh.tracking_events || [])] }
            : sh
        )
      );
      setEventForms((prev) => ({ ...prev, [shipmentId]: defaultEventForm }));
      onShipmentUpdated && onShipmentUpdated();
      Swal.fire({ title: 'Event Added', icon: 'success', timer: 1200, showConfirmButton: false });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.error || 'Could not add event.', 'error');
    }
  };

  return (
    <Box>
      {/* Header row */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LocalShippingIcon color="action" fontSize="small" />
          <Typography variant="h6">Shipment & Tracking</Typography>
        </Stack>
        {shipments.length === 0 && (
          <Button
            size="small"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setShowCreateForm((v) => !v)}
            variant={showCreateForm ? 'outlined' : 'contained'}
            disableElevation
          >
            {showCreateForm ? 'Cancel' : 'Create Shipment'}
          </Button>
        )}
      </Stack>

      {/* Create shipment form */}
      <Collapse in={showCreateForm}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>New Shipment Details</Typography>
          <Grid container spacing={2}>
            {[
              { field: 'carrier',          label: 'Carrier (e.g. DHL)',   required: true },
              { field: 'carrier_code',     label: 'Carrier Code (e.g. dhl)' },
              { field: 'tracking_number',  label: 'Tracking Number' },
              { field: 'tracking_url',     label: 'Tracking URL' },
            ].map(({ field, label, required }) => (
              <Grid key={field} size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label={label}
                  required={required}
                  value={form[field]}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Estimated Delivery Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.estimated_delivery_date}
                onChange={(e) => setForm((p) => ({ ...p, estimated_delivery_date: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Select
                fullWidth
                size="small"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                {Object.entries(SHIPMENT_STATUS).map(([v, { label }]) => (
                  <MenuItem key={v} value={v}>{label}</MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              disableElevation
              disabled={submitting}
              onClick={handleCreateShipment}
              startIcon={submitting ? <CircularProgress size={14} /> : null}
            >
              {submitting ? 'Creating…' : 'Create Shipment'}
            </Button>
          </Stack>
        </Paper>
      </Collapse>

      {/* Shipment list */}
      {shipments.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
          <LocalShippingIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No shipments yet. Click "Create Shipment" to add one.
          </Typography>
        </Paper>
      ) : (
        shipments.map((sh) => {
          const shEntry = getStatusEntry(SHIPMENT_STATUS, sh.status);
          const cfg = theme.palette.status[shEntry.hue];
          const currentStep = STEP_ORDER[sh.status] || 0;
          const isExpanded = expandedShipment === sh.shipment_id;
          const ef = eventForms[sh.shipment_id] || defaultEventForm;

          return (
            <Paper key={sh.shipment_id} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
              {/* Shipment header */}
              <Box
                sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onClick={() => setExpandedShipment(isExpanded ? null : sh.shipment_id)}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LocalShippingIcon fontSize="small" color="action" />
                  <Box>
                    <Typography variant="body2" fontWeight={700} fontFamily="monospace">
                      {sh.shipment_id}
                    </Typography>
                    {sh.tracking_number && (
                      <Typography variant="caption" color="text.secondary">
                        {sh.carrier} · #{sh.tracking_number}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={shEntry.label}
                    size="small"
                    sx={{ background: cfg.bg, color: cfg.text, fontWeight: 700, fontSize: 11, height: 22, borderRadius: '6px' }}
                  />
                  {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </Stack>
              </Box>

              <Collapse in={isExpanded}>
                <Box sx={{ p: 2 }}>
                  {/* Progress stepper */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {PROGRESS_STEPS.map((step, idx) => {
                      const done = currentStep > idx + 1;
                      const active = currentStep === idx + 1;
                      return (
                        <Box key={step.key} sx={{ display: 'flex', alignItems: 'center', flex: idx < PROGRESS_STEPS.length - 1 ? 1 : 'initial' }}>
                          <Stack alignItems="center" spacing={0.5}>
                            {done ? (
                              <CheckCircleIcon sx={{ fontSize: 20, color: 'success.main' }} />
                            ) : active ? (
                              <FiberManualRecordIcon sx={{ fontSize: 16, color: 'info.main' }} />
                            ) : (
                              <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'divider' }} />
                            )}
                            <Typography sx={{ fontSize: 10, fontWeight: active ? 700 : 500, color: done ? 'success.main' : active ? 'info.main' : 'text.disabled', whiteSpace: 'nowrap' }}>
                              {step.label}
                            </Typography>
                          </Stack>
                          {idx < PROGRESS_STEPS.length - 1 && (
                            <Box sx={{ flex: 1, height: 2, bgcolor: done ? 'success.main' : 'divider', mx: 0.5, mb: 2.5 }} />
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Add tracking event form */}
                  <Typography variant="subtitle2" gutterBottom>Add Tracking Event</Typography>
                  <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Select
                        fullWidth
                        size="small"
                        value={ef.status}
                        onChange={(e) => setEventForms((p) => ({ ...p, [sh.shipment_id]: { ...ef, status: e.target.value } }))}
                      >
                        {TRACKING_EVENT_STATUSES.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Event Date & Time"
                        type="datetime-local"
                        InputLabelProps={{ shrink: true }}
                        value={ef.event_date}
                        onChange={(e) => setEventForms((p) => ({ ...p, [sh.shipment_id]: { ...ef, event_date: e.target.value } }))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description (e.g. Package arrived at sorting facility)"
                        required
                        value={ef.description}
                        onChange={(e) => setEventForms((p) => ({ ...p, [sh.shipment_id]: { ...ef, description: e.target.value } }))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth size="small" label="Location"
                        value={ef.location}
                        onChange={(e) => setEventForms((p) => ({ ...p, [sh.shipment_id]: { ...ef, location: e.target.value } }))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth size="small" label="City"
                        value={ef.city}
                        onChange={(e) => setEventForms((p) => ({ ...p, [sh.shipment_id]: { ...ef, city: e.target.value } }))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth size="small" label="Country"
                        value={ef.country}
                        onChange={(e) => setEventForms((p) => ({ ...p, [sh.shipment_id]: { ...ef, country: e.target.value } }))}
                      />
                    </Grid>
                  </Grid>
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="contained"
                      disableElevation
                      onClick={() => handleAddEvent(sh.shipment_id)}
                    >
                      Add Event
                    </Button>
                  </Stack>

                  {/* Existing events */}
                  {sh.tracking_events?.length > 0 && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>Tracking History</Typography>
                      <Box sx={{ position: 'relative', pl: 2 }}>
                        <Box sx={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, bgcolor: 'divider' }} />
                        {sh.tracking_events.map((ev, idx) => (
                          <Box key={ev.id} sx={{ display: 'flex', gap: 2, mb: 1.5, position: 'relative' }}>
                            <Box sx={{ mt: '3px', flexShrink: 0 }}>
                              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: idx === 0 ? 'info.main' : 'divider', border: '2px solid', borderColor: idx === 0 ? 'info.main' : 'divider' }} />
                            </Box>
                            <Box>
                              <Typography variant="body2" fontWeight={idx === 0 ? 700 : 500}>
                                {ev.description}
                              </Typography>
                              {(ev.city || ev.location) && (
                                <Typography variant="caption" color="text.secondary">
                                  {[ev.location, ev.city, ev.country].filter(Boolean).join(', ')}
                                </Typography>
                              )}
                              <Typography variant="caption" display="block" color="text.secondary">
                                {dayjs(ev.event_date).format('MMM D, YYYY · h:mm A')}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              </Collapse>
            </Paper>
          );
        })
      )}
    </Box>
  );
}

export default function OrderDetailPage({ id }) {
  const axiosClient = createAxiosClient();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [shipments, setShipments] = useState([]);

  const fetchShipments = useCallback(async () => {
    try {
      const res = await axiosClient.get(`/api/v1/vendor/orders/${id}/shipment/`);
      setShipments(res.data ?? []);
    } catch (_) {}
  }, [id]);

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
    fetchShipments();
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
                GHS {order.vendor_total != null ? parseFloat(order.vendor_total).toFixed(2) : '—'}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Delivery Cost</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {order.vendor_delivery_cost != null
                  ? `GHS ${parseFloat(order.vendor_delivery_cost).toFixed(2)}`
                  : 'Not available'}
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="overline">Payment Method</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                {(order.payment_method || '').replace(/_/g, ' ').toUpperCase() || '—'}
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
        {!order.address ? (
          <Paper variant="outlined" sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" color="text.secondary">No shipping address on record.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ px: 2, py: 1 }}>
                <Typography variant="overline">Name</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.address.full_name || '—'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ px: 2, py: 1 }}>
                <Typography variant="overline">Email</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.address.email || '—'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ px: 2, py: 1 }}>
                <Typography variant="overline">Mobile</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {order.address.mobile || '—'}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Paper sx={{ px: 2, py: 1 }}>
                <Typography variant="overline">Address</Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {[order.address.country, order.address.region, order.address.town, order.address.address]
                    .filter(Boolean).join(', ') || '—'}
                  {order.address.gps_address && `, GPS: ${order.address.gps_address}`}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
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
                  <TableCell >{product.product.title}</TableCell>
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

        {/* ── Shipment & Tracking Panel ── */}
        <ShipmentPanel
          orderId={id}
          existingShipments={shipments}
          onShipmentUpdated={fetchShipments}
        />

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