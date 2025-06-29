"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFilm, FaGoogle, FaFacebook, FaEnvelope, FaEye, FaEyeSlash, FaExclamationCircle, FaExclamationTriangle, FaCheckCircle, FaCamera } from "react-icons/fa";
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: "",
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({ ...prev, avatar: "画像サイズは5MB以下にしてください" }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, avatar: "画像ファイルを選択してください" }));
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, avatar: "" }));
    }
  };

  const getDefaultAvatar = () => {
    if (firstName) {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#6366f1'; // Indigo color (primary)
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 100px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(firstName.charAt(0).toUpperCase(), canvas.width / 2, canvas.height / 2);
        return canvas.toDataURL('image/png');
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatar: "",
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
      avatar: "",
      general: "",
    };
    if (!firstName.trim()) {
      newErrors.firstName = "姓を入力してください";
      isValid = false;
    }
    if (!lastName.trim()) {
      newErrors.lastName = "名を入力してください";
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
      isValid = false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
      newErrors.password = "パスワードは8文字以上で、大文字・小文字・数字を含める必要があります";
      isValid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません";
      isValid = false;
    }
    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    const supabase = createClient();

    try {
      // アバター画像のアップロード処理
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;
        avatarUrl = fileName;
      } else if (firstName) {
        // デフォルトアバターの作成と保存
        const defaultAvatarDataUrl = getDefaultAvatar();
        if (defaultAvatarDataUrl) {
          const response = await fetch(defaultAvatarDataUrl);
          const blob = await response.blob();
          const fileName = `${Date.now()}.png`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob);

          if (uploadError) throw uploadError;
          avatarUrl = fileName;
        }
      }

      // ユーザー登録
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`.trim(),
            avatar_url: avatarUrl,
          },
        },
      });

      if (error) throw error;

      // プロフィールも必ずupsert
      if (signUpData.user) {
        await new Promise(res => setTimeout(res, 1000));
        const meta = signUpData.user.user_metadata || {};
        const upsertObj = {
          id: signUpData.user.id,
          first_name: meta.first_name || firstName.trim(),
          last_name: meta.last_name || lastName.trim(),
          full_name: meta.full_name || `${firstName} ${lastName}`.trim(),
          avatar_url: meta.avatar_url || avatarUrl,
          email: meta.email || email.trim(),
        };
        console.log('profiles upsert object:', upsertObj);
        const { error: upsertError } = await supabase.from('profiles').upsert(upsertObj);
        if (upsertError) {
          console.error('profiles upsert error:', upsertError);
        } else {
          console.log('profiles upsert success');
        }
      }

      setSuccess(true);
      const name = encodeURIComponent(`${firstName} ${lastName}`.trim());
      const mail = encodeURIComponent(email);
      const avatar = encodeURIComponent(avatarUrl || '');
      router.push(`/signup-success?name=${name}&email=${mail}&avatar=${avatar}`);
    } catch (error: any) {
      setErrors({ ...newErrors, general: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark text-white font-sans min-h-screen">
      {/* Sign Up Section */}
      <section className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-darkgray rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">CineVerseへようこそ</h1>
              <p className="text-gray-400">アカウントを作成して映画の旅を始めましょう</p>
            </div>
            {/* Avatar Upload */}
            <div className="mb-8 flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-full overflow-hidden bg-primary relative cursor-pointer group"
                onClick={handleAvatarClick}
              >
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar preview"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : firstName ? (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaCamera className="text-2xl text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaCamera className="text-2xl text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-sm text-gray-400 mt-2">プロフィール画像を選択（任意）</p>
              {errors.avatar && (
                <div className="text-red-400 text-sm mt-1 flex items-center">
                  <FaExclamationCircle className="mr-1" /> {errors.avatar}
                </div>
              )}
            </div>
            {/* Social Sign Up Buttons (無効化) */}
            <div className="space-y-3 mb-6">
              <button disabled className="w-full bg-white text-black py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center opacity-60 cursor-not-allowed">
                <FaGoogle className="mr-3 text-lg" />
                Googleで続ける
              </button>
              <button disabled className="w-full bg-[#1877F2] text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center opacity-60 cursor-not-allowed">
                <FaFacebook className="mr-3 text-lg" />
                Facebookで続ける
              </button>
            </div>
            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-darkgray text-gray-400">またはメールアドレスで登録</span>
              </div>
            </div>
            {/* Sign Up Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">苗字</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors" placeholder="山田" />
                  {errors.firstName && (
                    <div className="text-red-400 text-sm mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" /> {errors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">名前</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors" placeholder="太郎" />
                  {errors.lastName && (
                    <div className="text-red-400 text-sm mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" /> {errors.lastName}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">メールアドレス</label>
                <div className="relative">
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors" placeholder="example@email.com" />
                  <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.email && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {errors.email}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">パスワード</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={handlePasswordChange} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-12" placeholder="8文字以上の強力なパスワード" />
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
                  <p className="text-xs text-gray-400 mt-1">パスワードの強度: <span>{passwordStrength <= 2 ? '弱い' : passwordStrength <= 3 ? '普通' : '強い'}</span></p>
                </div>
                {errors.password && (
                  <div className="text-red-400 text-sm mt-1 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {errors.password}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">パスワード（確認）</label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-lightgray border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors pr-12" placeholder="パスワードを再入力" />
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
                  <span>アカウントが作成されました！メールを確認してください。</span>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-gray-100 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50">
                {loading ? (
                  <>
                    <span>アカウントを作成中...</span>
                    <svg className="animate-spin ml-2 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                  </>
                ) : (
                  <span>アカウントを作成</span>
                )}
              </button>
            </form>
            <div className="text-center mt-6 pt-6 border-t border-gray-600">
              <p className="text-gray-400">
                すでにアカウントをお持ちですか？{' '}
                <Link href="/login" className="text-primary hover:text-secondary transition-colors font-medium ml-1">
                  ログインはこちら
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 