"use client";

import { useState, useEffect, useCallback } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';
import { DataGrid, GridActionsCellItem, gridClasses } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

const INITIAL_PAGE_SIZE = 10;

export default function OrderList() {
  const axiosClient = createAxiosClient();
  const router = useRouter();

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: INITIAL_PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [sortModel, setSortModel] = useState([]);
  const [rowsState, setRowsState] = useState({
    rows: [],
    rowCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: (paginationModel.page + 1).toString(), // DRF pages start at 1
        page_size: paginationModel.pageSize.toString(),
        ...(sortModel.length > 0 && { ordering: sortModel[0].field + (sortModel[0].sort === 'desc' ? ':-' : ':') }),
        ...(filterModel.items.length > 0 && { status: filterModel.items[0].value }),
      });
      const response = await axiosClient.get('/api/v1/vendor/orders/', { params });
      setRowsState({
        rows: response.data.results || response.data.items || [],
        rowCount: response.data.count || 0,
      });
    } catch (error) {
      console.log(`Failed to load orders: ${error.response?.data?.detail || error.message}`);
    }
    setIsLoading(false);
  }, []); // Empty deps to ensure loadData is stable

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = useCallback(() => {
    if (!isLoading) loadData();
  }, [isLoading, loadData]);

  const handleRowClick = useCallback((params) => {
    router.push(`/orders/${params.row.id}/detail`);
  }, [router]);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'order_number', headerName: 'Order Number', width: 190 },
    {
      field: 'date_created',
      headerName: 'Ordered On',
      type: 'dateTime',
      width: 190,
      valueGetter: (value) => value && new Date(value),
    },
    { field: 'grand_total', headerName: 'Amount Involved (GHS)', type: 'number', width: 180 },
    { field: 'payment_method', headerName: 'Payment Method', type: 'string', width: 140 },
    { field: 'user_email', headerName: 'Customer', type: 'string', width: 160 },
    { field: 'status', headerName: 'Status', width: 130 },
    {
      field: 'actions',
      type: 'actions',
      width: 60,
      align: 'right',
      getActions: (params) => [
        <GridActionsCellItem
          key="view-item"
          icon={<EditIcon />}
          label="View"
          onClick={() => router.push(`/orders/${params.row.id}/detail`)}
        />,
      ],
    },
  ];

  columns.push({
    field: 'vendor_delivery_status',
    headerName: 'Delivery Status',
    width: 150,
  });

  return (
    <PageContainer
      title="Orders"
      breadcrumbs={[{ title: "Orders" }]}
      actions={
        <Box>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      }
    >
      <Box sx={{ flex: 1, width: '100%' }}>
        <DataGrid
          rows={rowsState.rows}
          rowCount={rowsState.rowCount}
          columns={columns}
          pagination
          sortingMode="server"
          filterMode="server"
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          disableRowSelectionOnClick
          onRowClick={handleRowClick}
          loading={isLoading}
          pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
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
          showToolbar
        />
      </Box>
    </PageContainer>
  );
}