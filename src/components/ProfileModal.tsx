import React, { useState } from 'react';
import { X, Check, Trophy, Clock, Gamepad2, Award, Sparkles, User } from 'lucide-react';
import { AVATARS, INITIAL_ACHIEVEMENTS, PlayerProfile, getAchievements, saveProfile } from '../lib/storage';
import { getLangText, Language } from '../lib/translations';
import { sounds } from '../lib/sounds';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  lang: Language;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  lang,
}) => {
  const [username, setUsername] = useState(profile.username);
  const [selectedAvatarId, setSelectedAvatarId] = useState(profile.avatarId);
  const [isEditingName, setIsEditingName] = useState(false);

  if (!isOpen) return null;

  const unlockedMap = getAchievements();

  const handleSave = () => {
    sounds.playClick();
    const updated: PlayerProfile = {
      ...profile,
      username: username.trim() || 'Player',
      avatarId: selectedAvatarId,
    };
    saveProfile(updated);
    onUpdateProfile(updated);
    setIsEditingName(false);
  };

  const formatPlayTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const unlockedCount = Object.keys(unlockedMap).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-[#0a0b12]">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-cyber-neonCyan" />
            <h2 className="text-lg font-black text-white tracking-wide">
              {getLangText('playerProfile', lang)}
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-cyber-bg border border-cyber-border text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Avatar and Username Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#0a0b12] border border-cyber-border">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-500 p-[3px] shadow-neon-purple">
                <div className="w-full h-full bg-[#131626] rounded-[13px] flex items-center justify-center text-4xl">
                  {AVATARS[selectedAvatarId]?.emoji || '🎮'}
                </div>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={18}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="px-3 py-1.5 bg-cyber-bg border border-cyan-500 rounded-lg text-sm text-white focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSave}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-xl font-black text-white">{profile.username}</h3>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    ({getLangText('editUsername', lang)})
                  </button>
                </div>
              )}
              <p className="text-xs text-slate-400">
                {AVATARS[selectedAvatarId]?.name} • Offline Gamer
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#0a0b12] border border-cyber-border text-center">
              <Gamepad2 className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                {getLangText('totalGamesPlayed', lang)}
              </p>
              <p className="text-lg font-black text-white font-mono mt-0.5">
                {profile.totalGamesPlayed}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0a0b12] border border-cyber-border text-center">
              <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                {getLangText('totalPlayTime', lang)}
              </p>
              <p className="text-lg font-black text-white font-mono mt-0.5">
                {formatPlayTime(profile.totalPlayTime)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#0a0b12] border border-cyber-border text-center">
              <Award className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-[10px] text-slate-400 uppercase font-bold">
                {getLangText('achievements', lang)}
              </p>
              <p className="text-lg font-black text-white font-mono mt-0.5">
                {unlockedCount} / {INITIAL_ACHIEVEMENTS.length}
              </p>
            </div>
          </div>

          {/* Choose Avatar */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              {getLangText('chooseAvatar', lang)}
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedAvatarId(av.id);
                    const updated = { ...profile, avatarId: av.id };
                    saveProfile(updated);
                    onUpdateProfile(updated);
                  }}
                  className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all ${
                    selectedAvatarId === av.id
                      ? 'bg-purple-950/60 border-cyan-400 shadow-neon-cyan scale-105'
                      : 'bg-[#0a0b12] border-cyber-border hover:border-slate-500'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="text-[9px] text-slate-300 truncate w-full text-center">
                    {av.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {getLangText('achievements', lang)}
              </h4>
              <span className="text-xs font-mono text-cyan-400">
                {Math.round((unlockedCount / INITIAL_ACHIEVEMENTS.length) * 100)}% Complete
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INITIAL_ACHIEVEMENTS.map((ach) => {
                const isUnlocked = !!unlockedMap[ach.id];
                return (
                  <div
                    key={ach.id}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      isUnlocked
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-[#0a0b12]/60 border-cyber-border text-slate-500 opacity-60'
                    }`}
                  >
                    <span className="text-2xl">{ach.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-white truncate">
                          {getLangText(ach.titleKey, lang)}
                        </p>
                        {isUnlocked && (
                          <span className="text-[9px] px-1 rounded bg-emerald-500/30 text-emerald-300">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {getLangText(ach.descKey, lang)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

