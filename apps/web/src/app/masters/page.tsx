import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { apiClient } from '../../lib/api';
import MastersClient from '../../components/MastersClient';
import styles from './masters.module.css';

// Обновлять каждые 10 секунд
export const revalidate = 10;

async function getMasters() {
  try {
    const masters = await apiClient.masters.getActive();
    return masters;
  } catch (error) {
    console.error('Ошибка загрузки мастеров:', error);
    return [];
  }
}

export default async function MastersPage() {
  const masters = await getMasters();

  return (
    <>
      <Header />
      <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Наши мастера</h1>
            <p>
              Познакомьтесь с нашими талантливыми мастерами, которые создают неповторимые
              изделия и делятся своим мастерством
            </p>
          </div>
        </div>

        <MastersClient masters={masters} />
      </div>
    </main>
      <Footer />
    </>
  );
}
