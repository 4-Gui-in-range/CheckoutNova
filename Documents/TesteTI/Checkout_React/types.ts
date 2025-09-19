
export enum ProductStatus {
  Active = 'Ativo',
  Inactive = 'Inativo',
}

export interface Product {
  id: number;
  title: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image: string;
  category: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}

export type PaymentMethod = 'card' | 'pix';

export interface Order {
  id: string;
  customer: Customer;
  address: Address;
  items: CartItem[];
  total: number;
  status: 'pending' | 'approved' | 'failed';
  createdAt: Date;
  paymentMethod: PaymentMethod;
}

export type View = 'products' | 'admin' | 'cart' | 'checkout' | 'confirmation';