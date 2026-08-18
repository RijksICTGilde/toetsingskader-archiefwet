#!/usr/bin/env python3
"""Validate norm pages in content/normen/.

Contentformaat:

  - Front matter: alleen machinaal gebruikte velden (`title`, `weight`,
    `norm_id`, `norm_titel`, `versie`, `kern`, `synoniemen`), zonder
    voetnoten of markdown in `kern`/`synoniemen`. Optioneel: `kern_bron`
    en `kern_bron_url`, de bronvermelding onder de kern.
  - Body: vaste koppen `## Toelichting` en `## Voorschriften` (verplicht,
    met `#### Voorschrift` -> optioneel `#### Criteria`/`#### Criterium` en
    `#### Indicatoren`/`#### Indicator`, eventueel gegroepeerd onder een
    `### <thema>`), `## Reikwijdte` (mag een achtervoegsel hebben) en
    `## Gerelateerde onderwerpen` (optioneel). Geen `#`-kop, geen koppen
    dieper dan h4. De koppen volgen het normblad woord voor woord.
  - Bronnen zijn Goldmark-voetnoten: elke `[^id]` heeft een definitie en
    andersom; ids zijn kleine letters, cijfers en koppeltekens.

Foutmeldingen zijn Nederlands, met regelnummer waar mogelijk:
`bestandsnaam:regel: melding`.
"""

import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)

# Front matter: alleen machinaal gebruikte velden.
REQUIRED_FIELDS = ["title", "weight", "norm_id", "norm_titel", "versie", "kern", "synoniemen"]

# Stonden in het oude formaat in de front matter, horen nu in de body.
# Aanwezigheid is een fout, zodat migraties niet half blijven.
DEPRECATED_FIELDS = [
    "toelichting",
    "normuitleg",
    "referenties",
    "reikwijdte",
    "gerelateerde_onderwerpen",
    "wetsverwijzing",
    "show_referenties",
]

REQUIRED_SECTIONS = ["Toelichting", "Voorschriften"]
OPTIONAL_SECTIONS = ["Reikwijdte", "Gerelateerde onderwerpen"]
ALLOWED_SECTIONS = REQUIRED_SECTIONS + OPTIONAL_SECTIONS

# Normblad 1 heet de sectie "Reikwijdte inbeheername en beheer". De koppen komen
# woord voor woord uit het normblad, dus een achtervoegsel achter "Reikwijdte"
# is goed; de sectie telt mee als "Reikwijdte".
SECTION_PREFIXES = ["Reikwijdte"]

# h4-subkoppen. Enkelvoud én meervoud zijn goed: de normbladen gebruiken
# "Criterium:"/"Indicator:" waar het er één is en "Criteria:"/"Indicatoren:"
# waar het er meer zijn, en de site volgt dat.
ALLOWED_SUBHEADINGS = ["Voorschrift", "Criteria", "Criterium", "Indicatoren", "Indicator"]

ID_RE = re.compile(r"^[a-z0-9-]+$")
HEADING_RE = re.compile(r"^(#{1,6})\s+(.*?)\s*$")
FN_DEF_RE = re.compile(r"^\[\^([^\]]+)\]:")
FN_USE_RE = re.compile(r"\[\^([^\]]+)\]")
# Definitieregel die alleen uit de "Bekijk bron"-link bestaat: die laat een lege
# tooltip achter. Letterlijk die linktekst, want normen/single.html splitst
# alleen díé af; een beschrijvende linktekst blijft brontekst en is dus goed.
FN_DEF_ALLEEN_BRONLINK_RE = re.compile(r"^\[Bekijk bron\]\([^)]*\)\s*$")

# De controle op voetnootplaatsing staat nu in `scripts/a11y-scan.mjs`, op de
# gerenderde HTML: elke overgebleven `a.footnote-ref` is een markering zonder
# ref-term. Hier voorspellen vroeg om Goldmark namaken in regex en werkte twee
# kanten op verkeerd — geldige tekst geweigerd, stukke tekst doorgelaten.


class Error:
    """Een validatiefout met optioneel regelnummer."""

    def __init__(self, name, message, line=None):
        self.name = name
        self.message = message
        self.line = line

    def __str__(self):
        if self.line is not None:
            return f"{self.name}:{self.line}: {self.message}"
        return f"{self.name}: {self.message}"


def split_document(text):
    """Splits in (front_matter_tekst, body_regels, body_startregel).

    body_startregel is het 1-gebaseerde regelnummer van de eerste
    body-regel in het bestand. Geeft (None, ...) als er geen front
    matter is.
    """
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None, [], 0
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            fm_text = "\n".join(lines[1:i])
            body_lines = lines[i + 1:]
            return fm_text, body_lines, i + 2  # 1-based regel na de tweede ---
    return None, [], 0


def find_field_line(text, field):
    """Zoek het regelnummer (1-based, t.o.v. het bestand) van een
    top-level front-matter-veld, voor nettere foutmeldingen."""
    pattern = re.compile(rf"^{re.escape(field)}\s*:")
    for idx, line in enumerate(text.splitlines(), start=2):  # regel 1 is '---'
        if pattern.match(line):
            return idx
    return None


def validate_front_matter(name, fm_text, errors):
    """Valideer de YAML-front matter. Geeft de geparste dict terug
    (of None bij een YAML-fout)."""
    try:
        fm = yaml.safe_load(fm_text)
    except yaml.YAMLError as exc:
        detail = str(exc).splitlines()[0] if str(exc) else "onbekende fout"
        errors.append(Error(name, f"Front matter is geen geldige YAML: {detail}"))
        return None

    if fm is None or not isinstance(fm, dict):
        errors.append(Error(name, "Front matter is leeg of geen geldig YAML-object"))
        return None

    for field in REQUIRED_FIELDS:
        if field not in fm or fm[field] is None:
            errors.append(Error(name, f"Verplicht veld '{field}' ontbreekt in de front matter"))

    for field in DEPRECATED_FIELDS:
        if field in fm and fm[field] is not None:
            errors.append(Error(
                name,
                f"Veld '{field}' hoort niet meer in de front matter; verplaats de inhoud naar de body",
                line=find_field_line(fm_text, field),
            ))

    if isinstance(fm.get("synoniemen"), list):
        for syn in fm["synoniemen"]:
            if isinstance(syn, str) and "[^" in syn:
                errors.append(Error(name, "'synoniemen' mag geen voetnoten ([^...]) bevatten",
                                    line=find_field_line(fm_text, "synoniemen")))
                break
    elif "synoniemen" in fm and fm["synoniemen"] is not None:
        errors.append(Error(name, "'synoniemen' moet een lijst zijn",
                            line=find_field_line(fm_text, "synoniemen")))

    if isinstance(fm.get("kern"), str) and "[^" in fm["kern"]:
        errors.append(Error(name, "'kern' mag geen voetnoten ([^...]) bevatten",
                            line=find_field_line(fm_text, "kern")))

    # De bron bij de kern staat als los veld en niet als voetnoot in `kern`:
    # front matter gaat ook naar de zoekindex, en een voetnootmarker die
    # nergens naar wijst is daar ruis. normen/single.html rendert dit als
    # bronregel onder de kern-callout.
    kern_bron = fm.get("kern_bron")
    if kern_bron is not None:
        if not isinstance(kern_bron, str):
            errors.append(Error(name, "'kern_bron' moet een tekst zijn",
                                line=find_field_line(fm_text, "kern_bron")))
        elif "[^" in kern_bron or "](" in kern_bron:
            errors.append(Error(name, "'kern_bron' mag geen voetnoten of markdown-links bevatten; "
                                      "de link staat in 'kern_bron_url'",
                                line=find_field_line(fm_text, "kern_bron")))

    # De korte omschrijving op de normenkaart komt uit het introductiedocument
    # en wijkt bewust af van de kerntekst uit het normblad; zonder dit veld
    # toont de kaart `kern` (layouts/shortcodes/normen-grid.html).
    kern_kaart = fm.get("kern_kaart")
    if kern_kaart is not None and (not isinstance(kern_kaart, str) or "[^" in kern_kaart):
        errors.append(Error(name, "'kern_kaart' moet een tekst zonder voetnoten ([^...]) zijn",
                            line=find_field_line(fm_text, "kern_kaart")))

    # De kop boven de kern-callout komt altijd uit `norm_titel`, afgeleid door
    # _partials/kern-kop.html ("Kern van ordenen"). Het normblad voert hier een
    # eigen Kop2 ("Kern van Ordeningsstructuur") en die stond even in het veld
    # `kern_kop`, maar de review vraagt expliciet om de normnaam en gaat vóór de
    # woord-voor-woord-regel. Zonder deze afwijzing zou het veld de kop
    # stilzwijgend opnieuw laten afwijken.
    if "kern_kop" in fm:
        errors.append(Error(name, "'kern_kop' bestaat niet meer: de kop boven de kern volgt "
                                  "'norm_titel' ('Kern van ordenen'). Zie "
                                  "docs/afwijkingen-van-het-normblad.md",
                            line=find_field_line(fm_text, "kern_kop")))

    kern_bron_url = fm.get("kern_bron_url")
    if kern_bron_url is not None and not (
        isinstance(kern_bron_url, str) and kern_bron_url.startswith(("http://", "https://"))
    ):
        errors.append(Error(name, "'kern_bron_url' moet een http(s)-URL zijn",
                            line=find_field_line(fm_text, "kern_bron_url")))

    if kern_bron_url is not None and kern_bron is None:
        errors.append(Error(name, "'kern_bron_url' zonder 'kern_bron': de link heeft geen brontekst",
                            line=find_field_line(fm_text, "kern_bron_url")))

    return fm


def validate_headings(name, body_lines, body_start, errors):
    """Controleer de koppenstructuur van de body."""
    in_code = False
    seen_sections = []
    current_h2 = None         # naam van de actieve ## sectie
    current_theme_line = None  # regel van de actieve ### thema (binnen Voorschriften)
    theme_has_voorschrift = {}  # regel-van-thema -> bool
    voorschriften_has_h4 = False  # '#### Voorschrift' direct onder '## Voorschriften'

    def section_name(title):
        """De sectienaam waaronder een h2 meetelt; vangt 'Reikwijdte <extra>'."""
        for prefix in SECTION_PREFIXES:
            if title == prefix or title.startswith(prefix + " "):
                return prefix
        return title

    for offset, raw in enumerate(body_lines):
        lineno = body_start + offset
        stripped = raw.strip()

        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            continue
        if in_code:
            continue

        m = HEADING_RE.match(raw)
        if not m:
            continue
        level = len(m.group(1))
        title = m.group(2).strip()

        if level == 1:
            errors.append(Error(name, "Gebruik geen '#'-kop in de body; de titel komt uit de front matter", lineno))
            continue

        if level >= 5:
            errors.append(Error(name, f"Gebruik geen koppen dieper dan h4 (gevonden: h{level} '{title}')", lineno))
            continue

        if level == 2:
            current_h2 = section_name(title)
            current_theme_line = None
            if current_h2 not in ALLOWED_SECTIONS:
                allowed = ", ".join(f"'## {s}'" for s in ALLOWED_SECTIONS)
                errors.append(Error(name, f"Onbekende sectie '## {title}'. Toegestaan: {allowed}", lineno))
            elif current_h2 in seen_sections:
                errors.append(Error(name, f"Sectie '## {title}' komt meer dan één keer voor", lineno))
            seen_sections.append(current_h2)

        elif level == 3:
            if current_h2 != "Voorschriften":
                errors.append(Error(name, "Een '###'-thema mag alleen binnen '## Voorschriften' staan", lineno))
            current_theme_line = lineno
            theme_has_voorschrift[lineno] = False

        elif level == 4:
            # Een '###'-thema is optioneel: de meeste normbladen groeperen de
            # voorschriften niet, en de koppen komen uit het normblad.
            if current_h2 != "Voorschriften":
                errors.append(Error(name, f"'#### {title}' mag alleen binnen '## Voorschriften' staan", lineno))
            if title not in ALLOWED_SUBHEADINGS:
                allowed = ", ".join(f"'#### {s}'" for s in ALLOWED_SUBHEADINGS)
                errors.append(Error(name, f"Onbekende subkop '#### {title}'. Toegestaan: {allowed}", lineno))
            if title == "Voorschrift":
                if current_theme_line is not None:
                    theme_has_voorschrift[current_theme_line] = True
                elif current_h2 == "Voorschriften":
                    voorschriften_has_h4 = True

    for section in REQUIRED_SECTIONS:
        if section not in seen_sections:
            errors.append(Error(name, f"Verplichte sectie '## {section}' ontbreekt"))

    for theme_line, has_vs in theme_has_voorschrift.items():
        if not has_vs:
            errors.append(Error(name, "Een '###'-thema moet minstens één '#### Voorschrift' bevatten", theme_line))

    if "Voorschriften" in seen_sections and not voorschriften_has_h4 and not theme_has_voorschrift:
        errors.append(Error(name, "Sectie '## Voorschriften' bevat geen enkel '#### Voorschrift'"))


def validate_footnotes(name, body_lines, body_start, errors):
    """Controleer dat voetnoten gebruikt én gedefinieerd zijn en dat de
    ids een geldig formaat hebben."""
    in_code = False
    definitions = {}  # id -> regel
    usages = {}       # id -> eerste regel
    bad_ids = {}      # id -> regel (voor formaatfouten)

    for offset, raw in enumerate(body_lines):
        lineno = body_start + offset
        stripped = raw.strip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code = not in_code
            continue
        if in_code:
            continue

        scan = raw
        dm = FN_DEF_RE.match(raw)
        if dm:
            fid = dm.group(1)
            if fid not in definitions:
                definitions[fid] = lineno
            if not ID_RE.match(fid):
                bad_ids.setdefault(fid, lineno)
            # Definitie-marker weg, anders telt hij als gebruik.
            scan = raw[dm.end():]

            # Zonder brontekst vóór de "Bekijk bron"-link houdt normen/single.html
            # een lege tooltip over (aria-describedby wijst naar een lege <span>)
            # en heet de link "Bekijk bron: " — bevinding 27 weer stuk.
            lichaam = scan.strip()
            if not lichaam:
                errors.append(Error(
                    name,
                    f"Voetnoot [^{fid}] heeft geen brontekst. Zet de bron achter de marker "
                    "(bijvoorbeeld 'Aw, artikel 4.1, eerste lid.'), anders krijgt de "
                    "verwijzing in de tekst een lege tooltip",
                    lineno))
            elif FN_DEF_ALLEEN_BRONLINK_RE.match(lichaam):
                errors.append(Error(
                    name,
                    f"Voetnoot [^{fid}] bestaat alleen uit een 'Bekijk bron'-link. Zet de "
                    "brontekst ervóór (bijvoorbeeld 'Aw, artikel 4.1, eerste lid.'), anders "
                    "krijgt de verwijzing in de tekst een lege tooltip en een naamloze bronlink",
                    lineno))

        for um in FN_USE_RE.finditer(scan):
            fid = um.group(1)
            usages.setdefault(fid, lineno)
            if not ID_RE.match(fid):
                bad_ids.setdefault(fid, lineno)


    for fid, lineno in bad_ids.items():
        errors.append(Error(name, f"Ongeldige voetnoot-id '{fid}': gebruik kleine letters, cijfers en koppeltekens", lineno))

    for fid, lineno in usages.items():
        if fid not in definitions:
            errors.append(Error(name, f"Voetnoot [^{fid}] wordt gebruikt maar is nergens gedefinieerd", lineno))

    for fid, lineno in definitions.items():
        if fid not in usages:
            errors.append(Error(name, f"Voetnoot [^{fid}] is gedefinieerd maar wordt nergens gebruikt", lineno))


def validate_norm(filepath):
    """Valideer één normpagina. Geeft een lijst foutmeldingen (strings)."""
    name = filepath.name
    text = filepath.read_text(encoding="utf-8")
    errors = []

    fm_text, body_lines, body_start = split_document(text)
    if fm_text is None:
        return [str(Error(name, "Geen geldige front matter gevonden (begin het bestand met '---')"))]

    validate_front_matter(name, fm_text, errors)
    validate_headings(name, body_lines, body_start, errors)
    validate_footnotes(name, body_lines, body_start, errors)

    return [str(e) for e in errors]


def main():
    content_dir = Path(__file__).resolve().parent.parent / "content" / "normen"

    if not content_dir.exists():
        print(f"ERROR: Directory {content_dir} niet gevonden")
        sys.exit(1)

    norm_files = [f for f in sorted(content_dir.glob("*.md")) if f.name != "_index.md"]

    if not norm_files:
        print("WARN: Geen normpagina's gevonden")
        sys.exit(0)

    all_errors = []
    for filepath in norm_files:
        all_errors.extend(validate_norm(filepath))

    if all_errors:
        print(f"Validatie mislukt ({len(all_errors)} fout(en)):\n")
        for error in all_errors:
            print(f"  - {error}")
        sys.exit(1)

    print(f"Validatie geslaagd: {len(norm_files)} normpagina's gevalideerd")
    sys.exit(0)


if __name__ == "__main__":
    main()
