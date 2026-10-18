import { Link } from "react-router";

export function Register() {
    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Create an account</h1>
            <p>
                Already have one? <Link to="/login">Sign in</Link>
            </p>
        </main>
    );
}
