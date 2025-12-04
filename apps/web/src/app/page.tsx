import Header from '../components/Header';
import NewsSlider from '../components/NewsSlider';
import UpcomingEvents from '../components/UpcomingEvents';
import Footer from '../components/Footer';
import { apiClient } from '../lib/api';
import styles from './page.module.css';

async function getHomePageData() {
  try {
    const [news, events] = await Promise.all([
      apiClient.news.getPublished(),
      apiClient.events.getUpcoming(5),
    ]);

    return { news, events };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return { news: [], events: [] };
  }
}

export default async function HomePage() {
  const { news, events } = await getHomePageData();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <h1>Добро пожаловать в MSS Platform!</h1>
            <p>Творческая студия мастер-классов и развития</p>
          </section>

          <NewsSlider news={news} />
          <UpcomingEvents events={events} />
        </div>
      </main>
      <Footer />
    </>
  );
}
