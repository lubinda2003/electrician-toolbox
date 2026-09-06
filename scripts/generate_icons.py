"""Generate PWA PNG icons for Electrician Toolbox.

Produces icon-192.png, icon-512.png (transparent-safe, on dark rounded
background matching favicon.svg) and icon-maskable-512.png (bolt inset
further from the edges, full-bleed background, for adaptive icon masks).
"""
from PIL import Image, ImageDraw
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
os.makedirs(OUT_DIR, exist_ok=True)

BG = (23, 24, 26, 255)  # #17181a
ACCENT = (217, 119, 6, 255)  # #d97706


def bolt_points(size, inset_ratio):
    """Lightning bolt polygon scaled to `size`, inset by inset_ratio."""
    # Base points from the favicon viewBox (0-100), same shape.
    base = [
        (55, 15), (28, 55), (46, 55), (40, 85), (74, 42), (54, 42),
    ]
    inset = size * inset_ratio
    scale = (size - 2 * inset) / 100
    return [(inset + x * scale, inset + y * scale) for x, y in base]


def make_icon(size, corner_radius_ratio, inset_ratio, filename):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * corner_radius_ratio)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=BG)
    draw.polygon(bolt_points(size, inset_ratio), fill=ACCENT)
    img.save(os.path.join(OUT_DIR, filename))
    print(f"wrote {filename} ({size}x{size})")


make_icon(192, corner_radius_ratio=0.2, inset_ratio=0.15, filename="icon-192.png")
make_icon(512, corner_radius_ratio=0.2, inset_ratio=0.15, filename="icon-512.png")
# Maskable icons need extra safe-zone padding (~20%) since OS masks crop edges.
make_icon(512, corner_radius_ratio=0.0, inset_ratio=0.28, filename="icon-maskable-512.png")
