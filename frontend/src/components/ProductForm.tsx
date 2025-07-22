import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box } from '@mui/material';
import type { Product } from '../api';

export interface ProductFormProps {
  initialValues?: Partial<Product>;
  onSubmit: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  loading?: boolean;
  submitLabel?: string;
}

export default function ProductForm({ initialValues = {}, onSubmit, loading, submitLabel = 'Save' }: ProductFormProps) {
  const { handleSubmit, control, formState: { errors } } = useForm<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    defaultValues: {
      name: initialValues.name || '',
      pricePerUnit: initialValues.pricePerUnit || 0,
      stockQuantity: initialValues.stockQuantity || 0,
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Name is required', minLength: 1, maxLength: 50 }}
        render={({ field }) => (
          <TextField {...field} label="Name" error={!!errors.name} helperText={errors.name?.message} required />
        )}
      />
      <Controller
        name="pricePerUnit"
        control={control}
        rules={{ required: 'Price is required', min: 0.01 }}
        render={({ field }) => (
          <TextField {...field} label="Price per Unit" type="number" inputProps={{ step: 0.01 }} error={!!errors.pricePerUnit} helperText={errors.pricePerUnit?.message} required />
        )}
      />
      <Controller
        name="stockQuantity"
        control={control}
        rules={{ required: 'Stock quantity is required', min: 0 }}
        render={({ field }) => (
          <TextField {...field} label="Stock Quantity" type="number" inputProps={{ step: 1 }} error={!!errors.stockQuantity} helperText={errors.stockQuantity?.message} required />
        )}
      />
      <Button type="submit" variant="contained" color="primary" disabled={loading}>{submitLabel}</Button>
    </Box>
  );
} 