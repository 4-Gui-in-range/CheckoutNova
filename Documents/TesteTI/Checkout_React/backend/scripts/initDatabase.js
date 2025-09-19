import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const { INITIAL_PRODUCTS } = await import("../constants.js");

async function initDatabase() {
  let connection;

  try {
    // Conectar sem especificar database para criar o banco
    // usar multipleStatements caso haja scripts com várias instruções
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true,
    });

    console.log("Conectado ao MySQL...");

    // Criar database se não existir
    const dbName = process.env.DB_NAME || "checkout_nova_concursos";
    // usar query() para comandos não suportados pelo protocolo de prepared statements
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' criado/verificado com sucesso!`);

    // Usar o database
    await connection.query(`USE \`${dbName}\``);

    // Criar tabela de produtos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
        image VARCHAR(500),
        category VARCHAR(100),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
  `);
    console.log("Tabela products criada/verificada com sucesso!");

    // Criar tabela de pedidos
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        customer_cpf VARCHAR(20),
        street VARCHAR(255) NOT NULL,
        number VARCHAR(20) NOT NULL,
        complement VARCHAR(255),
        neighborhood VARCHAR(100) NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(2) NOT NULL,
        zip VARCHAR(10) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'approved', 'failed') NOT NULL DEFAULT 'pending',
        payment_method ENUM('card', 'pix') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
  `);
    console.log("Tabela orders criada/verificada com sucesso!");

    // Criar tabela de itens do pedido
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(100) NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
  `);
    console.log("Tabela order_items criada/verificada com sucesso!");

    // Inserir produtos iniciais se a tabela estiver vazia
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM products"
    );
    if (rows[0].count === 0) {
      console.log("Inserindo produtos iniciais...");

      for (const product of INITIAL_PRODUCTS) {
        await connection.query(
          `
          INSERT INTO products (id, title, price, stock, status, image, category, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            product.id,
            product.title,
            product.price,
            product.stock,
            product.status,
            product.image,
            product.category,
            product.description,
          ]
        );
      }
      console.log(`${INITIAL_PRODUCTS.length} produtos inseridos com sucesso!`);
    } else {
      console.log("Produtos já existem no banco de dados.");
    }

    console.log("✅ Banco de dados inicializado com sucesso!");
    // Inserir pedido inicial 'pending' se não houver nenhum pedido com status 'pending'
    try {
      const [pendingCountRows] = await connection.query(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
      );

      if (pendingCountRows[0].count === 0) {
        console.log(
          "Nenhum pedido pendente encontrado. Inserindo pedido inicial pendente..."
        );

        // Escolher um produto existente para referenciar no pedido
        const [prodRows] = await connection.query(
          "SELECT id, price FROM products LIMIT 1"
        );

        if (prodRows.length === 0) {
          console.log("Nenhum produto encontrado para criar pedido inicial.");
        } else {
          const product = prodRows[0];
          const orderId = `init-order-${Date.now()}`;

          // Inserir pedido
          await connection.query(
            `INSERT INTO orders (
              id, customer_name, customer_email, customer_phone, customer_cpf,
              street, number, complement, neighborhood, city, state, zip,
              total, status, payment_method
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
            [
              orderId,
              "Guilherme",
              "guilhermeteste@eduqi.com",
              "12345678901",
              null,
              "Rua Teste",
              "99",
              null,
              "Bairro",
              "Cidade",
              "ST",
              "00000-000",
              product.price,
              "card",
            ]
          );

          // Inserir item do pedido
          await connection.query(
            `INSERT INTO order_items (order_id, product_id, quantity, price)
             VALUES (?, ?, ?, ?)`,
            [orderId, product.id, 1, product.price]
          );

          console.log("Pedido inicial pendente inserido com sucesso!");
        }
      } else {
        console.log(
          "Já existe pelo menos um pedido pendente no banco de dados."
        );
      }
    } catch (err) {
      console.error("Erro ao inserir pedido inicial:", err);
    }
  } catch (error) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export default initDatabase;
