import { createContext } from "react";
import { useState } from "react";
import type { ReactNode } from "react";

interface AuthContextType {
    token: string;
    updateToken: (token: string) => void;
    me: string;
    updateMe: (me: string) => void;
    id: number | null;
    updateId: (id: number) => void;
}



export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

    const [token, setToken] = useState("")
    function updateToken(newToken: string) { setToken(newToken) }
    const [me, setMe] = useState("")
    function updateMe(newMe: string) { setMe(newMe) }
    const [id, setId] = useState<number | null>(null)
    function updateId(newId: number) { setId(newId) }



    return (
        <AuthContext.Provider value={{
            token, updateToken,
            me, updateMe,
            id, updateId

        }}>
            {children}
        </AuthContext.Provider>
    );
}