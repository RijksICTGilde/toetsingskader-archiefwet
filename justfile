# Theme module-resolution: standaard via go.mod's `replace`-directive
# naar ./hugo-theme-ro. Voor ontwikkeling tegen een externe theme-clone:
# zet THEME_PATH naar het absolute pad van de clone.

# Default: clone naast deze repo
THEME_PATH := env_var_or_default('THEME_PATH', '')

_replace_env := if THEME_PATH == '' { '' } else {
    'HUGO_MODULE_REPLACEMENTS="github.com/RijksICTGilde/hugo-theme-ro -> ' + THEME_PATH + '"'
}

# Show available recipes
default:
    @just --list

# Start dev server (gebruikt THEME_PATH env-var indien gezet)
serve:
    {{_replace_env}} hugo server --environment development

# Production build
build:
    {{_replace_env}} hugo --environment production --minify
