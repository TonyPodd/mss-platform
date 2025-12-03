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

  async getPublished(): Promise<News[]> {
    return this.client.get<News[]>(API_ROUTES.NEWS.PUBLISHED);
  }

  async getById(id: string): Promise<News> {
    return this.client.get<News>(API_ROUTES.NEWS.BY_ID(id));
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
