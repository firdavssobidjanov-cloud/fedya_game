import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Sparkles, Check, AlertCircle, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { AVATARS } from '../lib/storage';
import { loginUser, registerUser, ADMIN_CREDENTIALS, AppUser } from '../lib/auth';
import { Language } from '../lib/translations';
import { sounds } from '../lib/sounds';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAuthSuccess: (user: AppUser) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatarId, setRegAvatarId] = useState(0);

  // Status & Error
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = loginUser(loginEmail, loginPassword);
    if (!res.success) {
      sounds.playHit();
      setError(res.error || 'Kirishda xatolik yuz berdi');
      return;
    }

    sounds.playWin();
    setSuccessMsg(res.user?.role === 'admin' ? 'Xush kelibsiz, Bosh Administrator!' : `Xush kelibsiz, ${res.user?.username}!`);
    setTimeout(() => {
      onAuthSuccess(res.user!);
      onClose();
    }, 900);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regPassword !== regConfirmPassword) {
      sounds.playHit();
      setError('Kiritilgan parollar bir-biriga mos kelmadi!');
      return;
    }

    const res = registerUser(regUsername, regEmail, regPassword, regAvatarId);
    if (!res.success) {
      sounds.playHit();
      setError(res.error || 'Ro\'yxatdan o\'tishda xatolik');
      return;
    }

    sounds.playWin();
    setSuccessMsg(`Tabriklaymiz! "${res.user?.username}" akkaunti muvaffaqiyatli yaratildi.`);
    setTimeout(() => {
      onAuthSuccess(res.user!);
      onClose();
    }, 1000);
  };

  const fillAdminCredentials = () => {
    setMode('login');
    setLoginEmail(ADMIN_CREDENTIALS.email);
    setLoginPassword(ADMIN_CREDENTIALS.password);
    sounds.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0d0e19] border border-cyber-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-cyan-400">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {mode === 'login' ? (lang === 'ru' ? 'Вход в аккаунт' : lang === 'uz' ? 'Tizimga kirish' : 'Sign In') : (lang === 'ru' ? 'Регистрация' : lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Create Account')}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'ru' ? 'GAME ZONE платформасы' : lang === 'uz' ? 'GAME ZONE platformasi' : 'GAME ZONE Gaming Hub'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 p-1.5 mx-6 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              sounds.playClick();
              setMode('login');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'ru' ? 'Вход' : lang === 'uz' ? 'Kirish' : 'Sign In'}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setMode('register');
              setError(null);
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'ru' ? 'Регистрация' : lang === 'uz' ? 'Ro\'yxatdan o\'tish' : 'Sign Up'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-cyber-border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {lang === 'ru' ? 'Пароль' : lang === 'uz' ? 'Parol' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-cyber-border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              {/* Admin quick login button for owner */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-amber-950/30 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin sifatida kirish (Firdavs)</span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 group-hover:underline">Avto-to'ldirish</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-neon-purple transition-all flex items-center justify-center gap-2 group"
              >
                <span>{lang === 'ru' ? 'Войти' : lang === 'uz' ? 'Tizimga kirish' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {lang === 'ru' ? 'Имя игрока (Никнейм)' : lang === 'uz' ? 'O\'yinchi ismi (Nikneym)' : 'Username'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="CyberPlayer"
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-900/90 border border-cyber-border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="player@mail.com"
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-900/90 border border-cyber-border rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ru' ? 'Пароль' : lang === 'uz' ? 'Parol' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-900/90 border border-cyber-border rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {lang === 'ru' ? 'Повтор' : lang === 'uz' ? 'Tasdiqlash' : 'Confirm'}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-8 pr-2.5 py-2 bg-slate-900/90 border border-cyber-border rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {lang === 'ru' ? 'Выберите аватар' : lang === 'uz' ? 'Avatar tanlang' : 'Choose Avatar'}
                </label>
                <div className="grid grid-cols-6 gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-xl max-h-24 overflow-y-auto">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setRegAvatarId(av.id);
                      }}
                      className={`text-xl p-1.5 rounded-lg transition-all flex items-center justify-center ${
                        regAvatarId === av.id
                          ? 'bg-purple-600/40 border border-cyan-400 scale-110 shadow-sm'
                          : 'hover:bg-slate-800'
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-neon-cyan transition-all flex items-center justify-center gap-2 group"
              >
                <span>{lang === 'ru' ? 'Зарегистрироваться' : lang === 'uz' ? 'Akkaunt yaratish' : 'Create Account'}</span>
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </button>
            </form>
          )}

          {/* Guest play option */}
          <div className="pt-2 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              {lang === 'ru' ? 'Продолжить как гость (без аккаунта)' : lang === 'uz' ? 'Mehmon sifatida davom etish (ro\'yxatdan o\'tmasdan)' : 'Continue as Guest'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
