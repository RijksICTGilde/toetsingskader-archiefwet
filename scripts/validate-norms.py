#!/usr/bin/env python3
"""Validate norm front matter in content/normen/ markdown files."""

import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML is required. Install with: pip install pyyaml")
    sys.exit(1)

REQUIRED_FIELDS = ["title", "norm_id", "norm_titel", "kern", "toelichting", "synoniemen", "normuitleg"]


def extract_front_matter(filepath):
    """Extract YAML front matter from a markdown file."""
    text = filepath.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    if len(parts) < 3:
        return None
    return yaml.safe_load(parts[1])


def validate_norm(filepath):
    """Validate a single norm file. Returns list of error messages."""
    errors = []
    fm = extract_front_matter(filepath)

    if fm is None:
        return [f"{filepath.name}: Geen geldige front matter gevonden"]

    for field in REQUIRED_FIELDS:
        if field not in fm or fm[field] is None:
            errors.append(f"{filepath.name}: Verplicht veld '{field}' ontbreekt")

    if "synoniemen" in fm and fm["synoniemen"] is not None:
        if not isinstance(fm["synoniemen"], list):
            errors.append(f"{filepath.name}: 'synoniemen' moet een lijst zijn")

    if "gerelateerde_onderwerpen" in fm and fm["gerelateerde_onderwerpen"] is not None:
        if not isinstance(fm["gerelateerde_onderwerpen"], list):
            errors.append(f"{filepath.name}: 'gerelateerde_onderwerpen' moet een lijst zijn")
        else:
            for j, onderwerp in enumerate(fm["gerelateerde_onderwerpen"], 1):
                if not isinstance(onderwerp, dict):
                    errors.append(f"{filepath.name}: gerelateerd onderwerp {j}: moet een object zijn")
                elif "titel" not in onderwerp:
                    errors.append(f"{filepath.name}: gerelateerd onderwerp {j}: 'titel' is verplicht")

    if "normuitleg" in fm and fm["normuitleg"] is not None:
        if not isinstance(fm["normuitleg"], list):
            errors.append(f"{filepath.name}: 'normuitleg' moet een lijst zijn")
        else:
            for i, item in enumerate(fm["normuitleg"], 1):
                if not isinstance(item, dict):
                    errors.append(f"{filepath.name}: normuitleg item {i} moet een object zijn")
                    continue
                if "voorschriften" not in item or item["voorschriften"] is None:
                    errors.append(f"{filepath.name}: normuitleg item {i}: verplicht veld 'voorschriften' ontbreekt")
                elif not isinstance(item["voorschriften"], list):
                    errors.append(f"{filepath.name}: normuitleg item {i}: 'voorschriften' moet een lijst zijn")
                else:
                    for k, vs in enumerate(item["voorschriften"], 1):
                        if not isinstance(vs, dict):
                            errors.append(f"{filepath.name}: normuitleg item {i}, voorschrift {k}: moet een object zijn")
                        elif "tekst" not in vs or vs["tekst"] is None:
                            errors.append(f"{filepath.name}: normuitleg item {i}, voorschrift {k}: 'tekst' is verplicht")
                        for field in ["criterium", "indicatoren"]:
                            if field in vs and vs[field] is not None and not isinstance(vs[field], list):
                                errors.append(f"{filepath.name}: normuitleg item {i}, voorschrift {k}: '{field}' moet een lijst zijn")

    return errors


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
        errors = validate_norm(filepath)
        all_errors.extend(errors)

    if all_errors:
        print(f"Validatie mislukt ({len(all_errors)} fout(en)):\n")
        for error in all_errors:
            print(f"  - {error}")
        sys.exit(1)

    print(f"Validatie geslaagd: {len(norm_files)} normpagina's gevalideerd")
    sys.exit(0)


if __name__ == "__main__":
    main()
