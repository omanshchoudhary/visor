import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import { api, setAccessToken } from "../api/client.ts";
import { AuthContext } from "./context.ts";
import type { User } from "./context.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let ignore = false;

        // the client refreshes on a 401 by itself, so one call restores the session
        async function load() {
            try {
                const me = await api.get<User>("/users/me");
                if (!ignore) setUser(me);
            } catch {
                setAccessToken(undefined);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        void load();
        return () => {
            ignore = true;
        };
    }, []);

    async function login(email: string, password: string) {
        const body = await api.post<{ user: User; accessToken: string }>("/auth/login", {
            email,
            password,
        });
        setAccessToken(body.accessToken);
        setUser(body.user);
    }

    async function logout() {
        try {
            await api.post("/auth/logout");
        } finally {
            setAccessToken(undefined);
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
