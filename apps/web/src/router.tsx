import { createBrowserRouter } from "react-router";

import { RequireAuth } from "./auth/require-auth.tsx";
import { AppLayout } from "./layout.tsx";
import { Login } from "./pages/login.tsx";
import { NotFound } from "./pages/not-found.tsx";
import { OrganizationPage } from "./pages/organization.tsx";
import { ProjectPage } from "./pages/project.tsx";
import { Overview } from "./pages/overview.tsx";
import { Register } from "./pages/register.tsx";
import { RoutesPage } from "./pages/routes.tsx";

export const router = createBrowserRouter([
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: "/", element: <Overview /> },
                    { path: "/orgs/:organizationId", element: <OrganizationPage /> },
                    {
                        path: "/orgs/:organizationId/projects/:projectId",
                        element: <ProjectPage />,
                    },
                    { path: "/routes", element: <RoutesPage /> },
                ],
            },
        ],
    },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "*", element: <NotFound /> },
]);
