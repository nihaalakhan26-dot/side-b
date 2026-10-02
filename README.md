# Side B

A small record shop with a pressing booth in the back. Pick songs, design a record, and send it to someone as a link.

## What's in here

- `index.html` is the whole site.
- `api/search.js` searches Apple's music catalogue (India store). The site calls it when you search for songs.
- `api/albums.js` finds cover art for the real albums on the shop's shelves. Edit the list at the top of it to change what's on display.

## Put it online with Vercel

### The easy way: GitHub
1. Create a free account on github.com and make a new repository called `side-b`.
2. Click "uploading an existing file" and drag in everything from this folder (keep the `api` folder as a folder).
3. Go to vercel.com, sign in with GitHub, click "Add New", then "Project", and import the `side-b` repository.
4. Leave every setting as it is and click "Deploy". You'll get a link like `side-b.vercel.app`.

Any time you change a file on GitHub, Vercel updates the site on its own.

### The terminal way
If you have Node installed, open a terminal in this folder and run:

    npx vercel

Follow the prompts, then run `npx vercel --prod` to publish.

## Good to know
- Song search, cover art and 30-second previews come from Apple. There's no database.
- Records are stored inside the link itself, so nothing needs saving on a server.
- Photos on the sleeve make links very long. A later version could store photos with Vercel Blob so links stay short.
