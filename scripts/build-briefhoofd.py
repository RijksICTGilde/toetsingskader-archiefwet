#!/usr/bin/env python3
"""Genereert assets/print/briefhoofd.svg: het Rijksoverheid-lint met het
woordmerk ernaast, met de tekst als contouren.

    python3 scripts/build-briefhoofd.py        (vraagt fonttools)

Alleen opnieuw draaien als het woordmerk of de lettersnede wijzigt; de
uitvoer staat in de repository.

Waarom contouren en geen tekst: het briefhoofd wordt als vectorbeeld in een
eigen Form XObject gezet (scripts/pdf-tagged.mjs) en daar
laadt geen enkel lettertype — ook niet als `data:`-URI. Gemeten op de
gegenereerde PDF viel de tekst terug op DejaVu Sans, een derde breder dan
Rijksoverheid Sans. Als contour hoeft er niets geladen te worden.

Dat de tekst daarmee niet meer te selecteren is, kan hier: het briefhoofd is
huisstijl, valt buiten de structuurboom van de PDF en herhaalt niets wat
nergens anders staat. De documenttitel staat op de titelpagina en in de
metadata.
"""
from pathlib import Path
import re

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

WORTEL = Path(__file__).resolve().parent.parent
LINT = WORTEL / "assets/images/logo-rijksoverheid.svg"
DOEL = WORTEL / "assets/print/briefhoofd.svg"

# Maten uit de oude export (assets/js/pdf-export.js, verwijderd in ba41540):
# lint 26pt breed (1:2, dus 52pt hoog), tekst 8pt ernaast. Daar stond y=16 voor
# de bovenkant van het tekstblok; hier staat de basislijn, dus de waarden
# hieronder zijn nagemeten op de gerenderde PDF tegen de oude export: de
# bovenkant van de inkt komt op 17,9pt en 32,1pt uit.
LINT_BREED = 26.0
LINT_HOOG = 52.0
TEKST_X = LINT_BREED + 8.0
BLAUW = "#154273"

REGELS = [
    ("assets/fonts/ro-sans-bold.ttf", "Inspectie Overheidsinformatie en Erfgoed", 9.5, 24.6),
    ("assets/fonts/ro-sans-regular.ttf", "Ministerie van Onderwijs, Cultuur en Wetenschap", 8.0, 37.8),
]


def regel_naar_pad(font_pad, tekst, korps, basislijn_y):
    """Eén regel tekst als SVG-pad, met de basislijn op `basislijn_y`."""
    font = TTFont(WORTEL / font_pad)
    eenheden = font["head"].unitsPerEm
    schaal = korps / eenheden
    cmap = font.getBestCmap()
    glyfset = font.getGlyphSet()
    hmtx = font["hmtx"]

    onderdelen = []
    x = 0.0
    for teken in tekst:
        naam = cmap.get(ord(teken))
        if naam is None:
            raise SystemExit(f"Teken {teken!r} ontbreekt in {font_pad}")
        # Gehele punten zijn op 9,5pt ruim onder een beeldpunt. De PDF-renderer zet dit
        # briefhoofd op élke pagina opnieuw in de PDF, dus de SVG wordt één keer als Form XObject in de PDF ingebed.
        pen = SVGPathPen(glyfset, ntos=lambda n: f'{n:.0f}')
        glyfset[naam].draw(pen)
        d = pen.getCommands()
        if d:
            onderdelen.append((d, x))
        x += hmtx[naam][0] * schaal

    # Eén transform per glyph: schalen (y omklappen, want de font-as loopt
    # omhoog en de SVG-as omlaag) en op zijn plek zetten.
    paden = [
        f'<path transform="translate({TEKST_X + dx:.3f} {basislijn_y:.3f}) '
        f'scale({schaal:.6f} {-schaal:.6f})" d="{d}"/>'
        for d, dx in onderdelen
    ]
    return "\n  ".join(paden), x


def lint_inhoud():
    """De binnenkant van het lint-SVG, om te nesten in de uitvoer."""
    bron = LINT.read_text(encoding="utf-8")
    binnen = bron[bron.index(">", bron.index("<svg")) + 1 : bron.rindex("</svg>")]
    # De <title> hoort bij het bronbestand; het uitvoer-SVG krijgt zijn eigen.
    binnen = re.sub(r"<title>.*?</title>", "", binnen, flags=re.S).strip()
    # Het wapen staat in een viewBox van 50x100 en wordt op 26pt getekend, dus
    # twee decimalen zijn ruim genoeg. Scheelt een derde in bestandsgrootte.
    return re.sub(r"\d+\.\d{3,}", lambda m: f"{float(m.group()):.2f}", binnen)


def main():
    stukken = []
    breedste = 0.0
    for font_pad, tekst, korps, y in REGELS:
        pad, breedte = regel_naar_pad(font_pad, tekst, korps, y)
        stukken.append(pad)
        breedste = max(breedste, breedte)

    breed = TEKST_X + breedste
    alle_stukken = "\n".join(stukken)
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="{breed:.3f}" height="{LINT_HOOG:.3f}"
     viewBox="0 0 {breed:.3f} {LINT_HOOG:.3f}" role="img">
  <title>Inspectie Overheidsinformatie en Erfgoed, Ministerie van Onderwijs, Cultuur en Wetenschap</title>
  <svg x="0" y="0" width="{LINT_BREED}" height="{LINT_HOOG}" viewBox="0 0 50 100">
    {lint_inhoud()}
  </svg>
  <g fill="{BLAUW}">
  {alle_stukken}
  </g>
</svg>
"""
    DOEL.write_text(svg, encoding="utf-8")
    print(f"{DOEL.relative_to(WORTEL)} geschreven — {breed:.1f} x {LINT_HOOG:.0f} pt, "
          f"breedste regel {breedste:.1f} pt")


if __name__ == "__main__":
    main()
