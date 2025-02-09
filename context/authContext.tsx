import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { verifyUser as fetchVerifyUser, logout as authLogout } from "@/service/userService";

interface AuthContextType {
  user: any;
  loading: boolean;
  verifyUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
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

  const logout = () => {
    authLogout();
    setUser(null);
    router.push("/");
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

  return <AuthContext.Provider value={{ user, loading, verifyUser, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};
