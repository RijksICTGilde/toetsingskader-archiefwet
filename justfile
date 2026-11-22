# Show available recipes
default:
    @just --list

# Start dev server
serve:
    hugo server --environment development

# Production build, inclusief de PDF's: de downloadknop op de normpagina's is
# een gewone link naar index.pdf, dus een build zonder deze stap levert een
# dode link op en laat de index.pdfdata.json-tussenproducten publiek staan.
# (`hugo server` heeft datzelfde: in dev wijst de knop naar een 404.)
build:
    hugo --environment production --minify --cleanDestinationDir
    [ -d node_modules/pdfkit ] || npm ci --no-audit --no-fund
    npm run build:pdf

# De controles die lokaal te draaien zijn
#
# Nodig omdat een deel van de controles op de gebouwde HTML werkt en dus niet
# in de pre-commit hook kan zitten: of een voetnootmarkering een ref-term heeft
# gekregen, of een ref-term meer is dan interpunctie, of een afbeelding een
# lege alt heeft. Zonder dit recept ziet een redacteur die fouten pas
# in CI. Zie scripts/a11y-checks.mjs.
#
# Bewust géén `--quiet` op de build: Hugo's warnf gaat daarmee ook weg, en juist
# de waarschuwingen (zoals de labeldrift in het bollendiagram) zijn hier het punt.
#
# Twee CI-stappen ontbreken, omdat ze een installatie vragen die niet in de
# repo zit: `htmltest` (linkcontrole, los binary) en de browserscan
# `npm run test:a11y:browser` (Chromium via Playwright). De PDF-stappen staan
# hieronder gewoon in de lijst: pdfkit draait in Node, zonder browser.
check:
    pre-commit run --all-files
    hugo --environment production --minify --cleanDestinationDir
    [ -d node_modules/pdfkit ] || npm ci --no-audit --no-fund
    npm test
    npm run test:a11y
    npm run build:pdf
    npm run test:pdf-ua

# PDF's genereren uit de gebouwde site en de markers controleren.
# Draait volledig lokaal: pdfkit in Node, geen browser nodig.
pdf:
    hugo --environment production --minify --cleanDestinationDir
    [ -d node_modules/pdfkit ] || npm ci --no-audit --no-fund
    npm run build:pdf
    npm run test:pdf-ua

# Vaste RijksSans-snedes voor de PDF, uit het variabele font van het theme:
# pdfkit sluit een variabel font niet per gewicht in. Opnieuw draaien als het
# theme een nieuwe RijksSans meebrengt.
pdf-fonts:
    #!/usr/bin/env bash
    set -euo pipefail
    thema=$(hugo config mounts | jq -s -r '.[] | select(.path | test("hugo-theme-rijksoverheid")) | .dir')
    tmp=$(mktemp -d)
    for snede in "Regular 400 regular" "Regular 700 bold" "Italic 400 italic"; do
      read -r bron gewicht naam <<< "$snede"
      uvx --quiet --from 'fonttools[woff]' fonttools varLib.instancer \
        "${thema%/}/static/fonts/RijksSansWeb-${bron}.woff2" "wght=${gewicht}" \
        --update-name-table -o "${tmp}/${naam}.woff2"
      uvx --quiet --from 'fonttools[woff]' python -I -c \
        'import sys; from fontTools.ttLib import TTFont; f = TTFont(sys.argv[1]); f.flavor = None; f.save(sys.argv[2])' \
        "${tmp}/${naam}.woff2" "assets/fonts/rijks-sans-${naam}.ttf"
    done
    trash "${tmp}"

# Bijwerken theme naar laatste versie
update-theme:
    hugo mod get -u github.com/RijksICTGilde/hugo-theme-rijksoverheid
    hugo mod tidy
