# Carat Digest — LinkedIn Pipeline

Щоденний пайплайн підготовки LinkedIn-поста для Carat Ukraine: добірка тем з RSS-дайджесту → текст поста українською → брендована картка 1080×1080 → планування в Publer.

## Структура

```
templates/card.html         — HTML-шаблон картки з {{TOKEN}}-плейсхолдерами
templates/card.sample.html  — той самий шаблон із прикладом контенту (для тест-рендеру)
fonts/Montserrat[wght].ttf  — variable-шрифт Montserrat (кирилиця)
scripts/render-card.mjs     — Playwright-рендер HTML → PNG 2160×2160 (dsf=2)
scripts/downscale.py        — Pillow LANCZOS даунскейл → 1080×1080
log/posted-topics.md        — журнал уже опублікованих тем/URL
cards/                      — готові PNG-картки (YYYY-MM-DD.png)
posts/                      — тексти постів (YYYY-MM-DD.md)
```

## Підготовка середовища (свіжа сесія)

```bash
npm install            # playwright (Chromium вже передвстановлено в /opt/pw-browsers)
pip install pillow
```

## Рендер картки

```bash
node scripts/render-card.mjs templates/card.filled.html /tmp/card-2x.png
python3 scripts/downscale.py /tmp/card-2x.png cards/YYYY-MM-DD.png
```

`card.filled.html` — це копія `templates/card.html`, у якій усі `{{TOKEN}}` замінено на контент дня (список токенів — у коментарі на початку шаблону).

## Доставка картки в Publer (важливо!)

Репозиторій **приватний**, тому raw.githubusercontent.com-посилання зовнішнім сервісам недоступні — Publer такий URL не приймає. Робочий ланцюг:

1. PNG → **Cloudinary** через Zapier-дію `upload_signed` (Cloudinary), `file` = data URI `data:image/png;base64,<...>`, `type` = `upload`, `resource_type` = `image`, `folder` = `carat-digest`, `public_id` = `YYYY-MM-DD`. У відповіді буде публічний `secure_url` (res.cloudinary.com).
2. `secure_url` → Publer-дія `upload_media`: `{file_urls: ["<secure_url>"], upload_type: "url", in_library: "true", workspace_id: "69eb81061ad08e54939f0de5"}` → `media_id`.
3. `create_post` з `media_ids: ["<media_id>"]`.

Коміт PNG у `cards/` — архів/журнал, не канал доставки.

## Publer — фіксовані ідентифікатори

- workspace_id: `69eb81061ad08e54939f0de5`
- LinkedIn account_id: `69eb812445572ded59bab55b`
