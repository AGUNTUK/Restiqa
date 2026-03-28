/**
 * ZiniPay Utility for Restiqa
 * Handles API interactions with zinipay.com
 */

const ZINIPAY_API_KEY = process.env.ZINIPAY_API_KEY;
const ZINIPAY_CREATE_URL = "https://api.zinipay.com/v1/payment/create";
const ZINIPAY_VERIFY_URL = "https://api.zinipay.com/v1/payment/verify";

export interface ZiniCreateResponse {
  status: boolean;
  message: string;
  payment_url?: string;
}

export interface ZiniVerifyResponse {
  status: string; // 'success' or other
  message?: string;
  data?: {
    transactionId: string;
    invoiceId: string;
    amount: string;
    currency: string;
    paymentMethod: string;
    status: string;
    customerName?: string;
    customerEmail?: string;
    metadata?: any;
    createdAt?: string;
  };
}

/**
 * Initiates a payment with ZiniPay
 */
export async function createZiniPayment(params: {
  amount: number;
  bookingId: string;
  redirect_url: string;
  cancel_url: string;
  webhook_url?: string;
  customer_name?: string;
  customer_email?: string;
}): Promise<ZiniCreateResponse> {
  if (!ZINIPAY_API_KEY) {
    throw new Error("ZINIPAY_API_KEY is not configured in environment variables.");
  }

  const body = {
    amount: params.amount.toString(),
    redirect_url: params.redirect_url,
    cancel_url: params.cancel_url,
    webhook_url: params.webhook_url,
    metadata: {
      bookingId: params.bookingId,
    },
    cus_name: params.customer_name,
    cus_email: params.customer_email,
  };

  const response = await fetch(ZINIPAY_CREATE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "zini-api-key": ZINIPAY_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ZiniPay API Error Response:", errorText);
    try {
      const errorJson = JSON.parse(errorText);
      return {
        status: false,
        message: errorJson.message || errorJson.error || `API returned ${response.status}`,
      };
    } catch (e) {
      return {
        status: false,
        message: `API returned ${response.status}`,
      };
    }
  }

  const data: ZiniCreateResponse = await response.json();
  return data;
}

/**
 * Verifies a payment with ZiniPay using invoiceId
 */
export async function verifyZiniPayment(invoiceId: string): Promise<ZiniVerifyResponse> {
  if (!ZINIPAY_API_KEY) {
    throw new Error("ZINIPAY_API_KEY is not configured in environment variables.");
  }

  const body = {
    invoiceId: invoiceId,
    apiKey: ZINIPAY_API_KEY, // The docs show apiKey in body for verify
  };

  const response = await fetch(ZINIPAY_VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "zini-api-key": ZINIPAY_API_KEY, // Also in header for consistency
    },
    body: JSON.stringify(body),
  });

  const data: ZiniVerifyResponse = await response.json();
  return data;
}
