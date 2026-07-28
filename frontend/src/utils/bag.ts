export interface BagItem {
  id: string; // `${slug}-${size}-${color}`
  slug: string;
  name: string;
  collection: string;
  size: string;
  color?: string;
  price: number;
  image: string;
  quantity: number;
}

// Get logged-in user email if authenticated
export function getCurrentUserEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("sector_madness_user");
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (parsed && parsed.loggedIn && parsed.email) {
      return parsed.email;
    }
    return null;
  } catch {
    return null;
  }
}

// Get bag key tied exclusively to the logged-in user
function getBagKey(): string | null {
  const email = getCurrentUserEmail();
  if (!email) return null;
  return `sector_madness_bag_${email}`;
}

// Retrieve items from user's saved bag (returns [] if unauthenticated or empty)
export function getBagItems(): BagItem[] {
  if (typeof window === "undefined") return [];
  const key = getBagKey();
  if (!key) return []; // Do NOT access or create local storage if not signed in
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    return JSON.parse(saved) as BagItem[];
  } catch {
    return [];
  }
}

// Save items exclusively to the logged in user's account storage
export function saveBagItems(items: BagItem[]): boolean {
  if (typeof window === "undefined") return false;
  const key = getBagKey();
  if (!key) return false; // Fail gracefully without saving if not signed in
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event("sector_bag_change"));
    return true;
  } catch {
    return false;
  }
}

// Add product to bag (or increment quantity if identical size exists)
export function addItemToBag(item: Omit<BagItem, "id" | "quantity">, quantity = 1): { success: boolean; requiresAuth: boolean } {
  const email = getCurrentUserEmail();
  if (!email) {
    // If not signed in: Do not add product, do not create temp bag, do not use local storage
    return { success: false, requiresAuth: true };
  }

  const currentItems = getBagItems();
  const id = `${item.slug}-${item.size}-${item.color || "default"}`;
  const existingIndex = currentItems.findIndex((i) => i.id === id);

  if (existingIndex > -1) {
    currentItems[existingIndex].quantity += quantity;
  } else {
    currentItems.push({
      ...item,
      id,
      quantity,
    });
  }

  const saved = saveBagItems(currentItems);
  return { success: saved, requiresAuth: false };
}

// Update quantity of an item in the bag
export function updateItemQuantity(id: string, newQty: number): void {
  const currentItems = getBagItems();
  if (newQty <= 0) {
    removeItemFromBag(id);
    return;
  }
  const index = currentItems.findIndex((i) => i.id === id);
  if (index > -1) {
    currentItems[index].quantity = newQty;
    saveBagItems(currentItems);
  }
}

// Remove an item entirely from the bag
export function removeItemFromBag(id: string): void {
  const currentItems = getBagItems();
  const filtered = currentItems.filter((i) => i.id !== id);
  saveBagItems(filtered);
}
