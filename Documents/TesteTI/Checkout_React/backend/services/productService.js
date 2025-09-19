import pool from "../config/database.js";

export class ProductService {
  // Buscar todos os produtos
  static async getAllProducts() {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM products 
        ORDER BY created_at DESC
      `);
      // Converter campos que vêm como string (por exemplo DECIMAL) para tipos apropriados
      const normalized = rows.map((r) => ({
        ...r,
        price:
          r.price !== null && r.price !== undefined
            ? parseFloat(r.price)
            : r.price,
        stock:
          r.stock !== null && r.stock !== undefined ? Number(r.stock) : r.stock,
      }));
      return normalized;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw new Error("Erro interno do servidor");
    }
  }

  // Buscar produto por ID
  static async getProductById(id) {
    try {
      const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [
        id,
      ]);
      const product = rows[0];
      if (!product) return product;
      return {
        ...product,
        price:
          product.price !== null && product.price !== undefined
            ? parseFloat(product.price)
            : product.price,
        stock:
          product.stock !== null && product.stock !== undefined
            ? Number(product.stock)
            : product.stock,
      };
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      throw new Error("Erro interno do servidor");
    }
  }

  // Criar novo produto
  static async createProduct(productData) {
    try {
      const { title, price, stock, status, image, category, description } =
        productData;

      const [result] = await pool.execute(
        `
        INSERT INTO products (title, price, stock, status, image, category, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [title, price, stock, status, image, category, description]
      );

      const newProduct = await this.getProductById(result.insertId);
      return newProduct;
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      throw new Error("Erro interno do servidor");
    }
  }

  // Atualizar produto
  static async updateProduct(id, productData) {
    try {
      const { title, price, stock, status, image, category, description } =
        productData;

      const [result] = await pool.execute(
        `
        UPDATE products 
        SET title = ?, price = ?, stock = ?, status = ?, image = ?, category = ?, description = ?
        WHERE id = ?
      `,
        [title, price, stock, status, image, category, description, id]
      );

      if (result.affectedRows === 0) {
        throw new Error("Produto não encontrado");
      }

      const updatedProduct = await this.getProductById(id);
      return updatedProduct;
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      if (error.message === "Produto não encontrado") {
        throw error;
      }
      throw new Error("Erro interno do servidor");
    }
  }

  // Deletar produto
  static async deleteProduct(id) {
    try {
      const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [
        id,
      ]);

      if (result.affectedRows === 0) {
        throw new Error("Produto não encontrado");
      }

      return { id: parseInt(id) };
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      if (error.message === "Produto não encontrado") {
        throw error;
      }
      throw new Error("Erro interno do servidor");
    }
  }

  // Atualizar estoque de múltiplos produtos
  static async updateProductsStock(updates) {
    try {
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        for (const update of updates) {
          const { id, quantitySold } = update;

          // Verificar se o produto existe e tem estoque suficiente
          const [productRows] = await connection.execute(
            "SELECT stock FROM products WHERE id = ?",
            [id]
          );

          if (productRows.length === 0) {
            throw new Error(`Produto com ID ${id} não encontrado`);
          }

          const currentStock = productRows[0].stock;
          const newStock = Math.max(0, currentStock - quantitySold);

          await connection.execute(
            "UPDATE products SET stock = ? WHERE id = ?",
            [newStock, id]
          );
        }

        await connection.commit();
        return { success: true };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Erro ao atualizar estoque:", error);
      throw new Error("Erro interno do servidor");
    }
  }
}
