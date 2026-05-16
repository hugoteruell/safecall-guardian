# Spec: Zeabur Deployment

> Sponsor tool #3. Deploy SafeCall Guardian to Zeabur with a public URL.
> **Do this AT HOUR 0:30, right after Hello World works locally.**
> Don't leave deployment for the last hour. Don't.

---

## 1. Goal

Get a live URL like `https://safecall-guardian.zeabur.app` that:
- Loads the home page
- Updates automatically when we push to GitHub `main` branch
- Has all environment variables set (LLM key, Bright Data, Butterbase)
- Works on the venue Wi-Fi during the demo

---

## 2. What Zeabur is (for the strategist)

Zeabur is a one-click deployment platform. We point it at our GitHub repo,
it builds the Next.js app, and gives us a public URL. Think: Vercel /
Heroku, but it's a hackathon sponsor.

We use it because:
- It's required for sponsor-tool judging.
- It's faster to deploy than Vercel for first-time setup with their stack.
- Zero-config for Next.js.

---

## 3. Prerequisites checklist

Before deploying, make sure:

- [ ] Code is in a GitHub repo (private is fine).
- [ ] Repo has `package.json` with `"build"` and `"start"` scripts.
- [ ] Local `npm run build && npm run start` works without errors.
- [ ] `.env.local` is in `.gitignore` (do NOT commit secrets to GitHub).
- [ ] At least one Zeabur team member has a Zeabur account.

---

## 4. Deploy steps (do this at hour 0:30)

### Step 1: Push Hello World to GitHub

After `npx create-next-app@latest .` and your first `npm run dev` works:

```bash
git init
git add .
git commit -m "Hello world"
gh repo create safecall-guardian --private --source=. --push
# OR push to an existing repo manually
```

### Step 2: Create Zeabur project

1. Go to https://zeabur.com → sign in with GitHub.
2. Click **"Create Project"**.
3. Pick a region (default is fine).
4. Click **"Deploy New Service"** → **"Git"** → choose your repo.

### Step 3: Confirm framework detection

Zeabur should auto-detect Next.js. Build command should be `npm run build`,
start command should be `npm run start`.

If it doesn't detect:
- Build command: `npm run build`
- Start command: `npm run start`
- Node version: 20 (or latest LTS)

### Step 4: Add environment variables

In Zeabur project settings → Variables tab, add:

```
ANTHROPIC_API_KEY=sk-ant-...
BRIGHT_DATA_API_KEY=...
BRIGHT_DATA_ZONE=...
BUTTERBASE_API_KEY=...
BUTTERBASE_PROJECT_ID=...
NEXT_PUBLIC_APP_URL=https://safecall-guardian.zeabur.app
```

> **Important:** restart the service after adding vars (Zeabur usually does
> this automatically, but verify).

### Step 5: Generate a public domain

1. In Zeabur project → **Networking** tab.
2. Click **"Generate Domain"** → pick a subdomain like `safecall-guardian`.
3. URL becomes `https://safecall-guardian.zeabur.app`.
4. Copy the URL. Share with the team. Put it in the demo script.

### Step 6: Verify the deploy

1. Open the public URL in a browser.
2. Click each of the 3 demo scenario cards.
3. Verify the Analysis screen animates correctly.
4. Verify the agent trace shows all 3 agents.
5. Check on mobile (Safari iPhone) — every text ≥ 20px.

If anything is broken, fix it now while you still have hours.

---

## 5. Auto-deploy on push

Zeabur watches the `main` branch. Every push triggers a new build.

**Workflow during the build:**
- Lorenzo / Hugo / Luka push to `main` as they implement features.
- Each push deploys automatically (~30-90 seconds build time).
- Felipe (you) can keep refreshing the live URL to test the latest state.

**Branch protection:**
- Don't enable branch protection for the hackathon — slows you down.
- Trust the team. If something breaks `main`, fix it forward, don't revert.

---

## 6. Custom domain (skip for hackathon)

The free `*.zeabur.app` subdomain is fine. Don't waste time on a custom
domain. It adds zero judging value.

---

## 7. Production logs

To debug live errors during the demo:

1. Zeabur project → **Logs** tab.
2. Filter by timestamp.
3. Look for `[analyzer]`, `[investigator]`, `[brightdata]`, `[butterbase]`
   error markers from the agent code.

Have this tab open in a background browser tab during the demo. If
something goes wrong, you can see the error in 10 seconds.

---

## 8. Backup plan: if Zeabur is unreachable from venue Wi-Fi

This shouldn't happen, but:

### Plan B: Local demo
1. Have the project running on Lorenzo's laptop (`npm run dev`).
2. Connect laptop directly to the projector / screen.
3. URL becomes `http://localhost:3000`.
4. Demo works identically.

### Plan C: Backup video
1. Recorded by 2:30 PM (see spec 00 build order).
2. Stored on at least two laptops + cloud (Google Drive / Dropbox).
3. If everything else fails, play the video.
4. Backup video should still tell the story — opening logo, 3 scenarios,
   verbal narration during the analysis animations.

---

## 9. Test plan (after first deploy)

1. **Public URL loads:** open in private/incognito browser. Home page renders.

2. **Scenarios work:** click each card. Analysis screen animates and reveals.

3. **Free input works (if Bright Data + LLM keys are set):** type a custom
   message. Submit. Wait 5-10 seconds. See result on Analysis screen.

4. **Mobile:** open URL on iPhone Safari. All text ≥ 20px. Buttons tappable.

5. **Cold start:** wait 5+ minutes without traffic. Reload. Should still
   load within 3 seconds (Zeabur cold start is fast for Next.js).

6. **Re-deploy:** push a tiny change (edit a string) to `main`. Wait 1-2
   minutes. Refresh URL. See the change live.

If all 6 pass, you're production-ready.

---

## 10. Demo-day morning checklist

Morning of May 16, 2026 — do this in this order:

- [ ] Open the live Zeabur URL in 2 browsers (desktop Chrome, phone Safari).
- [ ] Run all 3 scenarios end-to-end. Verify each animates and shows correct
      score (92 / 88 / 12).
- [ ] Run the `?skip=1` fallback URL for the primary scenario. Verify it
      renders instantly.
- [ ] Check Zeabur Logs tab for any errors in the last hour.
- [ ] Test free input with one custom message (gives you a backup live demo
      option if judges ask).
- [ ] Confirm backup video is on at least 2 laptops + Google Drive.

If any of the above fail, you have hours to fix. Don't wait until 4:00 PM.

---

## 11. What this does NOT cover

- Custom DNS, SSL certs (Zeabur auto-handles).
- CI/CD beyond push-to-deploy (out of scope for hackathon).
- Multi-region deployment (single region is enough for a 5-min demo).
- Performance optimization (Next.js defaults are fast enough).
- Monitoring beyond Zeabur's built-in logs.
