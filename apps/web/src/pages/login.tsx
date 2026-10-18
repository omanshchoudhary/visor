import { Link } from "react-router";

export function Login() {
    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Sign in</h1>
            <p>
                No account yet? <Link to="/register">Create one</Link>
            </p>
        </main>
    );
}
