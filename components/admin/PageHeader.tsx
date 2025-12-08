import { Icon } from '@iconify/react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PageHeaderProps {
  icon?: string;
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: ReactNode;
}

export function PageHeader({ icon, title, subtitle, backHref, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <Icon icon="solar:arrow-left-line-duotone" className="text-xl text-gray-600" />
          </Link>
        )}
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Icon icon={icon} className="text-2xl text-white" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
