# Question blocks — write questions the way they look on paper

A **question block** is one group of questions (e.g. "Questions 11–15") written as
plain HTML, with every gap marked `[[N]]` (N = question number). The platform turns each
gap into an answer box, keeps the timer, scoring, navigator and results as usual.

Where: **Admin → Content → Mock tests → (your mock) → "Question blocks" tab → Add**
(or Admin → Mock question blocks). Fields:

| Field | What to put |
|---|---|
| Section / Part | `listening` + `1`–`4`, or `reading` + `A`/`B`/`C` |
| Order | the first question number of the block (keeps blocks in the right place) |
| Title | `Questions 11–15` |
| Instructions | `Complete the flow-chart below. Write ONE WORD ONLY for each answer.` |
| Content | the HTML layout (templates below) |
| Word bank | *optional* — one option per line, letter first: `A sunlight`. Gaps become drag-and-drop boxes; answers are letters. |
| Answer key | one line per gap: `11 = sun` — alternatives with `/`: `12 = oil / olive oil` |

Saving checks that every `[[N]]` has an answer (and the other way round) and creates the
scoring rows automatically. Blocks and normal questions (MCQ, TFNG…) can be mixed in a part.

---

## Templates (copy, then replace the text)

### Notes / sentence completion
```html
<div class="notes">
  <h3>Local history museum</h3>
  <h4>Opening times</h4>
  <ul>
    <li>Closed on [[1]]</li>
    <li>Entrance fee: £[[2]]</li>
  </ul>
</div>
```

### Form
```html
<div class="form">
  <h3>Hotel booking form</h3>
  <p>Name: Sarah [[1]]</p>
  <p>Number of nights: [[2]]</p>
</div>
```

### Table
```html
<table>
  <tr><th>Room</th><th>Price</th><th>Extra</th></tr>
  <tr><td>Single</td><td>£[[3]]</td><td>breakfast</td></tr>
  <tr><td>[[4]]</td><td>£85</td><td>sea [[5]]</td></tr>
</table>
```

### Flow-chart (boxes with arrows drawn automatically)
```html
<h3>How the coffee is produced</h3>
<div class="flow">
  <div class="box">Coffee cherries are picked by hand</div>
  <div class="box">Cherries are dried in the [[11]]</div>
  <div class="box">Beans are taken to the [[12]]</div>
</div>
```
With a word bank (drag-and-drop):
```
A sunlight
B factory
C ovens
```
Answer key: `11 = A` · `12 = B`

### Map / diagram labelling
Upload the picture to `ielts-assets`, then place each gap by percentage (left / top of the picture):
```html
<div class="map">
  <img src="https://raw.githubusercontent.com/hero-04/ielts-assets/main/mock2_map.png">
  <span class="pin" style="left:22%; top:35%">[[15]]</span>
  <span class="pin" style="left:68%; top:60%">[[16]]</span>
</div>
```
Usually combined with a word bank (`A café`, `B toilets`, …) so the gaps are drop boxes.

### Summary (Reading)
```html
<h3>The history of glass</h3>
<p>Early glass was made from [[27]] and was mainly used for [[28]] …</p>
```

## Rules of thumb
- `<b>bold</b>`, `<i>italic</i>`, `<br>` for a line break, `<p>` for paragraphs.
- Scripts and `onclick=…` are removed automatically.
- Answers are not case-sensitive; extra spaces are ignored.
- In JSON imports a block looks like:
  `{"part": 2, "order": 11, "title": "Questions 11–15", "instructions": "…", "content": "<div class=\"flow\">…</div>", "word_bank": ["A sunlight", "B factory"], "answers": {"11": "A", "12": "B"}}`
  inside `"listening": {"blocks": [...]}` or `"reading": {"blocks": [...]}`.
