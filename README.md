# Carat Digest — LinkedIn Pipeline

Щоденний пайплайн підготовки LinkedIn-поста для Carat Ukraine.

**Флоу (з 2026-07-14):** Routine автоматично готує **три повні чернетки** — для кожної з топ-3 тем дня одразу і текст поста українською, і брендовану картку 1080×1080 — і показує їх користувачу. Користувач відповідає лише номером обраного варіанта (опційно + час публікації або правки), після чого обрана чернетка комітиться в репо і йде на планування в Publer. Необрані чернетки не комітяться. Проміжного етапу «вибір теми до написання» більше немає.

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
1. URL → Publer-дія `upload_media`: `{file_urls: ["<url>"], upload_type: "url", in_library: "true", workspace_id: "69eb81061ad08e54939f0de5"}` → `media_id` (у `results[0].payload[0].id` або `media_id`, залежно від відповіді дії).
2. `create_post` з обов'язковим `state: "scheduled"` (без цього поля дія попросить його окремо), `media_ids: ["<media_id>"]`, `scheduled_at` в UTC ISO-8601, **без** `auto_comment_enabled`/`auto_comment_text` (див. нижче).

Коміт PNG у `cards/` — одночасно і канал доставки (raw-URL), і архів.

## Publer — фіксовані ідентифікатори

- workspace_id: `69eb81061ad08e54939f0de5`
- LinkedIn account_id: `69eb812445572ded59bab55b`

## Публікація без auto-comment (важливо!)

Поточний тариф Publer-акаунта **не підтримує** auto-comment / auto-share / auto-delete (перевірено 2026-07-08 — `create_post` з `auto_comment_enabled: true` падає з помилкою «Please upgrade your plan…»). Тому:

- У `create_post` НЕ передавати `auto_comment_enabled`/`auto_comment_text` взагалі (або передавати `auto_comment_enabled: false`).
- Джерело статті в тіло поста НЕ додавати (правило про чистий текст лишається).
- Після планування нагадати користувачу вручну додати посилання на джерело першим коментарем у LinkedIn після публікації.
- Якщо тариф колись оновлять — прибрати це обмеження і повернути auto-comment у `create_post`.

## Фіксовані правила контенту

- Авторський рядок на КОЖНІЙ картці: **Михайло Білик** / **AI & Digital Analytics Director** (бейдж «MB»). Не змінювати без прямої вказівки власника.
- Згадка `@Carat Ukraine` в тексті поста НЕ обов'язкова: додавати лише там, де це справді доречно за змістом (наприклад, коли пост описує позицію/практику агенції). Не вставляти штучно в кожен пост.
