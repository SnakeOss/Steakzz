const { PrismaClient, menuItem } = require('@prisma/client'); // Import `menuItem`
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  await prisma.branch.createMany({
    data: [
      { name: 'Branch1' },
      { name: 'Branch2' },
      { name: 'Branch3' },
    ],
    skipDuplicates: true,
  });

  console.log('Branches seeded.');

  await prisma.menu.createMany({
    data: [
      { item: menuItem.GRILLED_CHICKEN, price: 10.99 },  
      { item: menuItem.PASTA_ALFREDO, price: 12.99 },
      { item: menuItem.PIZZA_MARGHERITA, price: 14.99 },
      { item: menuItem.SUSHI_ROLL, price: 16.99 },
      { item: menuItem.BURGER_DELUXE, price: 18.99 },
      { item: menuItem.CAESAR_SALAD, price: 9.99 },
    ],
    skipDuplicates: true,
  });

  console.log('Menu items seeded.');

  const email = 'admin@gmail.com';
  const rawPassword = 'admin';
  const role = 'ADMIN';
  const branchName = 'Branch1';

  const password = await bcrypt.hash(rawPassword, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    const branch = await prisma.branch.findFirst({
      where: { name: branchName },
    });

    if (!branch) {
      console.error(`Branch with name ${branchName} does not exist.`);
      return;
    }

    await prisma.user.create({
      data: {
        email,
        password,
        role,
        Branch: { connect: { id: branch.id } },
      },
    });

    console.log(`User with email ${email} created with role ${role}.`);
  } else {
    console.log(`User with email ${email} already exists and will not be updated.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
