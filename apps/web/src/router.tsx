import { createBrowserRouter } from "react-router";

import { App } from "./App.tsx";
import { Login } from "./pages/login.tsx";
import { NotFound } from "./pages/not-found.tsx";
import { Register } from "./pages/register.tsx";

export const router = createBrowserRouter([
    { path: "/", element: <App /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "*", element: <NotFound /> },
]);
