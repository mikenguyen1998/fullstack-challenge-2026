import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import { normalizeSearch } from '../src/utils/search.js';
import { type Prisma, PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

const resourceData: Omit<Prisma.ResourceCreateInput, 'searchName'>[] = [
  {
    name: 'AccumsanOdioCurabitur.ppt',
    description: 'Exposure to electric transmission lines, subsequent encounter',
    createdAt: '2024-07-23T22:00:20Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'PretiumIaculisJusto.xls',
    description:
      'Displaced segmental fracture of shaft of unspecified fibula, initial encounter for closed fracture',
    createdAt: '2024-07-07T22:46:44Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'EratTortor.xls',
    description: 'Immersion foot, right foot, sequela',
    createdAt: '2024-11-30T06:07:41Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'Nulla.mp3',
    description:
      'Displaced fracture of lesser tuberosity of unspecified humerus, subsequent encounter for fracture with routine healing',
    createdAt: '2024-12-13T22:45:46Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'NisiVolutpatEleifend.mp3',
    description: 'Burn of third degree of multiple right fingers (nail), not including thumb',
    createdAt: '2024-11-10T13:11:18Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'AliquetAt.doc',
    description: 'Assault by drowning and submersion after push into swimming pool',
    createdAt: '2024-09-23T07:06:46Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'EratVolutpat.xls',
    description: 'Other reactive arthropathies, right knee',
    createdAt: '2024-10-14T16:29:41Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'Vehicula.gif',
    description: 'Other chorioretinal inflammations, unspecified eye',
    createdAt: '2024-08-21T03:22:31Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'VestibulumRutrum.jpeg',
    description: 'Decreased fetal movements, unspecified trimester, fetus 4',
    createdAt: '2024-02-21T17:22:06Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'NatoquePenatibusEt.tiff',
    description: 'Contusion of diaphragm, subsequent encounter',
    createdAt: '2024-12-11T00:00:52Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'NuncRhoncus.gif',
    description:
      'Poisoning by glucocorticoids and synthetic analogues, accidental (unintentional), initial encounter',
    createdAt: '2024-08-05T07:25:16Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'CuraeMaurisViverra.avi',
    description: 'Puncture wound without foreign body of right elbow',
    createdAt: '2024-11-02T16:07:07Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'VolutpatSapienArcu.mov',
    description:
      'Poisoning by monoamine-oxidase-inhibitor antidepressants, undetermined, initial encounter',
    createdAt: '2024-11-03T01:55:54Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'EuismodScelerisqueQuam.ppt',
    description:
      'Toxic effect of nitroderivatives and aminoderivatives of benzene and its homologues, undetermined',
    createdAt: '2024-05-25T15:53:57Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
  {
    name: 'Nulla.ppt',
    description: 'Unspecified injury of right internal jugular vein',
    createdAt: '2024-06-28T07:18:05Z',
    updatedAt: '2025-01-12T00:00:00Z',
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const u of resourceData) {
    const resource = await prisma.resource.create({
      data: { ...u, searchName: normalizeSearch(u.name) },
    });
    console.log(`Created resource with id: ${resource.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
