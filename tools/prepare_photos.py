"""Convert new couple photos into optimised WebP assets for the site.

Drop photos into images/new/ (jpg, jpeg, png or webp), named after their slot:
    hero, story, rings, church, closing   (any other name is kept as-is)

Then run from the project folder:
    python tools/prepare_photos.py

For each photo this writes images/<name>.webp (long edge max 1600px) and a tiny
pre-blurred images/<name>-blur.webp backdrop, and prints the width/height to use
in the <img> tags.
"""
import os
import sys
from PIL import Image, ImageFilter, ImageOps, ImageStat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "images", "new")
OUT = os.path.join(ROOT, "images")
EXTS = (".jpg", ".jpeg", ".png", ".webp")
MAX_EDGE = 1600


def trim_white_border(img, threshold=235, max_px=12):
    """Remove thin white/near-white borders that image generators often leave."""
    gray = img.convert("L")
    w, h = gray.size

    def is_light_row(y):
        return ImageStat.Stat(gray.crop((0, y, w, y + 1))).mean[0] > threshold

    def is_light_col(x):
        return ImageStat.Stat(gray.crop((x, 0, x + 1, h))).mean[0] > threshold

    top = next((y for y in range(max_px) if not is_light_row(y)), 0)
    bottom = next((y for y in range(max_px) if not is_light_row(h - 1 - y)), 0)
    left = next((x for x in range(max_px) if not is_light_col(x)), 0)
    right = next((x for x in range(max_px) if not is_light_col(w - 1 - x)), 0)
    return img.crop((left, top, w - right, h - bottom))


def main():
    if not os.path.isdir(SRC):
        sys.exit("No images/new/ folder found. Create it and add your photos first.")
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(EXTS))
    if not files:
        sys.exit("images/new/ is empty.")

    for f in files:
        name = os.path.splitext(f)[0].lower().replace(" ", "-")
        img = ImageOps.exif_transpose(Image.open(os.path.join(SRC, f))).convert("RGB")
        img = trim_white_border(img)
        img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        img.save(os.path.join(OUT, name + ".webp"), "WEBP", quality=82, method=6)

        small = img.copy()
        small.thumbnail((360, 360))
        small.filter(ImageFilter.GaussianBlur(9)).save(
            os.path.join(OUT, name + "-blur.webp"), "WEBP", quality=70, method=6)

        size_kb = os.path.getsize(os.path.join(OUT, name + ".webp")) // 1024
        print(f'{name}.webp  width="{img.width}" height="{img.height}"  {size_kb} KB')


if __name__ == "__main__":
    main()
