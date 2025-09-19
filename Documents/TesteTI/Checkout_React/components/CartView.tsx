import React, { useState } from 'react';
import type { CartItem, View } from '../types';
import { ConfirmationModal } from './ConfirmationModal';

interface CartViewProps {
  cartItems: CartItem[];
  updateCartQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  setView: (view: View) => void;
}

const PlusIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
);

const MinusIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6"></path></svg>
);

export const CartView: React.FC<CartViewProps> = ({ cartItems, updateCartQuantity, removeFromCart, clearCart, setView }) => {
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: 'removeItem' | 'clearCart';
    productId?: number;
    productTitle?: string;
  }>({
    isOpen: false,
    type: 'removeItem'
  });

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleRemoveItem = (productId: number, productTitle: string) => {
    console.log('Tentando remover item:', { productId, productTitle });
    setConfirmationModal({
      isOpen: true,
      type: 'removeItem',
      productId,
      productTitle
    });
  };

  const handleClearCart = () => {
    console.log('Tentando limpar carrinho');
    setConfirmationModal({
      isOpen: true,
      type: 'clearCart'
    });
  };

  const handleConfirmAction = () => {
    console.log('Confirmando ação:', confirmationModal.type);
    
    if (confirmationModal.type === 'removeItem' && confirmationModal.productId) {
      console.log('Removendo item do carrinho:', confirmationModal.productId);
      removeFromCart(confirmationModal.productId);
    } else if (confirmationModal.type === 'clearCart') {
      console.log('Limpando carrinho');
      clearCart();
    }
    
    setConfirmationModal({ isOpen: false, type: 'removeItem' });
  };

  const handleCancelAction = () => {
    console.log('Cancelando ação');
    setConfirmationModal({ isOpen: false, type: 'removeItem' });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Meu Carrinho</h2>
        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-semibold text-gray-700">Produtos no Carrinho</h3>
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Botão Limpar Carrinho clicado');
                        handleClearCart();
                    }} 
                    className="clear-cart-btn text-sm text-gray-500 hover:text-red-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 px-2 py-1 rounded"
                    type="button"
                >
                    Limpar Carrinho
                </button>
              </div>
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-md"/>
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 cart-item-actions">
                        <div className="flex-shrink-0">
                            <div className="flex items-center border border-gray-300 rounded-md">
                                <button 
                                    onClick={() => {
                                        console.log('Botão - clicado para item:', item.id);
                                        updateCartQuantity(item.id, item.quantity - 1);
                                    }} 
                                    className="cart-quantity-btn p-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                    aria-label="Diminuir quantidade"
                                    type="button"
                                >
                                    <MinusIcon />
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    console.log('Input quantidade alterado para item:', item.id, 'valor:', e.target.value);
                                    updateCartQuantity(item.id, parseInt(e.target.value, 10));
                                  }}
                                  className="w-12 text-center bg-white text-black border-x-0 border-y-0 focus:ring-0 focus:border-0 text-sm"
                                  min="1"
                                  max={item.stock}
                                  aria-label={`Quantidade para ${item.title}`}
                                />
                                 <button 
                                    onClick={() => {
                                        console.log('Botão + clicado para item:', item.id);
                                        updateCartQuantity(item.id, item.quantity + 1);
                                    }} 
                                    className="cart-quantity-btn p-2 bg-orange-500 text-white hover:bg-orange-600 transition-colors rounded-r-md disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                    disabled={item.quantity >= item.stock} 
                                    aria-label="Aumentar quantidade"
                                    type="button"
                                >
                                    <PlusIcon />
                                </button>
                            </div>
                            {item.quantity >= item.stock ? (
                                <p className="text-xs text-red-600 mt-1 text-center font-semibold">Limite de estoque atingido</p>
                            ) : (
                                <p className="text-xs text-gray-500 mt-1 text-center">{item.stock} disponíveis</p>
                            )}
                        </div>
                        <p className="font-semibold text-lg w-28 text-right">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        <div className="flex-shrink-0">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Botão X clicado para item:', item.id, item.title);
                                    handleRemoveItem(item.id, item.title);
                                }} 
                                className="cart-remove-btn text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500" 
                                aria-label={`Remover ${item.title}`}
                                type="button"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
                <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 shadow-inner">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Resumo do Pedido</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal ({cartItems.length} itens):</span>
                            <span className="font-medium text-gray-800">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Frete:</span>
                            <span className="font-medium text-green-600">GRÁTIS</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-800 pt-4 mt-2 border-t border-gray-300">
                            <span>Total:</span>
                            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <button onClick={() => setView('checkout')} className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                        Finalizar Compra
                    </button>
                    <button onClick={() => setView('products')} className="w-full mt-2 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                        ← Continuar Comprando
                    </button>
                </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-gray-600 mb-4">Seu carrinho está vazio.</p>
            <button onClick={() => setView('products')} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Ver Produtos
            </button>
          </div>
        )}
      </div>
      
      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelAction}
        onConfirm={handleConfirmAction}
        title={confirmationModal.type === 'removeItem' ? 'Remover Item' : 'Limpar Carrinho'}
        message={
          confirmationModal.type === 'removeItem' 
            ? `Tem certeza que deseja remover "${confirmationModal.productTitle}" do carrinho?`
            : 'Tem certeza que deseja remover todos os itens do carrinho?'
        }
        confirmText="Sim, remover"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};