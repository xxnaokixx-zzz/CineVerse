'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFilm, FaGoogle, FaEnvelope, FaEye, FaEyeSlash, FaExclamationCircle, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [socialLoginMessage, setSocialLoginMessage] = useState('');
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user was redirected due to session expiry
    if (searchParams.get('session_expired') === 'true') {
      setSessionExpiredMessage('Your session has expired. Please log in again.');
      setTimeout(() => {
        setSessionExpiredMessage('');
      }, 8000);
    }

    // onAuthStateChangeでログイン後にリダイレクト
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        const redirectTo = getRedirectTo();
        router.push(redirectTo);
      }
      if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams, router]);

  // URLからリダイレクト先を取得
  const getRedirectTo = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('redirectTo') || '/';
    }
    return '/';
  };

  const handleSocialLoginClick = () => {
    setSocialLoginMessage('随時対応予定です。一旦メールアドレスからログインをお願いします');
    setTimeout(() => {
      setSocialLoginMessage('');
    }, 6000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: '', password: '', general: '' });
    setSuccess(false);

    let isValid = true;
    const newErrors = { email: '', password: '', general: '' };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setLoading(true);
      const supabase = createClient();

      try {
        console.log('[LOGIN] signInWithPassword start', { email });

        // Clear any existing session first
        await supabase.auth.signOut();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        console.log('[LOGIN] signInWithPassword result', { data, error });

        if (error) {
          setLoading(false);
          let errorMessage = error.message;

          // Handle specific error messages
          if (error.message === 'Invalid login credentials') {
            errorMessage = 'Invalid email or password. Please check your credentials.';
          } else if (error.message.includes('refresh_token_not_found')) {
            errorMessage = 'Session expired. Please try logging in again.';
          }

          // 日本語化
          if (errorMessage === 'Invalid email or password. Please check your credentials.') {
            errorMessage = 'メールアドレスまたはパスワードが正しくありません';
          }

          setErrors({ ...newErrors, general: errorMessage });
          console.log('[LOGIN] error after signInWithPassword', error);
        } else if (data.session) {
          setLoading(false);
          setSuccess(true);
          // 遷移はonAuthStateChangeで行う
        } else {
          setLoading(false);
          setErrors({ ...newErrors, general: 'Failed to establish session. Please try again.' });
          console.log('[LOGIN] session missing after signInWithPassword');
        }
      } catch (error) {
        setLoading(false);
        console.error('[LOGIN] Unexpected error:', error);
        setErrors({ ...newErrors, general: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  return (
    <div className="bg-dark text-white font-sans min-h-screen flex flex-col">
      <div className="flex-grow flex items-start justify-center pt-4 pb-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-darkgray rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-400">Sign in to continue your movie journey</p>
            </div>

            {sessionExpiredMessage && (
              <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg flex items-center mb-6">
                <FaExclamationTriangle className="mr-2" />
                <span>{sessionExpiredMessage}</span>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <button
                onClick={handleSocialLoginClick}
                className="w-full bg-white hover:bg-gray-100 text-black py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <FaGoogle className="mr-3 text-lg text-gray-600" />
                Continue with Google
              </button>
              <button
                onClick={handleSocialLoginClick}
                className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <FaXTwitter className="mr-3 text-lg" />
                Continue with X
              </button>
            </div>

            {socialLoginMessage && (
              <div className="bg-blue-900/50 border border-blue-600 text-blue-200 px-4 py-3 rounded-lg flex items-center mb-6">
                <FaInfoCircle className="mr-2" />
                <span>{socialLoginMessage}</span>
              </div>
            )}

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-darkgray text-gray-400">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                  />
                  <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.email && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {errors.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-12"
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {errors.password}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 text-primary bg-lightgray border-gray-600 rounded focus:ring-primary focus:ring-2" />
                  <span className="ml-2 text-sm text-gray-300">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary hover:text-secondary transition-colors">
                  Forgot password?
                </button>
              </div>

              {errors.general && (
                <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{errors.general}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-900/50 border border-green-600 text-green-200 px-4 py-3 rounded-lg flex items-center">
                  <FaCheckCircle className="mr-2" />
                  <span>Login successful! Redirecting...</span>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50">
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-gray-600">
              <p className="text-gray-400">
                Don't have an account?
                <Link href="/signup" className="text-primary hover:text-secondary transition-colors font-medium ml-1">
                  Create one now
                </Link>
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              By signing in, you agree to our
              <Link href="/terms" className="text-primary hover:underline cursor-pointer mx-1">
                Terms of Service
              </Link>
              and
              <Link href="/privacy" className="text-primary hover:underline cursor-pointer ml-1">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}