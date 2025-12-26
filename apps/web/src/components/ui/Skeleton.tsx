import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className = ''
}: SkeletonProps) {
  const style: React.CSSProperties = {};

  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <Skeleton variant="rectangular" width="100%" height={200} className={styles.skeletonImage} />
      <div className={styles.skeletonCardContent}>
        <Skeleton variant="text" width="80%" height={24} />
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={16} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonListItem}>
          <Skeleton variant="circular" width={48} height={48} />
          <div className={styles.skeletonListText}>
            <Skeleton variant="text" width="70%" height={20} />
            <Skeleton variant="text" width="50%" height={16} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className={styles.skeletonTable}>
      {/* Header */}
      <div className={styles.skeletonTableRow}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className={styles.skeletonTableCell}>
            <Skeleton variant="text" width="80%" height={16} />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className={styles.skeletonTableRow}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className={styles.skeletonTableCell}>
              <Skeleton variant="text" width={`${60 + Math.random() * 30}%`} height={14} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
