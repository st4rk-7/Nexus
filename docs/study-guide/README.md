# Nexus study guide

Read these chapters in order to understand the project and explain it in a viva. Each chapter connects a module topic to the actual code, then gives a short question to check your understanding. Allow about 45–60 minutes, including opening the linked files.

## Sources and scope

The academic source is the two-page **EC4307 — Web Application Development, Module Information Sheet**, University of Ruhuna, Department of Electrical and Information Engineering. The original PDF stays in the local backup, outside the published repository. No individual lecture slides were available: these are explanations of the topics listed in the module outline, not a transcript of every lecture.

The sheet lists 3 credits, 30 lecture hours, 24 workshop hours, and these topics: web technologies; Bootstrap and Tailwind; React and Angular; client–server architecture; HTTP; ASP.NET Core, Spring Boot and MERN; REST principles and implementation; authentication, authorization and JWT.

**Assessment discrepancy:** the sheet lists 40% continuous assessment quizzes and 60% end-semester assessment (30% project evaluation + 30% quiz). The separate [course announcement](../../instruction.md) uses EE4207 and says project plus viva, with no written exam. Confirm the current module code and assessment arrangement with the lecturer; neither document proves guaranteed hosting bonus marks.

These chapters describe the `main` branch at commit `9335ff5`. They distinguish implemented behavior from features that still need work.

## Reading order and learning outcomes

| Chapter | What you should understand afterward | Module outcome |
|---|---|---|
| [01 — Architecture and frameworks](01-system-architecture-and-mern.md) | The problem, layers, stack, alternatives and request flow | LO1, LO2, LO4 |
| [02 — HTTP and REST](02-http-and-restful-apis.md) | Methods, headers, status codes, REST principles and every endpoint | LO1, LO3 |
| [03 — Backend and database](03-backend-and-database.md) | Routes, middleware, controllers, models and local firmware files | LO1, LO2, LO4 |
| [04 — Authentication and security](04-authentication-and-security.md) | Password hashes, JWT, API keys, permissions and limitations | LO3 |
| [05 — HTML, CSS and React](05-frontend-and-react.md) | Components, state, props, effects, forms and styling | LO1, LO2, LO4 |
| [06 — Firmware and simulator](06-ota-firmware-and-simulator.md) | Version selection, file transfer, status tracking and demo scope | LO3, LO4 |
| [07 — Code map and viva practice](07-code-map-and-viva.md) | Where each responsibility lives and how to demonstrate it | LO1–LO4 |

The four outcomes are: describe web application layers; use frameworks and tools; integrate APIs and security; and justify a full-stack design considering performance, usability and scalability.

Start with chapter 01. After each chapter, answer its self-check aloud before moving on. Run the local app and simulator to check your understanding against actual behavior.
