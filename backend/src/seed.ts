// src/seed.ts
import * as path from 'path';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';
import 'reflect-metadata';
import { Role } from './users/role.enum';
import bcrypt from 'bcrypt';
import { DeepPartial } from 'typeorm';
import ds from './data-source';
import { User } from './users/user.entity';

ConfigModule.forRoot({ isGlobal: true });

dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('DB_PASSWORD from seed:', process.env.DB_PASSWORD);

const users = [
  {
    name: 'Ralph',
    surname: 'Foentjies',
    email: 'ralph.foentjies@ricoh.co.za',
    rzaNumber: 'RZA11223',
    role: Role.SUPERVISOR,
  },
  {
    name: 'Apiwe',
    surname: 'Hlobo',
    email: 'apiwe.hlobo@ricoh.co.za',
    rzaNumber: 'RZA44556',
    role: Role.ADMIN,
  },
  {
    name: 'Zuko',
    surname: 'Tetyana',
    email: 'zuko.tetyana@ricoh.co.za',
    rzaNumber: 'RZA12345',
    role: Role.ENGINEER,
  },
  { 
    name: 'Leslie',
    surname: 'Smith',
    email: 'leslie.smith@ricoh.co.za',
    rzaNumber: 'RZA67890',
    role: Role.ENGINEER 
  },
  { 
    name: 'Muraad',
    surname: 'Jacobus',
    email: 'muraad.jacobus@ricoh.co.za',
    rzaNumber: 'RZA09876',
    role: Role.ENGINEER
  },
  { 
    name: 'Lubabalo',
    surname: 'Sazona',
    email: 'lubabalo.sazona@ricoh.co.za',
    rzaNumber: 'RZA54321',
    role: Role.ENGINEER
  },
  { 
    name: 'Masixole',
    surname: 'Mbembe',
    email: 'masixole.mbembe@ricoh.co.za',
    rzaNumber: 'RZA11234',
    role: Role.ENGINEER
  },
  { 
    name: 'Grant',
    surname: 'Scheepers',
    email: 'grant.scheepers@ricoh.co.za',
    rzaNumber: 'RZA56789',
    role: Role.ENGINEER
  },
  { 
    name: 'Wayne',
    surname: 'Haydricks',
    email: 'wayne.haydricks@ricoh.co.za',
    rzaNumber: 'RZA67890',
    role: Role.ENGINEER
  },
  { 
    name: 'Garth',
    surname: 'Klein',
    email: 'garth.klein@ricoh.co.za',
    rzaNumber: 'RZA12345',
    role: Role.ENGINEER
  },
  { 
    name: 'Siphenathi',
    surname: 'Matyesini',
    email: 'siphenathi.matyesini@ricoh.co.za',
    rzaNumber: 'RZA54321',
    role: Role.ENGINEER
  },
  { 
    name: 'Whitney',
    surname: 'Sharnick',
    email: 'whitney.scharnick@ricoh.co.za',
    rzaNumber: 'RZA67890',
    role: Role.ENGINEER
  },
  { 
    name: 'Faried',
    surname: 'Johnson',
    email: 'faried.johnson@ricoh.co.za',
    rzaNumber: 'RZA11223',
    role: Role.ENGINEER
  },
  { 
    name: 'Riaan',
    surname: 'Marais',
    email: 'riaan.marais@ricoh.co.za',
    rzaNumber: 'RZA44556',
    role: Role.ENGINEER
  },
  { 
    name: 'Leonardo',
    surname: 'Potter',
    email: 'leonardo.potter@ricoh.co.za',
    rzaNumber: 'RZA12345',
    role: Role.ADMIN
  },
  { 
    name: 'Reza',
    surname: 'Arend',
    email: 'reza.arend@ricoh.co.za',
    rzaNumber: 'RZA67890',
    role: Role.ENGINEER
  },
  { 
    name: 'Calvin',
    surname: 'Williams',
    email: 'calvin.williams@ricoh.co.za',
    rzaNumber: 'RZA09876',
    role: Role.ENGINEER
  },
  { 
    name: 'Jaco',
    surname: 'Greeff',
    email: 'jaco.greeff@ricoh.co.za',
    rzaNumber: 'RZA12345', role: Role.SUPERVISOR 
  },
];

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(User);
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10);

  for (const u of users) {
    try {
      const exists = await repo.findOne({ where: { email: u.email } });
      if (exists) {
        console.log(`⏩ Already exists: ${u.email}`);
        continue;
      }

      const passwordHash = await bcrypt.hash('ChangeMe123!', saltRounds);

      // build a DeepPartial<User> object, no generic on create()
      const userData: DeepPartial<User> = {
        name: u.name,
        surname: u.surname,
        email: u.email,
        rzaNumber: u.rzaNumber,
        role: u.role,
        isActive: true,
        passwordHash,
        mustChangePassword: true,
      };

      const user = repo.create(userData);
      await repo.save(user);
      console.log(`✅ Seeded: ${u.email}`);
    } catch (err) {
      console.error(`❌ Failed to seed ${u.email}:`, err);
    }
  }

  await ds.destroy();
}

run().catch((e) => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});
