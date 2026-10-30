import { cx } from "@visorhq/ui";

type SpinnerProps = {
    label?: string;
    className?: string;
};

export function Spinner({ label, className }: SpinnerProps) {
    return (
        <div className={cx("flex items-center gap-3", className)} role="status">
            <span className="size-4 animate-spin border-2 border-line-strong border-t-accent" />
            {label === undefined ? null : <span className="text-[13px] text-fg-2">{label}</span>}
        </div>
    );
}

export function PageSpinner({ label }: { label?: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-bg">
            <Spinner label={label} />
        </div>
    );
}
