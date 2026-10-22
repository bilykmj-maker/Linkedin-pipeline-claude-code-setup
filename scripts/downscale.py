#!/usr/bin/env python3
"""Даунскейл 2160×2160 → 1080×1080 через LANCZOS.
Використання: python3 scripts/downscale.py <input-2x.png> <output-1080.png>
"""
import sys
from PIL import Image

if len(sys.argv) != 3:
    sys.exit("Usage: python3 scripts/downscale.py <input-2x.png> <output-1080.png>")

src, dst = sys.argv[1], sys.argv[2]
img = Image.open(src)
img = img.resize((1080, 1080), Image.LANCZOS)
img.save(dst, "PNG", optimize=True)
print(f"OK: {dst} ({img.size[0]}×{img.size[1]})")
