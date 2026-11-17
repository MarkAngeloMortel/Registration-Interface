# Student Registration Interface (Improved)

HTML, CSS and JavaScript student registration interface (Group Carmonas).
Open `index.html` in a browser. No database or internet connection needed.

## Files
- `index.html`, `register.html`, `about.html`, `contact.html` - the four pages
- `style.css` - all styling (light theme by default, dark theme via the header toggle)
- `script.js` - theme toggle (all pages) and form logic (Register page)
- `fonts/` - Plus Jakarta Sans, bundled so it works offline

## Usability improvements (Nielsen heuristics)
| Improvement | Heuristic |
|---|---|
| Live "Your registration" summary + progress bar | Visibility of system status |
| Clear has no popup; it clears and offers **Undo** | User control and freedom |
| Validate when leaving a field; Student ID auto-uppercased; email typo suggestion | Error prevention |
| Persistent hints, grouped sections, summary beside the form | Recognition rather than recall |
| Error summary with links to each field; messages say how to fix | Help users recognize, diagnose and recover from errors |
| Same buttons, spacing and wording on every page | Consistency and standards |
| Short form in two sections, no unnecessary popups | Aesthetic and minimalist design |
| Reference number, Copy, Print, Edit, Register another | Flexibility and efficiency of use |
| Light and dark themes, skip link, visible focus, responsive layout | Accessibility |

Note: the **Submit confirmation popup was removed** because the live summary already lets students review before submitting.
