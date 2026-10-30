import { Navigate, Outlet, useLocation } from "react-router";

import { PageSpinner } from "../components/spinner.tsx";
import { useAuth } from "./context.ts";

export function RequireAuth() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <PageSpinner />;
    if (user === null) return <Navigate to="/login" replace state={{ from: location }} />;
    return <Outlet />;
}
