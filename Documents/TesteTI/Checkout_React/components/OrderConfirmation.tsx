import React from 'react';
import type { View } from '../types';

interface OrderConfirmationProps {
  orderResult: {
    success: boolean;
    message: string;
  };
  setView: (view: View) => void;
}

const SuccessIcon: React.FC = () => (
  <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const FailureIcon: React.FC = () => (
  <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ orderResult, setView }) => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-lg mx-auto text-center">
        {orderResult.success ? <SuccessIcon /> : <FailureIcon />}
        <h2 className={`mt-4 text-2xl font-bold ${orderResult.success ? 'text-gray-800' : 'text-red-700'}`}>
          {orderResult.success ? 'Pedido Realizado com Sucesso!' : 'Falha no Pagamento'}
        </h2>
        <p className="mt-2 text-gray-600">{orderResult.message}</p>
        
        {orderResult.success ? (
          <button
            onClick={() => setView('products')}
            className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continuar Comprando
          </button>
        ) : (
          <div className="mt-8 space-y-2">
            <button
              onClick={() => setView('checkout')}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Tentar Pagamento Novamente
            </button>
            <button
              onClick={() => setView('cart')}
              className="w-full text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Editar Carrinho
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
