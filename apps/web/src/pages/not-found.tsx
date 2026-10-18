import { Link } from "react-router";

export function NotFound() {
    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Not found</h1>
            <p>
                <Link to="/">Back to the dashboard</Link>
            </p>
        </main>
    );
}
