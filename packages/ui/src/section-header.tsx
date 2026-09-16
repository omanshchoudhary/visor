type SectionHeaderProps = {
    index: string;
    title: string;
    note?: string;
};

export function SectionHeader({ index, title, note }: SectionHeaderProps) {
    return (
        <div className="label flex items-center justify-between gap-6 border-b border-line px-6 py-4">
            <span className="text-fg">
                {index} / {title}
            </span>
            {note ? <span className="hidden text-right sm:inline">{note}</span> : null}
        </div>
    );
}
