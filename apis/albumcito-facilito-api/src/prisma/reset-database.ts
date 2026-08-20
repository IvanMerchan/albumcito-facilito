import { PrismaService } from './prisma.service';

// Test-only helper: clears every table so each test starts from a clean
// database, mirroring what auth.data.ts's resetUsers() did for the old
// in-memory USERS array. Order matters -- children before parents.
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.collectedSticker.deleteMany();
  await prisma.user.deleteMany();
}
