# FloodReady

### Disaster Management & Emergency Preparedness Web Application

FloodReady is a web application that brings disaster-preparedness
information and emergency-support tools into one interface. It includes
weather-based risk estimates, location and map views, safety guidance,
preparedness checklists, community hazard reporting, and quick access to
emergency-contact options.

> **Safety notice:** FloodReady is a preparedness aid and project
> demonstration, not an official emergency-alert or dispatch system.
> Always follow current instructions from local authorities and contact
> emergency services directly in an emergency.

## Features

-   **Real-Time Risk Dashboard:** Search for a location and review
    weather information and an application-generated risk estimate.
-   **360° Compass:** View weather samples in eight directions around
    the selected location.
-   **Interactive Map:** View the selected location and available map
    markers.
-   **Nearby Facilities:** Browse facility categories such as shelters,
    hospitals, relief camps, equipment/pump points, and pharmacies.
-   **Safety Protocols:** Review preparedness and safety guidance for
    before, during, and after a flood.
-   **Go-Bag & Family Check:** Track emergency supplies, medicines,
    important documents, household needs, and pet supplies.
-   **Hazard Reports:** Enter a hazard category, location, urgency, and
    description, and view recorded reports.
-   **Emergency SOS:** Access an acoustic siren control, emergency
    helpline shortcuts, and a user-controlled emergency-message
    workflow.

## Technology Stack

-   React
-   TypeScript
-   Vite
-   Open-Meteo forecast API for weather information
-   OpenStreetMap-based map visualization
-   npm for package management

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) with npm
-   [Git](https://git-scm.com/)

### 1. Clone the repository

``` bash
git clone https://github.com/shivani-rajput03/FloodReady.git
cd FloodReady
```

If `package.json` is inside the `dm` subfolder, run:

``` bash
cd dm
```

Run the following commands from the directory that contains
`package.json`.

### 2. Install dependencies

``` bash
npm ci
```

### 3. Start the development server

``` bash
npm run dev
```

Open the local URL printed in the terminal, usually
`http://localhost:5173`.

### 4. Build the application

``` bash
npm run build
```

If the project defines a preview script, you can preview the build with:

``` bash
npm run preview
```

## Using FloodReady

1.  Open the application in your browser.
2.  Search for a location or grant location permission to use the GPS
    option, if available.
3.  Review the weather information, map, and estimated risk level.
4.  Explore facility categories and safety protocols.
5.  Use the Go-Bag checklist to track preparedness items.
6.  Enter hazard details to record a report.
7.  Use the SOS controls to access helpline shortcuts or prepare a
    message for a trusted contact.

## Data, Safety & Limitations

-   **Weather-based risk:** The displayed risk is an
    application-generated estimate based on available weather
    information. It is not a physical flood-sensor reading and cannot
    guarantee that a location is safe.
-   **Facility records:** Facility entries in the current demonstration
    version may be illustrative sample data. They are not guaranteed to
    be real, open, or verified. Confirm facilities with official local
    sources before travelling.
-   **Hazard reports:** Locally saved reports do not automatically reach
    emergency responders unless a backend or external integration has
    been implemented.
-   **SOS behavior:** The siren is a local sound alert. Opening a
    messaging application does not send a message automatically; the
    user must review and send it. These tools do not dispatch rescue
    teams.
-   **Location:** GPS behavior depends on device/browser support and
    user permission. Location may be unavailable or inaccurate.
-   **Connectivity:** Weather data and map tiles may require an internet
    connection. Offline availability depends on browser caching and
    implementation.
-   **Official instructions:** Follow current alerts and instructions
    from local emergency authorities.

## Project Structure

``` text
FloodReady/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

The exact folder layout may vary if the application is stored in a `dm/`
subdirectory. Use the directory containing `package.json`.

## Author

**Shivani Rajput**\
Project: FloodReady --- Disaster Management & Emergency Preparedness Web
Application\
GitHub: [@shivani-rajput03](https://github.com/shivani-rajput03)

## Future Improvements

Possible future enhancements include verified shelter and hospital data,
official disaster alerts, a backend for shared hazard reports,
persistent cloud storage, and authorized emergency-service integrations.

## Contributing

Suggestions and improvements are welcome. When proposing changes,
consider data accuracy, user privacy, and emergency-safety implications.

## License

No license is currently specified in this repository. Unless a license
is added, reuse and redistribution remain subject to applicable default
copyright rules.
