# hugo-theme-rijksoverheid branch — dev recipes
#
# Theme module resolution is handled by go.mod's `replace` directive, which
# points the theme module at ./hugo-theme-ro for all builds on this branch.
# No env-var injection needed (was the case until we discovered go.mod replace works).

# Show available recipes
default:
    @just --list

# Start dev server
serve:
    hugo server --environment development

# Production build
build:
    hugo --environment production --minify

# Re-vendor NLDD assets from npm into hugo-theme-ro/assets + static
vendor-nldd:
    cd hugo-theme-ro && npm install && npm run vendor:nldd

# Run Storybook from the theme dir
storybook:
    cd hugo-theme-ro && npm run storybook

# Build Storybook (static output)
build-storybook:
    cd hugo-theme-ro && npm run build-storybook
