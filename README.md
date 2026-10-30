# Studylog

A study time tracker I built as my Terra project, using plain HTML, CSS, and JavaScript. The idea was simple: I wanted a way to actually see where my study time goes instead of just guessing, so I built something that logs sessions and breaks the data down in a few useful ways.

## What it does
- Log a study session with subject and duration
- Delete sessions you no longer want
- See a breakdown of total time studied per subject
- Set a weekly study goal and track progress with a visual progress bar
- Export all sessions as a CSV file for use elsewhere (Excel, Sheets, etc.)

## How I built it
Started with a basic HTML form and a list, using JavaScript to handle form submission and localStorage to persist data between visits. From there I added features incrementally over several days: delete functionality using array splicing, a subject breakdown using a JavaScript object as a lookup table, a weekly goal tracker that calculates week numbers from dates to filter sessions, and a CSV export that builds a Blob object and triggers a download directly from the browser with no backend involved.

## How to run it
1. Clone or download this repository
2. Open `index.html` in any web browser
3. No installation or build step needed — everything runs client-side and data is saved in your browser's localStorage

## Built with
- HTML
- CSS
- JavaScript (vanilla, no frameworks) 
