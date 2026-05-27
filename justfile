# hugo-theme-rijksoverheid branch — dev recipes
#
# Hugo's module replacement only accepts absolute paths in 0.159.x.
# These recipes inject HUGO_MODULE_REPLACEMENTS with the worktree's
# absolute path so collaborators don't need to manage their own.

# Show available recipes
default:
    @just --list

# Run hugo with theme module pointing at local ./hugo-theme-ro
hugo *args:
    @HUGO_MODULE_REPLACEMENTS="github.com/RijksICTGilde/hugo-theme-ro -> $(realpath ./hugo-theme-ro)" hugo {{args}}

# Start dev server (uses development environment + replacement)
serve:
    @just hugo server --environment development

# Production build (no replacement; uses pinned module from go.mod)
build:
    hugo --environment production

# Re-vendor NLDD assets from npm into hugo-theme-ro/assets
vendor-nldd:
    cd hugo-theme-ro && npm install && npm run vendor:nldd

# Run Storybook from the theme dir
storybook:
    cd hugo-theme-ro && npm run storybook
