# Toetsingskader Archiefwet — site + theme

Werkbranch waarop **consumer-site + theme-code gelijktijdig** ontwikkeld
worden. De theme wordt straks geëxtraheerd naar de canonical
[`RijksICTGilde/hugo-theme-RO`](https://github.com/RijksICTGilde/hugo-theme-RO);
deze branch fuseert nu beide.

## Structuur

- **Branch-root**: consumer-config (`hugo.yaml`, `content/`,
  `layouts/`, etc.) — eindstaat voor `main` van
  `toetsingskader-archiefwet`.
- **`hugo-theme-ro/`**: theme-code — module-pad
  `github.com/RijksICTGilde/hugo-theme-ro`, in lokaal gebruik via
  `go.mod`'s `replace`-directive.

## Lokale dev

`go.mod`'s `replace`-directive wijst het theme-module naar
`./hugo-theme-ro` voor alle builds op deze branch — geen env-vars of
direnv nodig.

```bash
just            # toont alle recipes
just serve      # dev-server (hugo server --environment development)
just build      # productie-build
```

## CI

- **`.github/workflows/test.yml`**: pre-commit-hooks + Hugo-build +
  htmltest link-validatie op PRs.
- **`.github/workflows/zad.yml`**: container-image bouwen + ZAD-deploy
  (dual-tag, Trivy-scan).

## Eindspel

1. Theme + consumer stable, team-review akkoord.
2. **Track C** (extractie): `hugo-theme-ro/*` →
   `RijksICTGilde/hugo-theme-RO`, tag `v0.1.0`.
3. Op deze branch: `git rm -r hugo-theme-ro/`, vervang `replace` door
   pin op `v0.1.0`.
4. Merge naar `main`; PR bevat dan alleen consumer-migratie.
