import { createContext } from "react";

interface AuthContextType {
    token: string;
    updateToken: (token: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
