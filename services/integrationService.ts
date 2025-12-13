
// This service mimics the backend interaction with external APIs
// In a real production app, these calls would go to your Node.js/Python backend

export interface PaymentMethod {
  cardNumber: string;
  holderName: string;
  expiry: string;
  cvv: string;
}

export interface BankCredentials {
  bankName: string; // 'inter' | 'nubank' | 'itau'
  clientId: string;
  clientSecret: string;
}

export interface ShopeeCredentials {
  shopId: string;
  partnerId: string;
}

export interface ConnectedStore {
  shopId: string;
  name: string;
  region: 'BR' | 'CN' | 'Local';
  status: 'active' | 'expired' | 'syncing';
  lastSync: string;
}

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const IntegrationService = {
  // 1. Shopee Open Platform Simulation (OAuth Flow)
  async authenticateShopeeStore(): Promise<ConnectedStore> {
    await delay(3000); // Simulate user logging in on Shopee popup

    // Randomize success/fail simulation (90% success)
    if (Math.random() > 0.9) {
        throw new Error("O usuário cancelou a autorização ou a sessão expirou.");
    }

    const randomId = Math.floor(Math.random() * 900000000) + 100000000;
    
    return { 
        shopId: randomId.toString(),
        name: `Shopee Store ${randomId.toString().substring(0, 4)} Oficial`,
        region: 'BR',
        status: 'syncing', // Start as syncing
        lastSync: new Date().toISOString()
    };
  },

  // Legacy manual connection (kept for reference or specific use cases)
  async connectShopee(credentials: ShopeeCredentials): Promise<{ success: boolean; message: string }> {
    await delay(2000); // Simulate network latency

    if (!credentials.shopId || !credentials.partnerId) {
      throw new Error("ID da Loja e Partner ID são obrigatórios.");
    }

    // Simulate validation logic
    if (credentials.shopId.length < 5) {
      throw new Error("ID da Loja inválido. Verifique o número.");
    }

    return { success: true, message: "Loja Shopee conectada com sucesso!" };
  },

  // 2. Open Banking / Banking API Simulation
  async connectBank(credentials: BankCredentials): Promise<{ success: boolean; balance: number }> {
    await delay(2500);

    if (!credentials.clientId || !credentials.clientSecret) {
      throw new Error("Credenciais da API do banco incompletas.");
    }

    // Mock returning a balance
    return { 
      success: true, 
      balance: Math.floor(Math.random() * 5000) + 1000 // Random balance between 1000 and 6000
    };
  },

  // 3. Payment Gateway Simulation (Stripe/Pagar.me style)
  async processCardValidation(card: PaymentMethod): Promise<{ success: boolean; token: string }> {
    await delay(1500);

    // Basic Validation
    const cleanNumber = card.cardNumber.replace(/\D/g, '');
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      throw new Error("Número de cartão inválido.");
    }

    if (!card.cvv || card.cvv.length < 3) {
      throw new Error("CVV inválido.");
    }

    // Simple Luhn Algorithm check for realism
    let sum = 0;
    let shouldDouble = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i));
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    if (sum % 10 !== 0) {
      throw new Error("Cartão recusado pela operadora (Inválido).");
    }

    return { 
      success: true, 
      token: `tok_${Math.random().toString(36).substr(2, 9)}` // Simulate a payment token
    };
  }
};
