import { AlertCircle, Label, TriangleUp } from "@visorhq/ui";

const points = [
    60, 57, 59, 51, 54, 46, 49, 40, 43, 35, 38, 29, 32, 23, 27, 19, 22, 15, 20, 13, 17, 11, 14, 9,
];

const width = 518;
const height = 84;
const step = width / (points.length - 1);
const linePath = points
    .map((y, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${y}`)
    .join(" ");
const areaPath = `${linePath} L ${width} ${height - 1} L 0 ${height - 1} Z`;

type StatProps = {
    label: string;
    value: string;
    unit: string;
    delta: string;
    bad?: boolean;
};

function Stat({ label, value, unit, delta, bad }: StatProps) {
    return (
        <div className="flex flex-col gap-2 bg-window px-5 py-4">
            <Label>{label}</Label>
            <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[26px] font-bold tracking-[-0.02em] text-fg">
                    {value}
                </span>
                <span className="text-xs text-fg-2">{unit}</span>
            </div>
            <div
                className={`flex items-center gap-1 text-[11px] ${bad ? "text-critical" : "text-fg-2"}`}
            >
                <TriangleUp size={9} />
                <span>{delta}</span>
            </div>
        </div>
    );
}

export function HeroPreview() {
    return (
        <div className="flex flex-col border border-line-strong border-t-2 border-t-accent bg-window shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
                <div className="flex items-center gap-2.5 text-xs text-fg-2">
                    <span className="size-[7px] rounded-full bg-good" />
                    <span className="text-muted">acme /</span>
                    <span className="text-fg">shop-api</span>
                    <span className="text-muted">/ Overview</span>
                </div>
                <Label className="border border-accent px-2 py-1 text-accent">Last 1h</Label>
            </div>
            <div className="grid grid-cols-3 gap-px border-b border-line bg-line">
                <Stat label="Error rate" value="0.42" unit="%" delta="0.18 pts" bad />
                <Stat label="p95" value="212" unit="ms" delta="19 ms" bad />
                <Stat label="Requests" value="3.1k" unit="/min" delta="4.2%" />
            </div>
            <div className="flex flex-col gap-2.5 border-b border-line px-5 pt-4 pb-3">
                <div className="flex items-center justify-between">
                    <Label>Requests per minute</Label>
                    <Label>60 min</Label>
                </div>
                <svg viewBox={`0 0 ${width} ${height}`} className="block w-full overflow-visible">
                    <line x1="0" x2={width} y1={height - 1} y2={height - 1} stroke="#262624" />
                    <path
                        d={areaPath}
                        fill="#c98500"
                        fillOpacity="0.1"
                        className="animate-fade-area"
                    />
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#c98500"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray={1}
                        className="animate-draw"
                    />
                    <circle
                        cx={width}
                        cy={points[points.length - 1]}
                        r="4"
                        fill="#c98500"
                        stroke="#101010"
                        strokeWidth="2"
                        className="animate-fade-dot"
                    />
                </svg>
            </div>
            <div className="flex flex-col gap-2 border-b border-line px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                    <AlertCircle className="text-critical" />
                    <Label className="text-critical">Regression</Label>
                    <span className="text-[11px] text-muted">
                        First seen 09:12 · release a1f9c2e
                    </span>
                </div>
                <div className="truncate text-[13px] text-fg">
                    TypeError: Cannot read properties of undefined (reading 'total')
                </div>
                <div className="text-xs text-fg-2">POST /checkout · 1,284 events · p95 380 ms</div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-xs text-fg-2">
                <div className="flex items-center gap-2">
                    <span className="text-accent">→</span>
                    <span>Alert sent to #ops · 09:14</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="size-2 bg-good" />
                    <span>Resolved 10:26 · deploy 7c3d0e1</span>
                </div>
            </div>
        </div>
    );
}
