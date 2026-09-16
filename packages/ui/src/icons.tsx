type IconProps = {
    size?: number;
    className?: string;
};

export function ArrowUpRight({ size = 12, className }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 9 9 3" />
            <path d="M4 3h5v5" />
        </svg>
    );
}

export function ArrowDown({ size = 12, className }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M6 2v8" />
            <path d="m2.5 6.5 3.5 3.5 3.5-3.5" />
        </svg>
    );
}

export function ArrowRight({ className }: IconProps) {
    return (
        <svg
            width="28"
            height="12"
            viewBox="0 0 28 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M0 6h24" />
            <path d="m20 2 4 4-4 4" />
        </svg>
    );
}

export function TriangleUp({ size = 10, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 10 10" className={className}>
            <path d="M5 2 9 8H1Z" fill="currentColor" />
        </svg>
    );
}

export function TriangleDown({ size = 10, className }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 10 10" className={className}>
            <path d="M5 8 1 2h8Z" fill="currentColor" />
        </svg>
    );
}

export function AlertCircle({ size = 14, className }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={className}
        >
            <circle cx="7" cy="7" r="5.5" />
            <path d="M7 4.2v3.3" />
            <path d="M7 9.8h.01" />
        </svg>
    );
}

export function AlertTriangle({ size = 14, className }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M7 2 12.5 11.5h-11Z" />
            <path d="M7 6v2.6" />
            <path d="M7 10.4h.01" />
        </svg>
    );
}

export function Chevron({ size = 10, className }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m2.5 4 2.5 2.5L7.5 4" />
        </svg>
    );
}
