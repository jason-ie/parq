# parq

A peer-to-peer parking marketplace that connects drivers with private parking spot owners near events and venues.

## Features

- **Renter** — Search parking spots by location, filter by price/type/radius, view on map or list, and book spots
- **Owner** — List and manage parking spots with availability windows
- **Event Discovery** — Browse nearby events via Ticketmaster API to find parking in advance
- **Authentication** — Email/password auth with role-based dashboards (renter vs. owner)
- **Bookings** — Real-time availability checks and booking confirmation via Firestore

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend/DB:** Firebase Auth, Firestore
- **Maps:** Google Maps API (interactive map, static previews, Places autocomplete)
- **Events:** Ticketmaster Discovery API

## Status

Core booking flow, auth, and dashboards are functional. Favorites and Notifications pages are placeholders. Event-to-spot linking is partially scaffolded.

## Setup

1. Clone the repo
2. Create a `.env` file with:
VITE_GOOGLE_MAPS_API_KEY=your_key
3. Add your Firebase config to `src/config/firebase.js`
4. `npm install && npm run dev`
