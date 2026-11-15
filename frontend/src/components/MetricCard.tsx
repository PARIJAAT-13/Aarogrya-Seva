import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'orchid' | 'plum' | 'champagne' | 'lavender' | 'obsidian' | 'forest' | 'sage' | 'gold' | 'ivory' | 'green' | 'dark' | 'peach' | 'soft' | 'blue' | 'teal' | 'purple' | 'amber' | 'emerald';
  badge?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'orchid',
  badge,
  onClick,
}) => {
  const variantStyles: Record<string, { bg: string; text: string; border: string; badgeBg: string; badgeText: string; accentGlow: string }> = {
    orchid: {
      bg: 'bg-gradient-to-br from-[#A879E8] to-[#915BDB]',
      text: 'text-white',
      border: 'border-transparent',
      badgeBg: 'bg-[#E9DDF8]',
      badgeText: 'text-[#352447]',
      accentGlow: 'from-[#A879E8]/20 to-transparent',
    },
    plum: {
      bg: 'bg-[#352447]',
      text: 'text-[#E7D4AE]',
      border: 'border-[#241731]',
      badgeBg: 'bg-[#FAF9FC]',
      badgeText: 'text-[#352447]',
      accentGlow: 'from-[#352447]/15 to-transparent',
    },
    champagne: {
      bg: 'bg-[#F8F3EA]',
      text: 'text-[#8A6729]',
      border: 'border-[#E7D4AE]',
      badgeBg: 'bg-[#FAF5EC]',
      badgeText: 'text-[#8A6729]',
      accentGlow: 'from-[#E7D4AE]/30 to-transparent',
    },
    lavender: {
      bg: 'bg-[#E9DDF8]',
      text: 'text-[#352447]',
      border: 'border-[#D5BEF4]',
      badgeBg: 'bg-white',
      badgeText: 'text-[#352447]',
      accentGlow: 'from-[#E9DDF8]/40 to-transparent',
    },
    obsidian: {
      bg: 'bg-[#171923]',
      text: 'text-white',
      border: 'border-[#171923]',
      badgeBg: 'bg-[#FAF9FC]',
      badgeText: 'text-[#171923]',
      accentGlow: 'from-[#171923]/15 to-transparent',
    },
    // Aliases
    sage: {
      bg: 'bg-gradient-to-br from-[#A879E8] to-[#915BDB]',
      text: 'text-white',
      border: 'border-transparent',
      badgeBg: 'bg-[#E9DDF8]',
      badgeText: 'text-[#352447]',
      accentGlow: 'from-[#A879E8]/20 to-transparent',
    },
    forest: {
      bg: 'bg-[#352447]',
      text: 'text-[#E7D4AE]',
      border: 'border-[#241731]',
      badgeBg: 'bg-[#FAF9FC]',
      badgeText: 'text-[#352447]',
      accentGlow: 'from-[#352447]/15 to-transparent',
    },
    gold: {
      bg: 'bg-[#F8F3EA]',
      text: 'text-[#8A6729]',
      border: 'border-[#E7D4AE]',
      badgeBg: 'bg-[#FAF5EC]',
      badgeText: 'text-[#8A6729]',
      accentGlow: 'from-[#E7D4AE]/30 to-transparent',
    },
    ivory: {
      bg: 'bg-[#FAF9FC]',
      text: 'text-[#352447]',
      border: 'border-[#E9DDF8]',
      badgeBg: 'bg-[#FAF9FC]',
      badgeText: 'text-[#858392]',
      accentGlow: 'from-[#E9DDF8]/20 to-transparent',
    },
  };

  const style = variantStyles[variant] || variantStyles.orchid;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white p-5 rounded-2xl border border-[#E9DDF8] shadow-soft hover:shadow-soft-md hover:border-[#A879E8]/50 transition-all duration-300 overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      {/* Subtle Asymmetric Gradient Ambient Glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${style.accentGlow} rounded-bl-full pointer-events-none transition-opacity duration-300 group-hover:scale-110 opacity-70`}></div>

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#858392] uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#171923] tracking-tight mt-1.5 flex items-baseline gap-1">
            <span>{value}</span>
          </div>
        </div>
        <div className={`p-3 rounded-xl ${style.bg} ${style.text} border ${style.border} shadow-soft group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || badge) && (
        <div className="relative z-10 flex items-center gap-2 mt-4 pt-3 border-t border-[#FAF9FC] text-xs">
          {badge && (
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] tracking-wide uppercase border border-transparent shadow-2xs ${style.badgeBg} ${style.badgeText}`}
            >
              {badge}
            </span>
          )}
          {subtitle && <span className="text-[#858392] text-[11px] font-medium truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
