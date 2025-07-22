import React, { useEffect, useState } from 'react';
import { getProducts, deleteProduct } from '../api';
import type { Product } from '../api';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, Card, CardContent, CardActions, Typography, Pagination, CircularProgress, CardMedia } from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ProductForm from '../components/ProductForm';
import { useBasket } from '../components/BasketContext';

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; } | null>(null);

  const { addToBasket } = useBasket();

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await getProducts(pageNum - 1, 10);
      setProducts(data.content);
      setTotalPages(data.totalPages);
      setPage(data.number + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
    // eslint-disable-next-line
  }, [page]);

  const handleAdd = () => {
    setEditingProduct(null);
    setOpenForm(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setOpenForm(true);
  };

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteProduct(deleteId);
      setSnackbar({ open: true, message: 'Product deleted' });
      fetchProducts(page);
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Delete failed' });
    } finally {
      setDeleteId(null);
    }
  };

  // Add a list of grocery-related emojis
  const productEmojis = ['🍎', '🍌', '🥦', '🥕', '🍞', '🧀', '🥩', '🍗', '🍪', '🥛', '🍊', '🍇', '🍉', '🍋', '🍆', '🍔', '🍟', '🍕', '🌭', '🥨', '🍿', '🍫', '🍰', '🍯', '🥜', '🍵', '🥤', '🧃', '🧊', '🍶'];
  function getProductEmoji(id: number | undefined) {
    if (typeof id !== 'number') return '🛒';
    return productEmojis[id % productEmojis.length];
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <h2>Products</h2>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add Product</Button>
      </Box>
      {loading ? <CircularProgress /> : (
        <Grid container columnSpacing={3} columns={12}>
          {products.map((product) => (
            <Grid key={product.id} columns={3}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Replace CardMedia with emoji icon */}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 140, fontSize: 64 }}>
                  {getProductEmoji(product.id)}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {product.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: {product.pricePerUnit} Kč
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock: {product.stockQuantity}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleEdit(product)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setDeleteId(product.id!)}><DeleteIcon /></IconButton>
                  <Button size="small" variant="outlined" onClick={() => addToBasket(product)}>
                    Add to Basket
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
      </Box>
      <Dialog open={openForm} onClose={() => setOpenForm(false)}>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <ProductForm
            initialValues={editingProduct || undefined}
            onSubmit={async (data) => {
              try {
                if (editingProduct) {
                  await import('../api').then(api => api.updateProduct(editingProduct.id!, data));
                  setSnackbar({ open: true, message: 'Product updated' });
                } else {
                  await import('../api').then(api => api.createProduct(data));
                  setSnackbar({ open: true, message: 'Product created' });
                }
                setOpenForm(false);
                fetchProducts(page);
              } catch (e: any) {
                setSnackbar({ open: true, message: e.message || 'Save failed' });
              }
            }}
            submitLabel={editingProduct ? 'Update' : 'Create'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteId != null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>Are you sure you want to delete this product?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={!!snackbar?.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(null)}
        message={snackbar?.message}
      />
      {error && <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)} message={error} />}
    </Box>
  );
} 