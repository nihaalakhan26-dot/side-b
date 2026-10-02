# Side B

Side B is a web experience where you walk into an illustrated record shop, step into a pressing booth at the back, build a custom vinyl record, and send it to someone as a link. The person who receives it opens a wrapped record-shop bag and plays the record on a fully working turntable.

This file is a handoff from the conversation where the project was designed. Read it before making changes.

## How the project got here

It started as a record store simulator, then went through a few ideas: a shareable "shelf of albums" gift, and finally a custom vinyl builder. The builder won because it gives people a clear reason to use it (a modern mixtape you make for someone) and it doesn't need a big catalogue or a database. The record shop is now the setting and the wrapping, not the product.

Ideas that were tried and dropped, and why:
- Hiding a YouTube player to play full songs: YouTube's rules require the player to stay visible, and ads can't be turned off. Use 30-second previews plus "listen to the full song" links instead.
- Deezer for search: not available in India. Apple's iTunes catalogue is used instead.
- Photorealism: hand-coded scenes can't fully reach it. A flat 2D editorial illustration style was tried next and dropped for feeling fake and boring. The scenes are now drawn ambient and lifelike, after reference photos (see Style below).

## Files

- `index.html` is the entire site: HTML, CSS and JavaScript in one file.
- `api/search.js` is a Vercel function. The site calls `/api/search?q=...` and it asks Apple's iTunes Search API (country `IN`, songs only) and returns track name, artist, album, artwork, preview URL and an Apple Music link. Apple blocks direct browser calls, which is why this function exists.
- `api/albums.js` is a Vercel function. It holds the list of real albums on the shop's shelves (Ariana Grande, Tame Impala, The Beatles, Mac Miller, Sade and many more), looks up their cover art on iTunes and returns it. The answer is cached for a week. To change what's on the shelves, edit the list at the top of that file.
- `package.json` only declares Node 18 or newer. There's no build step.
- `README.md` has deployment steps.

## The experience, in order

1. **Intro screen**: the name, one line ("Make a record for someone.") and one button, "Walk up to the shop". Keep it this short. The example gift is still reachable from code as `window.__example()`.
2. **Outside**: a shop front at night in the rain, after the Ultima Thule record shop: yellow sign with red script and red side panels, black frames, lit windows full of real album covers, a recessed wooden door, granite, double yellow lines. Tap the door, it opens and the view zooms in.
3. **Shop interior**: a 1920 by 1080 stage scaled to fit. A wall of cubbies lit from the top, each holding a real album, paper lanterns, a long counter with turntables, an orange lamp and speakers, floor crates, a striped rug, and the **Pressing Booth**: a lit wooden display unit with ledges of covers, a turntable over an amp with blue meters, crates and speakers, under a glowing script sign. Clicking the booth zooms in and opens the builder.
4. **Builder (the "studio")**: fits in one screen. The record preview stays on the left on a work mat; the controls are in a right-hand panel with five steps as folder tabs:
   - **01 Songs**: search songs, add to side A or B, reorder, move between sides, remove. Minimum 6 songs to press. 6 to 10 songs makes a 10-inch, 11 or more makes a 12-inch LP, up to 12 per side.
   - **02 Sleeve**: your own photo (full bleed, framed, duotone, circle), 14 colourways, 15 artwork patterns, 7 title styles, and extras (obi strip, hype sticker, worn edges). Options show as live thumbnails of the actual sleeve.
   - **03 Vinyl**: 16 pressings based on coloredvinylrecords.com categories (black, solid, transparent, ultra clear, metallic, iridescent, marbled, splatter, swirl, cloudy, half and half, striped, colour in colour, smoke, eco-mix, picture disc), 5 shapes (round, heart, star, hexagon, octagon), 14 named colours, 5 label styles and label colours.
   - **04 Words**: credits laid out like the back of a real record: title, line on the cover, pressed by, for, year, catalogue number.
   - **05 Notes**: up to 6 sticky notes in 5 colours, placed on the front or back of the sleeve and dragged into position.
   - **Press the record** creates the share link.
5. **Receiving it**: a kraft record bag with a name tag opens onto a listening room (plaster wall, a framed album, a small wooden radio, a real record leaning on the wall with its vinyl out, walnut credenza, silver turntable). The sleeve and a card sit on the left, the turntable in the middle, a receiver on the right. Pull the sleeve forward, flip it to read the tracklist and notes, slide the record out, carry it to the turntable.

## The turntable (everything works)

Power knob, start/stop, 33 and 45 speeds (45 plays faster and higher), pitch slider (plus or minus 8 percent), target light, cue lever, dust cover, tonearm drag (needle position chooses the song, each ring is a track), hold the record to slow it down, tap the label to flip sides. The receiver has volume, tone and balance knobs and live VU meters.

Playback: each song is a 30-second preview. Real songs play the Apple preview through an `<audio>` element (playback rate follows the platter speed, pitch is not preserved). Practice songs are synthesised in the browser with the Web Audio API.

## Data and sharing

- There is no database. The whole record (songs, design, words, notes) is JSON, compressed with `CompressionStream('deflate-raw')`, base64url encoded and stored in the URL after `#r=`. A typical link is a few hundred characters.
- A sleeve photo is squeezed into the link too, which makes it very long. A future version should store photos separately (for example Vercel Blob) and keep only a reference in the link.
- The draft being built is saved in the browser's `localStorage` under `sideb-press`.
- When the site isn't on a real web host (for example a local file or the Claude preview), search falls back to a practice catalogue of made-up albums and songs generated in code.

## Style

The look is **ambient and lifelike**, like a real record shop photographed at night: warm light from lanterns, shelf lights and lamps, soft shadows and glow, real materials (wood grain, granite, plaster, brushed metal), depth and falloff into darkness, and real album covers on every shelf. The reference photos were the Ultima Thule shop front, a backlit record wall with paper lanterns, a wooden listening unit with JBL-style speakers and a striped rug, and a silver turntable on a wooden credenza.

Everything is still drawn in code (CSS, SVG and canvas textures), so it won't be photographic. Get closer with lighting, texture and shading, not outlines.

Palette: warm walnut and oak browns, cream, faded black, the shop sign's yellow `#F1BD2B` and red `#B8232A`, burgundy `#7B2A2E` and mustard `#D9A33A` for the interface, warm light around `#FFD49A`.

Type: Archivo (grotesk), Archivo Narrow, IBM Plex Mono (labels and archival details), Caveat (handwriting), Yellowtail (sign-painter script), DM Serif Display.

UI language for the builder: paper texture, thin borders and double rules, folder tabs, small boxed archival labels, square buttons.

Avoid: thick black ink outlines, flat colour fills, hard offset shadows, halftone screens, made-up album covers where real ones fit, childish cartoon styling.

## Writing rules for anything on the site

- No em dashes.
- Plain, warm, human language. No jargon, no filler phrases.

## Known limits and ideas for later

- Photos in links (see above).
- The shelves show practice covers until `/api/albums` answers, and for good where there's no search function (a local file, the Claude preview).
- A person browsing the record wall was in the reference images but left out until it can be drawn well.
- Performance: the turntable redraws only when something changes. Keep it that way.

## Working on this repo

Changes merged into `main` deploy to the live Vercel site automatically. Other branches get their own Vercel preview link, so test there first.
