import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  where, 
  serverTimestamp,
  Timestamp,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible' | 'past_due';
export type SubscriptionStatus = 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid' | 'paused';
export type PaymentCollectionMethod = 'charge_automatically' | 'send_invoice';
export type SubscriptionType = 'recurring' | 'installment';

export interface Invoice {
  id?: string;
  recipientName: string;
  recipientEmail: string;
  amountDue: number;
  currency: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  assignedContacts?: string[];
  memberId?: string; // Links to club member when created from profile
  productId?: string;
  productName?: string;
  terms: string; // e.g., "30 days"
  dueDate: Date | Timestamp;
  sentAt?: Date | Timestamp;
  paidAt?: Date | Timestamp;
  type: 'invoice' | 'credit_note' | 'refund';
  stripeInvoiceId?: string;
  stripeCustomerId?: string;
  clubId: string;
  notes?: string;
  lineItems?: InvoiceLineItem[];
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Subscription {
  id?: string;
  recipientName: string;
  recipientEmail: string;
  assignedUsers?: string[];
  memberId?: string; // Links to club member when created from profile
  productId: string;
  productName: string;
  type: SubscriptionType;
  paidInstallments: number;
  totalInstallments: number;
  status: SubscriptionStatus;
  plan: string; // e.g., "Monthly", "Quarterly", "Annually"
  collectionMethod: PaymentCollectionMethod;
  startAt: Date | Timestamp;
  currentPeriodEnd: Date | Timestamp;
  nextInvoiceDate?: Date | Timestamp;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  clubId: string;
  canceledAt?: Date | Timestamp;
  cancelReason?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface Product {
  id?: string;
  title: string;
  description?: string;
  category: string;
  prices: ProductPrice[];
  stripeProductId?: string;
  archived: boolean;
  clubId: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface ProductPrice {
  id: string;
  amount: number;
  currency: string;
  interval?: 'day' | 'week' | 'month' | 'year';
  intervalCount?: number;
  type: 'one_time' | 'recurring';
  stripePriceId?: string;
  active: boolean;
}

export interface ProductCategory {
  id?: string;
  name: string;
  description?: string;
  clubId: string;
  createdAt?: Date | Timestamp;
}

export interface PaymentReport {
  productId: string;
  productName: string;
  total: number;
  monthly: Record<string, number>; // e.g., { "2025-01": 1500, "2025-02": 2000 }
}

export interface PaymentInsight {
  requiresAction: number;
  estimatedPayments30Days: {
    invoices: number;
    subscriptions: number;
  };
  recurringRevenue: {
    monthly: number;
    quarterly: number;
    annually: number;
  };
}

// Collection names
const INVOICES_COLLECTION = 'invoices';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PRODUCTS_COLLECTION = 'products';
const PRODUCT_CATEGORIES_COLLECTION = 'product_categories';

// ============ INVOICES ============

export async function createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, INVOICES_COLLECTION), {
    ...invoice,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<void> {
  const docRef = doc(db, INVOICES_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteInvoice(id: string): Promise<void> {
  const docRef = doc(db, INVOICES_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  const docRef = doc(db, INVOICES_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Invoice;
  }
  return null;
}

export async function getInvoices(
  clubId: string,
  options?: {
    status?: InvoiceStatus;
    type?: Invoice['type'];
    pageSize?: number;
    lastDoc?: DocumentSnapshot;
  }
): Promise<{ invoices: Invoice[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, INVOICES_COLLECTION),
    where('clubId', '==', clubId),
    orderBy('createdAt', 'desc')
  );

  if (options?.status) {
    q = query(q, where('status', '==', options.status));
  }

  if (options?.type) {
    q = query(q, where('type', '==', options.type));
  }

  if (options?.pageSize) {
    q = query(q, limit(options.pageSize));
  }

  if (options?.lastDoc) {
    q = query(q, startAfter(options.lastDoc));
  }

  const querySnapshot = await getDocs(q);
  const invoices = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Invoice));

  const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { invoices, lastDoc };
}

/** Get invoices for a specific profile (filtered by recipientEmail or memberId) */
export async function getInvoicesForProfile(
  clubId: string,
  profile: { email?: string; memberId?: string }
): Promise<Invoice[]> {
  const { invoices } = await getInvoices(clubId, { type: 'invoice', pageSize: 500 });
  const email = profile.email?.toLowerCase().trim();
  return invoices.filter((inv) => {
    if (profile.memberId && inv.memberId === profile.memberId) return true;
    if (email && inv.recipientEmail?.toLowerCase().trim() === email) return true;
    return false;
  });
}

/** Get subscriptions for a specific profile (filtered by recipientEmail or memberId) */
export async function getSubscriptionsForProfile(
  clubId: string,
  profile: { email?: string; memberId?: string }
): Promise<Subscription[]> {
  const { subscriptions } = await getSubscriptions(clubId, { pageSize: 500 });
  const email = profile.email?.toLowerCase().trim();
  return subscriptions.filter((sub) => {
    if (profile.memberId && sub.memberId === profile.memberId) return true;
    if (email && sub.recipientEmail?.toLowerCase().trim() === email) return true;
    return false;
  });
}

export async function getInvoiceStats(clubId: string, dateRange?: { from: Date; to: Date }): Promise<{
  paid: number;
  open: number;
  pastDue: number;
  uncollectible: number;
  totalRevenue: number;
  totalCount: number;
}> {
  let q = query(
    collection(db, INVOICES_COLLECTION),
    where('clubId', '==', clubId)
  );

  const querySnapshot = await getDocs(q);
  const invoices = querySnapshot.docs.map(doc => doc.data() as Invoice);

  // Filter by date range if provided
  let filteredInvoices = invoices;
  if (dateRange) {
    filteredInvoices = invoices.filter(inv => {
      const createdAt = inv.createdAt instanceof Timestamp 
        ? inv.createdAt.toDate() 
        : new Date(inv.createdAt as Date);
      return createdAt >= dateRange.from && createdAt <= dateRange.to;
    });
  }

  const stats = {
    paid: 0,
    open: 0,
    pastDue: 0,
    uncollectible: 0,
    totalRevenue: 0,
    totalCount: filteredInvoices.length,
  };

  filteredInvoices.forEach(inv => {
    switch (inv.status) {
      case 'paid':
        stats.paid++;
        stats.totalRevenue += inv.amountDue;
        break;
      case 'open':
        stats.open++;
        break;
      case 'past_due':
        stats.pastDue++;
        break;
      case 'uncollectible':
        stats.uncollectible++;
        break;
    }
  });

  return stats;
}

// ============ SUBSCRIPTIONS ============

export async function createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), {
    ...subscription,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
  const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelSubscription(id: string, reason?: string): Promise<void> {
  const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, id);
  await updateDoc(docRef, {
    status: 'canceled',
    canceledAt: serverTimestamp(),
    cancelReason: reason,
    updatedAt: serverTimestamp(),
  });
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Subscription;
  }
  return null;
}

export async function getSubscriptions(
  clubId: string,
  options?: {
    status?: SubscriptionStatus;
    pageSize?: number;
    lastDoc?: DocumentSnapshot;
  }
): Promise<{ subscriptions: Subscription[]; lastDoc: DocumentSnapshot | null }> {
  let q = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('clubId', '==', clubId),
    orderBy('createdAt', 'desc')
  );

  if (options?.status) {
    q = query(q, where('status', '==', options.status));
  }

  if (options?.pageSize) {
    q = query(q, limit(options.pageSize));
  }

  if (options?.lastDoc) {
    q = query(q, startAfter(options.lastDoc));
  }

  const querySnapshot = await getDocs(q);
  const subscriptions = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Subscription));

  const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

  return { subscriptions, lastDoc };
}

export async function getSubscriptionStats(clubId: string): Promise<{
  active: number;
  canceled: number;
  pastDue: number;
  total: number;
  newThisMonth: number;
}> {
  const q = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('clubId', '==', clubId)
  );

  const querySnapshot = await getDocs(q);
  const subscriptions = querySnapshot.docs.map(doc => doc.data() as Subscription);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    active: 0,
    canceled: 0,
    pastDue: 0,
    total: subscriptions.length,
    newThisMonth: 0,
  };

  subscriptions.forEach(sub => {
    switch (sub.status) {
      case 'active':
        stats.active++;
        break;
      case 'canceled':
        stats.canceled++;
        break;
      case 'past_due':
        stats.pastDue++;
        break;
    }

    const createdAt = sub.createdAt instanceof Timestamp
      ? sub.createdAt.toDate()
      : new Date(sub.createdAt as Date);
    
    if (createdAt >= startOfMonth) {
      stats.newThisMonth++;
    }
  });

  return stats;
}

// ============ PRODUCTS ============

export async function createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function archiveProduct(id: string): Promise<void> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, {
    archived: true,
    updatedAt: serverTimestamp(),
  });
}

export async function getProduct(id: string): Promise<Product | null> {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
}

export async function getProducts(
  clubId: string,
  options?: {
    archived?: boolean;
    category?: string;
  }
): Promise<Product[]> {
  let q = query(
    collection(db, PRODUCTS_COLLECTION),
    where('clubId', '==', clubId),
    orderBy('createdAt', 'desc')
  );

  if (options?.archived !== undefined) {
    q = query(q, where('archived', '==', options.archived));
  }

  if (options?.category) {
    q = query(q, where('category', '==', options.category));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Product));
}

// ============ PRODUCT CATEGORIES ============

export async function createProductCategory(category: Omit<ProductCategory, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, PRODUCT_CATEGORIES_COLLECTION), {
    ...category,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getProductCategories(clubId: string): Promise<ProductCategory[]> {
  const q = query(
    collection(db, PRODUCT_CATEGORIES_COLLECTION),
    where('clubId', '==', clubId),
    orderBy('name', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as ProductCategory));
}

export async function deleteProductCategory(id: string): Promise<void> {
  const docRef = doc(db, PRODUCT_CATEGORIES_COLLECTION, id);
  await deleteDoc(docRef);
}

// ============ REPORTS ============

export async function getRevenueReport(
  clubId: string,
  dateRange: { from: Date; to: Date }
): Promise<PaymentReport[]> {
  // Get all paid invoices in the date range
  const q = query(
    collection(db, INVOICES_COLLECTION),
    where('clubId', '==', clubId),
    where('status', '==', 'paid')
  );

  const querySnapshot = await getDocs(q);
  const invoices = querySnapshot.docs.map(doc => doc.data() as Invoice);

  // Filter by date range
  const filteredInvoices = invoices.filter(inv => {
    const paidAt = inv.paidAt instanceof Timestamp
      ? inv.paidAt.toDate()
      : new Date(inv.paidAt as Date);
    return paidAt >= dateRange.from && paidAt <= dateRange.to;
  });

  // Group by product
  const productMap = new Map<string, PaymentReport>();

  filteredInvoices.forEach(inv => {
    const productId = inv.productId || 'no-product';
    const productName = inv.productName || 'Uncategorized';
    
    if (!productMap.has(productId)) {
      productMap.set(productId, {
        productId,
        productName,
        total: 0,
        monthly: {},
      });
    }

    const report = productMap.get(productId)!;
    report.total += inv.amountDue;

    // Add to monthly breakdown
    const paidAt = inv.paidAt instanceof Timestamp
      ? inv.paidAt.toDate()
      : new Date(inv.paidAt as Date);
    const monthKey = `${paidAt.getFullYear()}-${String(paidAt.getMonth() + 1).padStart(2, '0')}`;
    
    report.monthly[monthKey] = (report.monthly[monthKey] || 0) + inv.amountDue;
  });

  return Array.from(productMap.values()).sort((a, b) => b.total - a.total);
}

export async function getPaymentInsights(clubId: string): Promise<PaymentInsight> {
  // Get invoices that require action
  const invoicesQuery = query(
    collection(db, INVOICES_COLLECTION),
    where('clubId', '==', clubId),
    where('status', 'in', ['past_due', 'uncollectible'])
  );
  const invoicesSnap = await getDocs(invoicesQuery);
  const requiresAction = invoicesSnap.size;

  // Calculate estimated payments in next 30 days
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const openInvoicesQuery = query(
    collection(db, INVOICES_COLLECTION),
    where('clubId', '==', clubId),
    where('status', '==', 'open')
  );
  const openInvoicesSnap = await getDocs(openInvoicesQuery);
  let estimatedInvoiceRevenue = 0;
  openInvoicesSnap.forEach(doc => {
    const inv = doc.data() as Invoice;
    const dueDate = inv.dueDate instanceof Timestamp
      ? inv.dueDate.toDate()
      : new Date(inv.dueDate as Date);
    if (dueDate <= thirtyDaysFromNow) {
      estimatedInvoiceRevenue += inv.amountDue;
    }
  });

  // Get active subscriptions for recurring revenue
  const subsQuery = query(
    collection(db, SUBSCRIPTIONS_COLLECTION),
    where('clubId', '==', clubId),
    where('status', '==', 'active')
  );
  const subsSnap = await getDocs(subsQuery);
  
  let monthlyRevenue = 0;
  let quarterlyRevenue = 0;
  let annuallyRevenue = 0;
  let estimatedSubRevenue = 0;

  const products = await getProducts(clubId);
  const productPriceMap = new Map<string, ProductPrice[]>();
  products.forEach(p => {
    productPriceMap.set(p.id!, p.prices);
  });

  subsSnap.forEach(doc => {
    const sub = doc.data() as Subscription;
    const prices = productPriceMap.get(sub.productId) || [];
    const activePrice = prices.find(p => p.active && p.type === 'recurring');
    
    if (activePrice) {
      const amount = activePrice.amount;
      switch (sub.plan.toLowerCase()) {
        case 'monthly':
          monthlyRevenue += amount;
          estimatedSubRevenue += amount;
          break;
        case 'quarterly':
          quarterlyRevenue += amount;
          if (sub.currentPeriodEnd) {
            const periodEnd = sub.currentPeriodEnd instanceof Timestamp
              ? sub.currentPeriodEnd.toDate()
              : new Date(sub.currentPeriodEnd as Date);
            if (periodEnd <= thirtyDaysFromNow) {
              estimatedSubRevenue += amount;
            }
          }
          break;
        case 'annually':
          annuallyRevenue += amount;
          break;
      }
    }
  });

  return {
    requiresAction,
    estimatedPayments30Days: {
      invoices: estimatedInvoiceRevenue,
      subscriptions: estimatedSubRevenue,
    },
    recurringRevenue: {
      monthly: monthlyRevenue,
      quarterly: quarterlyRevenue,
      annually: annuallyRevenue,
    },
  };
}

// ============ PAYMENT TIMELINE DATA ============

export async function getPaymentTimeline(
  clubId: string,
  dateRange: { from: Date; to: Date }
): Promise<{ date: string; amount: number }[]> {
  const q = query(
    collection(db, INVOICES_COLLECTION),
    where('clubId', '==', clubId),
    where('status', '==', 'paid')
  );

  const querySnapshot = await getDocs(q);
  const invoices = querySnapshot.docs.map(doc => doc.data() as Invoice);

  // Filter and group by date
  const dateMap = new Map<string, number>();

  invoices.forEach(inv => {
    const paidAt = inv.paidAt instanceof Timestamp
      ? inv.paidAt.toDate()
      : new Date(inv.paidAt as Date);
    
    if (paidAt >= dateRange.from && paidAt <= dateRange.to) {
      const dateKey = paidAt.toISOString().split('T')[0];
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + inv.amountDue);
    }
  });

  // Convert to array and sort by date
  return Array.from(dateMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
