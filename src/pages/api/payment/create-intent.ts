import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { CartProduct } from '../../../lib/interfaces';

interface CreateIntentRequest {
  items: CartProduct[];
  currency?: string;
  metadata?: Record<string, string>;
  customerId?: string;
}

interface CreateIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  error?: string;
}

// Initialize Stripe lazily inside the handler
function getStripeInstance(): Stripe {
  // Check for Stripe configuration
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
    console.error('🔧 Payment API: STRIPE_SECRET_KEY is not properly configured');
    throw new Error('Payment service is not configured. Please contact support.');
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('placeholder')) {
    console.error('🔧 Payment API: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not properly configured');
    throw new Error('Payment service is not configured. Please contact support.');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreateIntentResponse | { error: string }>
) {
  try {
    // Initialize Stripe inside the handler
    const stripe = getStripeInstance();
    console.log('🔧 Payment API: Request received', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body ? 'Body present' : 'No body'
    });

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('🔧 Payment API: Processing request...');
    const { items, currency = 'cad', metadata = {}, customerId }: CreateIntentRequest = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((total, item) => {
      const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0);
      let optionsPrice = 0;
      
      if (item.options && Array.isArray(item.options)) {
        optionsPrice = item.options.reduce((optSum: number, option: any) => {
          const optPrice = Number(option.priceModifier || 0) || 0;
          const optQuantity = Number(option.quantity || 1) || 1;
          return optSum + (optPrice * optQuantity);
        }, 0);
      }
      
      return total + (basePrice + optionsPrice) * (Number(item.quantity) || 1);
    }, 0);

    // Add tax (13% for Canada)
    const taxRate = 0.13;
    const taxAmount = totalAmount * taxRate;
    const finalAmount = totalAmount + taxAmount;

    // Convert to cents
    const amountInCents = Math.round(finalAmount * 100);

    if (amountInCents < 50) { // Minimum $0.50
      return res.status(400).json({ error: 'Amount must be at least $0.50' });
    }

    // Create or retrieve customer
    let stripeCustomerId = customerId;
    if (!stripeCustomerId) {
      // For now, create anonymous customers
      // In a real app, you'd want to create customers with email/phone
      const customer = await stripe.customers.create({
        metadata: {
          source: 'stripe-elements',
          created_at: new Date().toISOString(),
        },
      });
      stripeCustomerId = customer.id;
    }

    // Prepare line items for receipt
    const lineItems = items.map((item) => ({
      name: item.title,
      description: item.description || '',
      quantity: Number(item.quantity) || 1,
      unit_amount: Math.round(
        ((typeof item.price === 'number' ? item.price : Number(item.price || 0)) +
         (item.options?.reduce((optSum: number, option: any) => {
           const optPrice = Number(option.priceModifier || 0) || 0;
           const optQuantity = Number(option.quantity || 1) || 1;
           return optSum + (optPrice * optQuantity);
         }, 0) || 0)) * 100
      ),
    }));

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      payment_method_types: ['card'], // Only allow card payments
      metadata: {
        ...metadata,
        source: 'stripe-elements',
        itemCount: items.length.toString(),
        items: JSON.stringify(items.map(item => ({
          productId: item.productId,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        }))),
        timestamp: new Date().toISOString(),
      },
      description: `Payment for ${items.length} item(s) from HSMobility`,
      receipt_email: undefined, // Will be collected via Link Authentication Element
      shipping: {
        name: 'Customer',
        address: {
          line1: 'TBD', // Will be collected via Address Element
          city: 'TBD',
          country: 'CA',
        },
      },
    });

    console.log('Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: paymentIntent.customer,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ error: error.message });
    } else if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ error: 'Invalid request. Please check your data.' });
    } else if (error.type === 'StripeAPIError') {
      return res.status(500).json({ error: 'Payment service error. Please try again.' });
    } else if (error.type === 'StripeConnectionError') {
      return res.status(500).json({ error: 'Network error. Please check your connection.' });
    } else if (error.type === 'StripeAuthenticationError') {
      return res.status(500).json({ error: 'Authentication error. Please contact support.' });
    }

    res.status(500).json({ 
      error: error.message || 'An unexpected error occurred while creating payment intent' 
    });
  }
}