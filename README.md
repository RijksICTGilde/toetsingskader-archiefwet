# Toetsingskader Archiefwet

Website met het toetsingskader waarmee de **Inspectie Overheidsinformatie
en Erfgoed** toeziet op de naleving van de Archiefwet 2026 door
overheidsorganisaties. Statische site, gebouwd met [Hugo].

## Vereisten

- [Hugo Extended] ≥ 0.162
- [Go] ≥ 1.26 (voor Hugo Modules)
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

### Werken aan het theme

Het theme zit in een aparte repo:
[`RijksICTGilde/hugo-theme-rijksoverheid`]. Voor parallelle ontwikkeling
clone die repo lokaal en gebruik `replace` in `go.mod`:

```bash
git clone git@github.com:RijksICTGilde/hugo-theme-rijksoverheid.git \
  ../hugo-theme-rijksoverheid-local
```

```go
// go.mod (consumer)
replace github.com/RijksICTGilde/hugo-theme-rijksoverheid =>
  ../hugo-theme-rijksoverheid-local
```

`hugo server` pakt vanaf nu wijzigingen in de lokale theme-clone live op.

[`RijksICTGilde/hugo-theme-rijksoverheid`]: https://github.com/RijksICTGilde/hugo-theme-rijksoverheid

## Structuur

- **Project-root**: consumer-content: `hugo.yaml`, `content/` (normen,
  over), `layouts/` (project-specifieke overrides),
  `assets/css/main.css`, `static/`.
- **Theme**: extern, geïmporteerd via Hugo Modules
  (`module.imports: github.com/RijksICTGilde/hugo-theme-rijksoverheid`).
  Bijwerken met `hugo mod get -u`.

Project-specifieke schemata (normen-frontmatter, referenties,
normen-grid) zitten op consumer-niveau; het theme is generiek.

## CI/CD

- **`.github/workflows/test.yml`**: bij elke PR pre-commit-hooks,
  Hugo-build en [htmltest] link-validatie.
- **`.github/workflows/zad.yml`**: bij PR + push naar `main` container
  image bouwen (digest-pinned base images, Trivy-scan), pushen naar
  GHCR, deployen via [ZAD] met preview-URL per PR.

Container build-recept staat in `container/Containerfile`, samen met de
runtime `container/nginx.conf`. Hugo wordt binnen de build geverifieerd
met SHA256-checksum tegen de officiële release.

## Standaarden en bijdragen

Voor bijdragen, gedragsregels, beveiligingsmeldingen en governance zie:

- [`CONTRIBUTING.md`](CONTRIBUTING.md): hoe je bijdraagt aan dit project.
- [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md): gedragsregels voor de
  community.
- [`SECURITY.md`](SECURITY.md): hoe je een kwetsbaarheid meldt.
- [`GOVERNANCE.md`](GOVERNANCE.md): besluitvorming en rolverdeling.
- [`CHANGELOG.md`](CHANGELOG.md): overzicht van wijzigingen per versie.

### Standaarden

Dit project sluit aan op de volgende standaarden voor publieke en open
software:

- [EUPL v1.2]: de Europese open-source-licentie waaronder dit project
  beschikbaar is.
- [Standard for Public Code]: kwaliteitsraamwerk voor publieke
  codebases (hergebruik, transparantie, samenwerken in het openbaar).
- [publiccode.yml]: machineleesbaar metadata-formaat voor publieke
  software; de repo bevat een [`publiccode.yml`](publiccode.yml) volgens
  deze specificatie.
- [Coordinated Vulnerability Disclosure (NCSC)]: leidraad voor het
  verantwoord melden van kwetsbaarheden; gevolgd in `SECURITY.md`.

[EUPL v1.2]: https://joinup.ec.europa.eu/collection/eupl
[Standard for Public Code]: https://standard.publiccode.net/
[publiccode.yml]: https://yml.publiccode.tools/
[Coordinated Vulnerability Disclosure (NCSC)]: https://www.ncsc.nl/contact/kwetsbaarheid-melden

## Licentie

Dit project is gelicentieerd onder de [EUPL v1.2](LICENSE).

[Hugo]: https://gohugo.io
[Hugo Extended]: https://github.com/gohugoio/hugo/releases
[Go]: https://go.dev
[just]: https://github.com/casey/just
[pre-commit]: https://pre-commit.com
[htmltest]: https://github.com/wjdp/htmltest
[ZAD]: https://github.com/RijksICTGilde/zad-actions
