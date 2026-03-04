# Toetsingskader Archiefwet

Het Toetsingskader Archiefwet biedt een gestructureerd raamwerk voor het toetsen van de naleving van de Archiefwet door overheidsorganisaties. Deze website presenteert de normen, beoordelingsmethodiek en het juridisch kader op een toegankelijke manier.

## Lokale ontwikkeling

### Vereisten

- [Hugo](https://gohugo.io/installation/) (extended edition)
- [Node.js](https://nodejs.org/) (voor MOx design system)
- [Git](https://git-scm.com/)

### Installatie

```bash
# Clone de repository met submodules
git clone --recurse-submodules https://github.com/MinBZK/toetsingskader-archiefwet.git
cd toetsingskader-archiefwet

# Genereer MOx CSS
cd MOx
npm ci
npm run tokens
cd ..

# Start de ontwikkelserver
hugo server
```

De site is beschikbaar op `http://localhost:1313/`.

### Bestaande checkout

Als je de repository al hebt gecloned zonder submodules:

```bash
git submodule update --init --recursive
```

### Pre-commit hooks

Dit project gebruikt [pre-commit](https://pre-commit.com/) voor code-kwaliteitscontroles.

```bash
# Installeer pre-commit (eenmalig)
pip install pre-commit

# Activeer de hooks
pre-commit install
```

### Lokaal testen

```bash
# Bouw de site (controleert op fouten)
hugo --minify

# Of draai de ontwikkelserver met live reload
hugo server --buildDrafts --buildFuture

# Open http://localhost:1313/ in je browser
```

Hugo's ontwikkelserver herlaadt automatisch bij wijzigingen in content, layouts of assets.

## Structuur

| Map | Beschrijving |
|---|---|
| `content/` | Markdown content per sectie |
| `layouts/` | Hugo templates |
| `assets/` | CSS en andere assets |
| `MOx/` | MOx design system (submodule) |
| `.github/` | CI/CD workflows en templates |

## Licentie

Dit project is gelicentieerd onder de [EUPL v1.2](LICENSE).
