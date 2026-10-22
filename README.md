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

## Short links for records (optional, recommended)
Without this, a record is packed into the link itself, which makes long links. With it, links look like `yoursite/r/k3x9q2Ab`, show a preview card in WhatsApp and iMessage, and last 30 days.
1. In Vercel, open the `side-b` project and go to the **Storage** tab.
2. Choose **Create Database** (or **Browse Marketplace**), pick **Upstash**, then **Upstash for Redis**.
3. Pick the **Free** plan and a region near your visitors (for India, Mumbai if offered), give it a name, and create it.
4. When asked, connect it to the `side-b` project for all environments. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to the project.
5. Redeploy (Deployments, the latest one, Redeploy). Press a record to check you get a `/r/` link.

