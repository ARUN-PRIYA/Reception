"""Build the sharing kit for the published invitation.

Run from the project folder (needs Pillow and segno: pip install segno):
    python tools/make_share_assets.py

Writes:
    images/share.jpg       1200x630 link-preview card (WhatsApp / Instagram / Facebook)
    share/invite-qr.png    1080x1350 invitation card with a QR code to the site
    share/qr.png           plain QR code, for printing on cards
    share/message.txt      ready-to-paste message for friends
"""
import io
import os
import segno
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

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
    """Landscape card shown inside chat apps instead of a bare link."""
    w, h = 1200, 630
    card = Image.new("RGB", (w, h), FOREST)
    photo = Image.open(os.path.join(IMAGES, "hero.webp")).convert("RGB")
    card.paste(cover(photo, (520, h)), (w - 520, 0))

    # soft fade from the text panel into the photo
    fade = Image.new("L", (160, h))
    for x in range(160):
        ImageDraw.Draw(fade).line((x, 0, x, h), fill=int(255 * (1 - x / 159)))
    card.paste(Image.new("RGB", (160, h), FOREST), (w - 520, 0), fade)

    d = ImageDraw.Draw(card)
    cx = 360
    cross(d, cx, 70, 54, GOLD)
    centered(d, cx, 150, "THE WEDDING RECEPTION OF", font("Cinzel.ttf", 22), CHAMPAGNE, spacing=3)
    centered(d, cx, 195, "Arun & Priya", font("GreatVibes.ttf", 104), GOLD)
    rule(d, cx, 350, 170, GOLD)
    centered(d, cx, 385, "WEDNESDAY · 11 NOVEMBER 2026", font("Cinzel.ttf", 24), IVORY, spacing=2)
    centered(d, cx, 425, "6:00 PM onwards", font("CormorantItalic.ttf", 34), CHAMPAGNE)
    centered(d, cx, 475, "FLORA PARK INN · COIMBATORE", font("Cinzel.ttf", 22), CHAMPAGNE, spacing=2)
    d.rectangle((14, 14, w - 535, h - 15), outline=GOLD + (0,), width=1)

    card.save(os.path.join(IMAGES, "share.jpg"), "JPEG", quality=84, optimize=True, progressive=True)


def qr_image(scale, dark, light):
    qr = segno.make(URL, error="h")
    buf = io.BytesIO()
    qr.save(buf, kind="png", scale=scale, border=2, dark=dark, light=light)
    buf.seek(0)
    return Image.open(buf).convert("RGB")


def qr_card():
    """Portrait card to forward as an image; scanning opens the invitation."""
    w, h = 1080, 1350
    photo = Image.open(os.path.join(IMAGES, "rings.webp")).convert("RGB")
    card = cover(photo, (w, h)).filter(ImageFilter.GaussianBlur(18))
    card = Image.blend(card, Image.new("RGB", (w, h), FOREST), 0.78)

    d = ImageDraw.Draw(card)
    d.rectangle((36, 36, w - 37, h - 37), outline=GOLD, width=2)
    d.rectangle((50, 50, w - 51, h - 51), outline=(120, 100, 60), width=1)

    cx = w // 2
    cross(d, cx, 105, 70, GOLD)
    centered(d, cx, 210, "YOU ARE CORDIALLY INVITED TO", font("Cinzel.ttf", 28), CHAMPAGNE, spacing=3)
    centered(d, cx, 252, "THE WEDDING RECEPTION OF", font("Cinzel.ttf", 28), CHAMPAGNE, spacing=3)
    centered(d, cx, 300, "Arun & Priya", font("GreatVibes.ttf", 132), GOLD)
    rule(d, cx, 495, 220, GOLD)
    centered(d, cx, 525, "WEDNESDAY · 11 NOVEMBER 2026 · 6:00 PM", font("Cinzel.ttf", 27), IVORY, spacing=2)
    centered(d, cx, 570, "Flora Park Inn, Coimbatore", font("CormorantItalic.ttf", 40), CHAMPAGNE)

    # QR on an ivory tile so every phone camera reads it reliably
    # whole-pixel modules (no resampling) keep the code crisp for scanners
    side = segno.make(URL, error="h").symbol_size(border=2)[0]
    qr = qr_image(440 // side, FOREST, IVORY)
    tile = 488
    tx, ty = cx - tile // 2, 665
    d.rounded_rectangle((tx, ty, tx + tile, ty + tile), radius=22, fill=IVORY, outline=GOLD, width=3)
    card.paste(qr, (cx - qr.width // 2, ty + (tile - qr.height) // 2))

    centered(d, cx, ty + tile + 34, "SCAN TO OPEN THE INVITATION", font("Cinzel.ttf", 26), GOLD, spacing=3)
    centered(d, cx, ty + tile + 80, "Photos · Countdown · Map · Add to Calendar", font("CormorantItalic.ttf", 32), CHAMPAGNE)

    card.save(os.path.join(SHARE, "invite-qr.png"), optimize=True)
    qr_image(16, FOREST, IVORY).save(os.path.join(SHARE, "qr.png"))


MESSAGE = """✨ You're Invited ✨

With the grace of God and the blessings of our families,
we joyfully invite you and your family to our

\U0001F48D *Wedding Reception* \U0001F48D
*Arun & Priya*

\U0001F4C5 Wednesday, 11 November 2026
\U0001F55B 6:00 PM onwards
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
    print("images/share.jpg, share/invite-qr.png, share/qr.png, share/message.txt written")


if __name__ == "__main__":
    main()
