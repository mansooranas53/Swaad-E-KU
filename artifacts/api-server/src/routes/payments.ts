import { Router, type IRouter } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";

const router: IRouter = Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

router.post("/payments/create-order", requireAuth, requireRole("student"), async (req, res): Promise<void> => {
  const { amount, currency = "INR", receipt } = req.body;
  if (!amount || amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create payment order" });
  }
});

router.post("/payments/verify", requireAuth, async (req, res): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400).json({ error: "Missing payment fields" });
    return;
  }
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400).json({ error: "Payment verification failed", verified: false });
    return;
  }
  res.json({ verified: true, paymentId: razorpay_payment_id });
});

export default router;
