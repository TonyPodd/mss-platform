'use client';

import React from 'react';
import styles from './Card.module.css';

export interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  hover = false,
  padding = 'md',
  className,
  onClick,
}) => {
  const classNames = [
    styles.card,
    styles[`padding-${padding}`],
    hover && styles.hover,
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
};
