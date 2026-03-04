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
REQUIRED_NORMUITLEG_FIELDS = ["voorschrift", "reikwijdte", "gerelateerde_onderwerpen"]
OPTIONAL_NORMUITLEG_FIELDS = ["titel", "criterium", "indicator"]


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

    if "normuitleg" in fm and fm["normuitleg"] is not None:
        if not isinstance(fm["normuitleg"], list):
            errors.append(f"{filepath.name}: 'normuitleg' moet een lijst zijn")
        else:
            for i, item in enumerate(fm["normuitleg"], 1):
                if not isinstance(item, dict):
                    errors.append(f"{filepath.name}: normuitleg item {i} moet een object zijn")
                    continue
                for field in REQUIRED_NORMUITLEG_FIELDS:
                    if field not in item or item[field] is None:
                        errors.append(f"{filepath.name}: normuitleg item {i}: verplicht veld '{field}' ontbreekt")
                if "gerelateerde_onderwerpen" in item and item["gerelateerde_onderwerpen"] is not None:
                    if not isinstance(item["gerelateerde_onderwerpen"], list):
                        errors.append(f"{filepath.name}: normuitleg item {i}: 'gerelateerde_onderwerpen' moet een lijst zijn")
                    else:
                        for j, onderwerp in enumerate(item["gerelateerde_onderwerpen"], 1):
                            if not isinstance(onderwerp, dict):
                                errors.append(f"{filepath.name}: normuitleg item {i}, onderwerp {j}: moet een object zijn")
                            elif "titel" not in onderwerp or "url" not in onderwerp:
                                errors.append(f"{filepath.name}: normuitleg item {i}, onderwerp {j}: 'titel' en 'url' zijn verplicht")
                for field in ["criterium", "indicator"]:
                    if field in item and item[field] is not None and not isinstance(item[field], list):
                        errors.append(f"{filepath.name}: normuitleg item {i}: '{field}' moet een lijst zijn")

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
