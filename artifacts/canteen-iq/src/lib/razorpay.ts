declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface RazorpayOptions {
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  userEmail?: string;
  userName?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onDismiss?: () => void;
}

export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error("Failed to load Razorpay checkout");
  }

  const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  const createRes = await fetch(`${BASE}/api/payments/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("canteeniq_token")}`,
    },
    body: JSON.stringify({
      amount: options.amount,
      currency: options.currency || "INR",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create payment order");
  }

  const { orderId, amount, currency } = await createRes.json();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: "Swaad-E-KU",
      description: "Canteen Order Payment",
      image: "",
      order_id: orderId,
      prefill: {
        name: options.userName || "",
        email: options.userEmail || "",
      },
      theme: {
        color: "#6d5cf6",
      },
      modal: {
        ondismiss: () => {
          options.onDismiss?.();
          resolve();
        },
      },
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch(`${BASE}/api/payments/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("canteeniq_token")}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const data = await verifyRes.json();
          if (!verifyRes.ok || !data.verified) {
            reject(new Error("Payment verification failed"));
            return;
          }
          options.onSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      },
    });

    rzp.open();
  });
}
