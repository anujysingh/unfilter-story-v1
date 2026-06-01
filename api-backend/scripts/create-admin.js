// One-time admin bootstrap.
//
// Creates (or upgrades) a CMS user with a real bcrypt-hashed password so you
// can log into the admin panel. Existing seed users have a placeholder hash and
// cannot log in until you run this.
//
// Usage (preferred — keeps the password out of shell history and `ps`):
//   ADMIN_PASSWORD='S0me-Strong-Pass' node scripts/create-admin.js <email> [firstName] [lastName]
//
// Fallback (password as 2nd arg — avoid on shared machines):
//   node scripts/create-admin.js <email> <password> [firstName] [lastName]
//
// Requires DATABASE_URL in the environment (loaded from .env).
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const args = process.argv.slice(2)
  const email = args[0]
  // Prefer ADMIN_PASSWORD env var; otherwise treat the 2nd arg as the password.
  const password = process.env.ADMIN_PASSWORD || args[1]
  const fromEnv = Boolean(process.env.ADMIN_PASSWORD)
  const firstName = fromEnv ? args[1] : args[2]
  const lastName = fromEnv ? args[2] : args[3]

  if (!email || !password) {
    console.error('Usage: ADMIN_PASSWORD=... node scripts/create-admin.js <email> [firstName] [lastName]')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('Error: password must be at least 8 characters.')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.cmsUser.upsert({
    where: { email },
    update: { passwordHash, role: 'Admin', isActive: true },
    create: {
      email,
      passwordHash,
      role: 'Admin',
      firstName: firstName || null,
      lastName: lastName || null,
      isActive: true
    }
  })

  console.log(`✅ Admin ready: ${user.email} (role: ${user.role}, id: ${user.id})`)
}

main()
  .catch((err) => {
    console.error('Failed to create admin:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
