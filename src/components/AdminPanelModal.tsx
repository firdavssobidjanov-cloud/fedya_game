import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Gamepad2,
  Trophy,
  Cloud,
  Shield,
  Download,
  Search,
  Trash2,
  Ban,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Save,
  Flame,
  Activity,
  Layers,
  Crown,
} from 'lucide-react';
import { isCurrentUserAdmin, ADMIN_CREDENTIALS, adminDeleteUser, adminToggleBlockUser, AppUser } from '../lib/auth';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'database'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => getAnalyticsSummary());
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [firebaseSettings, setFirebaseSettings] = useState<FirebaseConfig>(() => getFirebaseConfig());
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnalytics(getAnalyticsSummary());
      setFirebaseSettings(getFirebaseConfig());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isAdmin = isCurrentUserAdmin();

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

  // Filter users by search query
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
                  ADMIN BOSHQARUV PANELI
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 border border-amber-500/50 text-amber-300">
                  ROOT ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administrator: <span className="text-amber-300 font-mono">{ADMIN_CREDENTIALS.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              title="Statistikani yangilash"
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
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

        {/* Access Check */}
        {!isAdmin ? (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
            <Shield className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-white mb-2">Ruxsat Cheklangan!</h2>
            <p className="text-sm text-slate-400 max-w-md mb-4">
              Ushbu bo'lim faqat Bosh Administrator (<span className="text-amber-300 font-mono">{ADMIN_CREDENTIALS.email}</span>) uchun ochiq. Iltimos, administrator hisobi bilan kiring.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md"
            >
              Tushundim
            </button>
          </div>
        ) : (
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
                <span>Umumiy Tahlil & Statistika</span>
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
                <span>Foydalanuvchilar Boshqaruvi ({analytics.users.length})</span>
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
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Registered Users */}
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
                      <p className="text-[11px] text-slate-400 mt-1">Akkaunt yaratgan o'yinchilar</p>
                    </div>

                    {/* Card 2: Total Plays */}
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
                      <p className="text-[11px] text-slate-400 mt-1">Jami o'ynalgan sessiyalar</p>
                    </div>

                    {/* Card 3: Total Games Catalog */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 to-slate-900/90 border border-emerald-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                          Platformadagi O'yinlar
                        </span>
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                          <Layers className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-black text-white">{GAMES_CATALOG.length} ta</div>
                      <p className="text-[11px] text-slate-400 mt-1">100% oflayn ishlaydigan</p>
                    </div>

                    {/* Card 4: Database Status */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-900/90 border border-amber-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Sinxronizatsiya
                        </span>
                        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                          <Cloud className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-lg font-bold text-white">
                          {analytics.onlineStatus === 'online' ? 'Faol (Online)' : 'Oflayn Kesh'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Firebase + Mahalliy xotira</p>
                    </div>
                  </div>

                  {/* Top Games Popularity Breakdown */}
                  <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyber-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-400" />
                        <h2 className="text-sm font-bold text-white">Eng Ko'p O'ynalgan O'yinlar Reytingi</h2>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Real-time Stats</span>
                    </div>

                    <div className="space-y-3">
                      {analytics.topGames.slice(0, 8).map((item, idx) => {
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
                                style={{ width: `${Math.max(8, percentage * 2.5)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
                                Hech qanday foydalanuvchi topilmadi.
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
                        GAME ZONE ma'lumotlari Firebase Firestore bulutli bazasi bilan sinxronlashadi. Foydalanuvchilar internet bor paytda ro'yxatdan o'tganda ma'lumotlar bulutga saqlanadi. Internet yo'q paytda esa barcha o'yinlar 100% oflayn keshda xatosiz ishlayveradi!
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
                          placeholder="masalan: game-zone-fedya"
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
                        <p className="text-[11px] text-slate-500 mt-1">
                          API kaliti kiritilmasa, barcha ma'lumotlar avtomatik ravishda mahalliy xotirada 100% xavfsiz va tezkor saqlanadi.
                        </p>
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
