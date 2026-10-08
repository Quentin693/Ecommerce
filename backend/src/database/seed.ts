import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Car } from '../cars/entities/car.entity';
import { Booking } from '../bookings/entities/booking.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'luxury_cars',
  entities: [User, Car, Booking],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Starting seed...');

  const userRepository = AppDataSource.getRepository(User);
  const carRepository = AppDataSource.getRepository(Car);

  // Create admin user
  const adminExists = await userRepository.findOne({ where: { email: 'admin@luxurycars.com' } });
  if (!adminExists) {
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = userRepository.create({
      email: 'admin@luxurycars.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'LuxuryCars',
      role: 'admin',
    });
    await userRepository.save(admin);
    console.log('✅ Admin user created: admin@luxurycars.com / Admin123!');
  } else {
    console.log('⚠️  Admin user already exists');
  }

  // Create test user
  const userExists = await userRepository.findOne({ where: { email: 'user@test.com' } });
  if (!userExists) {
    const userPassword = await bcrypt.hash('Test123!', 10);
    const testUser = userRepository.create({
      email: 'user@test.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    });
    await userRepository.save(testUser);
    console.log('✅ Test user created: user@test.com / Test123!');
  } else {
    console.log('⚠️  Test user already exists');
  }

  // Create luxury cars
  const carsData = [
    {
      name: 'Ferrari 488 GTB',
      brand: 'Ferrari',
      model: '488 GTB',
      year: 2022,
      description:
        'La Ferrari 488 GTB est l\'expression ultime de la passion Ferrari. Avec son moteur V8 biturbo de 660 ch, elle offre des performances exceptionnelles et un design emblématique.',
      pricePerDay: 1500,
      category: 'supercar' as const,
      imageUrl: '/cars/ferrari-488.jpg',
      images: ['/cars/ferrari-488.jpg'],
      available: true,
      features: ['GPS', 'Assurance incluse', 'Livraison à domicile', 'Assistance 24/7'],
      seats: 2,
      transmission: 'automatic' as const,
    },
    {
      name: 'Lamborghini Huracán EVO',
      brand: 'Lamborghini',
      model: 'Huracán EVO',
      year: 2023,
      description:
        'La Lamborghini Huracán EVO incarne la puissance brute et le design futuriste. Son moteur V10 de 640 ch vous propulse de 0 à 100 km/h en 2,9 secondes.',
      pricePerDay: 1800,
      category: 'supercar' as const,
      imageUrl: '/cars/lamborghini-huracan.jpg',
      images: ['/cars/lamborghini-huracan.jpg', '/cars/lamborghini-huracan-2.jpg'],
      available: true,
      features: ['GPS', 'Assurance incluse', 'Chauffeur disponible', 'Livraison VIP'],
      seats: 2,
      transmission: 'automatic' as const,
    },
    {
      name: 'Rolls-Royce Ghost',
      brand: 'Rolls-Royce',
      model: 'Ghost',
      year: 2023,
      description:
        'La Rolls-Royce Ghost est la définition du luxe absolu. Un intérieur artisanal exceptionnel, une motorisation V12 de 571 ch et un silence de fonctionnement incomparable.',
      pricePerDay: 2500,
      category: 'luxury' as const,
      imageUrl: '/cars/rolls-royce.jpg',
      images: ['/cars/rolls-royce.jpg', '/cars/rolls-royce-2.jpg'],
      available: true,
      features: ['Chauffeur inclus', 'GPS', 'Champagne à bord', 'Assurance premium', 'Tapis rouge'],
      seats: 5,
      transmission: 'automatic' as const,
    },
    {
      name: 'Bentley Continental GT',
      brand: 'Bentley',
      model: 'Continental GT',
      year: 2023,
      description:
        'Le Bentley Continental GT marie luxe raffiné et performances sportives. Son W12 de 635 ch et ses finitions artisanales en font le grand tourer par excellence.',
      pricePerDay: 1200,
      category: 'luxury' as const,
      imageUrl: '/cars/bentley-continental.jpg',
      images: ['/cars/bentley-continental.jpg', '/cars/bentley-continental-2.jpg'],
      available: true,
      features: ['GPS', 'Assurance incluse', 'Système audio Bang & Olufsen', 'Massage sièges'],
      seats: 4,
      transmission: 'automatic' as const,
    },
    {
      name: 'Porsche 911 Turbo S',
      brand: 'Porsche',
      model: '911 Turbo S',
      year: 2023,
      description:
        'La Porsche 911 Turbo S est l\'icône sportive par excellence. 650 ch, 0-100 en 2,7 secondes et une maniabilité légendaire pour une expérience de conduite inoubliable.',
      pricePerDay: 900,
      category: 'supercar' as const,
      imageUrl: '/cars/porsche-911.jpg',
      images: ['/cars/porsche-911.jpg'],
      available: true,
      features: ['GPS', 'Assurance incluse', 'Sport Chrono Package', 'Livraison disponible'],
      seats: 4,
      transmission: 'automatic' as const,
    },
    {
      name: 'Aston Martin DB11',
      brand: 'Aston Martin',
      model: 'DB11',
      year: 2022,
      description:
        'L\'Aston Martin DB11 est l\'élégance britannique à l\'état pur. Son V12 de 600 ch dans une carrosserie au design intemporel vous offre une expérience grand tourisme unique.',
      pricePerDay: 1100,
      category: 'luxury' as const,
      imageUrl: '/cars/aston-db11.jpg',
      images: ['/cars/aston-db11.jpg', '/cars/aston-db11-2.jpg'],
      available: true,
      features: ['GPS', 'Assurance incluse', 'Son Bang & Olufsen', 'Système de conduite sportif'],
      seats: 4,
      transmission: 'automatic' as const,
    },
    {
      name: 'McLaren 720S',
      brand: 'McLaren',
      model: '720S',
      year: 2022,
      description:
        'La McLaren 720S redéfinit les limites de la supercar. Son V8 biturbo de 720 ch et sa structure en fibre de carbone offrent un rapport poids/puissance extraordinaire.',
      pricePerDay: 1600,
      category: 'supercar' as const,
      imageUrl: '/cars/mclaren-720s.jpg',
      images: ['/cars/mclaren-720s.jpg', '/cars/mclaren-720s-2.jpg'],
      available: true,
      features: ['GPS', 'Assurance incluse', 'Mode piste', 'Assistance technique dédiée'],
      seats: 2,
      transmission: 'automatic' as const,
    },
    {
      name: 'Bugatti Chiron',
      brand: 'Bugatti',
      model: 'Chiron',
      year: 2022,
      description:
        'La Bugatti Chiron est l\'hypercar ultime. Son W16 quadriturbo de 1500 ch la propulse à plus de 420 km/h. Une expérience réservée à une élite mondiale, maintenant accessible.',
      pricePerDay: 5000,
      category: 'supercar' as const,
      imageUrl: '/cars/bugatti-chiron.jpg',
      images: ['/cars/bugatti-chiron.jpg'],
      available: true,
      features: [
        'Chauffeur inclus obligatoire',
        'Assurance premium',
        'GPS',
        'Escorte sécurité',
        'Service VIP',
        'Conciergerie 24/7',
      ],
      seats: 2,
      transmission: 'automatic' as const,
    },
  ];

  for (const carData of carsData) {
    const exists = await carRepository.findOne({ where: { name: carData.name } });
    if (!exists) {
      const car = carRepository.create(carData);
      await carRepository.save(car);
      console.log(`✅ Car created: ${carData.name}`);
    } else {
      console.log(`⚠️  Car already exists: ${carData.name}`);
    }
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('📧 Admin: admin@luxurycars.com / Admin123!');
  console.log('📧 User: user@test.com / Test123!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
