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
  ThumbsUp,
  ThumbsDown,
  Bell,
  MessageSquare,
  Send,
  Smartphone,
  ExternalLink,
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
  getTelegramConfig,
  saveTelegramConfig,
  sendTelegramAlert,
  getCloudDbConfig,
  saveCloudDbConfig,
  triggerGlobalCloudSync,
  pullCloudUsers,
  pullCloudStats,
  TelegramConfig,
  CloudDatabaseConfig,
  AnalyticsSummary,
} from '../lib/cloudSync';
import {
  getAllReactions,
  pullCloudReactions,
  ReactionRecord,
  getUnreadReactionsCount,
  markReactionsAsRead,
} from '../lib/reactions';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reactions' | 'database'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(() => getAnalyticsSummary());
  const [reactionsList, setReactionsList] = useState<ReactionRecord[]>(() => getAllReactions());
  const [unreadNotifs, setUnreadNotifs] = useState<number>(() => getUnreadReactionsCount());
  const [reactionFilter, setReactionFilter] = useState<'all' | 'like' | 'dislike'>('all');
  const [searchUserQuery, setSearchUserQuery] = useState('');
  
  // Cloud & Telegram Settings
  const [telegramSettings, setTelegramSettings] = useState<TelegramConfig>(() => getTelegramConfig());
  const [cloudDbSettings, setCloudDbSettings] = useState<CloudDatabaseConfig>(() => getCloudDbConfig());
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [testTgStatus, setTestTgStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Secret Gate Login Form (Empty by default, manual input required)
  const [adminInputEmail, setAdminInputEmail] = useState('');
  const [adminInputPass, setAdminInputPass] = useState('');
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsAdmin(isCurrentUserAdmin());
      setAnalytics(getAnalyticsSummary());
      setReactionsList(getAllReactions());
      setUnreadNotifs(getUnreadReactionsCount());
      setTelegramSettings(getTelegramConfig());
      setCloudDbSettings(getCloudDbConfig());
      setGateError(null);
      setTestTgStatus(null);

      // Auto-fetch latest cloud data from other phones
      pullCloudUsers().then(() => setAnalytics(getAnalyticsSummary()));
      pullCloudReactions().then((recs) => setReactionsList(recs));
      pullCloudStats().then(() => setAnalytics(getAnalyticsSummary()));
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
    setReactionsList(getAllReactions());

    pullCloudUsers().then(() => setAnalytics(getAnalyticsSummary()));
    pullCloudReactions().then((recs) => setReactionsList(recs));
  };

  const handleRefresh = async () => {
    sounds.playClick();
    setIsSyncing(true);
    await Promise.all([
      pullCloudUsers(),
      pullCloudReactions(),
      pullCloudStats(),
      triggerGlobalCloudSync(),
    ]);
    setAnalytics(getAnalyticsSummary());
    setReactionsList(getAllReactions());
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playWin();
    saveTelegramConfig(telegramSettings);
    saveCloudDbConfig(cloudDbSettings);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
    triggerGlobalCloudSync();
  };

  const handleTestTelegram = async () => {
    sounds.playClick();
    setTestTgStatus('Yuborilmoqda...');
    const ok = await sendTelegramAlert(
      `🔔 <b>GAME ZONE Test Xabarnomasi!</b>\n\n` +
      `✅ Telegram xabarnoma tizimi muvaffaqiyatli ulandi!\n` +
      `📱 Endi 10 000 km uzoqda bo'lsangiz ham, saytingizga kim kirsa, kim ro'yxatdan o'tsa va kim layk bossa — Telegramingizga darhol xabar keladi!`
    );
    if (ok) {
      sounds.playWin();
      setTestTgStatus('✅ Xabar Telegramingizga yuborildi! Botingizni tekshiring.');
    } else {
      sounds.playHit();
      setTestTgStatus('❌ Xatolik: Bot Token yoki Chat ID noto\'g\'ri kiritilgan!');
    }
  };

  const handleOpenReactionsTab = () => {
    sounds.playClick();
    setActiveTab('reactions');
    markReactionsAsRead();
    setUnreadNotifs(0);
  };

  const filteredUsers = analytics.users.filter((u) => {
    const q = searchUserQuery.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const filteredReactions = reactionsList.filter((r) => {
    if (reactionFilter === 'like') return r.type === 'like';
    if (reactionFilter === 'dislike') return r.type === 'dislike';
    return true;
  });

  const totalLikes = reactionsList.filter((r) => r.type === 'like').length;
  const totalDislikes = reactionsList.filter((r) => r.type === 'dislike').length;

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
                10 000 km Masofaviy Jonli Statistika & Telegram Xabarnomalar
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
            <div className="flex border-b border-cyber-border/70 px-5 bg-slate-950/40 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('overview');
                }}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'overview'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Jonli Tahlil</span>
              </button>

              <button
                onClick={handleOpenReactionsTab}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all relative ${
                  activeTab === 'reactions'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bell className="w-4 h-4 text-pink-400" />
                <span>Xabarlar & Reaksiyalar ({reactionsList.length})</span>
                {unreadNotifs > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
                )}
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('users');
                }}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'users'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Foydalanuvchilar ({analytics.users.length})</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('database');
                }}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'database'
                    ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cloud className="w-4 h-4" />
                <span>Telegram & Bulutli Baza</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* TAB 1: OVERVIEW */}
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
                      <p className="text-[11px] text-slate-400 mt-1">Dunyo bo'ylab haqiqiy qurilmalar</p>
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

                    {/* Card 4: Reactions Summary */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-pink-950/40 to-slate-900/90 border border-pink-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                          O'yinchilar Bahosi
                        </span>
                        <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400">
                          <ThumbsUp className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-emerald-400 font-black text-2xl">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{totalLikes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-rose-400 font-black text-2xl">
                          <ThumbsDown className="w-4 h-4" />
                          <span>{totalDislikes}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Jami berilgan layk va dislayklar</p>
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
                      onClick={handleOpenReactionsTab}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-pink-500 text-pink-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Xabarlarni Ko'rish ({reactionsList.length})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Users className="w-4 h-4" />
                      <span>Foydalanuvchilarni Boshqarish</span>
                    </button>
                  </div>
                </>
              )}

              {/* TAB 2: REACTIONS & NOTIFICATIONS FEED */}
              {activeTab === 'reactions' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/80 border border-cyber-border">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-pink-400" />
                        <span>O'yinchilar Reaksiyalari & Xabarlari</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Qaysi foydalanuvchi qaysi akkauntdan qaysi o'yinga Layk yoki Dislayk bosgani haqida to'liq xabarnomalar:
                      </p>
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <button
                        onClick={() => setReactionFilter('all')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          reactionFilter === 'all'
                            ? 'bg-purple-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Barchasi ({reactionsList.length})
                      </button>
                      <button
                        onClick={() => setReactionFilter('like')}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                          reactionFilter === 'like'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-400 hover:text-emerald-400'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Layklar ({totalLikes})</span>
                      </button>
                      <button
                        onClick={() => setReactionFilter('dislike')}
                        className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                          reactionFilter === 'dislike'
                            ? 'bg-rose-600 text-white'
                            : 'text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span>Dislayklar ({totalDislikes})</span>
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="space-y-2.5">
                    {filteredReactions.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl bg-slate-950/60 border border-cyber-border text-slate-500 text-xs">
                        Hozircha hech kim layk yoki dislayk bosmagan. Foydalanuvchilar o'yinlarga reaksiya qoldirsa, bu yerda darhol real vaqtda xabar paydo bo'ladi.
                      </div>
                    ) : (
                      filteredReactions.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-cyber-border/80 hover:border-slate-700 transition-all text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl flex items-center justify-center ${
                                item.type === 'like'
                                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                                  : 'bg-rose-950/80 border border-rose-500/50 text-rose-400'
                              }`}
                            >
                              {item.type === 'like' ? (
                                <ThumbsUp className="w-4 h-4" />
                              ) : (
                                <ThumbsDown className="w-4 h-4" />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">
                                  {item.username}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  ({item.email})
                                </span>
                              </div>

                              <p className="text-slate-300 mt-0.5">
                                <span
                                  className={`font-bold mr-1.5 ${
                                    item.type === 'like' ? 'text-emerald-400' : 'text-rose-400'
                                  }`}
                                >
                                  {item.type === 'like' ? '👍 Layk bosdi' : '👎 Dislayk bosdi'}
                                </span>
                                o'yinga: <span className="text-cyan-300 font-semibold">{item.gameTitle}</span>
                              </p>
                            </div>
                          </div>

                          <div className="text-[11px] font-mono text-slate-500 text-right">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: USERS MANAGEMENT */}
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
                                Hozircha ro'yxatdan o'tgan foydalanuvchilar mavjud emas. Boshqa telefonlardan haqiqiy foydalanuvchilar ro'yxatdan o'tishi bilan shu yerda ko'rinadi.
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

              {/* TAB 4: TELEGRAM & DATABASE SETTINGS */}
              {activeTab === 'database' && (
                <div className="space-y-5">
                  {/* Telegram Integration Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900/90 to-cyan-950/40 border border-blue-500/40 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>10 000 KM Telegram Xabarnomalari</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold">
                              JONLI XABAR
                            </span>
                          </h3>
                          <p className="text-xs text-slate-400">
                            Dunyoning istalgan joyidan kimdir ro'yxatdan o'tsa yoki layk bossa — Telegramingizga darhol push-xabar keladi!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-300 font-medium mb-1">
                          Telegram Bot Token
                        </label>
                        <input
                          type="text"
                          value={telegramSettings.botToken}
                          onChange={(e) =>
                            setTelegramSettings({ ...telegramSettings, botToken: e.target.value })
                          }
                          placeholder="masalan: 7481928374:AAH..."
                          className="w-full px-3 py-2 bg-slate-950 border border-cyber-border rounded-xl font-mono text-slate-200 focus:outline-none focus:border-cyan-400 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-medium mb-1">
                          Telegram Chat ID
                        </label>
                        <input
                          type="text"
                          value={telegramSettings.chatId}
                          onChange={(e) =>
                            setTelegramSettings({ ...telegramSettings, chatId: e.target.value })
                          }
                          placeholder="masalan: 123456789"
                          className="w-full px-3 py-2 bg-slate-950 border border-cyber-border rounded-xl font-mono text-slate-200 focus:outline-none focus:border-cyan-400 transition-all"
                        />
                      </div>
                    </div>

                    {/* How to get in 30 seconds */}
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-300 space-y-1">
                      <p className="font-bold text-cyan-300">💡 1 daqiqada qanday ulanadi?</p>
                      <p>1. Telegramda <b>@BotFather</b> ga kiring va <code>/newbot</code> deb yozing, botingiz nomini kiritib <b>Bot Token</b> olasiz.</p>
                      <p>2. O'z botingizga <code>/start</code> yozing va <b>@userinfobot</b> orqali o'z <b>Chat ID</b> raqamingizni oling.</p>
                      <p>3. Yuqoriga yozib "Saqlash"ni bosing va "Test xabar yuborish" tugmasini bosing!</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleTestTelegram}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>O'z Telefonimga Test Xabar Yuborish</span>
                      </button>

                      {testTgStatus && (
                        <span className="text-xs font-bold text-cyan-300 animate-pulse">
                          {testTgStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cloud Database URL Card */}
                  <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyber-border space-y-4">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-cyan-400" />
                      <h3 className="text-sm font-bold text-white">Firebase Realtime Database (REST API)</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Bulutli Baza URL manzili
                      </label>
                      <input
                        type="text"
                        value={cloudDbSettings.databaseUrl}
                        onChange={(e) =>
                          setCloudDbSettings({ ...cloudDbSettings, databaseUrl: e.target.value })
                        }
                        placeholder="https://game-zone-fedya-default-rtdb.firebaseio.com"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-cyber-border rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 transition-all"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Ushbu baza orqali har xil telefonlardagi foydalanuvchilar va layklar real vaqtda birlashtiriladi.
                      </p>
                    </div>

                    {isSavedNotice && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Barcha sozlamalar muvaffaqiyatli saqlandi!</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={handleSaveSettings}
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
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
