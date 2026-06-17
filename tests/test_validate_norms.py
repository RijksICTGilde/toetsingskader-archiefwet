"""Unittests voor scripts/validate-norms.py (nieuw markdown-body-formaat)."""

import importlib.util
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VALIDATOR_PATH = REPO_ROOT / "scripts" / "validate-norms.py"

_spec = importlib.util.spec_from_file_location("validate_norms", VALIDATOR_PATH)
validator = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(validator)


VALID_NORM = """\
---
title: "Norm 2: Overzicht"
versie: "0.8"
weight: 2
norm_id: "2"
norm_titel: "Overzicht"
kern: "De organisatie heeft een overzicht van haar documenten."
synoniemen:
  - "Overzicht"
---

## Toelichting

Een toelichting met een bron.[^aw-4-1-lid-1]

[^aw-4-1-lid-1]: Aw, artikel 4.1, lid 1. [Bekijk bron](https://example.org)

## Normuitleg

### Besturing

#### Voorschrift

De Inspectie toetst of beheerregels zijn vastgesteld.

#### Criteria

- De beheerregels zijn actueel.

## Reikwijdte

Alle documenten.

## Zie ook

- [Ordenen](/normen/03-ordeningsstructuur/)
"""


def run(content):
    """Schrijf content naar een tijdelijk normbestand en valideer het."""
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "02-overzicht.md"
        path.write_text(content, encoding="utf-8")
        return validator.validate_norm(path)


def replace(snippet, new):
    return VALID_NORM.replace(snippet, new)


class FrontMatterTests(unittest.TestCase):
    def test_valid_norm_has_no_errors(self):
        self.assertEqual(run(VALID_NORM), [])

    def test_missing_required_field(self):
        content = replace('kern: "De organisatie heeft een overzicht van haar documenten."\n', "")
        errors = run(content)
        self.assertTrue(any("Verplicht veld 'kern' ontbreekt" in e for e in errors), errors)

    def test_deprecated_field_in_front_matter(self):
        content = replace("synoniemen:\n", 'toelichting: "x"\nsynoniemen:\n')
        errors = run(content)
        self.assertTrue(any("'toelichting' hoort niet meer in de front matter" in e for e in errors), errors)

    def test_synoniemen_not_a_list(self):
        content = replace('synoniemen:\n  - "Overzicht"\n', 'synoniemen: "Overzicht"\n')
        errors = run(content)
        self.assertTrue(any("'synoniemen' moet een lijst zijn" in e for e in errors), errors)

    def test_synoniemen_with_footnote(self):
        content = replace('  - "Overzicht"\n', '  - "Overzicht[^x]"\n')
        errors = run(content)
        self.assertTrue(any("'synoniemen' mag geen voetnoten" in e for e in errors), errors)

    def test_kern_with_footnote(self):
        content = replace(
            'kern: "De organisatie heeft een overzicht van haar documenten."',
            'kern: "De organisatie heeft een overzicht.[^x]"',
        )
        errors = run(content)
        self.assertTrue(any("'kern' mag geen voetnoten" in e for e in errors), errors)

    def test_invalid_yaml(self):
        content = replace('norm_titel: "Overzicht"', 'norm_titel: "Overzicht')  # ongesloten quote
        errors = run(content)
        self.assertTrue(any("geen geldige YAML" in e for e in errors), errors)

    def test_no_front_matter(self):
        errors = run("## Toelichting\n\nGeen front matter.\n")
        self.assertTrue(any("Geen geldige front matter" in e for e in errors), errors)


class HeadingTests(unittest.TestCase):
    def test_missing_required_section(self):
        content = replace("## Toelichting\n", "## Iets\n")
        errors = run(content)
        self.assertTrue(any("Verplichte sectie '## Toelichting' ontbreekt" in e for e in errors), errors)

    def test_unknown_section(self):
        content = replace("## Reikwijdte\n", "## Onbekend\n")
        errors = run(content)
        self.assertTrue(any("Onbekende sectie '## Onbekend'" in e for e in errors), errors)

    def test_duplicate_section(self):
        content = VALID_NORM + "\n## Toelichting\n\nNog een keer.\n"
        errors = run(content)
        self.assertTrue(any("komt meer dan één keer voor" in e for e in errors), errors)

    def test_h1_in_body(self):
        content = VALID_NORM + "\n# Titel\n"
        errors = run(content)
        self.assertTrue(any("Gebruik geen '#'-kop" in e for e in errors), errors)

    def test_heading_too_deep(self):
        content = replace("#### Voorschrift\n", "#### Voorschrift\n\n##### Te diep\n")
        errors = run(content)
        self.assertTrue(any("dieper dan h4" in e for e in errors), errors)

    def test_criterium_singular(self):
        content = replace("#### Criteria\n", "#### Criterium\n")
        errors = run(content)
        self.assertTrue(any("Gebruik '#### Criteria' (meervoud) in plaats van '#### Criterium'" in e for e in errors), errors)

    def test_indicator_singular(self):
        content = replace("#### Criteria\n\n- De beheerregels zijn actueel.\n",
                          "#### Indicator\n\n- Iets.\n")
        errors = run(content)
        self.assertTrue(any("Gebruik '#### Indicatoren' (meervoud)" in e for e in errors), errors)

    def test_unknown_subheading(self):
        content = replace("#### Criteria\n", "#### Onbekend\n")
        errors = run(content)
        self.assertTrue(any("Onbekende subkop '#### Onbekend'" in e for e in errors), errors)

    def test_theme_outside_normuitleg(self):
        content = replace("## Reikwijdte\n\nAlle documenten.\n",
                          "## Reikwijdte\n\n### Verdwaald thema\n\nAlle documenten.\n")
        errors = run(content)
        self.assertTrue(any("mag alleen binnen '## Normuitleg'" in e for e in errors), errors)

    def test_theme_without_voorschrift(self):
        content = replace("#### Voorschrift\n\nDe Inspectie toetst of beheerregels zijn vastgesteld.\n\n", "")
        errors = run(content)
        self.assertTrue(any("minstens één '#### Voorschrift'" in e for e in errors), errors)


class FootnoteTests(unittest.TestCase):
    def test_used_but_not_defined(self):
        content = replace(
            "[^aw-4-1-lid-1]: Aw, artikel 4.1, lid 1. [Bekijk bron](https://example.org)\n",
            "",
        )
        errors = run(content)
        self.assertTrue(any("wordt gebruikt maar is nergens gedefinieerd" in e for e in errors), errors)

    def test_defined_but_not_used(self):
        content = VALID_NORM + "\n[^ongebruikt]: Losse bron.\n"
        errors = run(content)
        self.assertTrue(any("[^ongebruikt] is gedefinieerd maar wordt nergens gebruikt" in e for e in errors), errors)

    def test_invalid_footnote_id(self):
        content = VALID_NORM.replace("aw-4-1-lid-1", "Aw_4_1")
        errors = run(content)
        self.assertTrue(any("Ongeldige voetnoot-id" in e for e in errors), errors)


class FormatTests(unittest.TestCase):
    def test_error_includes_line_number(self):
        content = replace("#### Criteria\n", "#### Criterium\n")
        errors = run(content)
        match = [e for e in errors if "Criteria" in e]
        self.assertTrue(match)
        # Vorm: bestandsnaam:regel: melding
        prefix = match[0].split(": ", 1)[0]
        self.assertRegex(prefix, r"^02-overzicht\.md:\d+$")


if __name__ == "__main__":
    unittest.main()
