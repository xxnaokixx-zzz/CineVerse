"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { FaFilm, FaCheck, FaEnvelope, FaInfoCircle, FaPaperPlane, FaArrowRight, FaSearch, FaHeart, FaStar } from "react-icons/fa";

export default function SignupSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name") || "";
  const email = searchParams.get("email") || "";
  const [modalOpen, setModalOpen] = useState(false);
  const [resending, setResending] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);

  const handleResend = async () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setModalOpen(true);
    }, 2000);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleContinue = () => {
    setContinueLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  // 30秒後に自動リダイレクト
  // setTimeoutはuseEffectで
  useState(() => {
    const timer = setTimeout(() => {
      setContinueLoading(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-dark text-white font-sans min-h-screen">
      {/* Success Confirmation Section */}
      <section className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FaCheck className="text-white text-4xl" />
            </div>
          </div>
          {/* Success Message */}
          <div className="bg-darkgray rounded-2xl shadow-2xl p-8">
            <h1 className="text-3xl font-bold mb-4 text-green-400">Welcome to CineVerse!</h1>
            <p className="text-xl text-gray-300 mb-6">Your account has been created successfully</p>
            {/* User Info Display */}
            <div className="bg-lightgray rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-3">
                <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg" alt="User Avatar" className="w-16 h-16 rounded-full mr-4" />
                <div className="text-left">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="text-gray-400">{email}</p>
                </div>
              </div>
            </div>
            {/* Email Verification Notice */}
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <FaEnvelope className="text-yellow-400 text-xl mr-3 mt-1" />
                <div className="text-left">
                  <h4 className="font-semibold text-yellow-200 mb-2">Verify Your Email</h4>
                  <p className="text-yellow-100 text-sm mb-3">
                    We've sent a verification email to <strong>{email}</strong>.<br />
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                  <p className="text-yellow-200 text-xs">
                    <FaInfoCircle className="inline mr-1" />
                    Don't see the email? Check your spam folder or wait a few minutes.
                  </p>
                </div>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="space-y-4">
              <button onClick={handleResend} disabled={resending} className="w-full bg-lightgray hover:bg-gray-600 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                {resending ? (
                  <>
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Resend Verification Email
                  </>
                )}
              </button>
              <button onClick={handleContinue} disabled={continueLoading} className="w-full bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                {continueLoading ? (
                  <>
                    <span>Redirecting to Dashboard...</span>
                    <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Continue to Dashboard</span>
                    <FaArrowRight className="ml-2" />
                  </>
                )}
              </button>
            </div>
            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-600">
              <h4 className="font-semibold mb-4">What's Next?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <FaSearch className="text-primary text-2xl mb-2 mx-auto" />
                  <p className="text-gray-300">Discover thousands of movies and shows</p>
                </div>
                <div className="text-center">
                  <FaHeart className="text-primary text-2xl mb-2 mx-auto" />
                  <p className="text-gray-300">Save your favorites and create watchlists</p>
                </div>
                <div className="text-center">
                  <FaStar className="text-primary text-2xl mb-2 mx-auto" />
                  <p className="text-gray-300">Rate and review movies you've watched</p>
                </div>
              </div>
            </div>
            {/* Support Link */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-gray-400 text-sm">
                Need help? <button className="text-primary hover:text-secondary transition-colors">Contact Support</button>
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Resend Email Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-darkgray rounded-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <FaPaperPlane className="text-primary text-3xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Email Sent!</h3>
              <p className="text-gray-300 text-sm mb-4">
                We've sent another verification email to your inbox. Please check your email and spam folder.
              </p>
              <button onClick={handleCloseModal} className="bg-primary hover:bg-secondary text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 