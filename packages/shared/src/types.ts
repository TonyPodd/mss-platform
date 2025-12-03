// Типы событий в календаре
export enum EventType {
  MASTER_CLASS = 'MASTER_CLASS', // Мастер-классы (зеленые)
  REGULAR_GROUP = 'REGULAR_GROUP', // Постоянные занятия (синие)
  ONE_TIME_EVENT = 'ONE_TIME_EVENT', // Разовые события (оранжевые)
}

// Статус события
export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

// Статус записи пользователя
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  ATTENDED = 'ATTENDED',
}

// Базовая информация о событии
export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  imageUrl?: string;
  masterId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Мастер-класс (расширение Event)
export interface MasterClass extends Event {
  type: EventType.MASTER_CLASS;
  resultImages: string[];
  materials?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Постоянная группа (направление)
export interface RegularGroup {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  imageUrl?: string;
  schedule: string; // например "Каждый понедельник 18:00"
  price: number;
  maxParticipants: number;
  masterId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Мастер
export interface Master {
  id: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  vkLink?: string;
  instagramLink?: string;
  telegramLink?: string;
  specializations: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Запись на событие
export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  status: BookingStatus;
  participantsCount: number;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Пользователь
export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'master';
  createdAt: Date;
  updatedAt: Date;
}

// Товар в магазине
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  images: string[];
  category: string;
  stockQuantity: number;
  isAvailable: boolean;
  masterId?: string; // кто создал товар
  createdAt: Date;
  updatedAt: Date;
}

// Заказ в магазине
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  priceAtTime: number;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

// Новость (для листалки на главной)
export interface News {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
