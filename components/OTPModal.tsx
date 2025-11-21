'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OTPModal({ isOpen, onClose }: OTPModalProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setMessage('OTP sent to your email. Check spam folder if not found.');
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), otp }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // Store the auth token in localStorage and cookies
      localStorage.setItem('authToken', data.token);
      
      // Refresh the page to update session and trigger any auth checks
      setTimeout(() => {
        router.push('/');
        window.location.reload();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {step === 'email' ? 'Email Login' : 'Verify OTP'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <p className="text-xs text-gray-500">
              We'll send a 6-digit code to your email. No password needed!
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit code sent to <span className="font-medium">{email}</span>
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">One-Time Password</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6).toUpperCase())}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black text-center text-2xl tracking-widest font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50 transition"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setMessage('');
                setError('');
              }}
              className="w-full text-sm text-gray-600 hover:text-black transition"
            >
              Use different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
