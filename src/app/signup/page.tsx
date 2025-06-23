"use client";

import { useState } from "react";
import Link from "next/link";
import { FaFilm, FaGoogle, FaFacebook, FaEnvelope, FaEye, FaEyeSlash, FaExclamationCircle, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: "",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  // Password strength checker
  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    checkPasswordStrength(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    });
    setSuccess(false);
    let isValid = true;
    const newErrors: typeof errors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      general: "",
    };
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      newErrors.password = "パスワードは8文字以上で、大文字・小文字・数字を含める必要があります";
      isValid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    // 成功時は即サクセス画面へ遷移
    const name = encodeURIComponent(`${firstName} ${lastName}`.trim());
    const mail = encodeURIComponent(email);
    router.push(`/signup-success?name=${name}&email=${mail}`);
    // 以降のSupabase API呼び出しは省略またはサクセス画面で実行
  };

  return (
    <div className="bg-dark text-white font-sans min-h-screen">
      {/* Sign Up Section */}
      <section className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-darkgray rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Join CineVerse</h1>
              <p className="text-gray-400">Create your account to start your movie journey</p>
            </div>
            {/* Social Sign Up Buttons (無効化) */}
            <div className="space-y-3 mb-6">
              <button disabled className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center opacity-60 cursor-not-allowed">
                <FaGoogle className="mr-3 text-lg" />
                Continue with Google
              </button>
              <button disabled className="w-full bg-[#1877F2] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center opacity-60 cursor-not-allowed">
                <FaFacebook className="mr-3 text-lg" />
                Continue with Facebook
              </button>
            </div>
            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-darkgray text-gray-400">Or sign up with email</span>
              </div>
            </div>
            {/* Sign Up Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors" placeholder="John" />
                  {errors.firstName && (
                    <div className="text-red-400 text-sm mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" /> {errors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors" placeholder="Doe" />
                  {errors.lastName && (
                    <div className="text-red-400 text-sm mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" /> {errors.lastName}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors" placeholder="john.doe@example.com" />
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
                  <input type={showPassword ? "text" : "password"} value={password} onChange={handlePasswordChange} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-12" placeholder="Create a strong password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {/* Password strength */}
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded ${passwordStrength <= 2 ? (i < passwordStrength ? 'bg-red-500' : 'bg-gray-600') : passwordStrength <= 3 ? (i < passwordStrength ? 'bg-yellow-500' : 'bg-gray-600') : (i < passwordStrength ? 'bg-green-500' : 'bg-gray-600')}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Password strength: <span>{passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}</span></p>
                </div>
                {errors.password && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {errors.password}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-12" placeholder="Confirm your password" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {errors.confirmPassword}
                  </div>
                )}
              </div>
              {errors.general && (
                <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  <span>{errors.general}</span>
                </div>
              )}
              {success && (
                <div className="bg-green-900 border border-green-600 text-green-200 px-4 py-3 rounded-lg flex items-center">
                  <FaCheckCircle className="mr-2" />
                  <span>Account created successfully! Please check your email to verify.</span>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-gray-100 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50">
                {loading ? (
                  <>
                    <span>Creating Account...</span>
                    <svg className="animate-spin ml-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
            <div className="text-center mt-6 pt-6 border-t border-gray-600">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:text-secondary transition-colors font-medium ml-1">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 