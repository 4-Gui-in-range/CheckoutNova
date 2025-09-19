import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ProductService } from "./services/productService.js";
import { OrderService } from "./services/orderService.js";
import initDatabase from "./scripts/initDatabase.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Middleware de log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ===== ROTAS DE PRODUTOS =====

// GET /api/products - Buscar todos os produtos
app.get("/api/products", async (req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/products/:id - Buscar produto por ID
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }
    res.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products - Criar novo produto
app.post("/api/products", async (req, res) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/products/:id - Atualizar produto
app.put("/api/products/:id", async (req, res) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    if (error.message === "Produto não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/products/:id - Deletar produto
app.delete("/api/products/:id", async (req, res) => {
  try {
    const result = await ProductService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    if (error.message === "Produto não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products/update-stock - Atualizar estoque de múltiplos produtos
app.post("/api/products/update-stock", async (req, res) => {
  try {
    const { updates } = req.body;
    await ProductService.updateProductsStock(updates);
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao atualizar estoque:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== ROTAS DE PEDIDOS =====

// GET /api/orders - Buscar todos os pedidos
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:id - Buscar pedido por ID
app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await OrderService.getOrderById(req.params.id);
    res.json(order);
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    if (error.message === "Pedido não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders - Criar novo pedido
app.post("/api/orders", async (req, res) => {
  try {
    const order = await OrderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/orders/:id/status - Atualizar status do pedido
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await OrderService.updateOrderStatus(req.params.id, status);
    res.json(order);
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    if (error.message === "Pedido não encontrado") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// ===== ROTA DE HEALTH CHECK =====
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Middleware de tratamento de rotas não encontradas
app.use("*", (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error("Erro não tratado:", error);
  res.status(500).json({ error: "Erro interno do servidor" });
});

// Inicializar banco de dados e então iniciar servidor
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || "development"}`);
      console.log(
        `🌐 CORS habilitado para: ${
          process.env.CORS_ORIGIN || "http://localhost:5173"
        }`
      );
      console.log(
        `💾 Banco de dados: ${process.env.DB_NAME || "checkout_nova_concursos"}`
      );
    });
  })
  .catch((err) => {
    console.error(
      "Falha ao inicializar banco de dados, servidor não será iniciado.",
      err
    );
    process.exit(1);
  });
