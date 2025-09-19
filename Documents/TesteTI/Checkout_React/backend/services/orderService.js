import pool from '../config/database.js';

export class OrderService {
  // Criar novo pedido
  static async createOrder(orderData) {
    try {
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();

        const {
          customer,
          address,
          items,
          total,
          paymentMethod
        } = orderData;

        // Gerar ID único para o pedido
        const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Inserir pedido
        await connection.execute(`
          INSERT INTO orders (
            id, customer_name, customer_email, customer_phone, customer_cpf,
            street, number, complement, neighborhood, city, state, zip,
            total, status, payment_method
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
        `, [
          orderId,
          customer.name,
          customer.email,
          customer.phone,
          customer.cpf,
          address.street,
          address.number,
          address.complement || null,
          address.neighborhood,
          address.city,
          address.state,
          address.zip,
          total,
          paymentMethod
        ]);

        // Inserir itens do pedido
        for (const item of items) {
          await connection.execute(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
          `, [orderId, item.id, item.quantity, item.price]);
        }

        await connection.commit();

        // Buscar o pedido completo com itens
        const order = await this.getOrderById(orderId);
        return order;

      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      throw new Error('Erro interno do servidor');
    }
  }

  // Buscar pedido por ID
  static async getOrderById(orderId) {
    try {
      const connection = await pool.getConnection();
      
      try {
        // Buscar dados do pedido
        const [orderRows] = await connection.execute(
          'SELECT * FROM orders WHERE id = ?',
          [orderId]
        );

        if (orderRows.length === 0) {
          throw new Error('Pedido não encontrado');
        }

        const order = orderRows[0];

        // Buscar itens do pedido
        const [itemRows] = await connection.execute(`
          SELECT oi.*, p.title, p.image, p.category, p.description
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = ?
        `, [orderId]);

        // Formatar dados do pedido
        const formattedOrder = {
          id: order.id,
          customer: {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            cpf: order.customer_cpf
          },
          address: {
            street: order.street,
            number: order.number,
            complement: order.complement,
            neighborhood: order.neighborhood,
            city: order.city,
            state: order.state,
            zip: order.zip
          },
          items: itemRows.map(item => ({
            id: item.product_id,
            title: item.title,
            price: parseFloat(item.price),
            quantity: item.quantity,
            image: item.image,
            category: item.category,
            description: item.description
          })),
          total: parseFloat(order.total),
          status: order.status,
          paymentMethod: order.payment_method,
          createdAt: order.created_at
        };

        return formattedOrder;

      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      if (error.message === 'Pedido não encontrado') {
        throw error;
      }
      throw new Error('Erro interno do servidor');
    }
  }

  // Atualizar status do pedido
  static async updateOrderStatus(orderId, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Pedido não encontrado');
      }

      const updatedOrder = await this.getOrderById(orderId);
      return updatedOrder;
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      if (error.message === 'Pedido não encontrado') {
        throw error;
      }
      throw new Error('Erro interno do servidor');
    }
  }

  // Buscar todos os pedidos
  static async getAllOrders() {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM orders 
        ORDER BY created_at DESC
      `);

      // Para cada pedido, buscar os itens
      const ordersWithItems = await Promise.all(
        rows.map(async (order) => {
          const [itemRows] = await pool.execute(`
            SELECT oi.*, p.title, p.image, p.category, p.description
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
          `, [order.id]);

          return {
            id: order.id,
            customer: {
              name: order.customer_name,
              email: order.customer_email,
              phone: order.customer_phone,
              cpf: order.customer_cpf
            },
            address: {
              street: order.street,
              number: order.number,
              complement: order.complement,
              neighborhood: order.neighborhood,
              city: order.city,
              state: order.state,
              zip: order.zip
            },
            items: itemRows.map(item => ({
              id: item.product_id,
              title: item.title,
              price: parseFloat(item.price),
              quantity: item.quantity,
              image: item.image,
              category: item.category,
              description: item.description
            })),
            total: parseFloat(order.total),
            status: order.status,
            paymentMethod: order.payment_method,
            createdAt: order.created_at
          };
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      throw new Error('Erro interno do servidor');
    }
  }
}
