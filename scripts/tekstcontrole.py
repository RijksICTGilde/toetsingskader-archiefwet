#!/usr/bin/env python3
"""Woord-voor-woord-controle: normbladen versus de sitecontent.

Beantwoordt één vraag: is elke inhoudelijke alinea uit de normbladen letterlijk
overgenomen in de content, en zo nee, waar wijkt de site af?

Gebruik (vanuit de repo-root):

    python3 scripts/tekstcontrole.py > docs/tekstcontrole-4e-iteratie.md

De normbladen zelf staan **niet** in de repo (`.git/info/exclude`): het zijn
aangeleverde Word-bestanden. Zet ze in `docs/normbladen 4e iteratie (1)/` om
het rapport opnieuw te genereren; zonder die map stopt het script met een
melding in plaats van een leeg rapport.

Elke alinea krijgt één van vier uitkomsten (zie de rapportkop). De normalisatie
raakt alleen opmaak — typografische aanhalingstekens en streepjes, harde
spaties, witruimte, Word-opsommingstekens — nooit de woorden zelf, anders
verdwijnt precies het verschil waar het om gaat.
"""
import difflib
import glob
import os
import re
import sys
import unicodedata
import zipfile

DOC = 'docs/normbladen 4e iteratie (1)/'

# docx → contentbestand. Het normbladnummer volgt de oude nummering; de
# koppeling is op inhoud (norm_titel), niet op nummer. Vandaar 5 → 06 en 7 → 05.
NORM_MAP = {
    '1) Normanalyse beheer.docx': ['content/normen/01-beheer.md'],
    '2) Normanalyse overzicht.docx': ['content/normen/02-overzicht.md'],
    '3) Normanalyse ordeningsstructuur.docx': ['content/normen/03-ordenen.md'],
    '4) Normanalyse metadatering.docx': ['content/normen/04-metadateren.md'],
    '5) Normanalyse vindbaarheid.docx': ['content/normen/06-vindbaar.md'],
    '6) Normanalyse vernietigen.docx': ['content/normen/07-vernietigen.md'],
    '7) Normanalyse Informatiebeveiliging.docx': ['content/normen/05-betrouwbaar.md'],
    '8) Normanalyse periodieke evaluatie.docx': ['content/normen/08-periodieke-evaluatie.md'],
}
ALL_CONTENT = sorted(glob.glob('content/**/*.md', recursive=True))
# Deze twee normbladen bevatten losse tekstblokken die over de hele site zijn
# verdeeld; daar is geen één-op-één-doelbestand voor.
BREED = {
    '0) Introductie toetsingskader.docx': ALL_CONTENT,
    '9) Onderwerpen en Verwijzingen.docx': ALL_CONTENT,
}

TRANS = {
    0x2018: "'", 0x2019: "'", 0x201a: "'", 0x201b: "'",
    0x201c: '"', 0x201d: '"', 0x201e: '"',
    0x2013: '-', 0x2014: '-', 0x2212: '-', 0x00ad: '',
    0x00a0: ' ', 0x2009: ' ', 0x202f: ' ', 0x200b: '',
}
LABELS = re.compile(
    r'^(Bron(nen)?|Synoniemen|Criteri(a|um)|Indicator(en)?|Voorschrift|Toelichting|'
    r'Reikwijdte|Zie ook|Normuitleg|Kern van|Normanalyse|Verwijzingen)\b', re.I)
TOETST = 'de inspectie toetst of '


# --- docx uitpakken ---------------------------------------------------------
# Een .docx is een zip met word/document.xml: elke <w:p> is een alinea, elke
# <w:t> een tekstrun. Geen extern pakket nodig.
NS_T = re.compile(r'<w:t(?: [^>]*)?>(.*?)</w:t>', re.S)
NS_P = re.compile(r'<w:p[ >].*?</w:p>|<w:p/>', re.S)
STYLE = re.compile(r'<w:pStyle w:val="([^"]+)"')


def unescape(s):
    return (s.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
             .replace('&quot;', '"').replace('&apos;', "'"))


def paragraphs(path):
    """[(stijl, tekst)] per alinea, lege alinea's overgeslagen."""
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml').decode('utf-8')
    out = []
    for m in NS_P.finditer(xml):
        p = m.group(0)
        style = STYLE.search(p)
        # <w:tab/> en <w:br/> als witruimte, anders kleven woorden aan elkaar.
        p = re.sub(r'<w:(?:tab|br)/>', ' ', p)
        # Eerst de runs samenvoegen, dán unescapen. Omgekeerd maakt &lt;x&gt;
        # een echte <x> die als markup wordt gelezen, en dan verdwijnt de tekst
        # van een <placeholder> uit het normblad.
        text = unescape(''.join(NS_T.findall(p)))
        text = re.sub(r'\s+', ' ', text).strip()
        if text:
            out.append((style.group(1) if style else '', text))
    return out


# --- vergelijken ------------------------------------------------------------
def norm(s):
    s = unicodedata.normalize('NFKC', s).translate(TRANS)
    # Opsommingstekens en -letters van Word zijn opmaak, geen tekst: als ze
    # blijven staan levert elke bullet een schijnverschil op.
    s = re.sub(r'^\s*(?:[•▪●·o\-]|[a-z]\.|\d+\.)\s+', '', s)
    return re.sub(r'\s+', ' ', s).strip()


def strip_markers(s):
    """<<term>> → term; de site maakt daar een link van."""
    return re.sub(r'<<\s*([^>]*?)\s*>>', r'\1', s)


def site_chunks(paths):
    chunks = []
    for path in paths:
        s = open(path, encoding='utf-8').read()
        parts = s.split('---')
        fm, body = ('---'.join(parts[1:2]), '---'.join(parts[2:])) if len(parts) > 2 else ('', s)
        for line in fm.splitlines():
            v = re.sub(r'^\s*[\w-]+:\s*', '', line).strip(' "\'')
            if v:
                chunks.append((path, v))
        body = re.sub(r'^\[\^[^\]]+\]:', '', body, flags=re.M)
        body = re.sub(r'\[\^[^\]]+\]', '', body)
        body = re.sub(r'\{\{<[^>]*>\}\}', ' ', body)
        body = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', body)
        body = re.sub(r'[*_`>#|]', '', body)
        for block in re.split(r'\n\s*\n', body):
            lines = [re.sub(r'^\s*[-+]\s+', '', l).strip() for l in block.splitlines()]
            lines = [l for l in lines if l]
            for l in lines:
                chunks.append((path, l))
            # Ook het hele blok als één string: de site knipt alinea's soms
            # anders op dan het normblad.
            if len(lines) > 1:
                chunks.append((path, ' '.join(lines)))
    return [(p, norm(c)) for p, c in chunks if norm(c)]


def is_content(style, text):
    if style.lower().startswith(('heading', 'kop', 'title')):
        return False
    if LABELS.match(text):
        return False
    return len(text.split()) >= 6


def worddiff(a, b):
    aw, bw = a.split(), b.split()
    out = []
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, aw, bw).get_opcodes():
        if tag == 'equal':
            continue
        if tag in ('replace', 'delete') and aw[i1:i2]:
            out.append('normblad **' + ' '.join(aw[i1:i2]) + '**')
        if tag in ('replace', 'insert') and bw[j1:j2]:
            out.append('site **' + ' '.join(bw[j1:j2]) + '**')
    return '; '.join(out)


def classify(n, chunks, blob_low):
    """(klasse, beste passage, ratio)"""
    plain = strip_markers(n)
    if plain.lower() in blob_low:
        return ('markering' if plain != n else 'letterlijk', plain, 1.0)
    best, ratio = '', 0.0
    for _, c in chunks:
        r = difflib.SequenceMatcher(None, plain.lower(), c.lower()).ratio()
        if r > ratio:
            ratio, best = r, c
    if ratio < 0.6:
        return ('ontbreekt', best, ratio)
    if best.lower().startswith(TOETST) and \
            difflib.SequenceMatcher(None, plain.lower(), best.lower()[len(TOETST):]).ratio() > 0.93:
        rest = best[len(TOETST):]
        # Het voorschrift is verder identiek op de eerste letter/lidwoord na.
        return ('voorschrift', best, difflib.SequenceMatcher(None, plain.lower(), rest.lower()).ratio())
    return ('tekst', best, ratio)


def run(mapping):
    rows = []
    for docx_name, paths in sorted(mapping.items()):
        chunks = site_chunks(paths)
        blob_low = ' '.join(c for _, c in chunks).lower()
        tally = {'letterlijk': 0, 'markering': 0, 'voorschrift': 0, 'tekst': [], 'ontbreekt': []}
        for style, text in paragraphs(DOC + docx_name):
            if not is_content(style, text):
                continue
            n = norm(text)
            klasse, best, ratio = classify(n, chunks, blob_low)
            if klasse in ('letterlijk', 'markering', 'voorschrift'):
                tally[klasse] += 1
            else:
                tally[klasse].append((n, best, ratio))
        rows.append((docx_name, paths, tally))
    return rows


def report(title, rows):
    print(f'\n## {title}\n')
    print('| Normblad | Letterlijk | Alleen `<<…>>` | Voorschrift-vorm | Woordverschil | Niet gevonden |')
    print('|---|---:|---:|---:|---:|---:|')
    for docx_name, paths, t in rows:
        print(f'| {docx_name.replace(".docx", "")} | {t["letterlijk"]} | {t["markering"]} | '
              f'{t["voorschrift"]} | {len(t["tekst"])} | {len(t["ontbreekt"])} |')
    for docx_name, paths, t in rows:
        if not t['tekst'] and not t['ontbreekt']:
            continue
        doel = paths[0] if len(paths) == 1 else 'de hele contentboom'
        print(f'\n### {docx_name.replace(".docx", "")} → `{doel}`\n')
        for n, best, ratio in sorted(t['tekst'], key=lambda x: -x[2]):
            print(f'- **Woordverschil** ({ratio:.0%}): {worddiff(strip_markers(n), best)}')
            print(f'  - normblad: "{n}"')
            print(f'  - site: "{best}"')
        for n, best, ratio in t['ontbreekt']:
            print(f'- **Niet gevonden**: "{n}"')


if not os.path.isdir(DOC):
    sys.exit(f'{DOC} ontbreekt — zet de aangeleverde normbladen daar neer '
             '(ze staan bewust niet in de repo).')

print('# Tekstcontrole normbladen 4e iteratie')
print("""
Vergelijkt elke inhoudelijke alinea uit de normbladen met de sitecontent en
classificeert het verschil. Gegenereerd met `scripts/tekstcontrole.py`; de
normalisatie raakt alleen opmaak (typografische aanhalingstekens en streepjes,
harde spaties, witruimte), nooit de woorden zelf.

Vier uitkomsten:

- **Letterlijk** — de alinea staat woord voor woord in de content.
- **Alleen `<<…>>`** — identiek, op de verwijzingsmarkering van het normblad na.
  Die markering is bedoeld als aanwijzing voor een link en hoort niet in de
  lopende tekst; dit is dus geen tekstverschil.
- **Voorschrift-vorm** — de site zet "De Inspectie toetst of …" voor de zin uit
  het normblad. Dat is een bewuste, sitebrede formulering van de voorschriften.
- **Woordverschil** / **Niet gevonden** — hier wijkt de tekst echt af, of staat
  hij nergens. Dit zijn de regels om na te lopen.

De conclusie hieronder is met de hand getrokken uit die laatste twee categorieën
en staat daarom in dit script, zodat rapport en conclusie bij regenereren bij
elkaar blijven.
""")
print("""
## Conclusie

**Nee, niet alles staat er woord voor woord — maar er is geen tekst
weggevallen en geen betekenis veranderd.**

Van de oorspronkelijke veertien meldingen "Niet gevonden" was er één echt: het
derde criterium bij het eerste voorschrift van normblad 5 stond niet op de site.
Dat is toegevoegd. De overige dertien zijn vals alarm. Vijf ervan zijn
plaatsingsinstructies uit het Word-bestand ("NB: dit document bevat stukken
tekst die …", "Inleiding -> andere naam voor het kopje") en horen niet op de
site. De andere acht staan er wel, alleen niet in het bestand waar het script
zocht of niet in dezelfde bewoording:

| Normblad-alinea | Staat op |
|---|---|
| "Een document is in beheer … gehouden kan worden" | `content/normen/_index.md` |
| "… in ieder geval per categorie documenten, een omschrijving …" | `content/normen/01-beheer.md` |
| "Het overzicht bevat, in het geval … meerdere ordeningsstructuren …" | `content/normen/02-overzicht.md` |
| "Het archiefbeheer wordt … periodiek geëvalueerd …" | `kern` van `content/normen/08-periodieke-evaluatie.md` |
| "Het toetsingskader omvat momenteel de onderwerpen … wit gearceerde …" | `content/samenhang.md` (herschreven naar het bollendiagram) |
| "Dat documenten in beheer moeten zijn, is het fundament …" | `content/samenhang.md` |
| "Het overzicht is te vinden op de website van de Inspectie …" | `content/over/doelgroep.md` |
| "Algemene introductie - Toetsingskader overheidsinformatie …" | is een kop, geen lopende tekst |

De 55 resterende woordverschillen vallen uiteen in vier groepen:

1. **Correcties op het normblad (28)** — de site schrijft het goed waar het
   normblad een fout heeft: "emailapplicaties" → "e-mailapplicaties",
   "maateregelen" → "maatregelen", "informatie overleg" → "informatieoverleg",
   "plaats vond" → "plaatsvond", "Tenminste" → "Ten minste", "gebruik gemaakt"
   → "gebruikgemaakt", "Archiefwet-en" → "Archiefwet- en", "artikel 1.1." →
   "1.1", en het ontbrekende haakje in "(digitaal of papier.". Ook
   congruentiefouten: "metadata wordt" → "metadata worden", "de inhoud …
   zijn" → "is". Letterlijk overnemen zou hier de fout overnemen.
2. **Voorschrift-vorm (13)** — de site zet "De Inspectie toetst of …" voor de
   normbladzin en verplaatst daarvoor het werkwoord. Sitebrede afspraak; het
   script vangt de meeste hiervan al apart af (kolom "Voorschrift-vorm"), deze
   dertien vallen alleen op doordat de woordvolgorde te ver verschuift.
3. **Afkortingen en verwijzingen voluit (13)** — "Ar" → "Archiefregeling",
   "SIO" → "strategisch informatieoverleg (SIO)", "WOO" → "Woo", "etc." →
   "enzovoorts", en `<<…>>`-markeringen die een link of een volzin zijn
   geworden ("technisch vernietigen (buiten scope, volgt op een later moment)"
   → "Technisch vernietigen valt op dit moment buiten de reikwijdte …").
4. **Redactionele keuze (1)** — `08-periodieke-evaluatie.md` somt de normen op
   in de sitenaamgeving ("informatiebeveiliging en betrouwbaarheid",
   "gecontroleerd vernietigen") in plaats van die van het normblad
   ("Informatiebeveiliging", "Vernietiging"). Bewust zo gelaten: de site voert
   die namen overal.

De andere redactionele keuzes zijn wél teruggedraaid naar de brontekst: de
toegevoegde DUTO-zin in `01-beheer.md` is verwijderd, "zwaarder beheer" in
`02-overzicht.md` is weer "zwaarder (archief)beheer", `06-vindbaar.md` schrijft
weer "functie/rol" en heeft het ontbrekende derde criterium terug, en
`over/opbouw-en-indeling.md` heeft de zin "In dit toetsingskader wordt
onderscheid gemaakt tussen voorschriften, criteria en indicatoren" weer
letterlijk.

Eén valkuil in het rapport zelf: bij normblad 4 lijken drie voorschriften tot
één te zijn samengevat, doordat het script per alinea de best gelijkende
passage toont. Dat is niet zo — `04-metadateren.md` heeft ze alle drie, mét het
onderscheid tussen "is minimaal het volgende … vastgelegd", "is … vastgelegd"
en "kan … worden vastgelegd".
""")
report('Normbladen 1 t/m 8', run(NORM_MAP))
report('Introductie en Onderwerpen (gezocht in alle contentbestanden)', run(BREED))
