# Show available recipes
default:
    @just --list

# Start dev server
serve:
    hugo server --environment development

# Production build
build:
    hugo --environment production --minify

# De controles die lokaal te draaien zijn
#
# Nodig omdat een deel van de controles op de gebouwde HTML werkt en dus niet
# in de pre-commit hook kan zitten: of een voetnootmarkering een ref-term heeft
# gekregen, of een ref-term meer is dan interpunctie, of elke pagina het
# draft-voorbehoud draagt. Zonder dit recept ziet een redacteur die fouten pas
# in CI. Zie scripts/a11y-checks.mjs.
#
# Bewust géén `--quiet` op de build: Hugo's warnf gaat daarmee ook weg, en juist
# de waarschuwingen (zoals de labeldrift in het bollendiagram) zijn hier het punt.
#
# Drie CI-stappen ontbreken, omdat ze een installatie vragen die niet in de
# repo zit: `htmltest` (linkcontrole, los binary), de browserscan
# `npm run test:a11y:browser` en de PDF-generatie `just pdf` (beide Chromium via
# Playwright). Draai die op de PR.
check:
    pre-commit run --all-files
    hugo --environment production --minify
    npm test
    npm run test:a11y

# PDF's genereren uit de gebouwde site en de markers controleren
#
# Vraagt een Chromium die kan starten: `npx playwright install --with-deps
# chromium`. In een omgeving zonder root lukt dat niet — draai het dan op de PR,
# waar CI hetzelfde doet en de PDF's als artifact bewaart.
pdf:
    hugo --environment production --minify
    npm run build:pdf
    npm run test:pdf-ua

# Bijwerken theme naar laatste versie
update-theme:
    hugo mod get -u github.com/RijksICTGilde/hugo-theme-rijksoverheid
    hugo mod tidy
