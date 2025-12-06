import './MetricCard.css';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  subtitle?: string;
  className?: string;
  delay?: number;
  highlight?: boolean;
  infoText?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  className = '',
  delay = 0,
  highlight = false,
  infoText,
}: MetricCardProps) {
  return (
    <div
      className={`metric-card ${highlight ? 'metric-card--highlight' : ''} ${className}`}
      style={{ animationDelay: `${delay * 80}ms` }}
      title={infoText ?? ''}
    >
      <div className="metric-top">
        <div className="metric-title">{title}</div>
        {Icon && (
          <div className="metric-icon">
            <Icon size={14} />
          </div>
        )}
      </div>

      <div className="metric-value">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {subtitle && <div className="metric-sub">{subtitle}</div>}
    </div>
  );
}
