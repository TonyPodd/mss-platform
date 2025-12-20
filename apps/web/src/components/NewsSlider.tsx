'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './NewsSlider.module.css';
import { News } from '@mss/shared';
import { getImageUrl } from '../lib/utils';

interface NewsSliderProps {
  news: News[];
}

export default function NewsSlider({ news }: NewsSliderProps) {
  if (!news || news.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Новостей пока нет</p>
      </div>
    );
  }

  return (
    <div className={styles.sliderWrapper}>
      <h2 className={styles.title}>Новости</h2>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className={styles.swiper}
      >
        {news.map((item) => (
          <SwiperSlide key={item.id}>
            <div className={`${styles.slide} ${!item.imageUrl ? styles.slideNoImage : ''}`}>
              {item.imageUrl && (
                <div
                  className={styles.slideImage}
                  style={{ backgroundImage: `url(${getImageUrl(item.imageUrl)})` }}
                />
              )}
              <div className={styles.slideContent}>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
