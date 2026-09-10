# Cover Pro Canvassing Tools

Three static pages: Door Log, Time Clock, New Hire Info. The frontend is plain
HTML/CSS/JS deployed on Vercel, exactly like your calculator. The backend is a
free Google Apps Script tied to a Google Sheet — no third-party service, no
monthly limits, all inside your own Google account.

## What this gets you

- Every submission **emails you immediately**.
- Every submission **also lands as a row in a Google Sheet** — Door Log, Time
  Clock, and New Hire Info each get their own tab.
- A **"Payroll Tally" tab auto-calculates the $20 appointment bonus and $100
  job-sold bonus** per canvasser the moment you type their name into it.
- **Hourly pay is NOT automated** — that still needs the same manual weekly
  step as before (pairing Time Clock in/out timestamps and multiplying by
  rate). Automating that reliably needs more time than we have today; flagging
  it honestly rather than pretending it's done.

## Step 1 — Set up the Google Sheet + Apps Script backend (10 min)

1. Create a new Google Sheet. Name it "Cover Pro Canvassing Data."
2. In the Sheet, go to Extensions -> Apps Script.
3. Delete any starter code in the editor. Open AppsScript_Code.gs from this
   folder, copy all of it, paste it into the Apps Script editor.
4. Near the top, change YOUR_EMAIL@example.com to your real email address.
5. In the function dropdown (top toolbar), select setupSheets, then click
   Run. This builds all four tabs (Door Log, Time Clock, New Hire Info,
   Payroll Tally) with headers and formulas already in place. First time
   running it, Google will ask you to authorize -- click through the "unsafe"
   warning, that's expected for your own script.
6. Click Deploy -> New deployment. Click the gear icon, choose Web app.
   - Execute as: Me
   - Who has access: Anyone
7. Click Deploy, authorize again if asked, then copy the Web App URL
   it gives you (ends in /exec).

## Step 2 — Point the site at your script

In each of these three files, find YOUR_SCRIPT_URL (in the <form action="..."> 
line) and replace it with the Web App URL you just copied:
- door-log.html
- time-clock.html
- new-hire.html

## Step 3 — Deploy to Vercel (same as your other tools)

1. Push this folder to a new GitHub repo.
2. In Vercel, "Add New Project" -> import that repo.
3. Framework preset: Other (static files, no build command).
4. Deploy. You'll get a URL like coverpro-tools.vercel.app.

## Step 4 — TEST BEFORE TONIGHT, don't skip this

Open each live page and submit one real test entry per form. Check:
- Did the confirmation message show up on the page?
- Did an email land in your inbox?
- Did a row appear in the right tab of the Google Sheet?

If any of those three don't happen, the cross-domain submission likely needs
a small fix -- come back and tell me exactly what did and didn't happen (which
form, what you saw, whether the email arrived) and I'll debug it live rather
than guessing.

Keep the tested Google Forms links as backup until this passes all three
checks above. Don't hand out these new links to the crew until you've
confirmed it works end to end.
