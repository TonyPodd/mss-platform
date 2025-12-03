import { ApiClient, ApiClientConfig } from './client';
import {
  EventsService,
  BookingsService,
  MastersService,
  GroupsService,
  ProductsService,
  OrdersService,
  NewsService,
  AuthService,
} from './services';

export * from './client';
export * from './services';

export class MssApiClient {
  public events: EventsService;
  public bookings: BookingsService;
  public masters: MastersService;
  public groups: GroupsService;
  public products: ProductsService;
  public orders: OrdersService;
  public news: NewsService;
  public auth: AuthService;

  private client: ApiClient;

  constructor(config: ApiClientConfig) {
    this.client = new ApiClient(config);

    // Инициализация всех сервисов
    this.events = new EventsService(this.client);
    this.bookings = new BookingsService(this.client);
    this.masters = new MastersService(this.client);
    this.groups = new GroupsService(this.client);
    this.products = new ProductsService(this.client);
    this.orders = new OrdersService(this.client);
    this.news = new NewsService(this.client);
    this.auth = new AuthService(this.client);
  }

  setToken(token: string) {
    this.client.setToken(token);
  }

  clearToken() {
    this.client.clearToken();
  }
}

// Дефолтный экспорт для удобства
export default MssApiClient;
