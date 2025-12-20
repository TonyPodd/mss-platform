'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useCart } from '../../contexts/CartContext';
import { apiClient } from '../../lib/api';
import styles from './shop.module.css';

interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  images: string[];
  category: string;
  stockQuantity: number;
  isAvailable: boolean;
  master?: {
    id: string;
    name: string;
  };
}

export default function ShopPage() {
  const { addToCart, isInCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await apiClient.products.getAvailable();
      setProducts(data);

      // Получаем уникальные категории
      const uniqueCategories = [...new Set(data.map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <>
        <Header />
        <main className={styles.main}>
          <div className={styles.container}>
            <div className={styles.loading}>Загрузка магазина...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1>Магазин изделий</h1>
              <p>
                Уникальные изделия ручной работы от наших талантливых мастеров.
                Каждая вещь создана с любовью и вниманием к деталям.
              </p>
            </div>
          </section>

          {categories.length > 0 && (
            <div className={styles.filters}>
              <button
                className={`${styles.filterButton} ${selectedCategory === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                Все товары
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <h2>Товары не найдены</h2>
              <p>В данной категории пока нет доступных товаров</p>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map(product => {
                const currentIndex = currentImageIndex[product.id] || 0;
                const hasMultipleImages = product.images && product.images.length > 1;

                return (
                  <div key={product.id} className={styles.productCard}>
                    <div className={styles.productImage}>
                      {product.images && product.images.length > 0 ? (
                        <>
                          <img
                            src={product.images[currentIndex].startsWith('http')
                              ? product.images[currentIndex]
                              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${product.images[currentIndex]}`}
                            alt={`${product.name} - фото ${currentIndex + 1}`}
                          />
                          {hasMultipleImages && (
                            <div className={styles.imageGalleryControls}>
                              {product.images.map((_, index) => (
                                <button
                                  key={index}
                                  className={`${styles.galleryDot} ${currentIndex === index ? styles.galleryDotActive : ''}`}
                                  onClick={() => setCurrentImageIndex({ ...currentImageIndex, [product.id]: index })}
                                  aria-label={`Показать фото ${index + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className={styles.imagePlaceholder}>
                          <span>Нет фото</span>
                        </div>
                      )}
                    </div>

                  <div className={styles.productContent}>
                    <h3 className={styles.productName}>{product.name}</h3>

                    {product.master && (
                      <p className={styles.productMaster}>
                        Мастер: {product.master.name}
                      </p>
                    )}

                    <p className={styles.productDescription}>
                      {product.shortDescription}
                    </p>

                    <div className={styles.productFooter}>
                      <div className={styles.productPrice}>
                        {product.price} ₽
                      </div>

                      <div className={styles.productStock}>
                        {product.stockQuantity > 0 ? (
                          <span className={styles.inStock}>
                            В наличии: {product.stockQuantity} шт.
                          </span>
                        ) : (
                          <span className={styles.outOfStock}>
                            Нет в наличии
                          </span>
                        )}
                      </div>
                    </div>

                    {product.stockQuantity > 0 && (
                      <button
                        className={styles.addToCartButton}
                        onClick={() => addToCart(product, 1)}
                      >
                        {isInCart(product.id) ? 'Добавлено в корзину ✓' : 'Добавить в корзину'}
                      </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
