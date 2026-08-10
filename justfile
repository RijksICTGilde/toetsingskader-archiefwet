# Show available recipes
default:
    @just --list

# Start dev server
serve:
    hugo server --environment development

# Production build
build:
    hugo --environment production --minify

# Alles wat CI ook draait, behalve de browsertests (die vragen Chromium)
#
# Nodig omdat een deel van de controles op de gebouwde HTML werkt en dus niet
# in de pre-commit hook kan zitten: of een voetnootmarkering een ref-term heeft
# gekregen, of een ref-term meer is dan interpunctie, of elke pagina het
# draft-voorbehoud draagt. Zonder dit recept ziet een redacteur die fouten pas
# in CI. Zie scripts/a11y-checks.mjs.
check:
    pre-commit run --all-files
    hugo --environment production --minify --quiet
    npm test
    npm run smoke:pdf
    npm run test:a11y

# Bijwerken theme naar laatste versie
update-theme:
    hugo mod get -u github.com/RijksICTGilde/hugo-theme-rijksoverheid
    hugo mod tidy
