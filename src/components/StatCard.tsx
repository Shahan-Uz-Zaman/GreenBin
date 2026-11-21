import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  colorVariant?: 'forest' | 'blue' | 'red' | 'default';
  trend?: string;
}

export default function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  colorVariant = 'default',
  trend,
}: StatCardProps) {
  const getStyles = () => {
    switch (colorVariant) {
      case 'forest':
        return {
          iconBg: 'bg-forest-subtle text-forest',
          borderColor: 'border-l-4 border-l-forest',
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-50 text-recycle',
          borderColor: 'border-l-4 border-l-recycle',
        };
      case 'red':
        return {
          iconBg: 'bg-red-50 text-hazard',
          borderColor: 'border-l-4 border-l-hazard',
        };
      default:
        return {
          iconBg: 'bg-gray-100 text-gray-700',
          borderColor: 'border-l-4 border-l-gray-400',
        };
    }
  };

  const style = getStyles();

  return (
    <div className={`card-stitch p-5 ${style.borderColor}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
            {unit && <span className="text-xs font-semibold text-gray-500">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 text-[11px] text-gray-600 font-medium flex items-center gap-1">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
