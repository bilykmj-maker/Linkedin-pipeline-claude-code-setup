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

Publer не може читати raw-посилання приватного репозиторію — саме через це раніше картку доводилось перетягувати вручну.

**Основний канал (репо публічне):** закомітити й запушити PNG у `cards/`, взяти
`https://raw.githubusercontent.com/bilykmj-maker/Linkedin-pipeline-claude-code-setup/<гілка>/cards/YYYY-MM-DD.png`
і перевірити доступність (`curl -sI` → HTTP 200), потім передати цей URL у Publer `upload_media`.

**Запасний канал (якщо raw-URL раптом віддає 404 — репо стало приватним):** PNG → **Cloudinary** через Zapier-дію `upload_signed`: `file` = data URI `data:image/png;base64,<...>`, `type` = `upload`, `resource_type` = `image`, `public_id` = `carat-digest/YYYY-MM-DD`. Параметр `folder` НЕ передавати — він приймає лише вже наявні папки, а шлях у `public_id` створює папку сам. У відповіді буде публічний `secure_url` (res.cloudinary.com). Канал перевірено наскрізним тестом 2026-07-08.

Далі в обох випадках:
1. URL → Publer-дія `upload_media`: `{file_urls: ["<url>"], upload_type: "url", in_library: "true", workspace_id: "69eb81061ad08e54939f0de5"}` → `media_id` (у `payload[0].id`).
2. `create_post` з `media_ids: ["<media_id>"]`.

Коміт PNG у `cards/` — одночасно і канал доставки (raw-URL), і архів.

## Publer — фіксовані ідентифікатори

- workspace_id: `69eb81061ad08e54939f0de5`
- LinkedIn account_id: `69eb812445572ded59bab55b`

## Фіксовані правила контенту

- Авторський рядок на КОЖНІЙ картці: **Михайло Білик** / **AI & Digital Analytics Director** (бейдж «MB»). Не змінювати без прямої вказівки власника.
