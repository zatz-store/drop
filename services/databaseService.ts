import { supabase } from './supabaseClient';
import { Product } from '../types';

export const DatabaseService = {
    // Buscar todos os produtos
    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar produtos:', error);
            return [];
        }

        // Mapear snake_case do banco para camelCase do frontend se necessário
        // Supabase retorna os dados conforme as colunas. 
        // Vamos assumir que criamos as colunas com os mesmos nomes ou mapeamos aqui.
        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            supplierPrice: item.supplier_price,
            markup: item.markup,
            finalPrice: item.final_price,
            stock: item.stock,
            supplierName: item.supplier_name,
            image: item.image,
            category: item.category,
            shopeeId: item.shopee_id
        }));
    },

    // Adicionar novo produto
    async addProduct(product: Omit<Product, 'id'>): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .insert([{
                name: product.name,
                supplier_price: product.supplierPrice,
                markup: product.markup,
                final_price: product.finalPrice,
                stock: product.stock,
                supplier_name: product.supplierName,
                image: product.image,
                category: product.category,
                shopee_id: product.shopeeId
            }])
            .select()
            .single();

        if (error) {
            console.error('Erro ao adicionar produto:', error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            supplierPrice: data.supplier_price,
            markup: data.markup,
            finalPrice: data.final_price,
            stock: data.stock,
            supplierName: data.supplier_name,
            image: data.image,
            category: data.category,
            shopeeId: data.shopee_id
        };
    },

    // Atualizar produto (ex: preço)
    async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
        // Converter campos para snake_case
        const dbUpdates: any = {};
        if (updates.finalPrice !== undefined) dbUpdates.final_price = updates.finalPrice;
        if (updates.markup !== undefined) dbUpdates.markup = updates.markup;
        if (updates.shopeeId !== undefined) dbUpdates.shopee_id = updates.shopeeId;

        const { error } = await supabase
            .from('products')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    },

    // Deletar produto
    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao deletar produto:', error);
            throw error;
        }
    }
};