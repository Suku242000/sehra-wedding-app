import { 
  UserRoleType, 
  PackageTypeValue, 
  VendorTypeValue,
  User,
  Task, 
  Guest, 
  BudgetItem, 
  VendorProfile, 
  VendorBooking
} from "@shared/schema";

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRoleType) => Promise<void>;
  logout: () => void;
  selectPackage: (packageType: PackageTypeValue) => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// Dashboard types
export interface DashboardStats {
  completedTasks: number;
  totalTasks: number;
  progress: number;
  daysLeft: number;
  pendingTasks: number;
  totalGuests: number;
  confirmedGuests: number;
  vendorsBooked: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Form input types
export interface LoginFormInputs {
  email: string;
  password: string;
}

export interface RegisterFormInputs {
  name: string;
  email: string;
  password: string;
  role: UserRoleType;
}

export interface PackageSelectionInput {
  package: PackageTypeValue;
}

export interface TaskFormInputs {
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  priority?: string;
}

export interface GuestFormInputs {
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  status: string;
  side?: string;
  plusOnes?: number;
  notes?: string;
}

export interface BudgetItemFormInputs {
  category: string;
  item: string;
  estimatedCost: number;
  actualCost?: number;
  paid?: boolean;
  vendorId?: number;
  notes?: string;
}

export interface VendorProfileFormInputs {
  vendorType: VendorTypeValue;
  businessName: string;
  description?: string;
  location?: string;
  priceRange?: string;
}

export interface VendorBookingFormInputs {
  vendorId: number;
  eventDate: string;
  details?: string;
}

export interface WeddingDateFormInputs {
  weddingDate: string;
}

// Chart data types
export interface BudgetChartData {
  category: string;
  amount: number;
  color: string;
}

// Package information
export interface PackageInfo {
  name: string;
  price: string;
  features: string[];
  isPopular: boolean;
}

export const PACKAGES: Record<PackageTypeValue, PackageInfo> = {
  silver: {
    name: "Silver",
    price: "₹25,000",
    features: [
      "Guest Management",
      "Task Tracking",
      "Budget Basics"
    ],
    isPopular: false
  },
  gold: {
    name: "Gold",
    price: "₹65,000",
    features: [
      "All Silver Features",
      "Premium Vendor Access",
      "Dedicated Supervisor"
    ],
    isPopular: true
  },
  platinum: {
    name: "Platinum",
    price: "₹125,000",
    features: [
      "All Gold Features",
      "Elite Venue Options",
      "Full Event Coordination"
    ],
    isPopular: false
  }
};

// Vendor category information
export interface VendorCategoryInfo {
  label: string;
  value: VendorTypeValue;
  icon: string;
}

export const VENDOR_CATEGORIES: VendorCategoryInfo[] = [
  { label: "Hotel & Venue", value: "hotel", icon: "building" },
  { label: "Photography", value: "photographer", icon: "camera" },
  { label: "Videography", value: "videographer", icon: "video" },
  { label: "Catering", value: "catering", icon: "utensils" },
  { label: "Makeup Artist", value: "makeup", icon: "magic" },
  { label: "Hairdresser", value: "hairdresser", icon: "cut" },
  { label: "Decoration", value: "decoration", icon: "sparkles" },
  { label: "Mehandi", value: "mehandi", icon: "hand-sparkles" },
  { label: "DJ & Music", value: "dj", icon: "music" },
  { label: "Lighting", value: "lighting", icon: "lightbulb" }
];

// Budget categories
export const BUDGET_CATEGORIES = [
  "Venue & Catering",
  "Decoration",
  "Attire & Jewelry",
  "Photography & Video",
  "Music & Entertainment",
  "Transportation",
  "Invitations & Stationery",
  "Beauty & Spa",
  "Gifts & Favors",
  "Miscellaneous"
];
