import type { Order } from "../types";

const API_BASE_URL = "http://localhost:3001/api";

// --- Private Helper Functions ---

const handleApiError = (error: any): never => {
  console.error("API Error:", error);
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw new Error("Erro de conexão com o servidor");
};

// --- Public API Service ---

/**
 * Cria um novo pedido via backend API.
 */
export const createOrder = async (
  orderData: Omit<Order, "id">
): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Atualiza status de pedido via backend API.
 */
export const updateOrderStatus = async (
  orderId: string,
  status: "approved" | "failed"
): Promise<Order> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Order with id ${orderId} not found.`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Busca por todos os pedidos do backend API.
 */
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};
