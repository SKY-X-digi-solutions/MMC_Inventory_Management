export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  showroom: string;
}

const STORAGE_KEY = "mmc_inventory_auth_user";

// Hardcoded authorized credentials for Dealership Inventory
export const HARDCODED_USERS: { email: string; aliases: string[]; password: string; user: AuthUser }[] = [
  {
    email: "admin@maruthimotors.com",
    aliases: ["admin", "admin@maruthimotors.com"],
    password: "admin123",
    user: {
      id: "usr_admin_01",
      name: "Dealership Admin",
      email: "admin@maruthimotors.com",
      role: "Inventory Administrator",
      showroom: "Tirupattur HQ",
    },
  },
  {
    email: "inventory@maruthimotors.com",
    aliases: ["inventory", "inventory@maruthimotors.com"],
    password: "mmc123",
    user: {
      id: "usr_inv_02",
      name: "Stock Yard Manager",
      email: "inventory@maruthimotors.com",
      role: "Yard Supervisor",
      showroom: "Tirupattur HQ",
    },
  },
];

export class AuthService {
  static getCurrentUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  static login(identifier: string, password: string): AuthUser {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const matched = HARDCODED_USERS.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.aliases.includes(cleanId)) &&
        u.password === cleanPass
    );

    if (!matched) {
      throw new Error("Invalid username or password. Please verify your credentials.");
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matched.user));
    }

    return matched.user;
  }

  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "/login";
    }
  }
}

