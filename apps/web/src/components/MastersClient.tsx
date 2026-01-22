'use client';

import { Master } from '@mss/shared';
import { getImageUrl } from '../lib/utils';
import styles from '../app/masters/masters.module.css';

interface MastersClientProps {
  masters: Master[];
}

export default function MastersClient({ masters }: MastersClientProps) {
  return (
    <>
      {masters.length === 0 ? (
        <div className={styles.empty}>
          <h2>Мастера пока не добавлены</h2>
          <p>Скоро здесь появятся наши талантливые мастера</p>
        </div>
      ) : (
        <div className={styles.mastersGrid}>
          {masters.map((master) => (
            <div
              key={master.id}
              className={styles.masterCard}
            >
              <div className={styles.masterAvatar}>
                {master.avatarUrl ? (
                  <img src={getImageUrl(master.avatarUrl)} alt={master.name} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{master.name.charAt(0)}</div>
                )}
              </div>

              <div className={styles.masterContent}>
                <h2 className={styles.masterName}>{master.name}</h2>

                {master.specializations && master.specializations.length > 0 && (
                  <div className={styles.specializations}>
                    {master.specializations.map((spec, index) => (
                      <span key={index} className={styles.specializationTag}>
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {master.bio && <p className={styles.masterBio}>{master.bio}</p>}

                {(master.vkLink || master.instagramLink || master.telegramLink) && (
                  <div className={styles.socialLinks}>
                    {master.vkLink && (
                      <a
                        href={master.vkLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        title="VK"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.39 14.43h-1.48c-.54 0-.71-.43-1.69-1.41-.85-.83-1.23-.93-1.44-.93-.3 0-.38.08-.38.47v1.29c0 .35-.11.55-1.03.55-1.5 0-3.17-.91-4.35-2.6C6.49 11.55 6 9.82 6 9.42c0-.21.08-.41.47-.41h1.48c.35 0 .48.16.62.54.68 1.98 1.83 3.72 2.3 3.72.18 0 .26-.08.26-.54V11.4c-.06-.98-.58-1.05-.58-1.39 0-.17.14-.34.36-.34h2.32c.3 0 .4.16.4.5v2.99c0 .3.13.4.22.4.18 0 .32-.1.65-.43 1.01-1.13 1.74-2.87 1.74-2.87.09-.21.26-.41.61-.41h1.48c.42 0 .51.21.42.5-.15.73-.98 2.18-1.73 3.08-.18.23-.24.35 0 .61.18.19.76.75 1.15 1.2.71.82 1.25 1.51 1.39 1.99.15.48-.1.73-.58.73z" />
                        </svg>
                      </a>
                    )}
                    {master.instagramLink && (
                      <a
                        href={master.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        title="Instagram"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                    {master.telegramLink && (
                      <a
                        href={master.telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                        title="Telegram"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
