# Side B

Side B is a web experience where you walk into an illustrated record shop, step into a pressing booth at the back, build a custom vinyl record, and send it to someone as a link. The person who receives it opens a wrapped record-shop bag and plays the record on a fully working turntable.

This file is a handoff from the conversation where the project was designed. Read it before making changes.

## How the project got here

It started as a record store simulator, then went through a few ideas: a shareable "shelf of albums" gift, and finally a custom vinyl builder. The builder won because it gives people a clear reason to use it (a modern mixtape you make for someone) and it doesn't need a big catalogue or a database. The record shop is now the setting and the wrapping, not the product.

Ideas that were tried and dropped, and why:
- Hiding a YouTube player to play full songs: YouTube's rules require the player to stay visible, and ads can't be turned off. Use 30-second previews plus "listen to the full song" links instead.
- Deezer for search: not available in India. Apple's iTunes catalogue is used instead.
- Photorealism: hand-coded scenes can't reach it. A flat 2D editorial style with ink outlines felt fake and boring, and a soft night-time "lifelike" pass still looked 2D. The chosen look is a rich, sunlit illustration (see Style below), based on an illustration of the Ultima Thule record shop the owner supplied.

## Files

- `index.html` is the entire site: HTML, CSS and JavaScript in one file.
- `api/search.js` is a Vercel function. The site calls `/api/search?q=...` and it asks Apple's iTunes Search API (country `IN`, songs only) and returns track name, artist, album, artwork, preview URL and an Apple Music link. Apple blocks direct browser calls, which is why this function exists.
- `api/albums.js` is a Vercel function. It holds the list of real albums on the shop's shelves (Ariana Grande, Tame Impala, The Beatles, Mac Miller, Sade and many more), looks up their cover art on iTunes and returns it. The answer is cached for a week. To change what's on the shelves, edit the list at the top of that file.
- `api/record.js` is a Vercel function for short links. Pressing a record saves it in Upstash Redis for 30 days and gives a link like `/r/k3x9q2Ab`. The function also serves that page with a link preview (who it's from, the record's name, a picture of the sleeve). It allows 20 records per person per hour.
- `vercel.json` sends `/r/...` addresses to that function and bundles `index.html` with it.
- `package.json` only declares Node 18 or newer. There's no build step.
- `README.md` has deployment steps.

## The experience, in order

1. **Intro screen**: the name, one line ("Make a record for someone.") and one button, "Walk up to the shop". Keep it this short. The example gift is still reachable from code as `window.__example()`.
2. **Outside**: a sunny afternoon, after the Ultima Thule illustration: navy shop front with three dome lamps, yellow sign with red script and red side panels, warm orange windows with a paper lantern, real album covers, plants and crates, a red door in a tiled lobby, red brick with a copper downpipe and a potted tree on the left, cream stone with a hanging record sign and a bollard on the right. Tap the door, it opens and the view zooms in.
3. **Shop interior**: one 1920 by 1080 SVG, scaled to fit, drawn to scale (2.4px to the centimetre against the back wall, a little more for things nearer the viewer: a cover is 31cm, a turntable 45cm, an LP spine about 3mm). Orange walls, a wall of cubbies with a real album in each, paper lanterns, a counter with turntables, bookshelf speakers, an orange lamp and cubbies of LP spines, crates on the floor, a striped rug, a monstera, and the **Pressing Booth**: a wooden listening unit with three ledges of covers, crates, a turntable on an amp with blue meters, speakers and LPs, under a hanging navy sign. Clicking the booth zooms in and opens the builder. Keep everything to scale when adding objects.
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

- The record (songs, design, words, notes, photo) is JSON, compressed with `CompressionStream('deflate-raw')` and base64url encoded. That packed record is what gets stored or put in a link.
- Short links: when Upstash is connected (Vercel sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`), pressing stores the packed record plus a small sleeve picture under `rec:<id>` with a 30-day expiry and shares `/r/<id>`. Each record is about 14 KB (more with a photo), so the free tier (256 MB) holds about 18,000 at a time. After 30 days the link shows "This record has come off the shelf".
- If storage isn't set up or doesn't answer, pressing falls back to packing the record into the link itself (below), so sharing never breaks.
- New share links put the record after `?r=`, because some apps and link redirects drop the part after `#`. A record with a photo is too long for that and goes after `#r=`. Old `#r=` links still open. On load, `?r=` is moved into `#r=` and handled the same way.
- Links are unpacked with `DecompressionStream` where the browser has it, and with a small built-in inflater (`inflateRaw`) where it doesn't (iPhones before iOS 16.4, some in-app browsers).
- Links pressed on a Vercel branch preview point at that preview, which other people may not be able to open. The share dialog says so.
- The draft being built is saved in the browser's `localStorage` under `sideb-press`. Every visit starts a new record. If the last one had songs or a name, the booth shows "Carry on with your last record". After pressing, "Make another record" starts fresh. Someone who receives a record gets "Make one back", which starts a new record addressed to the sender.
- Sound: one button mutes everything, and the choice is remembered (`sideb-muted`). The outside ambience is a quiet low room tone, silent in the builder and the listening room. Keep it gentle.
- When the site isn't on a real web host (for example a local file or the Claude preview), search falls back to a practice catalogue of made-up albums and songs generated in code.

## Style

The look is a **rich, sunlit illustration**, taken from the Ultima Thule shop illustration the owner supplied: flat shapes with no outlines, strong afternoon sunlight from the upper left, hard-edged cool shadows (`rgba(24,30,70,.3)`) that fall down and to the right, light shafts through windows, a fine grain over everything, lots of small real-world detail (plants, lamps, crates, posters, tiles), and real album covers wherever covers appear. Objects show their top and side faces so they read as solid, not flat.

Scale matters: draw things at their real sizes relative to each other (see the shop interior notes above).

Palette: navy `#1F3A63` (lighter `#2E5488`, darker `#152A4A`), sign yellow `#EDB33A`, red `#B3252B`, orange walls `#D86A2C`, terracotta `#C4572B`, brick `#B9533A`, cream stone `#E8DCC1`, woods `#C98A4E` `#9A5A2C` `#6B3A1A`, plant greens `#2F6238` `#3E7A45`, burgundy `#7B2A2E` for interface buttons.

Type: Archivo (grotesk), Archivo Narrow, IBM Plex Mono (labels and archival details), Caveat (handwriting), Yellowtail (sign-painter script), DM Serif Display.

UI language for the builder: paper texture, thin borders and double rules, folder tabs, small boxed archival labels, square buttons.

Avoid: black ink outlines, soft glossy gradients standing in for lighting, objects at the wrong size for each other, made-up album covers where real ones fit, childish cartoon styling.

## Writing rules for anything on the site

- No em dashes.
- Plain, warm, human language. No jargon, no filler phrases.

## Known limits and ideas for later

- Records expire after 30 days. The free Upstash database is archived if nothing touches it for 14 days (restorable from the Upstash console).
- The shelves show practice covers until `/api/albums` answers, and for good where there's no search function (a local file, the Claude preview).
- A person browsing the record wall was in the reference images but left out until it can be drawn well.
- Performance: the turntable redraws only when something changes. Keep it that way.

## Working on this repo

Changes merged into `main` deploy to the live Vercel site automatically. Other branches get their own Vercel preview link, so test there first.
