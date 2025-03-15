import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { verifyUser as fetchVerifyUser } from "@/service/userService";
import { AuthUser } from "@/lib/types";

interface AuthContextType {
  user: any;
  loading: boolean;
  verifyUser: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const verifyUser = async () => {
    setLoading(true);
    try {
      const userData = await fetchVerifyUser();
      setUser(userData);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Add refreshUser function - similar to verifyUser but doesn't set loading to true initially
  const refreshUser = async () => {
    try {
      const userData = await fetchVerifyUser();
      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  const logout = () => {
    setUser(undefined);
    ["token", "userId", "companyId", "role", "userName", "userEmail"].forEach((key) =>
      localStorage.removeItem(key)
    );

    router.replace("/");
  };


  useEffect(() => {
    verifyUser();
    const handleStorageChange = (e: StorageEvent) => {
      if (["token", "userId", "companyId", "role", "userName", "userEmail"].includes(e.key || "")) {
        verifyUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, verifyUser, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};
