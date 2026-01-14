import { Timestamp } from 'firebase/firestore';
import {
  createInvoice,
  createSubscription,
  createProduct,
  createProductCategory,
  type Invoice,
  type Subscription,
  type Product,
  type ProductCategory,
} from './firestore-payments';

// Sample data
const productCategories = [
  { name: "Academy Registration Fees", description: "Registration and enrollment fees" },
  { name: "Training Programs", description: "Various training program fees" },
  { name: "Equipment", description: "Sports equipment and gear" },
  { name: "Tournament Fees", description: "Competition and tournament entry fees" },
];

const products = [
  {
    title: "The Winter Training Program",
    description: "Intensive winter training program for all skill levels",
    category: "Academy Registration Fees",
    prices: [
      {
        id: "price_winter_2025",
        amount: 250,
        currency: "JOD",
        type: "one_time" as const,
        active: true,
      },
    ],
    archived: false,
  },
  {
    title: "Arab Elite Cup – Dubai 2025",
    description: "Elite tournament in Dubai",
    category: "Tournament Fees",
    prices: [
      {
        id: "price_dubai_2025",
        amount: 1250,
        currency: "JOD",
        type: "one_time" as const,
        active: true,
      },
    ],
    archived: false,
  },
  {
    title: "Kit 2025",
    description: "Official team kit for 2025 season",
    category: "Equipment",
    prices: [
      {
        id: "price_kit_2025",
        amount: 85,
        currency: "JOD",
        type: "one_time" as const,
        active: true,
      },
    ],
    archived: false,
  },
  {
    title: "Official Winter Package (Black)",
    description: "Complete winter package including all gear",
    category: "Equipment",
    prices: [
      {
        id: "price_winter_pkg",
        amount: 120,
        currency: "JOD",
        type: "one_time" as const,
        active: true,
      },
    ],
    archived: false,
  },
  {
    title: "Registration Fee",
    description: "Annual registration and membership fee",
    category: "Academy Registration Fees",
    prices: [
      {
        id: "price_reg_monthly",
        amount: 75,
        currency: "JOD",
        type: "recurring" as const,
        interval: "month" as const,
        intervalCount: 1,
        active: true,
      },
    ],
    archived: false,
  },
  {
    title: "Premium Training Subscription",
    description: "Premium training sessions with advanced coaching",
    category: "Training Programs",
    prices: [
      {
        id: "price_premium_monthly",
        amount: 150,
        currency: "JOD",
        type: "recurring" as const,
        interval: "month" as const,
        intervalCount: 1,
        active: true,
      },
    ],
    archived: false,
  },
];

// Sample invoice recipients
const recipients = [
  { name: "Nilly samhan", email: "nillysamhan.1985@gmail.com" },
  { name: "Zaina Abuzahra", email: "zaina@daylightfm.com" },
  { name: "Omar Badran", email: "omar_badran@hotmail.com" },
  { name: "Reade AL AHMADATE", email: "raed.11@icloud.com" },
  { name: "Hanan Khaleefa", email: "hanan.khaleefa1@gmail.com" },
  { name: "laith tarawneh", email: "lt84@hotmail.com" },
  { name: "Hussam Alkhayyat", email: "hussamalkhayyat@gmail.com" },
  { name: "Omar AlDaoud", email: "oaldaoud@gmail.com" },
  { name: "Iyad Zawaideh", email: "iyad@zawaideh.com" },
  { name: "Tareq Aljuneidi", email: "tareqaljuneidi@icloud.com" },
  { name: "Shaker Amayreh", email: "shakeralamyreh@hotmail.com" },
  { name: "Hani Al Khasawneh", email: "hani.3amak@icloud.com" },
  { name: "Zaid Abudayeh", email: "z.abudayeh2011@gmail.com" },
  { name: "Tamara Al barghouthi", email: "t_bar1981@yahoo.com" },
  { name: "adel jumean", email: "adeljumeann@gmail.com" },
  { name: "Kyan Benyelles zoubi", email: "kyan.bz2013@icould.com" },
  { name: "Khaled Farhan", email: "khaled@lanapaper.com" },
  { name: "Saad Alkhayyat", email: "saad@alkhayyat.jo" },
  { name: "Ali elqutali", email: "ali.elqutali@gmail.com" },
  { name: "Zaid Abdulrahman", email: "zaid.abdulrahman@gmail.com" },
  { name: "Zaid Amayreh", email: "zaid.amayreh@gmail.com" },
];

function generateInvoiceNumber(index: number): string {
  return `UATLHQZ-0${(230 - index).toString().padStart(3, '0')}`;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomStatus(): 'paid' | 'open' | 'void' | 'past_due' | 'uncollectible' {
  const statuses: ('paid' | 'open' | 'void' | 'past_due' | 'uncollectible')[] = 
    ['paid', 'paid', 'paid', 'paid', 'paid', 'void', 'open', 'past_due'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

export async function seedPaymentData(clubId: string, onProgress?: (message: string) => void): Promise<void> {
  const log = (msg: string) => {
    console.log(msg);
    onProgress?.(msg);
  };

  log('🌱 Starting payment data seed...');

  try {
    // Seed Product Categories
    log('📁 Creating product categories...');
    for (const category of productCategories) {
      await createProductCategory({
        ...category,
        clubId,
      });
      log(`  ✓ Created category: ${category.name}`);
    }

    // Seed Products
    log('📦 Creating products...');
    const productRefs: { id: string; title: string; category: string }[] = [];
    
    for (const product of products) {
      const productId = await createProduct({
        ...product,
        clubId,
      });
      productRefs.push({ id: productId, title: product.title, category: product.category });
      log(`  ✓ Created product: ${product.title}`);
    }

    // Seed Invoices
    log('📄 Creating invoices...');
    const startDate = new Date('2025-01-14');
    const endDate = new Date('2025-11-30');

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const product = productRefs[Math.floor(Math.random() * productRefs.length)];
      const status = randomStatus();
      const createdAt = randomDate(startDate, endDate);
      const dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + 30);

      const invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        amountDue: 1250,
        currency: 'JOD',
        invoiceNumber: generateInvoiceNumber(i),
        status,
        productId: product.id,
        productName: product.title,
        terms: '30 days',
        dueDate,
        sentAt: createdAt,
        type: 'invoice',
        clubId,
      };

      // Add assigned contact for some invoices
      if (i % 3 === 0) {
        invoiceData.assignedContacts = [recipient.name.split(' ')[0]];
      }

      // Add paid date for paid invoices
      if (status === 'paid') {
        const paidAt = new Date(createdAt);
        paidAt.setDate(paidAt.getDate() + Math.floor(Math.random() * 10) + 1);
        invoiceData.paidAt = paidAt;
      }

      await createInvoice(invoiceData);
      log(`  ✓ Created invoice: ${invoiceData.invoiceNumber} for ${recipient.name} (${status})`);
    }

    // Create additional invoices to reach ~150 total
    log('📄 Creating additional invoices...');
    const additionalCount = 130;
    
    for (let i = 0; i < additionalCount; i++) {
      const recipient = recipients[Math.floor(Math.random() * recipients.length)];
      const product = productRefs[Math.floor(Math.random() * productRefs.length)];
      const status = randomStatus();
      const createdAt = randomDate(startDate, endDate);
      const dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + 30);

      const invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'> = {
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        amountDue: Math.floor(Math.random() * 1500) + 100,
        currency: 'JOD',
        invoiceNumber: generateInvoiceNumber(recipients.length + i),
        status,
        productId: product.id,
        productName: product.title,
        terms: '30 days',
        dueDate,
        sentAt: createdAt,
        type: 'invoice',
        clubId,
      };

      if (status === 'paid') {
        const paidAt = new Date(createdAt);
        paidAt.setDate(paidAt.getDate() + Math.floor(Math.random() * 10) + 1);
        invoiceData.paidAt = paidAt;
      }

      await createInvoice(invoiceData);
      
      if ((i + 1) % 25 === 0) {
        log(`  ✓ Created ${i + 1} additional invoices...`);
      }
    }

    // Seed a few Subscriptions
    log('🔄 Creating subscriptions...');
    const subscriptionProducts = productRefs.filter(p => 
      p.title.includes('Subscription') || p.title.includes('Registration')
    );

    if (subscriptionProducts.length > 0) {
      for (let i = 0; i < 5; i++) {
        const recipient = recipients[i];
        const product = subscriptionProducts[i % subscriptionProducts.length];
        const startAt = randomDate(new Date('2025-01-01'), new Date('2025-06-01'));
        const currentPeriodEnd = new Date(startAt);
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        await createSubscription({
          recipientName: recipient.name,
          recipientEmail: recipient.email,
          productId: product.id,
          productName: product.title,
          type: 'recurring',
          paidInstallments: Math.floor(Math.random() * 6) + 1,
          totalInstallments: 0,
          status: 'active',
          plan: 'Monthly',
          collectionMethod: 'charge_automatically',
          startAt,
          currentPeriodEnd,
          clubId,
        });
        log(`  ✓ Created subscription for ${recipient.name}`);
      }
    }

    log('✅ Payment data seed completed successfully!');
    log(`   - ${productCategories.length} categories`);
    log(`   - ${products.length} products`);
    log(`   - ~${recipients.length + additionalCount} invoices`);
    log(`   - 5 subscriptions`);

  } catch (error) {
    console.error('❌ Error seeding payment data:', error);
    throw error;
  }
}
