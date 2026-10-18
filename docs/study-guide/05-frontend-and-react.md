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
| [`DeviceList`](../../frontend/src/DeviceList.jsx) | Fetches devices with search, filter and sort; renders loading, error, empty or table states; switches between the list, add, detail and edit screens |
| [`DeviceForm`](../../frontend/src/DeviceForm.jsx) | One form for both adding and editing a device |
| [`DeviceDetail`](../../frontend/src/DeviceDetail.jsx) | Shows one device and its update history; Edit, and Delete with a confirmation |
| [`FirmwareUpload`](../../frontend/src/FirmwareUpload.jsx) | Collects file and release details, uploads them, then shows success or failure |
| [`Releases`](../../frontend/src/Releases.jsx) | Lists the newest releases with who uploaded them |
| [`Landing`](../../frontend/src/Landing.jsx) | Public page shown before login: what Nexus does, how the update loop works, FAQ, and an "Open the console" button |
| [`NexusLogo`](../../frontend/src/NexusLogo.jsx) | The logo, reused in the landing page, login panel and top bar |
| [`api.js`](../../frontend/src/api.js) | Shared helper for JSON requests: headers, token and error messages |

`useState` remembers values between renders. In a controlled text input, `value={username}` displays state and `onChange` updates it. `event.preventDefault()` stops the form's normal full-page submission so the component can call the API instead.

`DeviceList` uses `useEffect` with `[search, status, sort, view.mode]` as dependencies, so it fetches again whenever a control changes or the list screen reappears. An `ignore` flag discards an older, slower response so it cannot overwrite a newer one. It does **not** poll continuously: change a filter or reload to see new check-ins. The `_id` used as each row's `key` gives React stable identity when comparing lists.

There is no router. App shows the landing page until the visitor clicks "Open the console" (a `showLogin` state), then the login form, then the dashboard once a token exists. Inside the dashboard, `DeviceList` keeps a `view` state such as `{ mode: "detail", id }` and renders the matching screen, which is enough for four screens.

## Two forms, two body formats

Login sends JSON with `Content-Type: application/json`. Firmware upload constructs `FormData` containing `file`, `version` and `releaseNotes`. The browser supplies the multipart Content-Type and boundary; manually forcing JSON headers would break the upload.

`fetch()` does not reject merely because a server returns 401 or 500. The `api()` helper inspects `res.ok` and throws the server's error message, which the components display. Network failures and non-JSON responses can reach the catch block. Disabling a submit button during a request gives useful feedback and reduces accidental repeated submissions.

After a successful upload, `FirmwareUpload` calls the `onUploaded` prop. App uses it to change the `key` of `Releases`, which makes React remount that component and fetch the list again, so the new version appears.

## CSS and usability

[`index.css`](../../frontend/src/index.css) defines reusable variables (design tokens) for colors and fonts, and shared classes such as `.field`, `.btn`, `.table` and `.status`. The fonts are bundled with the app through `@font-face`, so the dashboard looks the same without internet. The box model combines content, padding, border and margin; `box-sizing: border-box` makes declared widths include padding and border.

Bootstrap and Tailwind are CSS frameworks mentioned in the module; this project uses neither. Custom CSS keeps the small interface direct, while a framework could provide more ready-made layout patterns.

Labels, visible focus outlines, text status labels and loading messages improve usability. A dot alone would not communicate status to every user, so it also says “online” or “offline”. Text colors were checked against the WCAG 4.5:1 contrast minimum. Below 900px the layout becomes one column and the table hides its Type column so it fits a phone. Screen-reader testing remains an improvement area.

## Build versus development

Vite serves the app during development and proxies `/api` to port 3000. `bun run build` produces HTML, CSS and JavaScript in `frontend/dist`. This guide covers the local application only.

**Self-check:** Why does login survive refresh? App initializes state from localStorage. Why can an expired token still show the dashboard initially? The presence of a stored string controls the view; the backend decides whether it is still valid.
