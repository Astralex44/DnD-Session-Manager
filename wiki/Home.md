# DnD Session Manager — Wiki

Background to the [Lastenheft](../docs/DnD_Tool_Lastenheft.docx) and [Pflichtenheft](../docs/DnD_Tool_Pflichtenheft.docx)
(the German requirements and technical specification), kept quick to search. The two Word documents remain the
binding source for requirements; this wiki is about the overview, finding your way around, and the "why".

## Pages

- [Architecture](Architecture.md) — backend and frontend stack, auth, real-time, deployment, routes
- [Data Model](Data-Model.md) — the entities as built and the main design choices
- [Feature Overview](Feature-Overview.md) — every FA/NFA requirement at a glance, with its status
- [Features and Ideas](Features-and-Ideas.md) — where the user guides are, plus ideas not built yet
- [Screens and Mockups](Screens-and-Mockups.md) — which mockup shows which screen
- [Decision Log](Decision-Log.md) — why things were decided the way they were
- [Setup](Setup.md) — local development, tests, releases

## Where do I find what?

| Question                                | Answer                                                                                          |
|-----------------------------------------|-------------------------------------------------------------------------------------------------|
| What should the tool do?                | [Lastenheft](../docs/DnD_Tool_Lastenheft.docx)                                                  |
| How is it built?                        | [Architecture](Architecture.md), [Pflichtenheft](../docs/DnD_Tool_Pflichtenheft.docx) chapter 8 |
| How do I use it as DM or player?        | The guides in [`docs/guides/`](../docs/guides/)                                                 |
| What did the screens look like planned? | [Screens and Mockups](Screens-and-Mockups.md)                                                   |
| Why is X the way it is?                 | [Decision Log](Decision-Log.md)                                                                 |
| How do I run it locally?                | [Setup](Setup.md)                                                                               |
| What changed in which release?          | [CHANGELOG](../CHANGELOG.md)                                                                    |

## Project status

Every requirement from the specification is built and live at [dnd.astralex.dev](https://dnd.astralex.dev), still
released as alpha (see the [CHANGELOG](../CHANGELOG.md)). Login is through Discord, by invite from the DM.
