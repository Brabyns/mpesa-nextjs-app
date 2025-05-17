'use client';
import React from "react";
import { useState } from 'react';

export default function Page() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/stk', {
      method: 'POST',
      body: JSON.stringify({ phone, amount }),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    alert(data.message || 'STK Push initiated!');
  };

  return (
    <form onSubmit={handlePay} className="p-4">
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone (2547XXXXXXXX)"
        className="border p-2 mb-2 block"
        required
      />
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        type="number"
        className="border p-2 mb-2 block"
        required
      />
      <button className="bg-green-600 text-white px-4 py-2">Pay Now</button>
    </form>
  );
}
