import { ApiClient } from './client';
import {
  API_ROUTES,
  Event,
  MasterClass,
  RegularGroup,
  Master,
  Booking,
  Product,
  Order,
  News,
  User,
} from '@mss/shared';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CalendarEventsParams {
  startDate: string;
  endDate: string;
}

export interface CreateBookingDto {
  eventId: string;
  participantsCount: number;
  notes?: string;
}

export class EventsService {
  constructor(private client: ApiClient) {}

  async getUpcoming(limit = 5): Promise<Event[]> {
    return this.client.get<Event[]>(`${API_ROUTES.EVENTS.UPCOMING}?limit=${limit}`);
  }

  async getCalendarEvents(params: CalendarEventsParams): Promise<Event[]> {
    return this.client.get<Event[]>(API_ROUTES.EVENTS.CALENDAR, { params });
  }

  async getById(id: string): Promise<MasterClass> {
    return this.client.get<MasterClass>(API_ROUTES.EVENTS.BY_ID(id));
  }

  async getList(page = 1, limit = 20): Promise<PaginatedResponse<Event>> {
    return this.client.get<PaginatedResponse<Event>>(API_ROUTES.EVENTS.LIST, {
      params: { page, limit },
    });
  }

  async create(data: any): Promise<Event> {
    return this.client.post<Event>(API_ROUTES.EVENTS.LIST, data);
  }

  async update(id: string, data: any): Promise<Event> {
    return this.client.patch<Event>(API_ROUTES.EVENTS.BY_ID(id), data);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(API_ROUTES.EVENTS.BY_ID(id));
  }

  async publish(id: string): Promise<Event> {
    return this.client.post<Event>(`/events/${id}/publish`);
  }

  async cancel(id: string): Promise<Event> {
    return this.client.post<Event>(`/events/${id}/cancel`);
  }
}

export class BookingsService {
  constructor(private client: ApiClient) {}

  async create(data: CreateBookingDto): Promise<Booking> {
    return this.client.post<Booking>(API_ROUTES.BOOKINGS.CREATE, data);
  }

  async getList(): Promise<Booking[]> {
    return this.client.get<Booking[]>(API_ROUTES.BOOKINGS.LIST);
  }

  async cancel(id: string): Promise<Booking> {
    return this.client.post<Booking>(API_ROUTES.BOOKINGS.CANCEL(id));
  }
}

export class MastersService {
  constructor(private client: ApiClient) {}

  async getList(): Promise<Master[]> {
    return this.client.get<Master[]>(API_ROUTES.MASTERS.LIST);
  }

  async getById(id: string): Promise<Master> {
    return this.client.get<Master>(API_ROUTES.MASTERS.BY_ID(id));
  }

  async create(data: any): Promise<Master> {
    return this.client.post<Master>(API_ROUTES.MASTERS.LIST, data);
  }

  async update(id: string, data: any): Promise<Master> {
    return this.client.patch<Master>(API_ROUTES.MASTERS.BY_ID(id), data);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(API_ROUTES.MASTERS.BY_ID(id));
  }
}

export class GroupsService {
  constructor(private client: ApiClient) {}

  async getActive(): Promise<RegularGroup[]> {
    return this.client.get<RegularGroup[]>(API_ROUTES.GROUPS.ACTIVE);
  }

  async getById(id: string): Promise<RegularGroup> {
    return this.client.get<RegularGroup>(API_ROUTES.GROUPS.BY_ID(id));
  }
}

export class ProductsService {
  constructor(private client: ApiClient) {}

  async getList(page = 1, limit = 20): Promise<PaginatedResponse<Product>> {
    return this.client.get<PaginatedResponse<Product>>(API_ROUTES.PRODUCTS.LIST, {
      params: { page, limit },
    });
  }

  async getById(id: string): Promise<Product> {
    return this.client.get<Product>(API_ROUTES.PRODUCTS.BY_ID(id));
  }

  async getCategories(): Promise<string[]> {
    return this.client.get<string[]>(API_ROUTES.PRODUCTS.CATEGORIES);
  }
}

export class OrdersService {
  constructor(private client: ApiClient) {}

  async create(data: any): Promise<Order> {
    return this.client.post<Order>(API_ROUTES.ORDERS.CREATE, data);
  }

  async getList(): Promise<Order[]> {
    return this.client.get<Order[]>(API_ROUTES.ORDERS.LIST);
  }
}

export class NewsService {
  constructor(private client: ApiClient) {}

  async getAll(): Promise<News[]> {
    return this.client.get<News[]>(API_ROUTES.NEWS.LIST);
  }

  async getPublished(): Promise<News[]> {
    return this.client.get<News[]>(API_ROUTES.NEWS.PUBLISHED);
  }

  async getById(id: string): Promise<News> {
    return this.client.get<News>(API_ROUTES.NEWS.BY_ID(id));
  }

  async create(data: any): Promise<News> {
    return this.client.post<News>(API_ROUTES.NEWS.LIST, data);
  }

  async update(id: string, data: any): Promise<News> {
    return this.client.patch<News>(API_ROUTES.NEWS.BY_ID(id), data);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete<void>(API_ROUTES.NEWS.BY_ID(id));
  }

  async publish(id: string): Promise<News> {
    return this.client.post<News>(`/news/${id}/publish`);
  }

  async unpublish(id: string): Promise<News> {
    return this.client.post<News>(`/news/${id}/unpublish`);
  }
}

export class AuthService {
  constructor(private client: ApiClient) {}

  async login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
    return this.client.post(API_ROUTES.AUTH.LOGIN, { email, password });
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ accessToken: string; user: User }> {
    return this.client.post(API_ROUTES.AUTH.REGISTER, data);
  }

  async logout(): Promise<void> {
    return this.client.post(API_ROUTES.AUTH.LOGOUT);
  }
}

export class UploadService {
  constructor(private client: ApiClient) {}

  async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.client.baseURL}/uploads`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error:', errorText);
      throw new Error(`Не удалось загрузить файл: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFile(id: string): Promise<void> {
    return this.client.delete(`/uploads/${id}`);
  }
}
