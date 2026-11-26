#!/usr/bin/env python3
"""Contrôle technique du rendu final : format, cadence, durée, codecs, loudness, crête."""
import json, subprocess, sys
from pathlib import Path
p = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "output/mccg-pub-1080x1920.mp4")
info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(p)], capture_output=True, text=True, check=True).stdout)
v = next(s for s in info["streams"] if s["codec_type"] == "video"); a = next(s for s in info["streams"] if s["codec_type"] == "audio")
lo = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(p), "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
I = float(lo.split("I:")[-1].split("LUFS")[0]); TP = float(lo.split("Peak:")[-1].split("dBFS")[0])
checks = {
    "1080x1920": (v["width"], v["height"]) == (1080, 1920),
    "30 fps": v["r_frame_rate"] == "30/1",
    "H.264": v["codec_name"] == "h264",
    "yuv420p": v["pix_fmt"] == "yuv420p",
    "AAC 48 kHz": a["codec_name"] == "aac" and a["sample_rate"] == "48000",
    f"loudness {I} LUFS (-14 ±1)": abs(I + 14) <= 1,
    f"true peak {TP} dBFS (≤ -0.5)": TP <= -0.5,
}
print(f"{p.name} : {float(info['format']['duration']):.2f} s, {int(info['format']['bit_rate'])/1e6:.1f} Mb/s, {p.stat().st_size/1e6:.1f} Mo")
for k, ok in checks.items():
    print(("OK  " if ok else "ÉCHEC ") + k)
sys.exit(0 if all(checks.values()) else 1)
