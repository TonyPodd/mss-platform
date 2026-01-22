import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение БД тестовыми данными...');

  // Очищаем БД
  await prisma.booking.deleteMany();
  await prisma.event.deleteMany();
  await prisma.regularGroup.deleteMany();
  await prisma.news.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.master.deleteMany();
  await prisma.user.deleteMany();

  // Создаем мастеров
  const master1 = await prisma.master.create({
    data: {
      name: 'Анна Иванова',
      bio: 'Профессиональный мастер по керамике с 10-летним опытом. Специализируется на создании посуды и декоративных изделий.',
      specializations: ['керамика', 'гончарное дело', 'роспись'],
      vkLink: 'https://vk.com/anna_keramika',
      instagramLink: 'https://instagram.com/anna_keramika',
      isActive: true,
    },
  });

  const master2 = await prisma.master.create({
    data: {
      name: 'Мария Петрова',
      bio: 'Художник-акварелист. Провожу мастер-классы по рисованию для начинающих и продвинутых учеников.',
      specializations: ['акварель', 'рисование', 'иллюстрация'],
      vkLink: 'https://vk.com/maria_art',
      telegramLink: 'https://t.me/maria_art',
      isActive: true,
    },
  });

  const master3 = await prisma.master.create({
    data: {
      name: 'Дмитрий Соколов',
      bio: 'Мастер по работе с кожей. Создаю сумки, ремни, кошельки ручной работы.',
      specializations: ['работа с кожей', 'кожгалантерея', 'тиснение'],
      vkLink: 'https://vk.com/dmitry_leather',
      isActive: true,
    },
  });

  console.log('✅ Мастера созданы');

  // Создаем новости
  await prisma.news.create({
    data: {
      title: 'Открытие новой студии!',
      content:
        'Мы рады сообщить об открытии нашей новой творческой студии! Теперь у нас больше пространства для проведения мастер-классов и творческих занятий. Приглашаем всех на день открытых дверей!',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.news.create({
    data: {
      title: 'Новогодняя программа мастер-классов',
      content:
        'Специально к новогодним праздникам мы подготовили уникальную программу мастер-классов. Создайте подарки своими руками для близких! Запись уже открыта.',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  await prisma.news.create({
    data: {
      title: 'Скидка 20% на первое занятие',
      content:
        'Для новых участников действует специальное предложение - скидка 20% на первый мастер-класс. Выбирайте любое направление и приходите творить вместе с нами!',
      isPublished: true,
      publishedAt: new Date(),
    },
  });

  console.log('✅ Новости созданы');

  // Создаем события (мастер-классы)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const in3days = new Date(today);
  in3days.setDate(in3days.getDate() + 3);

  const in5days = new Date(today);
  in5days.setDate(in5days.getDate() + 5);

  const in7days = new Date(today);
  in7days.setDate(in7days.getDate() + 7);

  const in10days = new Date(today);
  in10days.setDate(in10days.getDate() + 10);

  await prisma.event.create({
    data: {
      title: 'Мастер-класс по керамике для начинающих',
      description:
        'Научитесь создавать красивую керамическую посуду! На занятии вы освоите базовые техники работы с глиной и создадите свою первую чашку или тарелку.',
      type: 'MASTER_CLASS',
      status: 'PUBLISHED',
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000), // +3 часа
      maxParticipants: 8,
      currentParticipants: 5,
      price: 3000,
      difficulty: 'BEGINNER',
      masterId: master1.id,
      resultImages: [],
      materials: ['глина', 'гончарный круг', 'инструменты'],
    },
  });

  await prisma.event.create({
    data: {
      title: 'Акварельный скетчинг: рисуем природу',
      description:
        'Изучите технику акварельного скетчинга. Нарисуем пейзажи и природные мотивы. Подходит для всех уровней подготовки.',
      type: 'MASTER_CLASS',
      status: 'PUBLISHED',
      startDate: in3days,
      endDate: new Date(in3days.getTime() + 2.5 * 60 * 60 * 1000),
      maxParticipants: 12,
      currentParticipants: 8,
      price: 2500,
      difficulty: 'BEGINNER',
      masterId: master2.id,
      resultImages: [],
      materials: ['акварель', 'кисти', 'бумага', 'палитра'],
    },
  });

  await prisma.event.create({
    data: {
      title: 'Создание кожаного кошелька',
      description:
        'Создайте стильный кожаный кошелек своими руками! Научитесь работать с кожей, освоите техники сшивания и декорирования.',
      type: 'MASTER_CLASS',
      status: 'PUBLISHED',
      startDate: in5days,
      endDate: new Date(in5days.getTime() + 4 * 60 * 60 * 1000),
      maxParticipants: 6,
      currentParticipants: 2,
      price: 4500,
      difficulty: 'INTERMEDIATE',
      masterId: master3.id,
      resultImages: [],
      materials: ['натуральная кожа', 'инструменты', 'фурнитура'],
    },
  });

  await prisma.event.create({
    data: {
      title: 'Роспись керамики: создаем уникальную посуду',
      description:
        'На этом мастер-классе вы научитесь расписывать готовые керамические изделия. Создадите уникальный набор посуды с авторским дизайном.',
      type: 'MASTER_CLASS',
      status: 'PUBLISHED',
      startDate: in7days,
      endDate: new Date(in7days.getTime() + 2 * 60 * 60 * 1000),
      maxParticipants: 10,
      currentParticipants: 6,
      price: 2800,
      difficulty: 'BEGINNER',
      masterId: master1.id,
      resultImages: [],
      materials: ['керамическая посуда', 'краски', 'кисти'],
    },
  });

  await prisma.event.create({
    data: {
      title: 'Портрет акварелью: техника работы со светом',
      description:
        'Продвинутый мастер-класс по портретной живописи. Изучим технику работы со светом и тенью, создадим выразительный портрет.',
      type: 'MASTER_CLASS',
      status: 'PUBLISHED',
      startDate: in10days,
      endDate: new Date(in10days.getTime() + 3 * 60 * 60 * 1000),
      maxParticipants: 8,
      currentParticipants: 3,
      price: 3500,
      difficulty: 'ADVANCED',
      masterId: master2.id,
      resultImages: [],
      materials: ['акварель', 'кисти', 'бумага для акварели'],
    },
  });

  console.log('✅ События созданы');

  // Создаем постоянные группы (направления)
  await prisma.regularGroup.create({
    data: {
      name: 'Керамика для детей',
      description:
        'Постоянные занятия по керамике для детей 7-12 лет. Развиваем творческие способности и мелкую моторику через работу с глиной.',
      shortDescription: 'Творческие занятия по керамике для детей',
      schedule: 'Каждую субботу в 14:00',
      price: 2000,
      maxParticipants: 10,
      masterId: master1.id,
      isActive: true,
    },
  });

  await prisma.regularGroup.create({
    data: {
      name: 'Акварель для взрослых',
      description:
        'Регулярные занятия по акварельной живописи для взрослых. Изучаем различные техники, развиваем художественное видение.',
      shortDescription: 'Занятия по акварели, все уровни подготовки',
      schedule: 'Каждый четверг в 19:00',
      price: 2500,
      maxParticipants: 12,
      masterId: master2.id,
      isActive: true,
    },
  });

  await prisma.regularGroup.create({
    data: {
      name: 'Работа с кожей: базовый курс',
      description:
        'Полный курс по работе с кожей для начинающих. За 8 занятий вы освоите все основные техники и создадите несколько изделий.',
      shortDescription: 'Базовый курс работы с кожей',
      schedule: 'Каждый вторник в 18:30',
      price: 3500,
      maxParticipants: 8,
      masterId: master3.id,
      isActive: true,
    },
  });

  console.log('✅ Направления созданы');

  // Создаем несколько товаров
  await prisma.product.create({
    data: {
      name: 'Керамическая кружка ручной работы',
      description:
        'Уникальная керамическая кружка, созданная вручную. Каждое изделие имеет свой неповторимый рисунок и форму.',
      shortDescription: 'Авторская керамика',
      price: 1500,
      images: [],
      category: 'Посуда',
      stockQuantity: 5,
      isAvailable: true,
      masterId: master1.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Акварельная картина "Закат"',
      description: 'Оригинальная акварельная работа. Размер 30x40 см, оформлена в паспарту.',
      shortDescription: 'Авторская живопись',
      price: 5000,
      images: [],
      category: 'Живопись',
      stockQuantity: 1,
      isAvailable: true,
      masterId: master2.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Кожаный кошелек с тиснением',
      description:
        'Кошелек из натуральной кожи с авторским тиснением. Ручная работа, высокое качество.',
      shortDescription: 'Изделия из кожи',
      price: 3500,
      images: [],
      category: 'Аксессуары',
      stockQuantity: 3,
      isAvailable: true,
      masterId: master3.id,
    },
  });

  console.log('✅ Товары созданы');

  console.log('🎉 База данных успешно заполнена тестовыми данными!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении БД:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
