module github.com/RijksICTGilde/toetsingskader-archiefwet

go 1.26.1

require github.com/RijksICTGilde/hugo-theme-ro v0.0.0-20260430142837-b1c9224cde45 // indirect

// During v0.1 development the theme code lives in this repo's hugo-theme-ro/
// subdirectory (on this branch). After Track C extraction + v0.1.0 tag on the
// canonical hugo-theme-RO repo, remove this replace and bump the require above.
replace github.com/RijksICTGilde/hugo-theme-ro => ./hugo-theme-ro
