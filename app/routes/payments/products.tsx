import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/dashboard-layout";
import { Heading } from "../../components/heading";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Dialog, DialogTitle, DialogBody, DialogActions } from "../../components/dialog";
import { useAuth } from "../../context/auth-context";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "../../components/table";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EllipsisHorizontalIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import {
  getProducts,
  createProduct,
  updateProduct,
  archiveProduct,
  getProductCategories,
  createProductCategory,
  type Product,
  type ProductCategory,
  type ProductPrice,
} from "../../lib/firestore-payments";
import { formatCurrency, formatDate } from "../../lib/stripe";
import * as Headless from "@headlessui/react";
import { Timestamp } from "firebase/firestore";

type TabType = "all" | "taxes" | "archived";

const TABS: { id: TabType; label: string }[] = [
  { id: "all", label: "All products" },
  { id: "taxes", label: "Taxes" },
  { id: "archived", label: "Archived" },
];

export default function ProductsPage() {
  const { activeClub } = useAuth();
  const clubId = activeClub?.id || "";

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [inlineNewCategory, setInlineNewCategory] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    category: "",
    priceAmount: 0,
    priceType: "one_time" as "one_time" | "recurring",
    interval: "month" as "day" | "week" | "month" | "year",
  });

  useEffect(() => {
    if (!clubId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const isArchived = activeTab === "archived";
        const [productsResult, categoriesResult] = await Promise.all([
          getProducts(clubId, { archived: isArchived }),
          getProductCategories(clubId),
        ]);
        setProducts(productsResult);
        setCategories(categoriesResult);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [clubId, activeTab]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  });

  const handleCreateProduct = async () => {
    if (!clubId || !newProduct.title || !newProduct.category) return;

    try {
      const price: ProductPrice = {
        id: `price_${Date.now()}`,
        amount: newProduct.priceAmount,
        currency: "USD",
        type: newProduct.priceType,
        active: true,
      };

      if (newProduct.priceType === "recurring") {
        price.interval = newProduct.interval;
        price.intervalCount = 1;
      }

      await createProduct({
        title: newProduct.title,
        description: newProduct.description,
        category: newProduct.category,
        prices: newProduct.priceAmount > 0 ? [price] : [],
        archived: false,
        clubId,
      });

      // Refresh list
      const refreshed = await getProducts(clubId, { archived: false });
      setProducts(refreshed);

      setIsNewProductOpen(false);
      setNewProduct({
        title: "",
        description: "",
        category: "",
        priceAmount: 0,
        priceType: "one_time",
        interval: "month",
      });
      setInlineNewCategory("");
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  const handleArchiveProduct = async (productId: string) => {
    try {
      await archiveProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error archiving product:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!clubId || !newCategoryName) return;

    try {
      await createProductCategory({
        name: newCategoryName,
        clubId,
      });

      const refreshedCategories = await getProductCategories(clubId);
      setCategories(refreshedCategories);
      setNewCategoryName("");
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleCreateCategoryInline = async () => {
    if (!clubId || !inlineNewCategory.trim()) return;

    try {
      setIsCreatingCategory(true);
      await createProductCategory({
        name: inlineNewCategory.trim(),
        clubId,
      });

      const refreshedCategories = await getProductCategories(clubId);
      setCategories(refreshedCategories);
      setNewProduct((prev) => ({ ...prev, category: inlineNewCategory.trim() }));
      setInlineNewCategory("");
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const getActivePrice = (product: Product): string => {
    const activePrice = product.prices.find((p) => p.active);
    if (!activePrice) return "No active prices";
    
    const amount = formatCurrency(activePrice.amount, activePrice.currency);
    if (activePrice.type === "recurring") {
      return `${amount}/${activePrice.interval}`;
    }
    return amount;
  };

  const getDateValue = (date: Date | Timestamp | undefined): Date | undefined => {
    if (!date) return undefined;
    if (date instanceof Timestamp) return date.toDate();
    return date;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <Heading>Products</Heading>

        {/* Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <nav className="-mb-px flex gap-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`border-b-2 pb-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                    : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9"
              />
            </div>
            <Button outline className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button outline onClick={() => setIsCategoriesOpen(true)}>
              Categories
            </Button>
            <Button
              color="blue"
              className="flex items-center gap-2"
              onClick={() => setIsNewProductOpen(true)}
            >
              <PlusIcon className="h-4 w-4" />
              Create
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Product title</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader className="text-right">Price</TableHeader>
                <TableHeader>Created at</TableHeader>
                <TableHeader className="w-10"></TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-zinc-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-zinc-500">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium text-blue-600">
                      {product.title}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right text-zinc-500">
                      {getActivePrice(product)}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {formatDate(getDateValue(product.createdAt as any))}
                    </TableCell>
                    <TableCell>
                      <Headless.Menu as="div" className="relative">
                        <Headless.MenuButton className="rounded p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                          <EllipsisHorizontalIcon className="h-5 w-5 text-zinc-400" />
                        </Headless.MenuButton>
                        <Headless.MenuItems className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-zinc-800 dark:ring-white/10">
                          <Headless.MenuItem>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? "bg-zinc-100 dark:bg-zinc-700" : ""
                                } block w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300`}
                              >
                                Edit product
                              </button>
                            )}
                          </Headless.MenuItem>
                          <Headless.MenuItem>
                            {({ active }) => (
                              <button
                                className={`${
                                  active ? "bg-zinc-100 dark:bg-zinc-700" : ""
                                } block w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300`}
                              >
                                Add price
                              </button>
                            )}
                          </Headless.MenuItem>
                          {!product.archived && (
                            <Headless.MenuItem>
                              {({ active }) => (
                                <button
                                  onClick={() => handleArchiveProduct(product.id!)}
                                  className={`${
                                    active ? "bg-red-50 dark:bg-red-900/20" : ""
                                  } block w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400`}
                                >
                                  Archive product
                                </button>
                              )}
                            </Headless.MenuItem>
                          )}
                        </Headless.MenuItems>
                      </Headless.Menu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="text-sm text-zinc-500">
          Showing 1 to {filteredProducts.length}
          <br />
          <span className="text-zinc-400">of {filteredProducts.length} results</span>
        </div>

        {/* New Product Dialog */}
        <Dialog
          open={isNewProductOpen}
          onClose={() => {
            setIsNewProductOpen(false);
            setInlineNewCategory("");
          }}
        >
          <DialogTitle>Create New Product</DialogTitle>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Product Title
                </label>
                <Input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="Enter product title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description (optional)
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  rows={3}
                  placeholder="Enter product description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Category
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <Input
                    type="text"
                    value={inlineNewCategory}
                    onChange={(e) => setInlineNewCategory(e.target.value)}
                    placeholder="Or create new category"
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        void handleCreateCategoryInline();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    outline
                    onClick={handleCreateCategoryInline}
                    disabled={!inlineNewCategory.trim() || isCreatingCategory}
                  >
                    {isCreatingCategory ? "Adding…" : "Add"}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Price Type
                </label>
                <select
                  value={newProduct.priceType}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      priceType: e.target.value as "one_time" | "recurring",
                    })
                  }
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="one_time">One-time payment</option>
                  <option value="recurring">Recurring subscription</option>
                </select>
              </div>
              {newProduct.priceType === "recurring" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Billing Interval
                  </label>
                  <select
                    value={newProduct.interval}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        interval: e.target.value as typeof newProduct.interval,
                      })
                    }
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    <option value="day">Daily</option>
                    <option value="week">Weekly</option>
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Price Amount (USD)
                </label>
                <Input
                  type="number"
                  value={newProduct.priceAmount}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, priceAmount: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button outline onClick={() => setIsNewProductOpen(false)}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleCreateProduct}>
              Create Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Categories Dialog */}
        <Dialog open={isCategoriesOpen} onClose={() => setIsCategoriesOpen(false)}>
          <DialogTitle>Product Categories</DialogTitle>
          <DialogBody>
            <div className="space-y-4">
              {/* Add new category */}
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-1"
                />
                <Button color="blue" onClick={handleCreateCategory}>
                  Add
                </Button>
              </div>

              {/* Existing categories */}
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="py-4 text-center text-sm text-zinc-500">
                    No categories yet. Create one above.
                  </p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-2">
                        <TagIcon className="h-4 w-4 text-zinc-400" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                          {cat.name}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button outline onClick={() => setIsCategoriesOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
