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
- `img/storefront.webp` is the owner's illustration of the shop front (after the Ultima Thule record shop). The outside scene shows it as is, with the sign repainted in SVG to say Side B and the door cut out so it can swing open.
- `package.json` only declares Node 18 or newer. There's no build step.
- `README.md` has deployment steps.

## The experience, in order

1. **Intro screen**: the name, one line ("Make a record for someone.") and one button, "Walk up to the shop". Keep it this short. The example gift is still reachable from code as `window.__example()`.
2. **Outside**: the owner's picture, `img/storefront.webp`, shown exactly as supplied. Only the sign is repainted on top, with the same words and layout as the earlier drawn sign: "NEW & SECOND HAND LPs TAPES ETC." on the left, "THE Side B RECORD SHOP" in the centre, "HOME OF THE PRESSING BOOTH & RECORDS BY POST" on the right (this also covers the real shop's phone number). Coordinates are the picture's own pixels (1536 by 1024); the door is at x 696 to 860, y 484 to 860, hinged on the right. The whole picture always shows (the owner found filling the screen too zoomed in). On wide screens the street carries on past its edges (`streetSides`): brick on the left and stone on the right, drawn to the picture's own brick courses, stone rows, colours and sun shadows, with a mirrored strip at the left edge to complete the flower pot, and the pavement, kerb and road stretched out from its edge. Tall phones show the picture over a blurred copy. Behind the door is a live copy of the shop interior drawing (`fillDoorway`), looking at the record wall, so opening the door shows the inside of the shop. Tap the door, it swings open and the view zooms in. The owner wants the front to look exactly like this picture, so don't redraw it.
3. **Shop interior**: one 1920 by 1080 SVG in true one-point perspective. Everything is placed in the room in world units (2.4 to the centimetre at the back wall; x across, y down with the floor at 900, z depth with 0 at the back wall and negative towards the viewer) and projected through one vanishing point at eye height (960, 470) with `PJ(x, y, z)`. `box()` draws only the faces you could really see (tops below eye height, undersides above it, the side facing the centre), `recess()` draws cubbies with their insides, `plane(z)` scales anything flat facing the viewer, and `disc()` lays circles flat (platters, pot rims). Use these for anything new so the perspective stays consistent. In the room (after the owner's reference photos of real listening bars): orange walls, navy ceiling, wood floor, sunlight from the front-left with hard shadows. On the left, the **record wall**: walnut cubbies 12 by 5, with open wall above them, each lit by a warm strip under its top edge (`litRecess`) with a real album in it, and paper lanterns hanging in front. In front of it a 90cm counter: a reel-to-reel, two bins of records, two turntables, a red mushroom lamp on top; a hi-fi speaker (cream woofer) at each end, lit cubbies of LP spines and an amplifier with blue meters in its front. On the floor: a striped rug, crates of new arrivals and bargains, a plant in a white pot. On the right, the **Pressing Booth**: a walnut booth built out from the back wall, with a backlit "Pressing Booth" sign on its header and a warm-lit inside. On its back wall are three shelves of covers against white tiles (some with the record pulled half out), a speaker either side and a yellow pendant lamp. Its desk holds a turntable under a closed lid with a violet record, a leaning sleeve, headphones on a stand, a cream speaker and a plant, with a pale blue receiver and lit LP cubbies in its front. The left pillar has tiled niches of covers, the right pillar records framed in a column, and a stool waits in front. The room is drawn for 1920 by 1080, and `fitShop` widens or deepens the view to fill other screen shapes, because the walls, floor and ceiling carry on. Phones scroll across it, starting centred on the booth. Hovering any album shows its name and artist. Clicking the booth zooms in and opens the builder.
4. **Builder (the "studio")**: fits in one screen on desktop. The record preview stays on the left on a work mat and the controls are in a right-hand panel; on phones the preview sits on top and the panel scrolls below it. There are five steps as folder tabs, in this order, so the words and layout come before the look:
   - **01 Songs**: search songs, add to side A or B, reorder, move between sides, remove. Minimum 6 songs to press. 6 to 10 songs makes a 10-inch, 11 or more makes a 12-inch LP, up to 12 per side.
   - **02 Words**: title, line under the title, pressed by, for, year, catalogue number. Then how the words sit on the cover: one of three **layouts** (Top, Centre, Bottom, shown as live thumbnails), one of six **typefaces** (Grotesk, Narrow, Serif, Script, Handwritten, Typewriter), a title size slider, and switches for the title, the line and the "pressed by and for" credit. There are no per-style title designs any more; `coverLayout()` wraps the title to at most three lines and shrinks it until it fits.
   - **03 Sleeve**: a picture (full bleed or framed) with 10 filters (original, black and white, sepia, faded 70s, duotone, riso print, halftone, cyanotype, light leak, film grain) done with canvas blend modes; your own Background, Lettering and Accent colours; **On the front** switches (obi strip, stereo banner, hype sticker with your own three lines, 180 gram badge, worn edges); **On the back** switches (credits, legal small print, half-speed mastered logo, barcode; a real EAN-13 with the 20 to 29 in-store prefix); drawing straight onto the sleeve preview (saved as pen strokes, points 0 to 1000, at most 8,000 points); and up to 8 pieces of extra text placed anywhere on the front.
   - **Fixed spots, so nothing overlaps**: the stereo banner runs across the top, the obi strip down the left, the sticker sits top right and the badge bottom right, and the credit runs along the bottom. The title keeps clear of whichever are switched on, and a framed picture takes the space the words leave (stepping aside from the sticker). The back is a fixed layout too: header, tracklist, then credits, and a bottom row with the small print, the half-speed logo and the barcode each in their own column. Front switches show the front, back switches turn the sleeve over.
   - Every colour choice is a folded **colour field** (`colourField`): the colour's name, a chip and its hex code, opening to a tray of swatches plus the full colour picker. Only drawing inks stay as an open row, because you switch them while drawing. Colours are stored as hex; older records that stored list positions are converted when opened, and older records with one of the old title styles are given the nearest typeface and layout.
   - **04 Vinyl**: 16 pressings based on coloredvinylrecords.com categories (black, solid, transparent, ultra clear, metallic, iridescent, marbled, splatter, swirl, cloudy, half and half, striped, colour in colour, smoke, eco-mix, picture disc), 5 shapes (round, heart, star, hexagon, octagon), 5 label styles, then the main, second and label colours.
   - **05 Notes**: up to 6 sticky notes in 5 colours, placed on the front or back of the sleeve and dragged into position.
   - **Press the record** creates the share link.
5. **Receiving it**: a kraft record bag with a name tag opens onto a listening room seen straight down onto a wooden table, so everything shares one view: a stack of real records with a vinyl peeking out, a plant from above, window light and sun shadows, a silver turntable. The sleeve and a card sit on the left, the turntable in the middle, a receiver on the right. Pull the sleeve forward, flip it to read the tracklist and notes, slide the record out, carry it to the turntable.

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
