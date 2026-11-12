import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Gamepad2,
  Cloud,
  Shield,
  Download,
  Search,
  Trash2,
  Ban,
  CheckCircle,
  RefreshCw,
  Save,
  Flame,
  Activity,
  Layers,
  Crown,
  Lock,
  Mail,
  ArrowRight,
  Eye,
} from 'lucide-react';
import {
  isCurrentUserAdmin,
  verifyAndLoginAdmin,
  ADMIN_CREDENTIALS,
  adminDeleteUser,
  adminToggleBlockUser,
  AppUser,
} from '../lib/auth';
import {
  getAnalyticsSummary,
  exportUsersToCSV,
  getFirebaseConfig,
  saveFirebaseConfig,
  triggerCloudSync,
  FirebaseConfig,
  AnalyticsSummary,
} from '../lib/cloudSync';
import { GAMES_CATALOG } from '../lib/gamesCatalog';
import { AVATARS } from '../lib/storage';
import { Language } from '../lib/translations';
import { sounds } from '../lib/sounds';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose, lang }) => {
  const [isAdmin, setIsAdmin] = useState(isCurrentUserAdmin());
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'database'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => getAnalyticsSummary());
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [firebaseSettings, setFirebaseSettings] = useState<FirebaseConfig>(() => getFirebaseConfig());
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Secret Gate Login Form (Empty by default, manual input required)
  const [adminInputEmail, setAdminInputEmail] = useState('');
  const [adminInputPass, setAdminInputPass] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAdmin(isCurrentUserAdmin());
      setAnalytics(getAnalyticsSummary());
      setFirebaseSettings(getFirebaseConfig());
      setGateError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);

    const res = verifyAndLoginAdmin(adminInputEmail, adminInputPass);
    if (!res.success) {
      sounds.playHit();
      setGateError(res.error || 'Kirish taqiqlandi!');
      return;
    }

    sounds.playWin();
    setIsAdmin(true);
    setAnalytics(getAnalyticsSummary());
  };

  const handleRefresh = async () => {
    sounds.playClick();
    setIsSyncing(true);
    await triggerCloudSync();
    setAnalytics(getAnalyticsSummary());
    setTimeout(() => {
      setIsSyncing(false);
    }, 600);
  };

  const handleDeleteUser = (userId: string, username: string) => {
    sounds.playHit();
    if (window.confirm(`Haqiqatan ham "${username}" foydalanuvchisini o'chirmoqchimisiz?`)) {
      adminDeleteUser(userId);
      setAnalytics(getAnalyticsSummary());
    }
  };

  const handleToggleBlock = (userId: string) => {
    sounds.playClick();
    adminToggleBlockUser(userId);
    setAnalytics(getAnalyticsSummary());
  };

  const handleSaveFirebase = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playWin();
    saveFirebaseConfig(firebaseSettings);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
    triggerCloudSync();
  };

  const filteredUsers = analytics.users.filter((u) => {
    const q = searchUserQuery.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl bg-[#0b0c16] border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col h-[90vh]">
        {/* Top Gold Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400" />

        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-cyber-border/80 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 p-[2px] shadow-sm">
              <div className="w-full h-full bg-[#0b0c16] rounded-[10px] flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                  MAXFIY ADMIN BOSHQARUV PANELI
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-500/50 text-amber-300">
                  ROOT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                100% Haqiqiy (Real) Statistik Ma'lumotlar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={handleRefresh}
                title="Statistikani yangilash"
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECRET GATE: If not yet authenticated as Admin, show manual secure login form */}
        {!isAdmin ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center overflow-y-auto">
            <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
                <Lock className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Xavfsiz Boshqaruv Markazi
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Administrator hisobingiz orqali tizimga kiring:
                </p>
              </div>

              {gateError && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs">
                  {gateError}
                </div>
              )}

              <form onSubmit={handleGateLogin} className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={adminInputEmail}
                      onChange={(e) => setAdminInputEmail(e.target.value)}
                      placeholder="admin@email.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-cyber-border rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Admin Parol
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={adminInputPass}
                      onChange={(e) => setAdminInputPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-cyber-border rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-2 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Kirish (Authenticate)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <>
            {/* Nav Tabs */}
            <div className="flex border-b border-cyber-border/70 px-5 bg-slate-950/40 text-xs font-bold">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('overview');
                }}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'overview'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Haqiqiy Tahlil & Statistika</span>
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('users');
                }}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'users'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Real Foydalanuvchilar ({analytics.users.length})</span>
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('database');
                }}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'database'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>Bulutli Baza (Firebase)</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {activeTab === 'overview' && (
                <>
                  {/* Real KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Real Unique Visitors */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/40 to-slate-900/90 border border-blue-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                          Saytga Kirgan Odamlar
                        </span>
                        <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                          <Eye className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-white">{analytics.totalUniqueVisitors}</div>
                      <p className="text-[11px] text-slate-400 mt-1">Haqiqiy tashrif buyurgan qurilmalar</p>
                    </div>

                    {/* Card 2: Real Registered Users */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-900/90 border border-purple-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                          Ro'yxatdan O'tganlar
                        </span>
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                          <Users className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-white">{analytics.totalRegisteredUsers}</div>
                      <p className="text-[11px] text-slate-400 mt-1">Akkaunt ochgan real o'yinchilar</p>
                    </div>

                    {/* Card 3: Real Games Played */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900/90 border border-cyan-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                          O'ynalgan O'yinlar
                        </span>
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                          <Gamepad2 className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-white">{analytics.totalGamesPlayed}</div>
                      <p className="text-[11px] text-slate-400 mt-1">Haqiqiy o'yin sessiyalari</p>
                    </div>

                    {/* Card 4: Platform Games */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900/90 border border-emerald-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                          O'yinlar Soni
                        </span>
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Layers className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-white">{GAMES_CATALOG.length} ta</div>
                      <p className="text-[11px] text-slate-400 mt-1">100% oflayn o'yinlar</p>
                    </div>
                  </div>

                  {/* Real Games Popularity Breakdown */}
                  <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyber-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <h2 className="text-sm font-bold text-white">Eng Ko'p O'ynalgan O'yinlar</h2>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">100% Haqiqiy Ma'lumot</span>
                    </div>

                    {analytics.topGames.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Hali o'yin o'ynalmagan (Statistika toza 0 da turibdi). O'yinchilar o'yin o'ynashi bilan bu yerda real reyting paydo bo'ladi.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {analytics.topGames.map((item, idx) => {
                          const gameDef = GAMES_CATALOG.find((g) => g.id === item.gameId);
                          const title = gameDef
                            ? typeof gameDef.title === 'string'
                              ? gameDef.title
                              : gameDef.title[lang] || gameDef.title.uz || gameDef.title.en
                            : item.gameId;
                          const percentage = Math.min(
                            100,
                            Math.round((item.count / Math.max(1, analytics.totalGamesPlayed)) * 100)
                          );

                          return (
                            <div key={item.gameId} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-200">
                                  <span className="text-slate-500 mr-2 font-mono">#{idx + 1}</span>
                                  {title}
                                </span>
                                <span className="font-mono text-cyan-400 font-bold">
                                  {item.count} marta ({percentage}%)
                                </span>
                              </div>
                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.max(5, percentage)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        exportUsersToCSV();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>Foydalanuvchilar Ro'yxatini Yuklab Olish (CSV / Excel)</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span>Foydalanuvchilarni Ko'rish va Boshqarish</span>
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Search & Export header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="w-full sm:max-w-md relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={searchUserQuery}
                        onChange={(e) => setSearchUserQuery(e.target.value)}
                        placeholder="Foydalanuvchi ismi yoki emaili bo'yicha qidirish..."
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-cyber-border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                    </div>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        exportUsersToCSV();
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV Yuklab olish</span>
                    </button>
                  </div>

                  {/* Users Table */}
                  <div className="rounded-xl border border-cyber-border overflow-hidden bg-slate-950/60">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-cyber-border">
                          <tr>
                            <th className="py-3 px-4">O'yinchi</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Rol</th>
                            <th className="py-3 px-4">O'yinlar</th>
                            <th className="py-3 px-4">Sana</th>
                            <th className="py-3 px-4 text-center">Amallar</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500">
                                Hozircha ro'yxatdan o'tgan foydalanuvchilar mavjud emas. Haqiqiy foydalanuvchilar ro'yxatdan o'tishi bilan shu yerda ko'rinadi.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map((u) => {
                              const avatar = AVATARS.find((a) => a.id === u.avatarId) || AVATARS[0];
                              const isRoot = u.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();

                              return (
                                <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-xl">{avatar.emoji}</span>
                                      <div>
                                        <div className="font-bold text-slate-200">{u.username}</div>
                                        {u.isBlocked && (
                                          <span className="text-[10px] text-red-400 font-bold">Bloklangan</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 font-mono text-slate-400">{u.email}</td>
                                  <td className="py-3 px-4">
                                    {isRoot ? (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-500/50 text-amber-300">
                                        ADMIN
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 border border-purple-500/30 text-purple-300">
                                        PLAYER
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 font-mono text-cyan-400 font-bold">
                                    {u.totalGamesPlayed || 0}
                                  </td>
                                  <td className="py-3 px-4 text-slate-400">
                                    {new Date(u.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    {isRoot ? (
                                      <span className="text-[11px] text-slate-500 italic">Asosiy Admin</span>
                                    ) : (
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          onClick={() => handleToggleBlock(u.id)}
                                          title={u.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}
                                          className={`p-1.5 rounded-lg border transition-colors ${
                                            u.isBlocked
                                              ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-amber-400'
                                          }`}
                                        >
                                          <Ban className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteUser(u.id, u.username)}
                                          title="O'chirish"
                                          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-colors"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'database' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-300 flex items-start gap-3">
                    <Cloud className="w-5 h-5 flex-shrink-0 text-cyan-400 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-white mb-1">Gibrid Bulutli Arxitektura</h3>
                      <p className="text-slate-300 leading-relaxed">
                        Turli xil qurilmalardan kirgan foydalanuvchilar soni va o'yinlar Firebase Firestore orqali sinxronlashadi. Internet yo'q bo'lsa ham o'yinlar 100% oflayn ishlayveradi.
                      </p>
                    </div>
                  </div>

                  {isSavedNotice && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>Firebase sozlamalari muvaffaqiyatli saqlandi!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveFirebase} className="p-5 rounded-xl bg-slate-900/60 border border-cyber-border space-y-4">
                    <h3 className="text-sm font-bold text-white">Firebase Loyiha Parametrlari</h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Firebase Project ID
                        </label>
                        <input
                          type="text"
                          value={firebaseSettings.projectId}
                          onChange={(e) =>
                            setFirebaseSettings({ ...firebaseSettings, projectId: e.target.value })
                          }
                          placeholder="game-zone-fedya"
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-cyber-border rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Firebase Web API Key (ixtiyoriy)
                        </label>
                        <input
                          type="text"
                          value={firebaseSettings.apiKey}
                          onChange={(e) =>
                            setFirebaseSettings({ ...firebaseSettings, apiKey: e.target.value })
                          }
                          placeholder="AIzaSy..."
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-cyber-border rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Save className="w-4 h-4" />
                        <span>Sozlamalarni Saqlash</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRefresh}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Hozir Sinxronlash</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
