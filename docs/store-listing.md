# Store listing

Texts of the Firefox Add-ons and Chrome Web Store pages, in English and Brazilian Portuguese.

| Store | Where each text goes | Updated |
| --- | --- | --- |
| addons.mozilla.org | summary and description, through the add-on edit API (`PATCH /api/v5/addons/addon/<slug>/`, the `AMO_JWT_*` key) | 2026-10-10 |
| Chrome Web Store | summary: `description` in `platform/chromium/manifest.json`, which the store shows and reads only from a new version; description: the Developer Dashboard, by hand (the API has no listing method) | pending (T-707) |

The summary fits both stores: the Chrome Web Store takes up to 132 characters in the manifest's `description`, addons.mozilla.org up to 250. The descriptions are in the Markdown addons.mozilla.org renders (bold, lists, links; it shows HTML tags as text); the Developer Dashboard takes plain text, so there the bold marks go and each link becomes its address.

## Summary

| Locale | Summary |
| --- | --- |
| en-US | Blocks the ads Twitch puts in live streams by editing the stream playlists inside the Twitch player. No proxy, no data collected. |
| pt-BR | Bloqueia os anúncios das lives da Twitch editando as playlists do stream dentro do player. Sem proxy e sem coleta de dados. |

## Description, en-US

```markdown
Purple blocks the ads Twitch puts in live streams, before the player loads them.

**How it works**

Purple runs inside the Twitch player and edits the stream playlists the player receives. A playlist without ads reaches the player untouched. During an ad break, Purple asks Twitch for the same stream through other player types and gives the player one without ads, in the quality it is on. Ad segments no other stream replaces are answered with a blank segment, so the player never loads the ad.

**Features**

- Prerolls and midrolls on live streams
- The player keeps its quality
- No ad overlay on the page
- Turn it off for one channel from the toolbar button
- Requests go only to Twitch: no proxy, no other server
- No data collected

**Notes**

- Not compatible with other Twitch ad blockers (Alternate Player for Twitch, Twitch ad-block userscripts): they edit the same playlists.
- Twitch changes how it serves ads. When an ad gets through, report it on [GitHub](https://github.com/arthurbolsoni/Purple-adblock/issues) with the channel and the time.

Open source under the Apache License 2.0, provided as is, without warranty: [github.com/arthurbolsoni/Purple-adblock](https://github.com/arthurbolsoni/Purple-adblock)
```

## Description, pt-BR

```markdown
O Purple bloqueia os anúncios que a Twitch coloca nas lives, antes que o player os carregue.

**Como funciona**

O Purple roda dentro do player da Twitch e edita as playlists do stream que o player recebe. Uma playlist sem anúncios chega ao player sem alteração. Durante um intervalo de anúncios, o Purple pede à Twitch o mesmo stream por outros tipos de player e entrega ao player um sem anúncios, na qualidade em que ele está. Os segmentos de anúncio que nenhum outro stream substitui recebem um segmento em branco, e o player nunca carrega o anúncio.

**Recursos**

- Anúncios no início (preroll) e no meio (midroll) das lives
- O player mantém a qualidade
- Sem a sobreposição de anúncio na página
- Desligue para um canal pelo botão na barra de ferramentas
- As requisições vão só para a Twitch: sem proxy, sem outro servidor
- Nenhum dado coletado

**Observações**

- Não é compatível com outros bloqueadores de anúncios da Twitch (Alternate Player for Twitch, userscripts de bloqueio): eles editam as mesmas playlists.
- A Twitch muda a forma de entregar anúncios. Quando um anúncio passar, informe no [GitHub](https://github.com/arthurbolsoni/Purple-adblock/issues) com o canal e o horário.

Código aberto sob a Apache License 2.0, fornecido como está, sem garantia: [github.com/arthurbolsoni/Purple-adblock](https://github.com/arthurbolsoni/Purple-adblock)
```
