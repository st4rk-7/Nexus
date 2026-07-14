# 05 — HTML, CSS and React

[Guide index](README.md) · Next: [Firmware and simulator](06-ota-firmware-and-simulator.md)

## Browser foundations

HTML describes structure: headings, forms, labels, inputs and tables. CSS controls appearance and layout. JavaScript handles behavior and requests. The browser represents the page as a DOM tree; React updates the relevant UI when component data changes.

[`index.html`](../../frontend/index.html) contains the root element. [`main.jsx`](../../frontend/src/main.jsx) mounts `App` there and imports the stylesheet. JSX resembles HTML but is JavaScript syntax transformed by the frontend tooling. Expressions go inside braces, and HTML's `class` becomes `className`.

Nexus is a single-page application: login and dashboard views switch within one loaded page. A traditional multi-page application loads a new HTML document for navigation. An SPA still calls a server for data; it is not an offline database.

## Components, props, state and effects

A component is a function describing a piece of UI. **Props** are values passed from parent to child. **State** holds a component's changing values. Calling a state setter schedules a render; directly editing an ordinary variable does not give React the same signal. An **effect** synchronizes a component with something outside rendering, such as an API. [Reference: React quick start](https://react.dev/learn).

| Component | Responsibility in Nexus |
|---|---|
| [`App`](../../frontend/src/App.jsx) | Owns token and username state; chooses login or dashboard; stores/removes browser credentials |
| [`Login`](../../frontend/src/Login.jsx) | Collects credentials, calls the login API and invokes the parent's `onLogin` callback |
| [`DeviceList`](../../frontend/src/DeviceList.jsx) | Fetches the public device list and renders loading, error, empty or table states |
| [`FirmwareUpload`](../../frontend/src/FirmwareUpload.jsx) | Collects file and release details, uploads them, then shows success or failure |

`useState` remembers values between renders. In a controlled text input, `value={username}` displays state and `onChange` updates it. `event.preventDefault()` stops the form's normal full-page submission so the component can call the API instead.

`DeviceList` uses `useEffect(..., [])`: it fetches once when mounted. It does **not** poll continuously. Refresh or remount to retrieve newly registered devices. The `_id` used as each row's `key` gives React stable identity when comparing lists.

## Two forms, two body formats

Login sends JSON with `Content-Type: application/json`. Firmware upload constructs `FormData` containing `file`, `version` and `releaseNotes`. The browser supplies the multipart Content-Type and boundary; manually forcing JSON headers would break the upload.

`fetch()` does not reject merely because a server returns 401 or 500. The components inspect `res.ok` and show the returned error. Network failures and non-JSON responses can reach the catch block. Disabling a submit button during a request gives useful feedback and reduces accidental repeated submissions.

The upload component accepts an optional `onUploaded` callback, but App does not currently provide one. The dashboard contains an upload form and device list, not a firmware history table.

## CSS and usability

[`index.css`](../../frontend/src/index.css) defines reusable variables for colors, spacing-related shapes and shadows. Classes such as `.card` and `.badge` reuse those choices. The box model combines content, padding, border and margin; `box-sizing: border-box` makes declared widths include padding and border.

Bootstrap and Tailwind are CSS frameworks mentioned in the module; this project uses neither. Custom CSS keeps the small interface direct, while a framework could provide more ready-made layout patterns.

Labels, visible focus outlines, text status labels and loading messages improve usability. A green badge alone would not communicate status to every user, so it also says “online.” Mobile table layout and broader accessibility testing remain improvement areas.

## Build versus development

Vite serves the app during development and proxies `/api` to port 3000. `bun run build` produces HTML, CSS and JavaScript in `frontend/dist`. This guide covers the local application only.

**Self-check:** Why does login survive refresh? App initializes state from localStorage. Why can an expired token still show the dashboard initially? The presence of a stored string controls the view; the backend decides whether it is still valid.
