# doi-frontend
Tar inn DOI-api, presenterer dem som om det er en del av hjemmesiden

## Hva består den av?
Denne er omtrent så enkel som det er mulig å få en nettside. Den har en html, en javascript og css-stylesheets. Man trenger med andre ord ikke installere noe for å kjøre, men kan åpne index.html i nettleseren så er alt på plass. Rett og slett fordi den ikke skal gjøre så mye avansert.

## deployment
I utgangspunktet overføres alle filer og kataloger, i prosjektet, til webserveren. Ekskuderinger gjøres i filen deploy.sh og med følgende kommando:
rsync -avr --exclude='*.sh' --exclude='*.yml' --exclude='/dump' --exclude='node_modules' --exclude='README.md' . dump
