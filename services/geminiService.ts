import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

try {
    if (process.env.API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
} catch (error) {
    console.error("Error initializing GoogleGenAI", error);
}

export const generateOptimizedDescription = async (productName: string, currentDescription: string): Promise<string> => {
  if (!ai) {
    return "API Key não configurada. Adicione sua chave Gemini para usar este recurso.";
  }

  try {
    const prompt = `
      Atue como um especialista em E-commerce e SEO para Shopee Brasil.
      Eu tenho um produto com o nome: "${productName}"
      Descrição atual: "${currentDescription}"
      
      Por favor, gere uma descrição de produto otimizada para vendas no Brasil.
      Inclua:
      1. Um título chamativo (máximo 60 caracteres).
      2. Uma lista de benefícios (bullet points).
      3. Especificações técnicas (se aplicável).
      4. Gatilhos mentais de escassez ou urgência.
      
      Use português do Brasil, tom amigável e profissional. Retorne apenas o texto formatado.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a descrição.";
  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    return "Erro ao gerar descrição. Tente novamente mais tarde.";
  }
};