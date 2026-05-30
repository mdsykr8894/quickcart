const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const ADMIN_PASSWORD = 'Admin@12345';

const PRODUCT_UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads', 'products');
const PROFILE_UPLOAD_DIR = path.resolve(__dirname, '..', 'uploads', 'profiles');

function getModelFields(modelName) {
  const model = prisma._runtimeDataModel?.models?.[modelName];

  if (!model || !Array.isArray(model.fields)) {
    return new Set();
  }

  return new Set(model.fields.map((field) => field.name));
}

function filterDataByModel(modelName, data) {
  const fields = getModelFields(modelName);

  if (fields.size === 0) {
    return data;
  }

  return Object.fromEntries(
    Object.entries(data).filter(([key]) => fields.has(key))
  );
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

function ensureProductImageExists(filename) {
  const fullPath = path.join(PRODUCT_UPLOAD_DIR, filename);

  if (!fs.existsSync(fullPath)) {
    console.warn(`[Warning] Product image not found: ${fullPath}`);
    return false;
  }

  return true;
}

function ensureProfileImageExists(filename) {
  const fullPath = path.join(PROFILE_UPLOAD_DIR, filename);

  if (!fs.existsSync(fullPath)) {
    console.warn(`[Warning] Profile image not found: ${fullPath}`);
    return false;
  }

  return true;
}

function buildProductImageData(filename) {
  if (!filename || !ensureProductImageExists(filename)) {
    return {};
  }

  const imagePath = `/uploads/products/${filename}`;
  const imageMime = getMimeType(filename);

  // This supports common image field names.
  // Unknown fields are removed later by filterDataByModel().
  return {
    imageName: filename,
    imagePath,
    imageMime,
    imageUrl: imagePath,
    thumbnailUrl: imagePath,
    coverImageUrl: imagePath
  };
}

function buildProfileImageData(filename) {
  if (!filename || !ensureProfileImageExists(filename)) {
    return {};
  }

  const profileImagePath = `/uploads/profiles/${filename}`;
  const profileImageMime = getMimeType(filename);

  // This supports common profile image field names.
  // Unknown fields are removed later by filterDataByModel().
  return {
    profileImageName: filename,
    profileImagePath,
    profileImageMime,
    profileImageUrl: profileImagePath,
    avatarUrl: profileImagePath,
    imageUrl: profileImagePath
  };
}

async function main() {
  console.log('🌱 Starting QuickCart database seeding...');

  // 1. App settings
  console.log('Seeding app settings...');

  const swaggerSetting = await prisma.appSetting.upsert({
    where: { key: 'SWAGGER_ENABLED' },
    update: { value: 'true' },
    create: { key: 'SWAGGER_ENABLED', value: 'true' }
  });

  console.log(`[Configured] Setting: ${swaggerSetting.key} = ${swaggerSetting.value}`);

  // 2. Admin user only
  console.log('Seeding admin user...');

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

  const adminProfileImage = buildProfileImageData(
    '58fa7345-7cb0-4624-8b92-fee14a6b9c54.webp'
  );

  const adminUserData = filterDataByModel('User', {
    username: 'admin',
    email: 'admin@quickcart.io',
    passwordHash: adminPasswordHash,
    firstName: 'QuickCart',
    lastName: 'Admin',
    role: 'ADMIN',
    isActive: true,
    ...adminProfileImage
  });

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: adminUserData,
    create: adminUserData
  });

  console.log(`[Configured] Admin account created/updated: ${adminUser.username}`);
  console.log(`[Login] username: admin`);
  console.log(`[Login] email: admin@quickcart.io`);
  console.log(`[Login] password: ${ADMIN_PASSWORD}`);

  // 3. Categories
  console.log('Seeding categories...');

  const categoriesData = [
    {
      name: 'Gaming',
      slug: 'gaming',
      description: 'Gaming consoles, controllers, and entertainment devices.'
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Everyday tech accessories, adapters, and useful add-ons.'
    },
    {
      name: 'Audio',
      slug: 'audio',
      description: 'Headphones, earbuds, speakers, and portable sound gear.'
    },
    {
      name: 'Mobile',
      slug: 'mobile',
      description: 'Smartphones, mobile devices, and phone accessories.'
    },
    {
      name: 'Laptop',
      slug: 'laptop',
      description: 'Laptops, notebooks, and productivity devices.'
    },
    {
      name: 'Camera',
      slug: 'camera',
      description: 'Cameras, projectors, and visual media equipment.'
    },
    {
      name: 'Wearable',
      slug: 'wearable',
      description: 'Smart watches and wearable technology.'
    }
  ];

  const categories = {};

  for (const category of categoriesData) {
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description
      }
    });

    categories[category.slug] = createdCategory;
  }

  console.log(`[Configured] Seeded ${Object.keys(categories).length} categories.`);

  // 4. Products with local images
  console.log('Seeding products with local images...');

  const productsData = [
    {
      name: 'Apple Wired Earphones',
      slug: 'apple-wired-earphones',
      description:
        'Lightweight Apple-style wired earphones designed for clear calls, balanced audio, and daily listening comfort.',
      price: 49.9,
      stock: 75,
      categorySlug: 'audio',
      image: 'apple_earphone_image.png'
    },
    {
      name: 'ASUS Everyday Laptop',
      slug: 'asus-everyday-laptop',
      description:
        'Reliable ASUS laptop for study, office productivity, browsing, and everyday multitasking.',
      price: 2499.0,
      stock: 12,
      categorySlug: 'laptop',
      image: 'asus_laptop_image.png'
    },
    {
      name: 'Bose Wireless Headphones',
      slug: 'bose-wireless-headphones',
      description:
        'Premium wireless headphones with comfortable ear cushions, rich sound, and long battery performance.',
      price: 899.0,
      stock: 18,
      categorySlug: 'audio',
      image: 'bose_headphone_image.png'
    },
    {
      name: 'Canon Digital Camera',
      slug: 'canon-digital-camera',
      description:
        'Compact digital camera suitable for casual photography, travel moments, and content creation.',
      price: 1399.0,
      stock: 10,
      categorySlug: 'camera',
      image: 'cannon_camera_image.png'
    },
    {
      name: 'JBL Portable Soundbox',
      slug: 'jbl-portable-soundbox',
      description:
        'Portable Bluetooth speaker with strong bass, compact design, and easy wireless pairing.',
      price: 299.0,
      stock: 32,
      categorySlug: 'audio',
      image: 'jbl_soundbox_image.png'
    },
    {
      name: 'MacBook Productivity Laptop',
      slug: 'macbook-productivity-laptop',
      description:
        'Premium laptop for productivity, design work, programming, and smooth daily performance.',
      price: 5299.0,
      stock: 8,
      categorySlug: 'laptop',
      image: 'macbook_image.png'
    },
    {
      name: 'PlayStation Console',
      slug: 'playstation-console',
      description:
        'Modern gaming console built for immersive entertainment, fast loading, and next-generation gameplay.',
      price: 2299.0,
      stock: 15,
      categorySlug: 'gaming',
      image: 'playstation_image.png'
    },
    {
      name: 'DualSense Style Controller',
      slug: 'dualsense-style-controller',
      description:
        'Comfortable wireless controller with precise buttons, smooth grip, and responsive control for gaming.',
      price: 289.0,
      stock: 40,
      categorySlug: 'gaming',
      image: 'md_controller_image.png'
    },
    {
      name: 'Compact Gaming Controller',
      slug: 'compact-gaming-controller',
      description:
        'Small wireless gaming controller designed for casual gaming, portability, and easy setup.',
      price: 159.0,
      stock: 55,
      categorySlug: 'gaming',
      image: 'sm_controller_image.png'
    },
    {
      name: 'Portable Mini Projector',
      slug: 'portable-mini-projector',
      description:
        'Compact projector for presentations, movie nights, and portable entertainment setups.',
      price: 699.0,
      stock: 20,
      categorySlug: 'camera',
      image: 'projector_image.png'
    },
    {
      name: 'Samsung Galaxy S23',
      slug: 'samsung-galaxy-s23',
      description:
        'Flagship Samsung smartphone with a sharp display, fast performance, and reliable camera system.',
      price: 3199.0,
      stock: 16,
      categorySlug: 'mobile',
      image: 'samsung_s23phone_image.png'
    },
    {
      name: 'Sony Wireless Airbuds',
      slug: 'sony-wireless-airbuds',
      description:
        'Compact wireless earbuds with clear audio, pocket charging case, and comfortable daily fit.',
      price: 349.0,
      stock: 45,
      categorySlug: 'audio',
      image: 'sony_airbuds_image.png'
    },
    {
      name: 'Venu Smart Watch',
      slug: 'venu-smart-watch',
      description:
        'Stylish smart watch for notifications, activity tracking, daily health monitoring, and lifestyle use.',
      price: 799.0,
      stock: 22,
      categorySlug: 'wearable',
      image: 'venu_watch_image.png'
    },
    {
      name: 'Smart Workspace Laptop Kit',
      slug: 'smart-workspace-laptop-kit',
      description:
        'Workspace-ready laptop accessory bundle for students, office users, and clean desk setups.',
      price: 129.0,
      stock: 30,
      categorySlug: 'accessories',
      image: 'boy_with_laptop_image.png'
    },
    {
      name: 'Premium Headphone Setup',
      slug: 'premium-headphone-setup',
      description:
        'Comfortable headphone-focused setup for study sessions, music listening, and remote meetings.',
      price: 199.0,
      stock: 25,
      categorySlug: 'audio',
      image: 'girl_with_headphone_image.png'
    },
    {
      name: 'Daily Earphone Essentials',
      slug: 'daily-earphone-essentials',
      description:
        'Everyday earphone accessory set designed for online classes, calls, and music on the go.',
      price: 89.0,
      stock: 60,
      categorySlug: 'accessories',
      image: 'girl_with_earphone_image.png'
    }
  ];

  for (const product of productsData) {
    const category = categories[product.categorySlug];

    if (!category) {
      console.warn(`[Warning] Category not found for product: ${product.name}`);
      continue;
    }

    const imageData = buildProductImageData(product.image);

    const productData = filterDataByModel('Product', {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: category.id,
      isActive: true,
      ...imageData
    });

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: productData,
      create: productData
    });

    console.log(`[Product] ${product.name}`);
  }

  console.log(`[Configured] Seeded ${productsData.length} products.`);

  // 5. Seed audit log
  console.log('Writing seed audit log...');

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_SEED',
      status: 'SUCCESS',
      ipAddress: '127.0.0.1',
      userAgent: 'QuickCart Seed Script',
      details:
        'Database seeded with one admin account, product categories, and local product images.'
    }
  });

  console.log('🌱 Database seeding completed successfully!');
}

main()
  .catch((error) => {
    console.error('❌ Error occurred during database seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });