const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing products
  await prisma.product.deleteMany({});
  console.log('Cleared existing products');

  // Create sample products
  const products = await prisma.product.createMany({
    data: [
      {
        title: 'Blue T-Shirt Premium',
        slug: 'blue-tshirt-premium',
        description: 'Comfortable 100% organic cotton t-shirt. Perfect for everyday wear with a premium finish.',
        price: 49900, // 499 INR in paise
        images: ['https://via.placeholder.com/300x300?text=Blue+TShirt'],
        sku: 'TS-BLUE-001',
        stock: 50,
        category: 'Clothing'
      },
      {
        title: 'Red Ceramic Mug',
        slug: 'red-ceramic-mug',
        description: 'Beautiful red ceramic mug, microwave and dishwasher safe.',
        price: 29900, // 299 INR in paise
        images: ['https://via.placeholder.com/300x300?text=Red+Mug'],
        sku: 'MUG-RED-001',
        stock: 100,
        category: 'Drinkware'
      },
      {
        title: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
        price: 799900, // 7999 INR in paise
        images: ['https://via.placeholder.com/300x300?text=Headphones'],
        sku: 'HP-WIRE-001',
        stock: 25,
        category: 'Electronics'
      },
      {
        title: 'Cotton Socks Pack',
        slug: 'cotton-socks-pack',
        description: 'Pack of 5 pairs of comfortable cotton socks.',
        price: 39900, // 399 INR in paise
        images: ['https://via.placeholder.com/300x300?text=Socks+Pack'],
        sku: 'SK-COTTON-005',
        stock: 200,
        category: 'Accessories'
      },
      {
        title: 'Stainless Steel Water Bottle',
        slug: 'steel-water-bottle',
        description: 'Insulated stainless steel water bottle keeps drinks cold for 24 hours.',
        price: 69900, // 699 INR in paise
        images: ['https://via.placeholder.com/300x300?text=Water+Bottle'],
        sku: 'BOT-STEEL-001',
        stock: 75,
        category: 'Outdoor'
      }
    ],
    skipDuplicates: false
  });

  console.log(`✅ Seeded ${products.count} products`);
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
