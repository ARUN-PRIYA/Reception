"""Build the sharing kit for the published invitation.

Run from the project folder (needs Pillow and segno: pip install segno):
    python tools/make_share_assets.py

Writes:
    images/share-qr.jpg  1200x630 link-preview card with QR (WhatsApp / Instagram / Facebook)
    share/invite-qr.png    1080x1350 invitation card with a QR code to the site
    share/qr.png           plain QR code, for printing on cards
    share/message.txt      ready-to-paste message for friends
"""
import io
import os
import segno
from PIL import Image, ImageDraw, ImageFont, ImageOps

URL = "https://arun-priya.github.io/Reception/"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "tools", "fonts")
IMAGES = os.path.join(ROOT, "images")
SHARE = os.path.join(ROOT, "share")

FOREST = (11, 23, 19)
GOLD = (199, 161, 90)
CHAMPAGNE = (232, 214, 174)
IVORY = (247, 241, 231)


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


def centered(draw, cx, y, text, fnt, fill, spacing=0):
    """Draw text centred on cx; spacing adds letter-spacing in px."""
    if not spacing:
        w = draw.textlength(text, font=fnt)
        draw.text((cx - w / 2, y), text, font=fnt, fill=fill)
        return
    widths = [draw.textlength(ch, font=fnt) for ch in text]
    x = cx - (sum(widths) + spacing * (len(text) - 1)) / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=fnt, fill=fill)
        x += w + spacing


def cross(draw, cx, top, h, colour, width=3):
    draw.line((cx, top, cx, top + h), fill=colour, width=width)
    arm = h * 0.3
    draw.line((cx - arm, top + h * 0.28, cx + arm, top + h * 0.28), fill=colour, width=width)


def rule(draw, cx, y, half, colour):
    draw.line((cx - half, y, cx - 14, y), fill=colour, width=2)
    draw.line((cx + 14, y, cx + half, y), fill=colour, width=2)
    draw.regular_polygon((cx, y, 6), 4, fill=colour)


def cover(img, size):
    return ImageOps.fit(img, size, Image.LANCZOS, centering=(0.5, 0.35))


def preview_card():
    """Landscape link-preview card: details, QR and photo in one image, so a shared
    link arrives as a single chat message instead of separate image + text."""
    w, h = 1200, 630
    pw = 400
    card = Image.new("RGB", (w, h), FOREST)
    photo = Image.open(os.path.join(IMAGES, "evening.webp")).convert("RGB")
    card.paste(cover(photo, (pw, h)), (w - pw, 0))

    # soft fade from the text panel into the photo
    fade = Image.new("L", (140, h))
    for x in range(140):
        ImageDraw.Draw(fade).line((x, 0, x, h), fill=int(255 * (1 - x / 139)))
    card.paste(Image.new("RGB", (140, h), FOREST), (w - pw, 0), fade)

    d = ImageDraw.Draw(card)
    d.rectangle((14, 14, w - pw - 14, h - 15), outline=GOLD, width=1)

    cx = 215
    cross(d, cx, 62, 50, GOLD)
    centered(d, cx, 135, "THE WEDDING RECEPTION OF", font("Cinzel.ttf", 16), CHAMPAGNE, spacing=2)
    centered(d, cx, 170, "Arun & Priya", font("GreatVibes.ttf", 74), GOLD)
    rule(d, cx, 300, 140, GOLD)
    centered(d, cx, 330, "WEDNESDAY", font("Cinzel.ttf", 21), IVORY, spacing=3)
    centered(d, cx, 364, "11 NOVEMBER 2026", font("Cinzel.ttf", 21), IVORY, spacing=3)
    centered(d, cx, 402, "6:00 PM onwards", font("CormorantItalic.ttf", 30), CHAMPAGNE)
    centered(d, cx, 452, "FLORA PARK INN", font("Cinzel.ttf", 19), CHAMPAGNE, spacing=3)
    centered(d, cx, 482, "COIMBATORE", font("Cinzel.ttf", 19), CHAMPAGNE, spacing=3)

    # QR dead centre: when WhatsApp shrinks the preview to a centre-cropped square,
    # the QR is what stays visible
    qx = w // 2
    side = segno.make(URL, error="h").symbol_size(border=2)[0]
    qr = qr_image(260 // side, FOREST, IVORY)
    tile = qr.width + 24
    ty = (h - tile) // 2 - 18
    d.line((qx - 190, 120, qx - 190, h - 120), fill=(90, 76, 46), width=1)
    d.rounded_rectangle((qx - tile // 2, ty, qx + tile // 2, ty + tile), radius=14, fill=IVORY, outline=GOLD, width=2)
    card.paste(qr, (qx - qr.width // 2, ty + 12))
    centered(d, qx, ty + tile + 22, "SCAN TO OPEN", font("Cinzel.ttf", 18), GOLD, spacing=3)

    card.save(os.path.join(IMAGES, "share-qr.jpg"), "JPEG", quality=86, optimize=True, progressive=True)


def qr_image(scale, dark, light):
    qr = segno.make(URL, error="h")
    buf = io.BytesIO()
    qr.save(buf, kind="png", scale=scale, border=2, dark=dark, light=light)
    buf.seek(0)
    return Image.open(buf).convert("RGB")


def qr_card():
    """Portrait card to forward as an image; scanning opens the invitation."""
    w, h = 1080, 1350
    ph = 640
    card = Image.new("RGB", (w, h), FOREST)
    photo = Image.open(os.path.join(IMAGES, "evening.webp")).convert("RGB")
    card.paste(ImageOps.fit(photo, (w, ph), Image.LANCZOS, centering=(0.5, 0.12)), (0, 0))

    # photo fades into the text panel below it
    fade_h = 240
    fade = Image.new("L", (w, fade_h))
    for y in range(fade_h):
        ImageDraw.Draw(fade).line((0, y, w, y), fill=int(255 * y / (fade_h - 1)))
    card.paste(Image.new("RGB", (w, fade_h), FOREST), (0, ph - fade_h), fade)

    d = ImageDraw.Draw(card)
    d.rectangle((36, 36, w - 37, h - 37), outline=GOLD, width=2)
    d.rectangle((50, 50, w - 51, h - 51), outline=(120, 100, 60), width=1)

    cx = w // 2
    centered(d, cx, 590, "THE WEDDING RECEPTION OF", font("Cinzel.ttf", 26), CHAMPAGNE, spacing=3)
    centered(d, cx, 620, "Arun & Priya", font("GreatVibes.ttf", 116), GOLD)
    rule(d, cx, 800, 200, GOLD)
    centered(d, cx, 822, "WEDNESDAY · 11 NOVEMBER 2026 · 6:00 PM", font("Cinzel.ttf", 27), IVORY, spacing=2)
    centered(d, cx, 864, "Flora Park Inn, Coimbatore", font("CormorantItalic.ttf", 38), CHAMPAGNE)

    # QR on an ivory tile so every phone camera reads it reliably
    # whole-pixel modules (no resampling) keep the code crisp for scanners
    side = segno.make(URL, error="h").symbol_size(border=2)[0]
    qr = qr_image(7, FOREST, IVORY) if side * 7 <= 300 else qr_image(300 // side, FOREST, IVORY)
    tile = qr.width + 24
    tx, ty = cx - tile // 2, 930
    d.rounded_rectangle((tx, ty, tx + tile, ty + tile), radius=18, fill=IVORY, outline=GOLD, width=3)
    card.paste(qr, (cx - qr.width // 2, ty + 12))

    centered(d, cx, ty + tile + 18, "SCAN TO OPEN THE INVITATION", font("Cinzel.ttf", 24), GOLD, spacing=3)

    card.save(os.path.join(SHARE, "invite-qr.png"), optimize=True)
    qr_image(16, FOREST, IVORY).save(os.path.join(SHARE, "qr.png"))


MESSAGE = """✨ You're Invited ✨

With the grace of God and the blessings of our families,
we joyfully invite you and your family to our

\U0001F48D *Wedding Reception* \U0001F48D
*Arun Daniel & Priyadharshini*

\U0001F4C5 Wednesday, 11 November 2026
\0001F555 6:00 PM onwards
\U0001F4CD Flora Park Inn, Coimbatore

Tap to open our invitation \U0001F447
{url}

Your presence will make our day complete \U0001F64F
"""


def main():
    os.makedirs(SHARE, exist_ok=True)
    preview_card()
    qr_card()
    with open(os.path.join(SHARE, "message.txt"), "w", encoding="utf-8") as f:
        f.write(MESSAGE.format(url=URL))
    print("images/share-qr.jpg, share/invite-qr.png, share/qr.png, share/message.txt written")


if __name__ == "__main__":
    main()
