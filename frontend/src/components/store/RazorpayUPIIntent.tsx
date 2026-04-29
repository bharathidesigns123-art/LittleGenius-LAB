'use client';

import React from 'react';

interface RazorpayUPIIntentProps {
  orderId: string;
  amountInr: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

/**
 * A specialized Razorpay component for the Indian market that prioritizes UPI Intent flow.
 * On mobile, this will directly show apps like GPay, PhonePe, and Paytm.
 */
export const RazorpayUPIIntent: React.FC<RazorpayUPIIntentProps> = ({
  orderId,
  amountInr,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure
}) => {
  const handlePayment = () => {
    if (typeof window === 'undefined' || !(window as any).Razorpay) {
      alert('Razorpay SDK not loaded. Please try again.');
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amountInr * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'LittleGenius LAB',
      description: '3D Printed Toy Order',
      order_id: orderId,
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
        method: 'upi' // Suggest UPI as the primary method
      },
      config: {
        display: {
          blocks: {
            upi: {
              name: 'Pay via UPI',
              instruments: [
                {
                  method: 'upi',
                  apps: ['google_pay', 'phonepe', 'paytm'] // Priority apps for Intent flow
                }
              ]
            }
          },
          sequence: ['block.upi'],
          preferences: {
            show_default_blocks: false // Focus strictly on UPI for this specific button
          }
        }
      },
      handler: (response: any) => {
        onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          onFailure({ message: 'Payment cancelled by user' });
        }
      },
      theme: {
        color: '#6366F1' // Indigo-500
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  return (
    <button
      onClick={handlePayment}
      className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg active:scale-95"
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" 
        alt="UPI" 
        className="h-5 bg-white px-1 rounded" 
      />
      <span>Pay with UPI (GPay / PhonePe)</span>
    </button>
  );
};
