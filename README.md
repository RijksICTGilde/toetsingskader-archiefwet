# Toetsingskader Archiefwet

Het Toetsingskader Archiefwet van de [Inspectie Overheidsinformatie en Erfgoed](https://www.inspectie-oe.nl) biedt een gestructureerd raamwerk voor het toetsen van de naleving van de Archiefwet 2026 door overheidsorganisaties. Deze website presenteert de normen op een toegankelijke manier.

## Architectuur

Dit project gebruikt [hugo-theme-ro](https://github.com/RijksICTGilde/hugo-theme-ro) als Hugo module. De theme levert de Rijksoverheid huisstijl (via MOx design system), basistemplates, navigatie en header/footer. Dit project bevat alleen de content en project-specifieke templates en styling.

## Lokale ontwikkeling

### Vereisten

- [Hugo](https://gohugo.io/installation/) (extended edition)
- [Go](https://go.dev/dl/) (voor Hugo modules)
- [Git](https://git-scm.com/)

### Installatie

```bash
git clone https://github.com/RijksICTGilde/toetsingskader-archiefwet.git
cd toetsingskader-archiefwet

# Start de ontwikkelserver
hugo server
```

Hugo haalt automatisch de theme module op bij de eerste keer draaien.

De site is beschikbaar op `http://localhost:1313/`.

### Pre-commit hooks

Dit project gebruikt [pre-commit](https://pre-commit.com/) voor code-kwaliteitscontroles.

```bash
pip install pre-commit
pre-commit install
```

### Handige commando's

```bash
# Bouw de site (controleert op fouten)
hugo --minify

# Valideer normpagina's front matter
python3 scripts/validate-norms.py

# Update de theme naar de nieuwste versie
hugo mod get -u
```

## Structuur

| Map | Beschrijving |
|---|---|
| `content/normen/` | Normpagina's (7 normen + introductiepagina) |
| `layouts/normen/` | Project-specifieke templates voor normpagina's |
| `assets/css/` | Project-specifieke CSS |
| `scripts/` | Validatie- en hulpscripts |
| `.github/` | CI/CD workflows |

## Licentie

Dit project is gelicentieerd onder de [EUPL v1.2](LICENSE).
