# AI Project Advisor

> Answer 11 questions. Get your full AI project architecture in seconds.

A data-driven advisor that takes you from idea to a concrete technical blueprint — recommending the right framework, agent design, reasoning strategy, memory architecture, and execution pipeline for your specific project.

---

## What it does

The advisor scores **17 AI frameworks** (CrewAI, LangGraph, LlamaIndex, AutoGen, Microsoft Agent Framework, Pydantic AI, Strands, Google ADK, OpenAI Agents SDK, Smolagents, Agno, n8n, LangChain, DSPy, and more) against your answers across 6 dimensions:

| Dimension | What it captures |
|---|---|
| **Problem** | What you're building, who it's for |
| **AI Job** | Answer / Converse / Autonomous / Decide / Process / Build |
| **Knowledge** | Internal docs, real-time data, domain expertise, structured DBs |
| **Memory** | None / Session / Cross-session / Adaptive |
| **Actions** | Info-only / Search / Compute / Execute / Coordinate |
| **Constraints** | Stakes, environment (solo→enterprise), stage (idea→scaling) |

### Output

- **Framework ranking** — top 5 scored matches with why/best-for/avoid
- **Advisory Agents** — up to 6 specialist advisors (Knowledge, Reasoning, Memory, Tools, Improvement, Architecture), each with a specific technique recommendation and behaviour spec
- **Execution Pipeline** — a step-by-step pipeline diagram tailored to your project
- **Workflow Map** — SVG visualisation of how your agents connect

---

## Tech stack

- **React 19** + **Vite 8**
- Fully inline styles (no CSS-in-JS library, no Tailwind)
- Google Fonts: DM Sans + DM Mono
- Zero external dependencies beyond React

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Extending the framework registry

Every framework is defined as a data entry in `DEFAULT_FRAMEWORKS` inside `src/App.jsx`. To add a new framework:

```js
{
  id: "my_framework",
  name: "My Framework",
  tagline: "One-line description",
  best: "What it excels at",
  why: "Why this framework wins for those signals",
  avoid: "What to use instead for X use case",
  scores: {
    // signal: weight
    enterprise: 20,
    scaling: 15,
    // ...
  }
}
```

Signals are emitted based on user answers. The full signal list is documented in `scoreFrameworks()`.

---

## License

MIT
