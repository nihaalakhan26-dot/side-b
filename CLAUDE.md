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
3. **Shop interior**: one 1920 by 1080 SVG in true one-point perspective. Everything is placed in the room in world units (2.4 to the centimetre at the back wall; x across, y down with the floor at 900, z depth with 0 at the back wall and negative towards the viewer) and projected through one vanishing point at eye height (960, 470) with `PJ(x, y, z)`. `box()` draws only the faces you could really see, `recess()` draws cubbies with their insides, `plane(z)` scales anything flat facing the viewer, and `disc()` lays circles flat. Use these for anything new so the perspective stays consistent.
   - **Look**: Japanese wood interiors, moody and warm, never like an office. Warm toasted-tan plaster framed by dark timber posts and a beam, above dark walnut wainscot panelling (plain pale walls looked sterile and were rejected), a dark slatted wood ceiling, a dark oak floor, all colour coming from the album covers and the decor, and the light coming from inside the shelves and from paper lanterns and bronze pendants. No daylight, no orange. The whole room is warmed and dimmed by an amber multiply layer, with soft gradient glows (`lampG`) round the lanterns and lamps and a deep vignette. Framed gig posters and a small shelf of a plant and records fill the wall between the record wall and the booth. (The owner liked the layout of the "repainted to match the shop front" version, commit b133603, but hated its orange and its booth; that layout is the base. Many other rooms and booths were tried and rejected, including a photo-booth style booth: "don't make it a kissing booth or photo booth".)
   - **Record wall** (left): dark walnut cubbies, 12 by 5, each lit by a warm strip under its top edge with light falling down its back; about five in six hold a real album face out (names on hover), the rest a stack, a record, spines or a small plant. Records, framed covers and a clock hang above it.
   - **Counter** under the wall: a reel-to-reel, bins of records, two turntables and a lamp on top; hi-fi speakers at each end, lit cubbies of LP spines and an amp in its front. Crates of new arrivals and bargains on the floor, a plant in a terracotta pot, a striped rug.
   - **Hanging**: round paper lanterns at different heights, bronze pendant lamps, and a hanging plant by the booth.
   - **Pressing Booth** (right): an open listening corner with no walls, curtains or screens (closed booths, cabins, photo-booth shapes and shoji rooms were all rejected as too enclosed). A raised dark wood platform; against the wall a low walnut shelf of lit record spines with a speaker on each end and a plant; a long walnut counter with a slatted front and a lit top holding a turntable, a small record press (blue base, steel posts, platens on a black puck), headphones and a red lamp; three stools in front; a lit "Pressing Booth" plaque hung on wires over it between two bronze pendants; the "Step into the booth" note on the counter front. Clicking it opens the builder.
   - The room is drawn for 1920 by 1080, and `fitShop` widens or deepens the view to fill other screen shapes. Phones scroll across it, starting centred on the booth.
4. **Builder (the "studio")**: works like the Vinylacy configurator (vinylacy.com/pages/configurator-beta), which the owner liked for its flow on phone and desktop but not its look. Earlier versions with menus of parts inside each step, and one where the layout changed from step to step, were rejected: keep it simple and keep it still.
   - **One layout for every step**: the record on the bench on the left and a panel on the right (on phones, the record on top at a fixed height and the panel below), with a bar along the bottom holding back, the step's name with "4 of 11", a progress line and a big round next arrow (the Press button on the last step). The bar has a fixed height, so the record never moves or changes size between steps. Tapping the step's name lists every step with what it's set to, to jump straight to one. The header names the four groups: Songs, Sleeve, Vinyl, Press.
   - **One decision per step, in a straight line** (`FLOW` in the code): Songs; Picture, Colours, Words, Draw, Finishing touches; Pressing, Vinyl colour (skipped when the pressing has no colour), Shape, Label; Ready to press. Choices are chips or picture tiles in the panel and apply the moment they're tapped; pressings, shapes and labels show a line about the chosen one (`OPT_NOTES`).
   - **No Words section and no Notes section** (both removed at the owner's request). There are no title presets, layouts or title sizes for new records: the cover's words are whatever the person writes in the **Words** step, as many as they like (up to 30). Each sits right on the sleeve preview as real text (`renderTextLayer`, while the cover image is drawn without its words): tap to select, drag to move, pull the corner handle to resize, pull the top knob to turn, × to remove. The panel holds the wording, six typefaces, colours, size and turn sliders, and Copy it. A new record starts with one line, "A record for you", to edit. Older records keep their old title, line and credit on the cover, and their notes still show, but neither can be added any more.
   - **Ready to press** asks for the record's name and who it's from and for (used on the gift tag, the link preview, the back of the sleeve and the label), shows a recap of every step (tap a line to go back to it) and the tracklist, and holds **Press the record**.
   - **Start over** and **Turn it over** sit at the top of the bench. Start over keeps the old record reachable with "Carry on with your last record".
   What the steps cover:
   - **Songs**: search songs, add to side A or B, reorder, move between sides, remove. Minimum 6 songs to press. 6 to 10 songs makes a 10-inch, 11 or more makes a 12-inch LP, up to 12 per side.
   - **Sleeve**: a picture (full bleed or framed) with 10 filters (original, black and white, sepia, faded 70s, duotone, riso print, halftone, cyanotype, light leak, film grain) done with canvas blend modes; ready-made colour sets plus Background, Lettering and Accent pickers; words; drawing straight onto the sleeve (pen strokes, points 0 to 1000, at most 8,000 points); **On the front** switches (obi strip, stereo banner, hype sticker with your own three lines, 180 gram badge, worn edges) and **On the back** switches (credits, legal small print, half-speed mastered logo, barcode; a real EAN-13 with the 20 to 29 in-store prefix).
   - **Fixed spots, so nothing overlaps**: the stereo banner runs across the top, the obi strip down the left, the sticker sits top right and the badge bottom right. The back is a fixed layout: header, tracklist, then credits, and a bottom row with the small print, the half-speed logo and the barcode each in their own column. Front switches show the front, back switches turn the sleeve over.
   - Colours are stored as hex; older records that stored list positions are converted when opened, and older records with one of the old title styles are given the nearest typeface and layout.
   - **Vinyl**: 16 pressings based on coloredvinylrecords.com categories (black, solid, transparent, ultra clear, metallic, iridescent, marbled, splatter, swirl, cloudy, half and half, striped, colour in colour, smoke, eco-mix, picture disc), 5 shapes (round, heart, star, hexagon, octagon), 5 label styles, then the main, second and label colours. Colour rows end in an "Any colour" chip that opens the full picker.
5. **Receiving it**: a kraft record bag with a name tag opens onto a listening room seen straight down onto a wooden table, so everything shares one view: a stack of real records with a vinyl peeking out, a plant from above, window light and sun shadows, a silver turntable. The sleeve and a card sit on the left, the turntable in the middle, a receiver on the right. Pull the sleeve forward, flip it to read the tracklist and notes, slide the record out, carry it to the turntable.

## The turntable (everything works)

Power knob, start/stop, 33 and 45 speeds (45 plays faster and higher), pitch slider (plus or minus 8 percent), target light, cue lever, dust cover, tonearm drag (needle position chooses the song, each ring is a track), hold the record to slow it down, tap the label to flip sides. The receiver has volume, tone and balance knobs and live VU meters.

Playback: each song is a 30-second preview. Real songs play the Apple preview through an `<audio>` element (playback rate follows the platter speed, pitch is not preserved). Practice songs are synthesised in the browser with the Web Audio API.

## Data and sharing

- The record (songs, design, words, photo, and notes on older records) is JSON, compressed with `CompressionStream('deflate-raw')` and base64url encoded. That packed record is what gets stored or put in a link.
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
