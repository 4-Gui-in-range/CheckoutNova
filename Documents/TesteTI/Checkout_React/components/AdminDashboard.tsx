
import React, { useState, useEffect } from 'react';
import type { Product, Order, PaymentMethod } from '../types';
import { ProductForm } from './ProductForm';
import { ProductStatus } from '../types';
import * as ordersApi from '../services/ordersApi';
import { ConfirmationModal } from './ConfirmationModal';

interface AdminDashboardProps {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  updateProductsStock: (updates: { id: number; quantitySold: number }[]) => Promise<void>;
}

const DeleteIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
    </svg>
);

const EditIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"></path></svg>
);

const ChevronDownIcon: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => (
    <svg className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
    </svg>
);

const getStatusClass = (status: Order['status']) => {
    switch (status) {
        case 'approved': return 'bg-green-100 text-green-800';
        case 'failed': return 'bg-red-100 text-red-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const statusMap: Record<Order['status'], string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    failed: 'Recusado'
}

const paymentMethodMap: Record<PaymentMethod, string> = {
    card: 'Cartão de Crédito',
    pix: 'Pix'
};

const OrderManagementPanel: React.FC<{ updateProductsStock: AdminDashboardProps['updateProductsStock'] }> = ({ updateProductsStock }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);


    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                const fetchedOrders = await ordersApi.getOrders();
                fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setOrders(fetchedOrders);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleApprove = async (order: Order) => {
        setUpdatingOrderId(order.id);
        try {
            await ordersApi.updateOrderStatus(order.id, 'approved');
            const stockUpdates = order.items.map(item => ({
                id: item.id,
                quantitySold: item.quantity,
            }));
            await updateProductsStock(stockUpdates);
            
            setOrders(currentOrders => currentOrders.map(o => 
                o.id === order.id ? { ...o, status: 'approved' } : o
            ));
        } catch (error) {
            console.error("Failed to approve order:", error);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleRefuse = async (order: Order) => {
        setUpdatingOrderId(order.id);
        try {
            await ordersApi.updateOrderStatus(order.id, 'failed');
            setOrders(currentOrders => currentOrders.map(o => 
                o.id === order.id ? { ...o, status: 'failed' } : o
            ));
        } catch (error) {
            console.error("Failed to refuse order:", error);
        } finally {
            setUpdatingOrderId(null);
        }
    };
    
    const InfoSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h5 className="font-semibold text-gray-600 mb-2 pb-1 border-b">{title}</h5>
            <div className="space-y-1 text-sm text-gray-800">
                {children}
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Gerenciamento de Pedidos</h3>
            </div>
            {isLoading ? (
                <p className="text-gray-600">Carregando pedidos...</p>
            ) : orders.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Nenhum pedido encontrado.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const isExpanded = expandedOrderId === order.id;
                        return (
                            <div key={order.id} className="bg-white rounded-lg border shadow-sm transition-shadow hover:shadow-md">
                                <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex-grow cursor-pointer" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                                        <p className="font-semibold text-gray-800">
                                            Pedido <span className="font-mono text-blue-600 text-sm">{order.id}</span>
                                        </p>
                                        <p className="text-sm text-gray-600">{order.customer.name}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                                        <div className="text-left sm:text-right">
                                            <p className="font-semibold text-gray-800 text-lg">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                                                {statusMap[order.status]}
                                            </span>
                                        </div>
                                        {order.status === 'pending' && (
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleApprove(order)} disabled={!!updatingOrderId} className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors flex-grow sm:flex-grow-0 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                                    {updatingOrderId === order.id ? 'Processando...' : 'Aprovar'}
                                                </button>
                                                <button onClick={() => handleRefuse(order)} disabled={!!updatingOrderId} className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors flex-grow sm:flex-grow-0 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                                    {updatingOrderId === order.id ? 'Processando...' : 'Recusar'}
                                                </button>
                                            </div>
                                        )}
                                        <button onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Ver detalhes">
                                          <ChevronDownIcon isExpanded={isExpanded} />
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-4 border-t bg-gray-50/50">
                                        <h4 className="text-md font-semibold text-gray-700 mb-4">Detalhes do Pedido</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <InfoSection title="Cliente">
                                                <p><strong>Nome:</strong> {order.customer.name}</p>
                                                <p><strong>Email:</strong> {order.customer.email}</p>
                                                <p><strong>Telefone:</strong> {order.customer.phone}</p>
                                                <p><strong>CPF:</strong> {order.customer.cpf}</p>
                                            </InfoSection>
                                            
                                            <InfoSection title="Endereço de Entrega">
                                                <p>{order.address.street}, {order.address.number}</p>
                                                {order.address.complement && <p>{order.address.complement}</p>}
                                                <p>{order.address.neighborhood}</p>
                                                <p>{order.address.city}, {order.address.state}</p>
                                                <p><strong>CEP:</strong> {order.address.zip}</p>
                                            </InfoSection>

                                            <InfoSection title={`Itens do Pedido (${order.items.reduce((acc, item) => acc + item.quantity, 0)})`}>
                                                <ul className="space-y-2">
                                                    {order.items.map(item => (
                                                        <li key={item.id} className="flex justify-between items-center text-sm">
                                                            <span className="flex-1 pr-2">
                                                                {item.title} <strong className="font-normal text-gray-600">x{item.quantity}</strong>
                                                            </span>
                                                            <span className="font-mono">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </InfoSection>
                                        </div>
                                        <div className="mt-4 pt-4 border-t">
                                            <InfoSection title="Pagamento">
                                                <p><strong>Método:</strong> {paymentMethodMap[order.paymentMethod] || 'Não especificado'}</p>
                                            </InfoSection>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
};


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, addProduct, updateProduct, deleteProduct, updateProductsStock }) => {
  const [adminView, setAdminView] = useState<'products' | 'orders'>('products');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    productId?: number;
    productTitle?: string;
  }>({
    isOpen: false
  });

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsFormVisible(true);
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setIsFormVisible(true);
  };

  const handleSave = async (productData: Omit<Product, 'id'> & { id?: number }) => {
    if (productData.id) {
      await updateProduct(productData as Product);
    } else {
      await addProduct(productData);
    }
    setIsFormVisible(false);
    setProductToEdit(null);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setProductToEdit(null);
  };

  const handleDelete = (productId: number, productTitle: string) => {
    console.log('AdminDashboard - handleDelete chamada com:', { productId, productTitle });
    setConfirmationModal({
      isOpen: true,
      productId,
      productTitle
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmationModal.productId) return;

    console.log('AdminDashboard - Confirmando exclusão do produto:', confirmationModal.productId);
    setDeletingProductId(confirmationModal.productId);

    try {
      await deleteProduct(confirmationModal.productId);
      console.log('AdminDashboard - Produto excluído com sucesso');
    } catch (error) {
      console.error("AdminDashboard - Erro ao excluir produto:", error);
      alert("Ocorreu um erro ao excluir o produto. Tente novamente mais tarde.");
    } finally {
      setDeletingProductId(null);
      setConfirmationModal({ isOpen: false });
    }
  };

  const handleCancelDelete = () => {
    console.log('AdminDashboard - Cancelando exclusão');
    setConfirmationModal({ isOpen: false });
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Painel Administrativo</h2>
          <div className="flex items-center space-x-1 p-1 bg-gray-200 rounded-lg">
            <button onClick={() => setAdminView('products')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-all duration-300 ${adminView === 'products' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>
              Produtos
            </button>
            <button onClick={() => setAdminView('orders')} className={`px-4 py-1 text-sm font-semibold rounded-md transition-all duration-300 ${adminView === 'orders' ? 'bg-white text-blue-600 shadow' : 'text-gray-600'}`}>
              Pedidos
            </button>
          </div>
        </div>

        {adminView === 'products' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Administração de Produtos</h2>
              {!isFormVisible && (
                 <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    Novo Produto
                 </button>
              )}
            </div>

            {isFormVisible ? (
              <ProductForm productToEdit={productToEdit} onSave={handleSave} onCancel={handleCancel} />
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Produtos Cadastrados ({products.length})</h3>
                <div className="space-y-3">
                  {products.map(product => {
                    const isDeleting = deletingProductId === product.id;
                    return (
                        <div key={product.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-center gap-4">
                            <img src={product.image} alt={product.title} className="w-16 h-16 object-cover rounded-md" />
                            <div>
                              <p className="font-semibold text-gray-800">{product.title}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.status === ProductStatus.Active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {product.status}
                                </span>
                                <span>•</span>
                                <span>{product.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800 text-lg w-28 text-right">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('AdminDashboard - Botão editar clicado para produto:', product.id, product.title);
                                    handleEdit(product);
                                }} 
                                disabled={!!deletingProductId}
                                className="admin-edit-btn text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                aria-label={`Editar ${product.title}`}
                                type="button"
                            >
                                <EditIcon />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('AdminDashboard - Botão deletar clicado para produto:', product.id, product.title);
                                    handleDelete(product.id, product.title);
                                }} 
                                disabled={!!deletingProductId}
                                className="admin-delete-btn text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-[36px] h-[36px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500" 
                                aria-label={`Deletar ${product.title}`}
                                type="button"
                            >
                                {isDeleting ? (
                                    <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <DeleteIcon />
                                )}
                            </button>
                          </div>
                        </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <OrderManagementPanel updateProductsStock={updateProductsStock} />
        )}
      </div>
      
      {/* Modal de Confirmação para Exclusão */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir o produto "${confirmationModal.productTitle}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};
