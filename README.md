# Toetsingskader Archiefwet

Website met het toetsingskader waarmee de **Inspectie Overheidsinformatie
en Erfgoed** toeziet op de naleving van de Archiefwet 2026 door
overheidsorganisaties. Statische site, gebouwd met [Hugo].

## Vereisten

- [Hugo Extended] ≥ 0.158 (CI/productie pinnen 0.162.1)
- [Go] ≥ 1.26.3 (voor Hugo Modules)
- [just] voor de dev-recipes
- [pre-commit] voor lokale hooks (optioneel, draait ook in CI)

## Lokaal draaien

```bash
git clone git@github.com:RijksICTGilde/toetsingskader-archiefwet.git
cd toetsingskader-archiefwet
just            # toont alle recipes
just serve      # dev-server op http://localhost:1313
just build      # productie-build naar public/
```

Eerste keer? Installeer ook pre-commit:

```bash
pip install pre-commit
pre-commit install
```

## Structuur

Het project bundelt **content + theme** in één repo:

- **Project-root** — consumer-content: `hugo.yaml`, `content/` (normen,
  over), `layouts/` (project-specifieke overrides), `assets/css/main.css`,
  `static/`.
- **`hugo-theme-ro/`** — herbruikbaar Rijksoverheid-thema: layouts,
  components, design tokens, JS. Modulepad
  `github.com/RijksICTGilde/hugo-theme-ro`, lokaal in gebruik via
  `go.mod`'s `replace`-directive.

Het thema is generiek; project-specifieke schemata (normen-frontmatter,
referenties, normen-grid) zitten op consumer-niveau.

## CI/CD

- **`.github/workflows/test.yml`** — bij elke PR: pre-commit-hooks,
  Hugo-build en [htmltest] link-validatie.
- **`.github/workflows/zad.yml`** — bij PR + push naar `main`: container
  image bouwen (digest-pinned base images, Trivy-scan), pushen naar
  GHCR, deployen via [ZAD] met preview-URL per PR.

Container build-recept staat in `Containerfile`. Hugo wordt binnen de
build geverifieerd met SHA256-checksum tegen de officiële release.

## Bijdragen

1. Branch + PR.
2. Pre-commit + tests groen in CI.
3. Review → merge naar `main` → automatische deploy.

## Licentie

[EUPL v1.2](LICENSE)

[Hugo]: https://gohugo.io
[Hugo Extended]: https://github.com/gohugoio/hugo/releases
[Go]: https://go.dev
[just]: https://github.com/casey/just
[pre-commit]: https://pre-commit.com
[htmltest]: https://github.com/wjdp/htmltest
[ZAD]: https://github.com/RijksICTGilde/zad-actions
