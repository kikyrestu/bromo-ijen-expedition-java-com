'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    // Check if already logged in
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      
      if (data.authenticated) {
        router.push('/cms');
      }
    } catch (error) {
      // Not logged in, stay on login page
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to CMS
        router.push('/cms');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] flex items-center justify-center p-4">
      {/* WordPress-style Login Box */}
      <div className="w-full max-w-[320px]">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-[84px] font-bold text-[#1e1e1e] leading-none tracking-tight mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            TT
          </h1>
          <p className="text-sm text-[#50575e]">Powered by TournTravel</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white shadow-md rounded-sm">
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-white border-l-4 border-[#d63638]">
                <p className="text-sm text-[#1e1e1e]">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Username */}
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-[#1e1e1e] mb-1">
                  Username or Email Address
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm text-gray-900 text-base focus:border-[#2271b1] focus:outline-none focus:ring-1 focus:ring-[#2271b1] shadow-inner placeholder:text-gray-500"
                  required
                  autoFocus
                  placeholder="Username or Email"
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-[#1e1e1e] mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded-sm text-gray-900 text-base focus:border-[#2271b1] focus:outline-none focus:ring-1 focus:ring-[#2271b1] shadow-inner placeholder:text-gray-500"
                  required
                  placeholder="Password"
                />
              </div>

              {/* Remember Me */}
              <div className="mb-5">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 border-[#8c8f94] rounded text-[#2271b1] focus:ring-[#2271b1] focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-[#2c3338]">Remember Me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white text-base font-medium rounded-sm border border-[#2271b1] hover:border-[#135e96] focus:outline-none focus:ring-1 focus:ring-[#2271b1] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </form>
          </div>
        </div>

        {/* Lost Password Link */}
        <p className="text-center mt-4">
          <a href="#" className="text-sm text-[#2271b1] hover:text-[#135e96] no-underline">
            Lost your password?
          </a>
        </p>

        {/* Back to Site */}
        <p className="text-center mt-4">
          <a href="/" className="text-sm text-[#50575e] hover:text-[#2271b1] no-underline">
            ← Go to TournTravel
          </a>
        </p>
      </div>

      {/* Language Switcher (optional, WordPress-style) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <select className="text-sm text-[#50575e] bg-transparent border-0 focus:outline-none cursor-pointer">
          <option value="en">English</option>
          <option value="id">Bahasa Indonesia</option>
        </select>
      </div>
    </div>
  );
}

