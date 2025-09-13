import { useState } from "react";
import { AuthContext } from "./AuthContext";
import type { ReactNode } from "react";


export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string>("");

    const updateToken = (newToken: string) =>
        setToken(newToken);

    return (
        <AuthContext.Provider value={{ token, updateToken }}>
            {children}
        </AuthContext.Provider>
    );
}