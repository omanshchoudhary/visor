import { Navigate, Outlet } from "react-router";

import { PageSpinner } from "../components/spinner.tsx";
import { useAuth } from "./context.ts";

export function RequireAuth() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <PageSpinner />;
    if (user === null) return <Navigate to="/login" replace />;
    return <Outlet />;
}
