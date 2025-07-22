import React, { useEffect, useState } from 'react';
import { listOrders, payOrder, cancelOrder, getProducts } from '../api';
import type { OrderResponseDto, PaymentRequestDto, Product } from '../api';
import { Box, Typography, Button, CircularProgress, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, Select, MenuItem, FormControl, InputLabel, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = async (pageNum = 1, size = pageSize) => {
    setLoading(true);
    try {
      const data = await listOrders(pageNum - 1, size, 'id,desc');
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts(0, 1000); // get all products
      setProducts(data.content);
    } catch {}
  };

  useEffect(() => {
    fetchOrders(page, pageSize);
    const interval = setInterval(() => {
      fetchOrders(page, pageSize);
    }, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [page, pageSize]);
  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePay = async (order: OrderResponseDto) => {
    setPayingId(order.id);
    try {
      const payment: PaymentRequestDto = {
        paymentMethod: 'card',
        paymentDetails: '**** **** **** 1234',
        amount: order.totalPrice,
      };
      await payOrder(order.id, payment);
      setSnackbar('Order paid!');
      fetchOrders();
    } catch (e: any) {
      setSnackbar(e.message || 'Payment failed');
    } finally {
      setPayingId(null);
    }
  };

  const handleCancel = async (order: OrderResponseDto) => {
    setCancellingId(order.id);
    try {
      await cancelOrder(order.id);
      setSnackbar('Order cancelled!');
      fetchOrders();
    } catch (e: any) {
      setSnackbar(e.message || 'Cancel failed');
    } finally {
      setCancellingId(null);
    }
  };

  // Add emoji list and getProductEmoji function for icons
  const productEmojis = ['🍎', '🍌', '🥦', '🥕', '🍞', '🧀', '🥩', '🍗', '🍪', '🥛', '🍊', '🍇', '🍉', '🍋', '🍆', '🍔', '🍟', '🍕', '🌭', '🥨', '🍿', '🍫', '🍰', '🍯', '🥜', '🍵', '🥤', '🧃', '🧊', '🍶'];
  function getProductEmoji(id: number | undefined) {
    if (typeof id !== 'number') return '🛒';
    return productEmojis[id % productEmojis.length];
  }

  // Helper to get product name by id
  const getProductName = (id: number) => products.find(p => p.id === id)?.name || `#${id}`;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Order History</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="order-page-size-label">Items per page</InputLabel>
          <Select
            labelId="order-page-size-label"
            value={pageSize}
            label="Items per page"
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(size => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {loading ? <CircularProgress /> : (
        orders.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
            No orders yet.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total (Kč)</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders
                  .slice()
                  .sort((a, b) => b.id - a.id)
                  .map(order => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link component={RouterLink} to={`/orders/${order.id}`} underline="hover">
                          {order.id}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{order.status}</TableCell>
                      <TableCell>{order.totalPrice}</TableCell>
                      <TableCell>
                        <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                          {order.items.map((item, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }} title={`Product ID: ${item.productId}`}>
                              <span style={{ fontSize: 20 }}>
                                {getProductEmoji(item.productId)}
                              </span>
                              <span>
                                {getProductName(item.productId)} x {item.quantity} ks
                              </span>
                            </li>
                          ))}
                        </ul>
                      </TableCell>
                      <TableCell>
                        {order.status === 'RESERVED' && (
                          <>
                            <Button size="small" variant="contained" color="success" disabled={payingId === order.id} onClick={() => handlePay(order)}>
                              {payingId === order.id ? 'Paying...' : 'Pay'}
                            </Button>
                            <Button size="small" variant="outlined" color="error" disabled={cancellingId === order.id} onClick={() => handleCancel(order)} sx={{ ml: 1 }}>
                              {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
      </Box>
      <Snackbar open={!!snackbar} autoHideDuration={3000} onClose={() => setSnackbar(null)} message={snackbar} />
      {error && <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} message={error} />}
    </Box>
  );
} 