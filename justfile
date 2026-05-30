# hugo-theme-rijksoverheid branch — dev recipes
#
# Theme module-resolution via go.mod's `replace`-directive
# (./hugo-theme-ro). Geen env-var injection nodig.

# Show available recipes
default:
    @just --list

# Start dev server
serve:
    hugo server --environment development

# Production build
build:
    hugo --environment production --minify
