import React, { useState, useEffect } from 'react';
import type { Product, CartItem, View } from './types';
import { ProductStatus } from './types';
import { Header } from './components/Header';
import { AdminDashboard } from './components/AdminDashboard';
import { CartView } from './components/CartView';
import { CheckoutView } from './components/CheckoutView';
import { OrderConfirmation } from './components/OrderConfirmation';
import { ProductCard } from './components/ProductCard';
import * as api from './services/api';

const ProductList: React.FC<{
    products: Product[],
    onAddToCart: (product: Product) => void,
}> = ({ products, onAddToCart }) => (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Nova Concursos - Cursos Online</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
        </div>
    </div>
);


const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    
    const [view, setView] = useState<View>('products');
    const [orderResult, setOrderResult] = useState<{ success: boolean; message: string }>({ success: false, message: '' });

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const fetchedProducts = await api.getProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Product CRUD handlers
    const addProduct = async (product: Omit<Product, 'id'>) => {
        const newProduct = await api.addProduct(product);
        setProducts(prev => [...prev, newProduct]);
    };
    const updateProduct = async (updatedProduct: Product) => {
        const savedProduct = await api.updateProduct(updatedProduct);
        setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
    };
    const deleteProduct = async (productId: number) => {
        console.log('App.tsx - deleteProduct chamada com productId:', productId);
        try {
            await api.deleteProduct(productId);
            console.log('App.tsx - API deleteProduct executada com sucesso');
            setProducts(prev => {
                const newProducts = prev.filter(p => p.id !== productId);
                console.log('App.tsx - Lista de produtos atualizada:', newProducts);
                return newProducts;
            });
        } catch (error) {
            console.error('App.tsx - Erro ao deletar produto:', error);
            throw error;
        }
    };
    const updateProductsStock = async (updates: { id: number; quantitySold: number }[]) => {
        await api.updateProductsStock(updates);
        // Refetch products to ensure stock is up to date everywhere
        const fetchedProducts = await api.getProducts();
        setProducts(fetchedProducts);
    };

    // Cart handlers
    const addToCart = (product: Product) => {
        if (product.status !== ProductStatus.Active || product.stock <= 0) return;
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id);
            if (existingItem) {
                 if (existingItem.quantity < product.stock) {
                    return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                 }
                 return prev;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };
    
    const removeFromCart = (productId: number) => {
        console.log('App.tsx - removeFromCart chamada com productId:', productId);
        setCartItems(prev => {
            const newCart = prev.filter(item => item.id !== productId);
            console.log('App.tsx - Carrinho atualizado:', newCart);
            return newCart;
        });
    };
    
    const updateCartQuantity = (productId: number, quantity: number) => {
        if (isNaN(quantity)) {
            return;
        }

        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const newQuantity = Math.min(quantity, product.stock);

        setCartItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };
    const clearCart = () => {
        console.log('App.tsx - clearCart chamada');
        setCartItems([]);
        console.log('App.tsx - Carrinho limpo');
    };

    const renderView = () => {
        if (isLoading && view === 'products') {
            return (
                <div className="container mx-auto p-8 text-center">
                    <p className="text-xl text-gray-600">Carregando produtos...</p>
                </div>
            );
        }
        switch (view) {
            case 'admin':
                return <AdminDashboard products={products} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} updateProductsStock={updateProductsStock} />;
            case 'cart':
                return <CartView cartItems={cartItems} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} setView={setView} />;
            case 'checkout':
                return <CheckoutView cartItems={cartItems} clearCart={clearCart} updateProductsStock={updateProductsStock} setOrderResult={setOrderResult} setView={setView} />;
            case 'confirmation':
                 return <OrderConfirmation orderResult={orderResult} setView={setView} />;
            case 'products':
            default:
                return <ProductList products={products} onAddToCart={addToCart} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Header cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} setView={setView} currentView={view} />
            <main>
                {renderView()}
            </main>
        </div>
    );
};

export default App;