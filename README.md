# 🧠 Anonymous Thoughts

### Yell into the void — but like, aesthetically 💅

> A place to drop your **deepest thoughts**, **unfiltered confessions**, or just random brain static.
> No usernames. Just *vibes*.

---

## 🌐 What is this?

A minimalist, anonymous thought-sharing app for when:

* You're having an **existential crisis** at 2am 🌌
* You need to say something **real**, but not to *real* people 😶
* You want to scroll through the **pure chaos** of others’ minds 🔥

Built with:

🛠️ **Frontend:** React + TypeScript + Vite
🎨 **UI:** Tailwind CSS + DaisyUI for clean AF vibes
⚙️ **Backend:** Node.js + Express + TypeScript
💾 **Database:** Vercel KV (Serverless Redis) for persistent vibes
🚀 **Deployment:** Vercel for full-stack serverless speed

---

## 💻 Get it running (aka “how to scream into the void from localhost”)

This is now a full-stack application!

### Prerequisites
* Node.js (v18 or later recommended)
* npm or yarn

### Setup

1.  **Clone this bad boy:**
    ```bash
    git clone https://github.com/scottonanski/anonymous-thoughts.git
    cd anonymous-thoughts
    ```

2.  **Install Frontend Dependencies:**
    ```bash
    # In the root directory (anonymous-thoughts)
    npm install
    # or
    yarn install
    ```

3.  **Install Backend Dependencies:**
    ```bash
    cd api
    npm install
    # or
    yarn install
    cd .. 
    ```

4.  **Set up Environment Variables for Backend (Vercel KV):**
    *   Create a Vercel KV store via the Vercel dashboard and connect it to your project.
    *   In the `anonymous-thoughts` root directory, create a file named `.env`.
    *   Add your Vercel KV credentials and the API base URL to the `.env` file:
        ```env
        VITE_API_BASE_URL=/api

        # Vercel KV Environment Variables (get these from your Vercel dashboard)
        KV_URL="your_kv_url_here"
        KV_REST_API_URL="your_kv_rest_api_url_here"
        KV_REST_API_TOKEN="your_kv_rest_api_token_here"
        KV_REST_API_READ_ONLY_TOKEN="your_kv_rest_api_read_only_token_here"
        ```
    *   **Important:** Your `api/src/index.ts` also uses `dotenv.config()`. Ensure your Vercel KV variables are accessible to the backend. For local development with `npx vercel dev`, the root `.env` file will be picked up. For Vercel deployment, these variables must be set in your Vercel project's Environment Variables settings.

5.  **Let’s get this void lit (locally with Vercel CLI):**
    ```bash
    # In the root directory (anonymous-thoughts)
    npx vercel dev
    ```

6.  Then hit up [http://localhost:3000](http://localhost:3000) in your browser.
    And start typing your weird little thoughts, now with persistence!

---

## 🧩 File vibes

```plaintext
anonymous-thoughts/
├── api/                 # The Backend Awakens! (Node.js/Express/TypeScript)
│   ├── src/
│   │   ├── controllers/ # API request handlers
│   │   ├── routes/      # API route definitions
│   │   ├── services/    # Business logic, KV interaction
│   │   ├── types.ts     # Backend type definitions
│   │   └── index.ts     # Express app entry point
│   ├── package.json     # Backend dependencies
│   └── tsconfig.json    # Backend TypeScript config
├── components/        # Frontend: lil' reusable UI pieces
├── public/            # Frontend: icons and stuff
├── src/               # Frontend: React app source
│   ├── App.tsx        # Frontend: the brain
│   └── index.tsx      # Frontend: the heart
├── .env               # Local environment variables (VITE_API_BASE_URL, KV_*) - DO NOT COMMIT!
├── .gitignore         # Specifies intentionally untracked files that Git should ignore
├── vercel.json        # Vercel deployment configuration
├── vite.config.ts     # Frontend: speed machine settings
├── tsconfig.json      # Frontend: TypeScript wizardry
└── package.json       # Root: scripts & frontend spells, dev server
```

---

## 🧠 Why tho?

Because not everything needs to be performative.
Because sometimes your brain just needs a **dump zone**.
Because doomscrolling should at least be honest.
And now, your chaos can be *shared* and *persistent*.

---

## 🤝 Contributing

Got spicy ideas? Found a bug?
Wanna make this weirder, better, cooler?

Pull up with a PR or open an issue.
Just don’t be a jerk.

---

## 📜 License

MIT — *aka do what you want, just don’t sue me.*

---

## ⚡ Real talk

If you made it this far in the README, you either:

* Really care about anonymous social media
* Are avoiding doing your actual project
* Think this README is kinda 🔥 (thank you)

Either way, go check out the app. Or fork it. Or scream into it.
We built this weird little place for you. 🖤

---

## ✨ Live Demo!

Check it out: [anonymous-thoughts-roan.vercel.app](https://anonymous-thoughts-roan.vercel.app/)
*(It's alive! And your thoughts actually save now!)*

---

# 📡 Roadmap to Collective Screaming

## aka: How a Local Brain-Dump App Became a Full-Stack Emotional Megaphone


> **UPDATE:** We did it. Your thoughts *used* to live in your browser. Now they're YEETED into the cloud via a backend and stored persistently.
> Welcome to the **multi-user, persistent void**.

---

## ✔️ PHASE 1: **THE BACKEND AWAKENS** (✅ COMPLETED!)

> The brain now has a serverless spine powered by Vercel KV.

### ✔️ Pick Your Database Vibe
* [x] Chosen and Implemented: **Vercel KV (Serverless Redis via Upstash)** ⚡ (Serverless, fast, and integrates smoothly with Vercel)

### ✔️ Build the Express Engine
* [x] Backend directory (`api/`) created and structured.
* [x] Stack: Express, CORS, TypeScript, `@vercel/kv`.

### ✔️ API Endpoints to Power the Madness
* [x] `POST /api/thoughts` → yeet a thought into Vercel KV
* [x] `GET /api/thoughts` → fetch all the brain noise from Vercel KV (sorted by spicy takes)
* [x] `POST /api/thoughts/:id/replies` → reply to a thought, saved to KV
* [x_] `POST /api/thoughts/:id/vote` → give it a 🆙 or a 👎, updates KV
* [x] `POST /api/replies/:id/vote` → same, but for spicy replies, updates KV

### ✔️ Backend Logic of Doom
* [x] Thoughts/Replies that get too many 👎? *Yeeted automatically from KV.*
* [x] Character limits implemented.
* [x] Basic input validation in place.

### ✔️ CORS It Up
* [x] CORS configured in the Express app.

---

## ✔️ PHASE 2: FRONTEND, BUT MAKE IT API (✅ COMPLETED!)

> The frontend is now fully connected to the backend API.

### ✔️ Replace That LocalStorage Life
* [x] `localStorage` GONE. Using `axios` for API calls.
* [x] Loading and error states are handled.

### ✔️ Submit to the Backend Overlord
* [x] Posting new thoughts → `POST /api/thoughts`
* [x] Posting new replies → `POST /api/thoughts/:id/replies`
* [x] Voting on thoughts/replies implemented.
* [x] Optimistic updates in place for a smoother UI experience.

### ✔️ Delete localStorage forever
* [x] Done. It served its purpose.

### ✔️ Make It Configurable
* [x] Using `VITE_API_BASE_URL` (via `.env` file for local, Vercel env vars for deployed).

---

## ✔️ PHASE 3: SHIP IT, COWARD (✅ COMPLETED!)

> We built it. We made it **real**. It's deployed on Vercel!

### ✔️ Backend Hosting
* [x] Deployed as serverless functions on Vercel.

### ✔️ Frontend Hosting
* [x] Deployed statically on Vercel.

### ✔️ Domain & HTTPS (Because You Fancy)
* [x] Live at [anonymous-thoughts-roan.vercel.app](https://anonymous-thoughts-roan.vercel.app/) with HTTPS.

---

## ✨ PHASE 4: POLISH & CHAOS (Future Vibes)

> Enhancements for when you wanna go ✨full send✨

* [ ] Realtime updates via WebSockets (e.g., using Socket.io or Ably)
* [ ] Pagination for thoughts (if the void gets too crowded)
* [ ] More sophisticated error modals/notifications
* [ ] Rate limiting on the API (to prevent spam)
* [ ] "Report" button functionality (still a philosophical quandary for anonymity)
* [ ] User accounts/authentication (if you ever decide to de-anonymize parts or add user-specific features)
* [ ] Search/Filtering capabilities

---

## 🧠 Final Thought (haha)

This roadmap has taken us from **local brain static**
to a **shared, persistent existential feed** where everyone’s screaming together.

The void is built. It's open to the world.
And remember: **no usernames, only vibes**.
