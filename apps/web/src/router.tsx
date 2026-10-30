import { createBrowserRouter } from "react-router";

import { App } from "./App.tsx";
import { RequireAuth } from "./auth/require-auth.tsx";
import { AppLayout } from "./layout.tsx";
import { Login } from "./pages/login.tsx";
import { NotFound } from "./pages/not-found.tsx";
import { Register } from "./pages/register.tsx";
import { RoutesPage } from "./pages/routes.tsx";

export const router = createBrowserRouter([
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: "/", element: <App /> },
                    { path: "/routes", element: <RoutesPage /> },
                ],
            },
        ],
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "*", element: <NotFound /> },
]);
