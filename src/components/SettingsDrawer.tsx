import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X as CloseIcon, Download, Upload, LogOut, Palette, Globe, Database, User, Info, Shield, Settings } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import { Language } from '../i18n';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignOut: () => void;
  userEmail?: string;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  onExport,
  onImport,
  onSignOut,
  userEmail,
}: SettingsDrawerProps) {
  const t = {
    settings: language === 'en' ? 'Settings' : '设置',
    appearance: language === 'en' ? 'Appearance' : '外观',
    theme: language === 'en' ? 'Theme' : '主题',
    languageLabel: language === 'en' ? 'Language' : '语言',
    data: language === 'en' ? 'Data' : '数据',
    exportBackup: language === 'en' ? 'Export Backup' : '导出备份',
    importBackup: language === 'en' ? 'Import Backup' : '导入备份',
    account: language === 'en' ? 'Account' : '账户',
    signOut: language === 'en' ? 'Sign Out' : '退出登录',
    about: language === 'en' ? 'About / System' : '关于 / 系统',
    syncStatus: language === 'en' ? 'Synced to Supabase' : '已同步到 Supabase',
    security: language === 'en' ? 'RLS Secured' : 'RLS 安全保护',
    version: 'v1.2.0',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500]"
          />

          {/* Desktop drawer (right side) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="hidden md:flex fixed inset-y-0 right-0 w-[380px] bg-[var(--t-surface)] border-l border-[var(--t-border)] z-[510] flex-col shadow-2xl shadow-black/30"
          >
            <DrawerContent
              t={t}
              language={language}
              onLanguageChange={onLanguageChange}
              onClose={onClose}
              onExport={onExport}
              onImport={onImport}
              onSignOut={onSignOut}
              userEmail={userEmail}
            />
          </motion.aside>

          {/* Mobile panel (full screen from bottom) */}
          <motion.aside
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="md:hidden fixed inset-0 bg-[var(--t-surface)] z-[510] flex flex-col"
          >
            <DrawerContent
              t={t}
              language={language}
              onLanguageChange={onLanguageChange}
              onClose={onClose}
              onExport={onExport}
              onImport={onImport}
              onSignOut={onSignOut}
              userEmail={userEmail}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Shared inner content ─────────────────────────────────── */
interface DrawerContentProps {
  t: Record<string, string>;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onClose: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSignOut: () => void;
  userEmail?: string;
}

function DrawerContent({ t, language, onLanguageChange, onClose, onExport, onImport, onSignOut, userEmail }: DrawerContentProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--t-border-subtle)] shrink-0">
        <div className="flex items-center gap-2.5">
          <Settings size={18} className="text-[var(--t-accent)]" />
          <h2 className="text-lg font-bold text-[var(--t-text)] tracking-tight">{t.settings}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-[var(--t-muted)] hover:text-[var(--t-text)] hover:bg-[var(--t-surface-2)] transition-colors"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

        {/* ── Appearance ── */}
        <Section icon={<Palette size={15} />} title={t.appearance}>
          <label className="text-[11px] uppercase tracking-widest font-bold text-[var(--t-faint)] mb-2 block">
            {t.theme}
          </label>
          <ThemeSwitcher language={language} />
        </Section>

        {/* ── Language ── */}
        <Section icon={<Globe size={15} />} title={t.languageLabel}>
          <div className="flex gap-2">
            <LangButton active={language === 'en'} onClick={() => onLanguageChange('en')} label="English" />
            <LangButton active={language === 'zh'} onClick={() => onLanguageChange('zh')} label="中文" />
          </div>
        </Section>

        {/* ── Data ── */}
        <Section icon={<Database size={15} />} title={t.data}>
          <div className="flex flex-col gap-2">
            <button
              onClick={onExport}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[var(--t-surface-2)] border border-[var(--t-border)] text-sm font-medium text-[var(--t-text)] hover:border-[var(--t-accent)] hover:text-[var(--t-accent)] transition-all"
            >
              <Download size={16} />
              {t.exportBackup}
            </button>
            <label className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[var(--t-surface-2)] border border-[var(--t-border)] text-sm font-medium text-[var(--t-text)] hover:border-emerald-400 hover:text-emerald-400 transition-all cursor-pointer">
              <Upload size={16} />
              {t.importBackup}
              <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>
          </div>
        </Section>

        {/* ── Account ── */}
        <Section icon={<User size={15} />} title={t.account}>
          {userEmail && (
            <div className="mb-3 px-4 py-3 rounded-xl bg-[var(--t-surface-2)] border border-[var(--t-border)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--t-faint)] font-bold mb-1">Email</p>
              <p className="text-sm text-[var(--t-text)] font-medium truncate">{userEmail}</p>
            </div>
          )}
          <button
            onClick={onSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-all"
          >
            <LogOut size={16} />
            {t.signOut}
          </button>
        </Section>

        {/* ── About / System ── */}
        <Section icon={<Info size={15} />} title={t.about}>
          <div className="space-y-2">
            <StatusRow>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse shrink-0" />
              <span className="text-emerald-500 font-bold">{t.syncStatus}</span>
            </StatusRow>
            <StatusRow>
              <Shield size={12} className="text-[var(--t-accent)] shrink-0" />
              <span className="text-[var(--t-muted)]">{t.security}</span>
            </StatusRow>
            <StatusRow>
              <span className="text-[var(--t-faint)] font-mono">{t.version} — WeLink</span>
            </StatusRow>
          </div>
        </Section>
      </div>
    </>
  );
}

/* ─── Small sub-components ─────────────────────────────────── */

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[var(--t-accent)]">{icon}</span>
        <h3 className="text-xs uppercase tracking-widest font-bold text-[var(--t-muted)]">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function LangButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
        active
          ? 'bg-[var(--t-primary-subtle)] border-[var(--t-accent)] text-[var(--t-accent)] shadow-lg'
          : 'bg-[var(--t-surface-2)] border-[var(--t-border)] text-[var(--t-muted)] hover:border-[var(--t-accent)] hover:text-[var(--t-text)]'
      }`}
    >
      {label}
    </button>
  );
}

function StatusRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[var(--t-surface-2)] border border-[var(--t-border)] text-[11px] uppercase tracking-widest font-bold">
      {children}
    </div>
  );
}
