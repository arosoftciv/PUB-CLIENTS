#!/usr/bin/env python3
"""Contrôle technique des MP4 livrés : codecs, résolution, FPS, durée, audio, loudness."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def probe(p: Path) -> dict:
    out = subprocess.run(["ffprobe", "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def loudness(p: Path) -> dict:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(p), "-vn", "-af", "loudnorm=print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    return json.loads(r.stderr[r.stderr.rindex("{"): r.stderr.rindex("}") + 1])


def main() -> None:
    files = sorted((ROOT / "output").glob("*.mp4"))
    report = []
    ok_all = True
    for f in files:
        d = probe(f)
        v = next(s for s in d["streams"] if s["codec_type"] == "video")
        a = next((s for s in d["streams"] if s["codec_type"] == "audio"), None)
        fps = eval(v["r_frame_rate"])  # noqa: S307 (fraction ffprobe)
        ln = loudness(f) if a else {}
        checks = {
            "h264": v["codec_name"] == "h264",
            "aac": bool(a) and a["codec_name"] == "aac",
            "48kHz": bool(a) and a["sample_rate"] == "48000",
            "30fps": abs(fps - 30) < 0.01,
            "9:16": int(v["width"]) * 16 == int(v["height"]) * 9,
            "loudness≈-14": bool(ln) and abs(float(ln["input_i"]) + 14) <= 1.0,
            "truepeak≤-1": bool(ln) and float(ln["input_tp"]) <= -0.9,
        }
        ok = all(checks.values())
        ok_all &= ok
        report.append({"file": f.name, "size_mb": round(f.stat().st_size / 1e6, 1), "res": f"{v['width']}x{v['height']}",
                       "duration_s": round(float(d["format"]["duration"]), 2), "lufs": ln.get("input_i"), "tp": ln.get("input_tp"),
                       "checks": checks, "ok": ok})
        print(("OK  " if ok else "ÉCHEC ") + f.name, {k: v for k, v in checks.items() if not v} or "")
    (ROOT / "output/validate-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))
    sys.exit(0 if ok_all else 1)


if __name__ == "__main__":
    main()
