export interface LrcLine {
    time: number;
    text: string;
}

const TIME_RE = /\[(\d{1,2}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;

export function parseLrc(raw: string | null | undefined): LrcLine[] {
    if (!raw) return [];
    const out: LrcLine[] = [];

    for (const rawLine of raw.split(/\r?\n/)) {
        TIME_RE.lastIndex = 0;
        const stamps: number[] = [];
        let m: RegExpExecArray | null;
        let lastEnd = 0;
        while ((m = TIME_RE.exec(rawLine))) {
            const min = parseInt(m[1], 10);
            const sec = parseInt(m[2], 10);
            const frac = m[3] ? parseInt(m[3].padEnd(3, "0").slice(0, 3), 10) / 1000 : 0;
            stamps.push(min * 60 + sec + frac);
            lastEnd = m.index + m[0].length;
        }
        if (stamps.length === 0) continue;

        const text = rawLine.slice(lastEnd).trim();
        for (const t of stamps) out.push({ time: t, text });
    }

    out.sort((a, b) => a.time - b.time);
    return out;
}

export function findActiveLine(lines: LrcLine[], currentTime: number): number {
    if (lines.length === 0) return -1;
    let lo = 0;
    let hi = lines.length - 1;
    let ans = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (lines[mid].time <= currentTime) {
            ans = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return ans;
}
