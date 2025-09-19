import type { Order } from "../types";

/**
 * Simula um chamdado pra API do metodo de pagamento do PagSeguro.
 * @param order O objeto order contem todos os detalhes para pagamento.
 * @returns Uma promise que retorna o resultado do pagamento.
 */
export const processPagSeguroPayment = (
  order: Order
): Promise<{ success: boolean; message: string; transactionId: string }> => {
  console.log(
    `Processando pagamento PagSeguro do pedido ${
      order.id
    } de R$ ${order.total.toFixed(2)}...`
  );

  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple rule: fail if the total amount includes cents other than .90
      const fails =
        Math.round(order.total * 100) % 100 !== 90 &&
        Math.round(order.total * 100) % 100 !== 0;
      const transactionId = `PAG_${Date.now()}`;

      // Se o método for PIX, recusamos automaticamente (regra de negócio solicitada)
      if (order.paymentMethod === "pix") {
        console.log(
          "Pagamento via PIX detectado -> recusando automaticamente."
        );
        resolve({
          success: false,
          message:
            "Pagamento PIX recusado automaticamente pelo gateway de teste.",
          transactionId,
        });
        return;
      }
      // - paymentMethod === 'card'  => consideramos o pagamento como concluído (aprovado)
      // - paymentMethod === 'pix'   => consideramos o pagamento como recusado
      if (fails) {
        if (order.paymentMethod === "card") {
          console.log(
            "Pagamento falhou, mas método é 'card' -> tratando como aprovado."
          );
          resolve({
            success: true,
            message: "Pagamento aprovado (fallback para cartão).",
            transactionId,
          });
        } else if (order.paymentMethod === "pix") {
          console.log("Pagamento falhou e método é 'pix' -> recusado.");
          resolve({
            success: false,
            message:
              "Pagamento PIX recusado pela operadora. Verifique os dados e tente novamente.",
            transactionId,
          });
        } else {
          // Comportamento padrão: recusar
          console.log("Pagamento falhou e método desconhecido -> recusado.");
          resolve({
            success: false,
            message:
              "Pagamento recusado pela operadora. Verifique os dados e tente novamente.",
            transactionId,
          });
        }
      } else {
        console.log("PagSeguro payment successful.");
        resolve({
          success: true,
          message: "Pagamento aprovado com sucesso!",
          transactionId,
        });
      }
    }, 2000); // Simulate network latency
  });
};
