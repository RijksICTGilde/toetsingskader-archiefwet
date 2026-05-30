# Show available recipes
default:
    @just --list

# Start dev server
serve:
    hugo server --environment development

# Production build
build:
    hugo --environment production --minify

# Bijwerken theme naar laatste versie
update-theme:
    hugo mod get -u github.com/RijksICTGilde/hugo-theme-rijksoverheid
    hugo mod tidy
