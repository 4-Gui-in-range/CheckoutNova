import React from "react";
import type { Product } from "../types";
import { ProductStatus } from "../types";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  const isAvailable =
    product.status === ProductStatus.Active && product.stock > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 flex flex-col">
      <div className="relative">
        <img
          className="h-48 w-full object-cover"
          src={product.image}
          alt={product.title}
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-lg font-semibold px-4 py-2 rounded-md bg-gray-700">
              {product.status === ProductStatus.Inactive
                ? "Inativo"
                : "Indisponível"}
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h5 className="text-lg font-semibold tracking-tight text-gray-900 h-14 overflow-hidden">
          {product.title}
        </h5>
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-gray-900">
            R${" "}
            {typeof product.price === "number" && !isNaN(product.price)
              ? product.price.toFixed(2).replace(".", ",")
              : "0,00"}
          </span>
        </div>
        <div className="flex-grow" />
        {isAvailable && product.stock > 0 && (
          <p
            className={`text-sm mt-2 text-right font-medium ${
              product.stock <= 10 ? "text-red-600" : "text-gray-600"
            }`}
          >
            {product.stock <= 10
              ? `Apenas ${product.stock} em estoque!`
              : `${product.stock} em estoque`}
          </p>
        )}
        <button
          onClick={() => onAddToCart(product)}
          disabled={!isAvailable}
          className={`mt-2 w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors ${
            isAvailable
              ? "bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:outline-none focus:ring-orange-300"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
};
