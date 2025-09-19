
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { ProductStatus } from '../types';

interface ProductFormProps {
  productToEdit?: Product | null;
  onSave: (product: Omit<Product, 'id'> & { id?: number }) => void;
  onCancel: () => void;
}

const emptyProduct: Omit<Product, 'id'> = {
  title: '',
  price: 0,
  stock: 0,
  status: ProductStatus.Active,
  image: '',
  category: '',
  description: '',
};

export const ProductForm: React.FC<ProductFormProps> = ({ productToEdit, onSave, onCancel }) => {
  const [product, setProduct] = useState(emptyProduct);

  useEffect(() => {
    if (productToEdit) {
      setProduct(productToEdit);
    } else {
      setProduct(emptyProduct);
    }
  }, [productToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(productToEdit ? { ...product, id: productToEdit.id } : product);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{productToEdit ? 'Editar Produto' : 'Criar Produto'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título *</label>
          <input type="text" name="title" id="title" value={product.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço *</label>
                <input type="number" name="price" id="price" value={product.price} onChange={handleNumberChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Estoque *</label>
                <input type="number" name="stock" id="stock" value={product.stock} onChange={handleNumberChange} required min="0" className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status *</label>
                <select name="status" id="status" value={product.status} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 bg-white text-black text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option>{ProductStatus.Active}</option>
                    <option>{ProductStatus.Inactive}</option>
                </select>
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                <input type="text" name="category" id="category" value={product.category} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">URL da Imagem *</label>
          <input type="url" name="image" id="image" value={product.image} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
          <textarea name="description" id="description" value={product.description || ''} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>
        <div className="flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {productToEdit ? 'Salvar' : 'Criar'}
          </button>
        </div>
      </form>
    </div>
  );
};