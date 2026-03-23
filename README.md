# Caremometer

A prototype longitudinal web application for measuring childcare precarity in research studies.

Built by Mateus Mazzaferro, Stanford Graduate School of Education  
Live demo: [https://mateusmazza.github.io/caremometer/](https://mateusmazza.github.io/caremometer/)  
Current stack: React + Vite + `localStorage` + GitHub Pages

---

## Current Prototype

This repository currently contains a standalone front-end prototype. Participant and researcher data are stored locally in the browser via `localStorage`; there is no backend or cloud database wired up in this version.

The app is organized around three participant instruments plus a researcher dashboard:

- Consent flow via `/consent?pid=...`
- Enrollment survey via `/entry?pid=...`
- Weekly check-in via `/checkin?pid=...`
- Exit assessment via `/exit?pid=...`
- Researcher dashboard via `/dashboard`

Each participant-facing route uses a `pid` query parameter. That structure is intentional so the flow can later be adapted to Qualtrics embedded data or a backend without rewriting the survey logic.

---

## What It Measures

Caremometer operationalizes childcare precarity across five dimensions:

1. Affordability
2. Reasonable effort
3. Supports child development
4. Meets parents' needs
5. Instability over time

The weekly calendar data is also used to compute:

- Multiplicity: number of distinct providers used in a week
- Instability: proportion of time slots that changed versus the prior completed week
- Entropy: Shannon entropy of provider usage within a week

These metrics are computed and stored for researcher export, but they are not shown back to participants in the current UI.

---

## Current Features

- Enrollment survey with demographics, provider roster, affordability, effort, child development, needs, and placeholder well-being/cognition sections
- Provider roster defaults so `Provider 1` starts as `Myself` with `Parent / self-care`
- Weekly calendar check-in with editable provider roster
- Touch-friendly calendar painting using pointer events, including vertical drag painting on phones
- Exit assessment mirroring the enrollment structure
- Password-protected researcher dashboard with participant overview and CSV export
- Thank-you / submission screens without participant-facing answer summaries
- Responsive mobile layout intended to stay portable to a future Qualtrics adaptation

---

## Quickstart

```bash
git clone https://github.com/mateusmazza/caremometer.git
cd caremometer
npm install
npm run dev
```

Vite will print the local dev URL in the terminal. In production, the app is configured for GitHub Pages using a hash router.

---

## Configuration

### Researcher password

The dashboard password is read from `VITE_RESEARCHER_PASSWORD`. If that variable is not set, the prototype falls back to:

```text
precarity-research-2025
```

Create a local `.env` file if you want to override it during development:

```bash
VITE_RESEARCHER_PASSWORD=your-password-here
```

### Data storage

All prototype data is stored in the browser's `localStorage`. That means:

- data is browser-specific
- data is device-specific
- clearing browser storage will erase saved prototype data
- multiple test participants can coexist in one browser because records are keyed by `pid`

This is useful for prototyping, but it is not a production data architecture.

---

## Researcher Workflow

In the current prototype, the researcher uses the dashboard to:

- create/open participant records by visiting participant-specific links with a `pid`
- monitor enrollment and completion status
- copy instrument links
- export participant data as CSV

The exported CSV is long-format and includes participant identifiers, selected demographics, calendar rows, provider details, and computed weekly metrics.

---

## Notes On Qualtrics Portability

The codebase is being kept portable to Qualtrics where practical:

- survey instruments are separated by route
- participant identity is passed via URL parameter
- storage helpers are abstracted in `src/utils/storage.js`
- the calendar interaction relies on standard DOM pointer events and CSS `touch-action`, not a React-only gesture library

That should make a future Qualtrics port more straightforward, although additional work will still be needed.

---

## Project Structure

```text
src/
  components/
    calendar/       CalendarPainter, ProviderLegend
    layout/         Header, Footer, ProgressStepper
    survey/         SurveyQuestion
  context/          AppContext
  data/             questions.js
  pages/            Welcome, Consent, EntryAssessment,
                    WeeklyCheckin, ExitAssessment,
                    Dashboard, ThankYou
  utils/
    metrics.js      Multiplicity, instability, entropy
    storage.js      localStorage-backed persistence and export helpers
```

---

## Current Limitations

- No backend, authentication service, or cloud persistence is connected
- Several emotional and cognition measures are still placeholders
- This prototype is not yet a Qualtrics implementation
- The repository still contains some legacy/stub files from earlier iterations that are not part of the active route flow

---

## License

MIT. If you use this tool in research, a citation or acknowledgment is appreciated.

## Citation

> Mazzaferro, M. (2025). Caremometer [Software]. Stanford Graduate School of Education. https://github.com/mateusmazza/caremometer
