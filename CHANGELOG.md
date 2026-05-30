# Changelog

Alle noemenswaardige wijzigingen aan dit project worden in dit bestand
gedocumenteerd.

Het format is gebaseerd op [Keep a Changelog v1.1.0][kac], en dit
changelog volgt [Semantic Versioning][semver].

[kac]: https://keepachangelog.com/nl/1.1.0/
[semver]: https://semver.org/lang/nl/

## [Unreleased]

### Added

### Changed

### Fixed

## [0.8.0] - 2026-05-30

### Added

- Hugo-thema voor Rijksoverheid-sites (`hugo-theme-ro`) met eigen design
  tokens, layouts, components en JS, geïmporteerd via Hugo Modules.
- Normen-content voor het toetsingskader Archiefwet 2026 inclusief
  bijbehorende frontmatter-schemata en referenties-systeem.
- Search-functionaliteit met `priority_sections` (normen, over) voor
  betere ranking van relevante resultaten.
- Componenten: callouts, breadcrumb, page-banner, page-nav.

### Changed

- Theme geport van NLDD-basis naar een eigen Rijksoverheid-design-token-set.
- Containerbuild gebruikt nu hash-gepinde base images voor reproduceerbare
  builds.

### Security

- SHA256-verificatie op de Hugo-binary tijdens de containerbuild.
- Trivy-scan toegevoegd aan de container-workflow.
- Minimale `permissions` ingesteld in de test-workflow.

[Unreleased]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/RijksICTGilde/toetsingskader-archiefwet/releases/tag/v0.8.0
