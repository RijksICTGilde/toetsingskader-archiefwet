# `hugo-theme-rijksoverheid` branch

Werkbranch waarop **theme + consumer-migratie gelijktijdig** ontwikkeld worden
voor de NLDD-gebaseerde versie van `hugo-theme-RO`.

## Structuur

- **Branch-root**: consumer-config (`hugo.yaml`, `content/`, `layouts/normen/`, …)
  — wordt straks gemerged naar `main` van `toetsingskader-archiefwet`.
- **`hugo-theme-ro/` subdir**: theme-code — wordt geëxtraheerd naar de
  canonical `RijksICTGilde/hugo-theme-RO` repo.
- **`theme-alignment.md`**: prior-art context document; blijft hier leven.

## Lokale dev

```bash
cd /Users/robbert/Projects/toetsingskader-archiefwet/hugo-theme-rijksoverheid
hugo server   # gebruikt config/development/module.yaml met replacement → ./hugo-theme-ro
```

## Eindspel

1. Theme + consumer stable, team-review akkoord.
2. **Track C** (extraction): `hugo-theme-ro/*` → `RijksICTGilde/hugo-theme-RO`, tag `v0.1.0`.
3. Op deze branch: `git rm -r hugo-theme-ro/`, vervang replacement door pin op `v0.1.0`.
4. Merge naar `main`; PR bevat dan alleen consumer-migratie.

Spec + plan: `RijksICTGilde/hugo-theme-RO/docs/superpowers/`.
