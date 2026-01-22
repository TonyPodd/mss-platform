'use client';

import React from 'react';
import styles from './Badge.module.css';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', className }) => {
  const classNames = [styles.badge, styles[variant], styles[size], className].filter(Boolean).join(' ');

  return <span className={classNames}>{children}</span>;
};
