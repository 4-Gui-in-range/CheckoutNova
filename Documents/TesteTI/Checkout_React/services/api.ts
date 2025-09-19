import type { Product } from "../types";

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
 * Fetches de todos os produtos na API do backend. GET
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Adiciona um novo produto via API do backend. POST
 */
export const addProduct = async (
  productData: Omit<Product, "id">
): Promise<Product> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
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
 * Atualiza um produto existente via API do backend. PUT
 */
export const updateProduct = async (
  updatedProduct: Product
): Promise<Product> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/products/${updatedProduct.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Product with id ${updatedProduct.id} not found.`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Deleta um produto via backend API. DELETE
 */
export const deleteProduct = async (
  productId: number
): Promise<{ id: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Product with id ${productId} not found.`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};

/**
 * Atualiza estoque de multiplos produtos apos um pedido via backend API. PUT/PATCH
 */
export const updateProductsStock = async (
  updates: { id: number; quantitySold: number }[]
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/update-stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error);
  }
};
