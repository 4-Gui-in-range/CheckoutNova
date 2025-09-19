
import React, { useState } from 'react';
import type { CartItem, Customer, Address, Order, View, PaymentMethod } from '../types';
import { processPagSeguroPayment } from '../services/paymentGateway';
import { createOrder, updateOrderStatus } from '../services/ordersApi';

interface CheckoutViewProps {
  cartItems: CartItem[];
  clearCart: () => void;
  updateProductsStock: (updates: { id: number; quantitySold: number }[]) => Promise<void>;
  setOrderResult: (result: { success: boolean, message: string }) => void;
  setView: (view: View) => void;
}

const initialCustomer: Customer = { name: '', email: '', phone: '', cpf: '' };
const initialAddress: Address = { street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zip: '' };

const formatCPF = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const formatPhone = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 10) {
      return digitsOnly
        .slice(0, 10)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return digitsOnly
        .slice(0, 11)
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
};

const formatZIP = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, '$1-$2');
};

const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly
        .slice(0, 16)
        .replace(/(\d{4})/g, '$1 ')
        .trim();
};

const CreditCardIcon: React.FC = () => (
    <svg className="w-6 h-6 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
    </svg>
);

const PixIcon: React.FC = () => (
    <svg className="w-6 h-6 mr-3 text-gray-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.625 3.375c-1.29 0-2.43.345-3.495 1.035l-1.05-1.05-1.305 1.305 1.05 1.05C6.1 6.885 5.76 8.025 5.76 9.315v1.305H4.455v2.76h1.305v1.305c0 1.29.345 2.43 1.035 3.495l-1.05 1.05 1.305 1.305 1.05-1.05c1.155.78 2.49.945 3.78.945h.69c3.105-1.05 4.845-4.14 4.845-7.785v-1.305c0-3.645-1.74-6.735-4.845-7.785h-.69Zm-1.515 2.76h2.76v1.305h1.305c.78 1.05 1.215 2.295 1.215 3.645v1.305c0 1.35-.435 2.595-1.215 3.645H12.87v1.305H10.11v-1.305H8.805c-.78-1.05-1.215-2.295-1.215-3.645v-1.305c0-1.35.435-2.595 1.215-3.645H10.11V6.135Z" />
    </svg>
);


interface PaymentOptionProps {
    label: string;
    value: PaymentMethod;
    selected: PaymentMethod;
    onChange: (value: PaymentMethod) => void;
    icon: React.ReactNode;
}

const PaymentOption: React.FC<PaymentOptionProps> = ({ label, value, selected, onChange, icon }) => (
    <label className={`flex-1 flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selected === value ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' : 'bg-white border-gray-300 hover:border-gray-400'}`}>
        <input
            type="radio"
            name="paymentMethod"
            value={value}
            checked={selected === value}
            onChange={() => onChange(value)}
            className="sr-only"
        />
        {icon}
        <span className="text-sm font-medium text-gray-800">{label}</span>
    </label>
);


export const CheckoutView: React.FC<CheckoutViewProps> = ({ cartItems, clearCart, updateProductsStock, setOrderResult, setView }) => {
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [address, setAddress] = useState<Address>(initialAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'cpf') value = formatCPF(value);
    if (name === 'phone') value = formatPhone(value);
    setCustomer({ ...customer, [name]: value });
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    if (name === 'zip') value = formatZIP(value);
    setAddress({ ...address, [name]: value });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };


  const validateForm = () => {
      const newErrors: Record<string, string> = {};
      if (!customer.name) newErrors.name = "Nome é obrigatório";
      if (!customer.email) newErrors.email = "Email é obrigatório";
      
      const phoneDigits = customer.phone.replace(/\D/g, '');
      if (!phoneDigits) newErrors.phone = "Telefone é obrigatório";
      else if (phoneDigits.length < 10) newErrors.phone = "Telefone inválido. Deve ter 10 ou 11 dígitos.";

      const cpfDigits = customer.cpf.replace(/\D/g, '');
      if (!cpfDigits) newErrors.cpf = "CPF é obrigatório";
      else if (cpfDigits.length !== 11) newErrors.cpf = "CPF deve conter 11 dígitos.";
      
      if (!address.street) newErrors.street = "Rua é obrigatória";
      if (!address.number) newErrors.number = "Número é obrigatório";
      if (!address.neighborhood) newErrors.neighborhood = "Bairro é obrigatório";
      if (!address.city) newErrors.city = "Cidade é obrigatória";
      if (!address.state) newErrors.state = "Estado é obrigatório";
      
      const zipDigits = address.zip.replace(/\D/g, '');
      if (!zipDigits) newErrors.zip = "CEP é obrigatório";
      else if (zipDigits.length !== 8) newErrors.zip = "CEP deve conter 8 dígitos.";
      
      if (paymentMethod === 'card') {
        const cardDigits = cardNumber.replace(/\D/g, '');
        if (!cardDigits) newErrors.cardNumber = "Número do cartão é obrigatório";
        else if (cardDigits.length !== 16) newErrors.cardNumber = "Cartão deve conter 16 dígitos.";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    let createdOrder: Order | null = null;

    try {
        const pendingOrderData: Omit<Order, 'id'> = {
            customer,
            address,
            items: cartItems,
            total,
            status: 'pending',
            createdAt: new Date(),
            paymentMethod,
        };

        createdOrder = await createOrder(pendingOrderData);
        
        const paymentResult = await processPagSeguroPayment(createdOrder);

        if (paymentResult.success) {
            // Payment approved: update order, update stock, clear cart
            await updateOrderStatus(createdOrder.id, 'approved');
            const stockUpdates = cartItems.map(item => ({
                id: item.id,
                quantitySold: item.quantity,
            }));
            await updateProductsStock(stockUpdates);
            clearCart();
        } else {
            // Payment failed: update order, but DO NOT update stock or clear cart
            await updateOrderStatus(createdOrder.id, 'failed');
        }
        
        setOrderResult(paymentResult);
        setView('confirmation');

    } catch (error) {
        console.error("An error occurred during checkout:", error);
        // If an order was created before the error, mark it as failed
        if (createdOrder) {
            try {
                await updateOrderStatus(createdOrder.id, 'failed');
            } catch (updateError) {
                console.error("Failed to update order status to 'failed' after an error:", updateError);
            }
        }
        setOrderResult({ success: false, message: 'Ocorreu um erro inesperado ao processar seu pedido. Por favor, tente novamente.' });
        setView('confirmation');
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <button onClick={() => setView('cart')} className="flex items-center text-blue-600 font-semibold hover:underline mb-4">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            Voltar ao Carrinho
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Finalizar Compra</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* Customer Data */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados do Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Nome Completo" name="name" value={customer.name} onChange={handleCustomerChange} error={errors.name} required />
                        <InputField label="Email" name="email" type="email" value={customer.email} onChange={handleCustomerChange} error={errors.email} required />
                        <InputField label="Telefone" name="phone" value={customer.phone} onChange={handleCustomerChange} error={errors.phone} required placeholder="(99) 99999-9999" maxLength={15} />
                        <InputField label="CPF" name="cpf" value={customer.cpf} onChange={handleCustomerChange} error={errors.cpf} required placeholder="123.456.789-00" maxLength={14} />
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Endereço de Entrega</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2">
                            <InputField label="Rua" name="street" value={address.street} onChange={handleAddressChange} error={errors.street} required />
                         </div>
                         <InputField label="Número" name="number" value={address.number} onChange={handleAddressChange} error={errors.number} required />
                         <InputField label="Complemento" name="complement" value={address.complement || ''} onChange={handleAddressChange} />
                         <InputField label="Bairro" name="neighborhood" value={address.neighborhood} onChange={handleAddressChange} error={errors.neighborhood} required />
                         <InputField label="Cidade" name="city" value={address.city} onChange={handleAddressChange} error={errors.city} required />
                         <InputField label="Estado" name="state" value={address.state} onChange={handleAddressChange} error={errors.state} required />
                         <InputField label="CEP" name="zip" value={address.zip} onChange={handleAddressChange} error={errors.zip} required placeholder="00000-000" maxLength={9} />
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Forma de Pagamento</h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        <PaymentOption
                            label="Cartão de Crédito"
                            value="card"
                            selected={paymentMethod}
                            onChange={setPaymentMethod}
                            icon={<CreditCardIcon />}
                        />
                        <PaymentOption
                            label="Pix"
                            value="pix"
                            selected={paymentMethod}
                            onChange={setPaymentMethod}
                            icon={<PixIcon />}
                        />
                    </div>
                </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md border border-gray-200 self-start">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">Resumo do Pedido</h3>
                 <div className="space-y-3 mb-4">
                     {cartItems.map(item => (
                         <div key={item.id} className="flex justify-between text-sm text-gray-600">
                             <span className="truncate pr-2">{item.title} x{item.quantity}</span>
                             <span className="whitespace-nowrap font-medium">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                         </div>
                     ))}
                 </div>
                 <div className="space-y-2 border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span className="font-medium text-gray-800">R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Frete:</span>
                        <span className="font-medium text-green-600">GRÁTIS</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-gray-800 pt-4 mt-2 border-t border-gray-300">
                        <span>Total:</span>
                        <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
                 
                <div className="mt-6 border-t border-gray-300 pt-6">
                    {paymentMethod === 'card' && (
                        <InputField 
                            label="Número do Cartão" 
                            name="cardNumber" 
                            value={cardNumber} 
                            onChange={handleCardNumberChange} 
                            error={errors.cardNumber} 
                            required 
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                        />
                    )}
                    {paymentMethod === 'pix' && (
                        <div className="text-center p-4 bg-blue-50/50 rounded-lg border border-blue-200">
                           <p className="text-sm font-semibold text-blue-800">Pagamento com Pix</p>
                           <p className="text-xs text-gray-600 mt-1">O QR Code para pagamento será gerado na próxima tela.</p>
                        </div>
                    )}
                </div>

                 <button type="submit" disabled={isLoading} className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:bg-orange-300 flex items-center justify-center">
                     {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                     ) : null}
                     {isLoading ? 'Processando...' : `Finalizar Compra - R$ ${total.toFixed(2).replace('.', ',')}`}
                 </button>
            </div>
        </form>
    </div>
  );
};


interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = "text", required = false, error, ...rest }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label} {required && '*'}
        </label>
        <input 
            type={type} 
            name={name} 
            id={name} 
            value={value} 
            onChange={onChange} 
            required={required}
            className={`mt-1 block w-full bg-white text-black px-3 py-2 border rounded-md shadow-sm focus:outline-none sm:text-sm ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`} 
            {...rest}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
);
