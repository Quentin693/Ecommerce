/**
 * Smoke e2e against a running API (register → cart → checkout → overlap).
 * Usage: API_URL=http://127.0.0.1:3001 node test/smoke.mjs
 */
const base = process.env.API_URL || 'http://127.0.0.1:3001';
const suffix = Date.now();
const email = `smoke-${suffix}@test.com`;
const password = 'Test123!';

async function req(method, path, { token, body } = {}) {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status} ${text}`);
  }
  return data;
}

async function main() {
  const registered = await req('POST', '/auth/register', {
    body: {
      email,
      password,
      firstName: 'Smoke',
      lastName: 'Test',
    },
  });
  if (!registered.access_token) throw new Error('missing token');
  const token = registered.access_token;

  const cars = await req('GET', '/cars');
  if (!cars.data?.length) throw new Error('no cars — run npm run seed');
  const carId = cars.data[0].id;

  await req('POST', '/cart/items', {
    token,
    body: {
      carId,
      startDate: '2027-06-10',
      endDate: '2027-06-13',
      deliveryCity: 'Paris',
    },
  });

  const checkout = await req('POST', '/checkout', {
    token,
    body: { deliveryCity: 'Paris' },
  });
  if (checkout.orders?.[0]?.payment?.status !== 'succeeded') {
    throw new Error('payment not succeeded');
  }
  if (checkout.orders?.[0]?.booking?.status !== 'confirmed') {
    throw new Error('booking not confirmed');
  }

  const bookingId = checkout.orders[0].booking.id;
  await req('GET', `/bookings/${bookingId}`, { token });

  let blocked = false;
  try {
    await req('POST', '/cart/items', {
      token,
      body: {
        carId,
        startDate: '2027-06-11',
        endDate: '2027-06-14',
      },
    });
  } catch (error) {
    blocked = String(error.message).includes('400');
  }
  if (!blocked) throw new Error('overlap was not blocked');

  console.log('Smoke e2e OK — confirmation booking', bookingId);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
