import { apiHelper } from "@/lib/apiHelper";

interface Product {
    id: string;
    name: string;
    price: number;
    createdAt: string;
}

export const getProducts = async () => {
    try {
        return await apiHelper.get<Product[]>("/products");
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const getProductById = async (id: string) => {
    try {
        return await apiHelper.get<Product>(`/products/${id}`);
    } catch (error) {
        console.error("Error fetching product:", error);
        throw error;
    }
};

export const createProduct = async (product: { name: string; price: number }) => {
    try {
        return await apiHelper.post<Product>("/products", product);
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

export const updateProduct = async (id: string, product: { name: string; price: number }) => {
    try {
        return await apiHelper.patch<Product>(`/products/${id}`, product);
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

export const deleteProduct = async (id: string) => {
    try {
        return await apiHelper.delete<void>(`/products/${id}`);
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};