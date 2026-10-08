import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('LuxeDrive API (e2e)', () => {
  let app: INestApplication<App>;
  const suffix = Date.now();
  const email = `e2e-${suffix}@test.com`;
  const password = 'Test123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('register → login → cars → cart → checkout → confirmation booking', async () => {
    const register = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        firstName: 'E2E',
        lastName: 'User',
      })
      .expect(201);

    expect(register.body.access_token).toBeDefined();
    const token = register.body.access_token as string;

    const cars = await request(app.getHttpServer()).get('/cars').expect(200);
    expect(cars.body.data.length).toBeGreaterThan(0);
    const carId = cars.body.data[0].id as string;

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        carId,
        startDate: '2027-03-10',
        endDate: '2027-03-13',
        deliveryCity: 'Paris',
      })
      .expect(201);

    const checkout = await request(app.getHttpServer())
      .post('/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ deliveryCity: 'Paris' })
      .expect(201);

    expect(checkout.body.orders.length).toBe(1);
    expect(checkout.body.orders[0].payment.status).toBe('succeeded');
    expect(checkout.body.orders[0].booking.status).toBe('confirmed');

    const bookingId = checkout.body.orders[0].booking.id as string;
    await request(app.getHttpServer())
      .get(`/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        carId,
        startDate: '2027-03-11',
        endDate: '2027-03-14',
      })
      .expect(400);
  });
});
