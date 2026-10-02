# Side B

Side B is a web experience where you walk into an illustrated record shop, step into a pressing booth at the back, build a custom vinyl record, and send it to someone as a link. The person who receives it opens a wrapped record-shop bag and plays the record on a fully working turntable.

This file is a handoff from the conversation where the project was designed. Read it before making changes.

## How the project got here

It started as a record store simulator, then went through a few ideas: a shareable "shelf of albums" gift, and finally a custom vinyl builder. The builder won because it gives people a clear reason to use it (a modern mixtape you make for someone) and it doesn't need a big catalogue or a database. The record shop is now the setting and the wrapping, not the product.

Ideas that were tried and dropped, and why:
- Hiding a YouTube player to play full songs: YouTube's rules require the player to stay visible, and ads can't be turned off. Use 30-second previews plus "listen to the full song" links instead.
- Deezer for search: not available in India. Apple's iTunes catalogue is used instead.
- Photorealism: hand-coded scenes can't reach it. The style is now a deliberate 2D editorial illustration (see Style below).

## Files

- `index.html` is the entire site: HTML, CSS and JavaScript in one file.
- `api/search.js` is a Vercel function. The site calls `/api/search?q=...` and it asks Apple's iTunes Search API (country `IN`, songs only) and returns track name, artist, album, artwork, preview URL and an Apple Music link. Apple blocks direct browser calls, which is why this function exists.
- `package.json` only declares Node 18 or newer. There's no build step.
- `README.md` has deployment steps.

## The experience, in order

1. **Intro screen**: "Walk up to the shop". Also "Skip to your record" if a draft exists, and "Or open a finished record" which opens an example gift.
2. **Outside**: an illustrated storefront at night in the rain. Tap the door, it opens and the view zooms in.
3. **Shop interior**: a 1920 by 1080 stage scaled to fit. A dense record wall with paper lanterns, a cabinet of spines with speakers, floor crates, and the **Pressing Booth** at the back. Clicking the booth zooms in and opens the builder.
4. **Builder (the "studio")**: fits in one screen. The record preview stays on the left on a work mat; the controls are in a right-hand panel with five steps as folder tabs:
   - **01 Songs**: search songs, add to side A or B, reorder, move between sides, remove. Minimum 6 songs to press. 6 to 10 songs makes a 10-inch, 11 or more makes a 12-inch LP, up to 12 per side.
   - **02 Sleeve**: your own photo (full bleed, framed, duotone, circle), 14 colourways, 15 artwork patterns, 7 title styles, and extras (obi strip, hype sticker, worn edges). Options show as live thumbnails of the actual sleeve.
   - **03 Vinyl**: 16 pressings based on coloredvinylrecords.com categories (black, solid, transparent, ultra clear, metallic, iridescent, marbled, splatter, swirl, cloudy, half and half, striped, colour in colour, smoke, eco-mix, picture disc), 5 shapes (round, heart, star, hexagon, octagon), 14 named colours, 5 label styles and label colours.
   - **04 Words**: credits laid out like the back of a real record: title, line on the cover, pressed by, for, year, catalogue number.
   - **05 Notes**: up to 6 sticky notes in 5 colours, placed on the front or back of the sleeve and dragged into position.
   - **Press the record** creates the share link.
5. **Receiving it**: a kraft record bag with a name tag opens onto a listening room (plaster wall, framed print, a record leaning on the wall, walnut credenza). The sleeve and a card sit on the left, the turntable in the middle, a receiver on the right. Pull the sleeve forward, flip it to read the tracklist and notes, slide the record out, carry it to the turntable.

## The turntable (everything works)

Power knob, start/stop, 33 and 45 speeds (45 plays faster and higher), pitch slider (plus or minus 8 percent), target light, cue lever, dust cover, tonearm drag (needle position chooses the song, each ring is a track), hold the record to slow it down, tap the label to flip sides. The receiver has volume, tone and balance knobs and live VU meters.

Playback: each song is a 30-second preview. Real songs play the Apple preview through an `<audio>` element (playback rate follows the platter speed, pitch is not preserved). Practice songs are synthesised in the browser with the Web Audio API.

## Data and sharing

- There is no database. The whole record (songs, design, words, notes) is JSON, compressed with `CompressionStream('deflate-raw')`, base64url encoded and stored in the URL after `#r=`. A typical link is a few hundred characters.
- A sleeve photo is squeezed into the link too, which makes it very long. A future version should store photos separately (for example Vercel Blob) and keep only a reference in the link.
- The draft being built is saved in the browser's `localStorage` under `sideb-press`.
- When the site isn't on a real web host (for example a local file or the Claude preview), search falls back to a practice catalogue of made-up albums and songs generated in code.

## Style

The look is a **contemporary mid-century editorial illustration**: 1960s to 70s graphic design, black ink outlines with a slight hand-drawn wobble, flat colour, simplified perspective, geometric composition, hard-edged offset shadows instead of soft blur, graphic light (bands and rings, not realistic glow), subtle paper grain and a halftone screen over everything. Nostalgic but not distressed, retro but not kitschy.

Palette: burgundy `#7B2A2E`, mustard `#D9A33A`, walnut browns (`#5B3A22`, `#6A3F22`, `#B07A45`), cream (`#E5D5B5`, `#F7F1E3`), faded black `#2B2522`, ink `#1b1714`, with teal, navy and orange as accents.

Type: Archivo (grotesk), Archivo Narrow, IBM Plex Mono (labels and archival details), Caveat (handwriting), Yellowtail (sign-painter script), DM Serif Display.

UI language for the builder: paper texture, thin borders and double rules, folder tabs, small boxed archival labels, square buttons with a small offset shadow.

Avoid: photorealism, 3D renders, glossy gradients, childish cartoon styling.

## Writing rules for anything on the site

- No em dashes.
- Plain, warm, human language. No jargon, no filler phrases.

## Known limits and ideas for later

- Photos in links (see above).
- The record wall uses practice covers. It could show real albums from Apple's catalogue.
- A person browsing the record wall was in the reference images but left out until it can be drawn well.
- Performance: the turntable redraws only when something changes. Keep it that way.

## Working on this repo

Changes merged into `main` deploy to the live Vercel site automatically. Other branches get their own Vercel preview link, so test there first.
