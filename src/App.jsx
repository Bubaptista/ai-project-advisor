import { useState } from "react";

/* ══════════════════════════════════════════
   FRAMEWORK REGISTRY — data-driven, editable
   Each framework has scoring weights per signal.
   To add a framework: add an entry here.
   ══════════════════════════════════════════ */

const DEFAULT_FRAMEWORKS = [
  { id:"doe", name:"DOE (Claude Code)", tagline:"Directives as SOPs, AI orchestrates, deterministic execution", best:"Vibe coding / solo app building", why:"Directives = SOPs. AI orchestrates while Python scripts execute deterministically — minimizes compounding errors.", avoid:"LangGraph (overkill)",
    scores:{ solo_code:30, build:25, process:15, simple:15, idea:15, none_k:10, none_m:10, info_only:5, low:5, prototype:5 }},
  { id:"crewai", name:"CrewAI", tagline:"Role-based agents with natural handoffs", best:"Multi-role pipelines (research → write → review)", why:"Role-based agents with natural handoffs. Fastest to prototype multi-agent workflows (2-4 hours).", avoid:"AutoGen (too conversational)",
    scores:{ small_team:15, autonomous:15, decide:10, complex:15, medium_cx:10, execute:10, coordinate:10, medium:5, prototype:10 }},
  { id:"langgraph", name:"LangGraph", tagline:"Graph-based state machines for complex workflows", best:"Complex branching logic / stateful workflows", why:"Graph-based state machines with 40-50% LLM call savings on repeat requests. Handles conditional execution and cycles.", avoid:"DOE (too flat for branching)",
    scores:{ small_team:10, existing_app:10, enterprise:15, autonomous:20, decide:15, complex:15, interconnected:20, cross_session:15, adaptive:15, coordinate:15, execute:10, high:10, critical:15, improving:10, scaling:15, realtime:10, structured:5, compute:5 }},
  { id:"llamaindex", name:"LlamaIndex", tagline:"Purpose-built for RAG and private data grounding", best:"RAG / private data grounding", why:"Best-in-class data connectors, indexing, vector DB support. Handles chunking, embedding, and retrieval out of the box.", avoid:"CrewAI (weak on data)",
    scores:{ answer:20, internal_docs:20, domain:15, structured:10, search:10, info_only:10, improving:5, cross_session:5 }},
  { id:"haystack", name:"Haystack", tagline:"Pipeline-focused architecture for document and search agents", best:"Pipeline-based document / search agents", why:"Pipeline-focused architecture with multimodal RAG, document Q&A, and composable nodes. Data-native by design.", avoid:"LangGraph (not data-native)",
    scores:{ answer:15, internal_docs:18, domain:12, search:15, process:12, structured:12, info_only:8 }},
  { id:"autogen", name:"AutoGen", tagline:"Conversation-driven agents that negotiate and brainstorm", best:"Human-in-the-loop / conversational AI", why:"Conversation-driven architecture where agents negotiate mid-run. Ideal when humans supervise, review, and steer.", avoid:"LangGraph (too rigid for conversation)",
    scores:{ converse:20, session:5, adaptive:10, small_team:5 }},
  { id:"ms_agent", name:"Microsoft Agent Framework", tagline:"Unified AutoGen + Semantic Kernel for enterprise", best:"Enterprise / existing app integration", why:"Unified AutoGen + Semantic Kernel (Oct 2025). Skills + planner model for C#, Java, Python. Enterprise-grade with Azure integration.", avoid:"CrewAI (greenfield only)",
    scores:{ enterprise:30, existing_app:25, scaling:15, critical:10, high:5, coordinate:5 }},
  { id:"pydantic_ai", name:"Pydantic AI", tagline:"Type-safe, production-grade agent framework", best:"Type-safe, production-grade agents", why:"Full type safety with structured outputs validated at runtime. Integrates with any framework. Catches schema mismatches before deployment.", avoid:"Smolagents (no type safety)",
    scores:{ enterprise:10, existing_app:15, high:15, critical:20, scaling:12, improving:8, complex:5 }},
  { id:"strands", name:"Strands (Bedrock)", tagline:"Fast tool-calling agents on AWS with minimal code", best:"Fast tool-calling agents on AWS", why:"Model-driven, minimal code, native AWS/Lambda integration. Claude 3.7 default. From idea to deployed agent in minutes.", avoid:"LangGraph (over-engineered for simple agents)",
    scores:{ solo_code:12, simple:12, process:10, execute:12, search:8, answer:5, idea:8, prototype:8 }},
  { id:"strands_langgraph", name:"Strands + LangGraph", tagline:"LangGraph orchestrates macro flow, Strands handles subtasks", best:"Production multi-agent on AWS", why:"LangGraph orchestrates the macro flow; Strands handles autonomous subtasks per node. Best of both worlds for AWS-native production.", avoid:"CrewAI (weak AWS-native)",
    scores:{ enterprise:12, scaling:12, coordinate:15, complex:10, autonomous:10, execute:8, critical:5 }},
  { id:"google_adk", name:"Google ADK", tagline:"Native Vertex AI integration, agent-to-agent protocol", best:"Google Cloud / Vertex AI agents", why:"Native Vertex AI integration with agent-to-agent protocol, optimized for Gemini models. First-party Google Cloud support.", avoid:"Strands (AWS-locked)",
    scores:{ enterprise:12, existing_app:10, scaling:8, coordinate:5 }},
  { id:"openai_agents", name:"OpenAI Agents SDK", tagline:"Lightweight, built-in tracing and handoffs", best:"OpenAI-native agents", why:"Lightweight SDK with built-in tracing and handoffs between agents. 8.6k GitHub stars. Minimal boilerplate for OpenAI-native workflows.", avoid:"Semantic Kernel (verbose)",
    scores:{ small_team:10, prototype:15, solo_code:8, converse:5, simple:5, idea:5 }},
  { id:"smolagents", name:"Smolagents (HuggingFace)", tagline:"~1,000 lines of code, code-first actions, runs on local models", best:"Rapid prototyping / MVPs", why:"~1,000 lines of code total. Code-first actions reduce LLM calls by ~30%. Runs on local models. Fastest from zero to working agent.", avoid:"LangGraph (too complex for MVPs)",
    scores:{ idea:18, prototype:20, solo_code:12, simple:12, build:5, process:5, low:5 }},
  { id:"agno", name:"Agno (ex-Phidata)", tagline:"Orchestrates thousands of agents with built-in memory + vector DB", best:"High-scale self-hosted agents", why:"Orchestrates thousands of agents. Multimodal with built-in memory + vector DB. 29k GitHub stars. Self-hosted scale without cloud lock-in.", avoid:"n8n (not designed for scale)",
    scores:{ scaling:22, enterprise:10, adaptive:12, coordinate:12, autonomous:12, cross_session:8, complex:5 }},
  { id:"n8n", name:"n8n + Claude Skills", tagline:"Visual workflow automation with AI modules", best:"No-code / low-code automation", why:"Visual workflow builder with trigger-based execution. Claude Skills as SOP modules. No Python required.", avoid:"LangGraph (requires Python)",
    scores:{ no_code:35, execute:10, simple:5 }},
  { id:"langchain", name:"LangChain", tagline:"Largest ecosystem (106k stars), most tutorials available", best:"Rapid prototyping / experimentation", why:"Largest ecosystem of tools and integrations. 106k GitHub stars, most tutorials. Best for quickly testing ideas.", avoid:"Semantic Kernel (verbose)",
    scores:{ prototype:12, small_team:15, answer:10, converse:10, session:10, medium_cx:10, search:5, realtime:10, compute:5, low:10, idea:10 }},
  { id:"dspy", name:"DSPy", tagline:"Treats prompts as learnable parameters — auto-optimizes them", best:"Optimizing prompts / LLM pipelines", why:"Treats prompts as learnable parameters and auto-optimizes them — no manual prompt engineering. Systematic improvement over trial-and-error.", avoid:"LangChain (manual prompting)",
    scores:{ improving:18, scaling:12, process:10, medium_cx:5, complex:5 }},
];

const QUESTIONS = [
  { id:"problem", section:"The Problem", question:"What problem are you solving?", subtitle:"Describe in 1-2 sentences what your user struggles with today.", type:"text", placeholder:"e.g., Our support team spends 4 hours/day answering repetitive questions from docs scattered across Notion, Confluence, and Zendesk..." },
  { id:"user", section:"The Problem", question:"Who is the user?", subtitle:"Who specifically will use this?", type:"text", placeholder:"e.g., Customer support agents at a B2B SaaS company with 200+ help articles..." },
  { id:"ai_job", section:"What the AI Does", question:"What should the AI actually do?", subtitle:"Pick the closest match.", type:"single", options:[
    { value:"answer", label:"Answer questions", desc:"Based on information it's given" },
    { value:"converse", label:"Have conversations", desc:"Back-and-forth dialogue with users" },
    { value:"autonomous", label:"Complete tasks autonomously", desc:"Research, write, execute without hand-holding" },
    { value:"decide", label:"Make decisions or recommendations", desc:"Evaluate options and advise" },
    { value:"process", label:"Process / transform content", desc:"Summarize, extract, translate, classify" },
    { value:"build", label:"Build software / apps", desc:"Generate code, create features, ship products" }
  ]},
  { id:"knowledge", section:"What the AI Does", question:"Does the AI need to know things beyond its training?", subtitle:"Select all that apply.", type:"multi", options:[
    { value:"internal_docs", label:"Internal documents / knowledge base" },
    { value:"realtime", label:"Real-time or frequently updated data" },
    { value:"domain", label:"Deep domain expertise (legal, medical, financial)" },
    { value:"structured", label:"Databases or structured records" },
    { value:"none", label:"General knowledge is sufficient" }
  ]},
  { id:"memory", section:"What the AI Does", question:"Does it need to remember things?", subtitle:"How much context persistence matters.", type:"single", options:[
    { value:"none", label:"No memory needed", desc:"Each interaction is independent" },
    { value:"session", label:"Within a session", desc:"Maintain context during one conversation" },
    { value:"cross_session", label:"Across sessions", desc:"Remember users between separate visits" },
    { value:"adaptive", label:"Learn and adapt over time", desc:"Build understanding that improves with use" }
  ]},
  { id:"complexity", section:"What the AI Does", question:"How complex is the thinking required?", subtitle:"What kind of cognitive work?", type:"single", options:[
    { value:"simple", label:"Simple", desc:"Classify, extract, summarize" },
    { value:"medium", label:"Medium", desc:"Analyze step-by-step, compare options" },
    { value:"complex", label:"Complex", desc:"Evaluate multiple strategies, make tradeoffs" },
    { value:"interconnected", label:"Highly interconnected", desc:"Everything affects everything" }
  ]},
  { id:"actions", section:"What the AI Does", question:"Does it need to take actions or just provide information?", subtitle:"Select all that apply.", type:"multi", options:[
    { value:"info_only", label:"Information only — text in, text out" },
    { value:"search", label:"Look things up (databases, APIs, web)" },
    { value:"compute", label:"Do calculations or data analysis" },
    { value:"execute", label:"Take actions (send messages, update records)" },
    { value:"coordinate", label:"Coordinate multiple tools / systems together" }
  ]},
  { id:"stakes", section:"Quality & Constraints", question:"What happens when the AI gets it wrong?", subtitle:"Calibrates reliability needs.", type:"single", options:[
    { value:"low", label:"Mildly annoying", desc:"User just tries again" },
    { value:"medium", label:"Frustrating", desc:"User loses trust" },
    { value:"high", label:"Costly", desc:"Wrong info → bad decisions" },
    { value:"critical", label:"Dangerous", desc:"Real harm — health, legal, financial" }
  ]},
  { id:"environment", section:"Quality & Constraints", question:"What's your technical environment?", subtitle:"Determines which frameworks are practical.", type:"single", options:[
    { value:"solo_code", label:"Solo builder / vibe coding", desc:"Just me, Claude Code or Cursor" },
    { value:"small_team", label:"Small team, greenfield", desc:"2-5 devs, building from scratch" },
    { value:"existing_app", label:"Integrating into an existing app", desc:"Adding AI to established codebase" },
    { value:"no_code", label:"No-code / low-code", desc:"Visual workflows, minimal programming" },
    { value:"enterprise", label:"Enterprise / production", desc:"Existing infra, compliance, C#/Java/Python" }
  ]},
  { id:"stage", section:"Quality & Constraints", question:"Where are you in building this?", subtitle:"Stage shapes technique choices.", type:"single", options:[
    { value:"idea", label:"Just an idea" },
    { value:"prototype", label:"Prototyping" },
    { value:"improving", label:"Improving a working product" },
    { value:"scaling", label:"Scaling / production" }
  ]},
  { id:"unsure", section:"Quality & Constraints", question:"What are you most unsure about?", subtitle:"What decision feels hardest?", type:"text", placeholder:"e.g., I don't know whether to use RAG or fine-tune, or whether I need agents at all..." }
];

/* ── DATA-DRIVEN SCORING ── */
function scoreFrameworks(answers, frameworks) {
  // Build signal set from answers
  const signals = new Set();
  if (answers.environment) signals.add(answers.environment);
  if (answers.ai_job) signals.add(answers.ai_job);
  (answers.knowledge||[]).forEach(k => { if(k==="none") signals.add("none_k"); else signals.add(k); });
  if (answers.memory) { if(answers.memory==="none") signals.add("none_m"); else signals.add(answers.memory); }
  if (answers.complexity) { signals.add(answers.complexity); if(answers.complexity==="medium") signals.add("medium_cx"); }
  (answers.actions||[]).forEach(a => signals.add(a));
  if (answers.stakes) signals.add(answers.stakes);
  if (answers.stage) signals.add(answers.stage);

  return frameworks.map(fw => {
    let score = 0;
    Object.entries(fw.scores||{}).forEach(([signal, weight]) => {
      if (signals.has(signal)) score += weight;
    });
    return { ...fw, score };
  }).sort((a,b) => b.score - a.score);
}

/* ── AGENT RECOMMENDATION ENGINE (unchanged logic) ── */
const AGENT_DEFS = {
  knowledge:{ icon:"📚", color:"#DDA0DD", name:"Knowledge Advisor" },
  reasoning:{ icon:"🧠", color:"#7CB9E8", name:"Reasoning Advisor" },
  memory:{ icon:"💾", color:"#90EE90", name:"Memory Advisor" },
  tools:{ icon:"🔧", color:"#FFD700", name:"Tools Advisor" },
  improvement:{ icon:"📈", color:"#FF6B6B", name:"Improvement Advisor" },
  architecture:{ icon:"🏗️", color:"#E8945A", name:"Architecture Advisor" }
};

function buildAgentRecommendations(a) {
  const agents = [];
  const kn=a.knowledge||[], ac=a.actions||[];
  const early=a.stage==="idea"||a.stage==="prototype";
  const hi=a.stakes==="high"||a.stakes==="critical";

  if(!kn.includes("none")&&kn.length>0){
    let technique,rationale,notChosen;
    const multi=kn.filter(x=>x!=="none").length>=3;
    if(early&&!kn.includes("domain")&&!multi){
      if(kn.length===1&&(kn.includes("internal_docs")||kn.includes("structured"))){technique="Prompt Injection";rationale="Your knowledge source is small and static enough to include directly in the prompt. Graduate to Naive RAG when documents exceed the context window.";notChosen="Naive RAG — adds unnecessary infrastructure at this scale.";}
      else{technique="Naive RAG";rationale="You need external knowledge across multiple sources at early stage. Naive RAG (chunk → embed → retrieve → generate) gives you a working pipeline in hours. Start here, measure quality, then upgrade.";notChosen="Advanced RAG — you don't yet know where retrieval fails. Get Naive RAG running first.";}
    }else if(a.stage==="scaling"&&multi){technique="Modular RAG";rationale="At scale with multiple knowledge sources. Modular RAG breaks the pipeline into interchangeable components (query processing, retrieval, re-ranking, generation) — each optimized or swapped independently.";notChosen="Advanced RAG — works as a single pipeline but becomes rigid at scale.";}
    else{technique="Advanced RAG";rationale=hi?"High-stakes domain — wrong retrievals cause real damage. Advanced RAG adds pre-retrieval query analysis (intent classification, entity recognition, decomposition) and post-retrieval re-ranking. Corrective RAG (CRAG) provides fallback for knowledge gaps.":"You need domain expertise or real-time data beyond Naive RAG. Advanced RAG's query rewriting and re-ranking catch semantic mismatches and relevance failures.";notChosen="Naive RAG — too simplistic for your knowledge complexity.";}
    agents.push({id:"knowledge",...AGENT_DEFS.knowledge,purpose:"Decides how the AI accesses information it wasn't trained on. Solves the temporal relevance gap (training cutoff), hallucination risk (pattern-based knowledge), and source transparency problem. Designs the retrieval pipeline: chunking, embeddings, retrieval + ranking.",technique,rationale,notChosen,given:`the AI needs external knowledge (${kn.filter(x=>x!=="none").join(", ")}) at ${a.stage} stage`,when:"a user query requires information the LLM doesn't have in its parameters",then:`apply ${technique} — index sources, retrieve relevant context at query time, augment the LLM prompt with grounded information`});
  }

  if(a.complexity&&a.complexity!=="simple"){
    let technique,rationale,notChosen;
    if(a.complexity==="medium"){technique="Chain of Thought (CoT)";rationale="Your task requires step-by-step analysis along a linear path. CoT breaks complex input into sequential reasoning steps — like an SOP. Research shows 20-30% improvement on complex reasoning tasks. Structure: define context → step-by-step reasoning → output format → examples.";notChosen="CoT Self-Consistency — overkill for linear tasks. Tree of Thought — your problem doesn't need branching exploration.";}
    else if(a.complexity==="complex"){
      if(hi){technique="CoT Self-Consistency";rationale="Complex AND high-stakes. Runs 8-10 parallel reasoning paths (e.g., user experience, technical feasibility, market dynamics, competitive positioning) and selects the answer with strongest consensus. Research: up to +20% accuracy. Diminishing returns after 10 paths.";notChosen="Tree of Thought — better for exploration, but your priority is accuracy and confidence. Standard CoT — too risky for high-stakes; single path may have logical gaps.";}
      else{technique="Tree of Thought (ToT)";rationale="Your task requires evaluating multiple strategies and tradeoffs — like a chess grandmaster considering several moves. ToT creates branching paths at each decision point, self-evaluates which are promising, prunes dead ends. Uses BFS or DFS to systematically explore solutions.";notChosen="CoT Self-Consistency — generates parallel end-to-end answers and votes, but your problem needs branching at each step. Graph of Thought — no circular dependencies in your problem.";}
    }else{technique="Graph of Thought (GoT)";rationale="Interconnected factors that influence each other bidirectionally — like marketplace pricing ↔ buyer behavior ↔ seller behavior. GoT represents reasoning as a network: insights flow in multiple directions, later discoveries refine earlier conclusions. Aggregation points synthesize perspectives.";notChosen="Tree of Thought — can't model circular dependencies. CoT — far too linear.";}
    agents.push({id:"reasoning",...AGENT_DEFS.reasoning,purpose:"Bridges System 1 thinking (fast pattern matching — LLM default) and System 2 thinking (deliberate multi-step reasoning). Overcomes the linear generation problem (can't course-correct mid-output) and structural thinking limitations (doesn't naturally decompose problems).",technique,rationale,notChosen,given:`core task has ${a.complexity} complexity and ${a.stakes} stakes`,when:"the AI receives a problem requiring multi-step analysis, not just pattern matching",then:`structure reasoning using ${technique} — decompose into explicit steps, execute the strategy, synthesize a final recommendation`});
  }

  if(a.memory&&a.memory!=="none"){
    let technique,rationale,notChosen;
    if(a.memory==="session"){
      if(early){technique="Buffer Memory";rationale="Within-session context with complete transcript storage. Simplest: no summarization risk, no complex implementation. Each request includes full history. Tradeoff: cost scales with conversation length. Fine for short sessions.";notChosen="Summary Memory — adds summarization risk without benefit for short sessions.";}
      else{technique="Summary Memory";rationale="Extended sessions need context window cost management. Summary Memory condenses history into key points — like meeting notes. Each request gets: current message + running summary + last few messages in full. Dramatically reduces tokens.";notChosen="Buffer Memory — cost scales linearly with conversation length, too expensive at scale.";}
    }else if(a.memory==="cross_session"){technique="Entity Memory";rationale="Remember specific things (users, projects, concepts) across sessions — like an executive assistant with detailed client files. Detects entities, extracts attributes, maintains structured profiles with cross-references. 'Project Aurora' recalled with features, stakeholders, status weeks later.";notChosen="KLTM — more complex, harder to update/delete specific facts. Entity Memory's structured profiles are more precise and controllable.";}
    else{technique="Knowledge Long-Term Memory (KLTM)";rationale="Learn and adapt from accumulated interactions. KLTM applies RAG to the AI's own conversation history: past interactions chunked, embedded, stored in vector DB. Semantically relevant experiences retrieved on each query. Most comprehensive: unlimited memory with semantic understanding.";notChosen="Entity Memory — captures structured facts but misses conversational nuance and patterns.";}
    agents.push({id:"memory",...AGENT_DEFS.memory,purpose:"Overcomes stateless LLMs — every interaction starts fresh by default. Designs how the AI stores, retrieves, and forgets information. Manages the triple tradeoff: longer context = more cost (quadratic scaling), less accuracy (signal-to-noise), slower responses (attention computation).",technique,rationale,notChosen,given:`AI needs ${a.memory==="session"?"within-session":a.memory==="cross_session"?"cross-session":"adaptive long-term"} memory at ${a.stage} stage`,when:"the AI needs prior context — from earlier in the conversation or past sessions",then:`implement ${technique} — store history in the appropriate format, retrieve relevant context, manage lifecycle (formation, staleness, user control)`});
  }

  if(ac.some(x=>["search","compute","execute","coordinate"].includes(x))){
    let technique,rationale,notChosen;
    const types=[];if(ac.includes("search"))types.push("Data Retrieval");if(ac.includes("compute"))types.push("Computational");if(ac.includes("execute"))types.push("Execution");
    if(ac.includes("coordinate")){technique="Tool Chain Orchestration";rationale=`Coordinate ${types.join(" + ")} tools to complete tasks no single tool handles alone. An orchestrator manages context, selects tools in sequence, handles errors. Latency budget: tool selection ~100-300ms + API calls ~200-1000ms each + processing ~100-200ms. Plan parallel execution.`;notChosen="Individual tool integration — can't handle tools that need to feed results to each other.";}
    else if(types.length===1){technique=`${types[0]} Tools`;const d={"Data Retrieval":"Access external info — databases, APIs, web search. Bridges training data and live reality. LLM generates structured function calls (JSON) executed outside the model.","Computational":"Precise math — LLMs use probabilistic patterns, not calculators. Provides calculators, data analysis, spreadsheet operations.","Execution":"Take actions in external systems — API calls, system control, file operations. Transforms AI from advisor into active assistant."};rationale=d[types[0]]+" Key challenge: the 'eager intern' problem — LLMs overuse tools. Add explicit 'when NOT to use' instructions.";notChosen="Tool Chain Orchestration — single tool category doesn't need coordination overhead.";}
    else{technique=`${types.join(" + ")} Tools`;rationale=`Multiple independent tool types. Integrate each: ${types.join(", ")}. For each: define purpose + I/O spec, write prompt instructions with examples, implement function calling, build error handling with fallbacks.`;notChosen="Tool Chain Orchestration — your tools operate independently, not chained.";}
    agents.push({id:"tools",...AGENT_DEFS.tools,purpose:"Solves three LLM limitations: can't access current information, can't perform real-world actions, can't interact with external systems. Designs tool definitions, prompt instructions, function calling, result integration, and error handling. Addresses: right tool selection, unnecessary usage, API mismatches, latency stacking.",technique,rationale,notChosen,given:`AI needs to ${ac.filter(x=>x!=="info_only").map(x=>({search:"look up external data",compute:"perform calculations",execute:"take system actions",coordinate:"coordinate multiple tools"}[x])).join(" and ")}`,when:"a task requires information, computation, or actions beyond text generation",then:`integrate ${technique} — define tool specs, implement function calling, handle errors with layered fallbacks`});
  }

  if(a.stage==="improving"||a.stage==="scaling"){
    let technique,rationale,notChosen;
    const hasK=kn.some(x=>x!=="none");const hasB=a.ai_job==="converse"||a.ai_job==="process";
    if(hasK&&!hasB){technique="Prompt Engineering → RAG";rationale="Knowledge gap — model doesn't know specific info. Exhaust prompt engineering first (free). Then layer RAG for domain knowledge at inference time. Don't fine-tune facts into a model.";notChosen="Fine-Tuning — wrong tool for knowledge gaps. RL/RLHF — massive overkill.";}
    else if(hasB){technique="LoRA (Parameter-Efficient Fine-Tuning)";rationale="Behavior gap — model doesn't act the way you need (tone, formatting, conventions). LoRA adds small trainable components: ~80-90% of full fine-tuning benefits at ~20% cost. Needs thousands of input/output examples. Try prompt engineering first.";notChosen="Full SFT — LoRA achieves near-same quality at fraction of cost. RLHF — your problem is behavior consistency, not subjective quality.";}
    else if(hi){technique="RLHF";rationale="High-stakes at scale — outputs need human judgment alignment that metrics can't capture. Human evaluators compare outputs → reward model → RL optimization. Most complex: high compute + human cost. Consider DPO as simpler alternative.";notChosen="RL with automated reward — your quality criteria are subjective. LoRA — addresses patterns but not nuanced preferences.";}
    else{technique="Prompt Engineering → RAG → LoRA";rationale="Follow the escalation ladder: (1) Rewrite prompts, add examples (free). (2) Layer RAG for knowledge gaps. (3) LoRA fine-tuning only if behavior gaps persist. Measure at each step before escalating.";notChosen="Jumping to fine-tuning — most 'model isn't good enough' problems are prompt problems.";}
    agents.push({id:"improvement",...AGENT_DEFS.improvement,purpose:"Overcomes static LLMs that can't learn from corrections, accumulate knowledge, or adapt to preferences. Diagnoses gap type: Knowledge → RAG, Behavior → Fine-Tuning, Decision-making → RL, Preference → RLHF. Enforces the escalation ladder: prompt engineering → RAG → fine-tuning → RL/RLHF.",technique,rationale,notChosen,given:`existing product at ${a.stage} stage with ${a.stakes} stakes needs quality improvement`,when:"current AI output quality doesn't meet the product bar",then:`apply ${technique} — measure baseline, implement improvement, validate before shipping`});
  }

  if(a.ai_job==="autonomous"||ac.includes("coordinate")){
    let technique,rationale,notChosen;
    const needsMulti=ac.includes("coordinate")&&(a.complexity==="complex"||a.complexity==="interconnected");
    if(early&&!needsMulti){technique="Single Agent (Think → Plan → Act → Reflect)";rationale="Autonomous behavior at early stage. Four-step loop: Think (gather data), Plan (decompose goal), Act (execute with tools), Reflect (evaluate + correct). Customize with five levers: Persona, Knowledge, Reasoning, Tools, Boundaries. Critical: 95% per step × 10 steps = 60% overall. Keep steps low.";notChosen="Multi-Agent — prove single agent can't handle it first. Pipeline — too rigid for adaptive behavior.";}
    else if(needsMulti){
      if(a.environment==="enterprise"||a.environment==="existing_app"){technique="Multi-Agent System (Hierarchical)";rationale="Complex coordination at enterprise scale. Multiple supervision layers — top orchestrator delegates to mid-level supervisors managing specialists. Highly scalable. Communication via Message Pool. Orchestrator handles task allocation, synchronization, context, and adaptation.";notChosen="Network — too much overhead at scale. Supervisor (flat) — single point of failure.";}
      else{technique="Multi-Agent System (Supervisor)";rationale="Central coordinator assigns tasks to specialist agents. Fast decisions with clear accountability. Each specialist narrowly customized — fewer mistakes, easier validation. Supervisor uses tool-calling: agents represented as callable tools.";notChosen="Hierarchical — unnecessary management layers. Single Agent — workflow has distinct roles needing specialization.";}
    }else{technique="Single Agent (Think → Plan → Act → Reflect)";rationale="Autonomous task completion with tool access. The Reflect step is what separates agents from pipelines — prevents compounding errors and makes reasoning transparent. Define operating boundaries: action limits, data access, communication rules, escalation triggers.";notChosen="Multi-Agent — single agent handles this complexity. Pipeline — too rigid for adaptive behavior.";}
    agents.push({id:"architecture",...AGENT_DEFS.architecture,purpose:"Overcomes the 'strategic vacuum' — LLMs can't set goals, prioritize, or adapt based on outcomes. Designs pipeline vs single agent vs multi-agent. Addresses compounding error rate: each step <100% success, errors multiply (95% × 10 steps = 60%). Defines the Think→Plan→Act→Reflect loop, customization levers, and coordination patterns.",technique,rationale,notChosen,given:`AI needs autonomous goal-directed behavior with ${a.complexity} complexity in ${a.environment} environment`,when:"user provides a broad goal, AI must determine needed steps",then:`implement ${technique} — define goal, tool set, guardrails, execute core loop, build error detection with human escalation`});
  }
  return agents;
}

/* ── EXECUTION STEPS ENGINE ── */

function buildExecutionSteps(answers, agents) {
  const steps = [];
  const agentIds = agents.map(a => a.id);
  const agentMap = {};
  agents.forEach(a => { agentMap[a.id] = a; });
  const ac = answers.actions || [];

  // ── Step 1: Always — Input Reception ──
  const inputDescs = {
    answer: "Receive user question or query",
    converse: "Receive user message in conversation",
    autonomous: "Receive user goal or objective",
    decide: "Receive decision context and options",
    process: "Receive content for processing",
    build: "Receive build specification or feature request"
  };
  steps.push({
    name: inputDescs[answers.ai_job] || "Receive user input",
    detail: "Parse the incoming request, extract intent and key entities. This is the entry point for every interaction.",
    agent: null,
    phase: "input",
    color: "#E8945A"
  });

  // ── Memory: Retrieve context (if active, runs before knowledge) ──
  if (agentIds.includes("memory")) {
    const a = agentMap.memory;
    const memSteps = {
      "Buffer Memory": { name: "Load conversation history", detail: "Append the full conversation transcript to the prompt. Every prior message is included in chronological order — no information lost, but token count grows with each turn." },
      "Summary Memory": { name: "Retrieve condensed context", detail: "Load the running summary of prior interactions plus the last 2-3 messages in full. The summary captures key decisions, preferences, and facts while keeping token usage manageable." },
      "Entity Memory": { name: "Retrieve entity profiles", detail: "Look up structured profiles for entities mentioned in the input — people, projects, products, concepts. Pull attributes, relationships, and history from the entity store. Cross-reference linked entities." },
      "Knowledge Long-Term Memory (KLTM)": { name: "Semantic search past interactions", detail: "Embed the current input and search the vector database of past interactions for semantically relevant memories. Retrieve the top-k most relevant past experiences, even if phrased differently from the current query." }
    };
    const ms = memSteps[a.technique] || { name: "Retrieve memory context", detail: a.technique };
    steps.push({ ...ms, agent: "memory", phase: "context", color: AGENT_DEFS.memory.color });
  }

  // ── Knowledge: Retrieval pipeline (if active) ──
  if (agentIds.includes("knowledge")) {
    const a = agentMap.knowledge;
    if (a.technique === "Prompt Injection") {
      steps.push({
        name: "Inject reference context into prompt",
        detail: "Load the relevant knowledge source directly into the prompt alongside the user's query. No retrieval pipeline — the context is small and static enough to include in full. Verify the source fits within the context window budget.",
        agent: "knowledge", phase: "retrieval", color: AGENT_DEFS.knowledge.color
      });
    } else if (a.technique === "Naive RAG") {
      steps.push({
        name: "Embed query and retrieve matching chunks",
        detail: "Convert the user's input into an embedding using the same model that indexed the knowledge base. Search the vector database for the top-k most similar chunks. Combine retrieved chunks with the original query into an enriched prompt.",
        agent: "knowledge", phase: "retrieval", color: AGENT_DEFS.knowledge.color
      });
    } else if (a.technique === "Advanced RAG") {
      steps.push({
        name: "Analyze and rewrite query",
        detail: "Classify intent (search, action, information). Recognize entities (product names, dates, domain terms). Detect query type (navigational, informational, transactional). Rewrite: expand with synonyms, decompose complex questions into sub-queries, enrich with contextual information.",
        agent: "knowledge", phase: "retrieval", color: AGENT_DEFS.knowledge.color
      });
      steps.push({
        name: "Retrieve, re-rank, and compress",
        detail: "Execute retrieval against the rewritten query. Re-rank results by semantic relevance, diversity, and recency. Compress overlapping chunks to eliminate redundancy. If coverage gaps remain, trigger recursive retrieval or web search fallback (Corrective RAG).",
        agent: "knowledge", phase: "retrieval", color: AGENT_DEFS.knowledge.color
      });
    } else if (a.technique === "Modular RAG") {
      steps.push({
        name: "Route query to retrieval module",
        detail: "The query processing module classifies the input and selects the optimal retrieval strategy — dense (semantic), sparse (keyword), or hybrid. Each module operates independently and can be swapped or upgraded without affecting the others.",
        agent: "knowledge", phase: "retrieval", color: AGENT_DEFS.knowledge.color
      });
      steps.push({
        name: "Retrieve → re-rank → prepare context",
        detail: "The retrieval module fetches candidates. The re-ranking module scores and orders them. The generation module receives the optimized context. Each component is independently tunable and versioned.",
        agent: "knowledge", phase: "retrieval", color: AGENT_DEFS.knowledge.color
      });
    }
  }

  // ── Tools: Execution (if active, before reasoning so reasoning can use tool results) ──
  if (agentIds.includes("tools")) {
    const a = agentMap.tools;
    if (a.technique === "Tool Chain Orchestration") {
      steps.push({
        name: "Orchestrate tool chain",
        detail: "The orchestrator selects tools in sequence based on the task decomposition. Each tool receives context from prior steps. Execution flow: select tool → validate parameters → call API → process response → feed into next tool. Handle failures with layered fallbacks. Latency budget: ~100-300ms selection + ~200-1000ms per API call.",
        agent: "tools", phase: "execution", color: AGENT_DEFS.tools.color
      });
    } else {
      const toolActions = [];
      if (ac.includes("search")) toolActions.push("query external data sources (databases, APIs, web search)");
      if (ac.includes("compute")) toolActions.push("execute precise calculations or data analysis");
      if (ac.includes("execute")) toolActions.push("perform actions in external systems (API calls, record updates, workflow triggers)");
      steps.push({
        name: `Execute ${a.technique.toLowerCase()}`,
        detail: `Call the required tools: ${toolActions.join("; ")}. For each call: generate structured function call (JSON) → validate parameters against API spec → execute outside the LLM → format result for context integration. Monitor for unnecessary tool invocations.`,
        agent: "tools", phase: "execution", color: AGENT_DEFS.tools.color
      });
    }
  }

  // ── Reasoning: Processing (if active) ──
  if (agentIds.includes("reasoning")) {
    const a = agentMap.reasoning;
    const reasoningSteps = {
      "Chain of Thought (CoT)": {
        name: "Execute chain-of-thought reasoning",
        detail: "Decompose the problem into sequential steps: Initial Assessment (gather facts, identify constraints) → Analysis Framework (select approach, key variables) → Explore Options (generate approaches, consider tradeoffs) → Evaluate and Select (apply criteria) → Implementation Plan → Final Review. Each step has a defined purpose, method, and expected output."
      },
      "CoT Self-Consistency": {
        name: "Run parallel reasoning paths and vote",
        detail: "Generate 8-10 independent reasoning paths, each analyzing the problem from a different perspective (e.g., user experience, technical feasibility, market dynamics, competitive positioning). Each path produces a complete answer. Compare outputs, identify the strongest consensus, and synthesize the final recommendation from the majority agreement."
      },
      "Tree of Thought (ToT)": {
        name: "Explore branching solutions with pruning",
        detail: "At each decision point, generate multiple candidate approaches. Self-evaluate each branch: 'Does this line of thinking seem promising?' Prune unproductive paths early. Systematically explore the remaining solution space using depth-first or breadth-first search. Backtrack when a branch dead-ends. Select the most promising path after thorough exploration."
      },
      "Graph of Thought (GoT)": {
        name: "Map reasoning network and resolve dependencies",
        detail: "Model the problem as an interconnected graph where each node is a consideration and edges represent influence relationships. Allow bidirectional information flow — later insights refine earlier conclusions. Identify aggregation points where multiple reasoning threads converge. Iterate until the network stabilizes and contradictions are resolved."
      }
    };
    const rs = reasoningSteps[a.technique] || { name: "Apply reasoning strategy", detail: a.technique };
    steps.push({ ...rs, agent: "reasoning", phase: "reasoning", color: AGENT_DEFS.reasoning.color });
  }

  // ── Architecture: Agent loop (if active) ──
  if (agentIds.includes("architecture")) {
    const a = agentMap.architecture;
    if (a.technique.includes("Multi-Agent")) {
      steps.push({
        name: "Delegate to specialist agents",
        detail: `The ${a.technique.includes("Hierarchical") ? "hierarchical orchestrator" : "supervisor agent"} decomposes the goal into subtasks and assigns each to a specialist agent. Each agent executes its narrow role with its own tool set and guardrails. Results flow back through the ${a.technique.includes("Hierarchical") ? "supervision layers" : "supervisor"} for aggregation and quality control.`,
        agent: "architecture", phase: "orchestration", color: AGENT_DEFS.architecture.color
      });
    }
    steps.push({
      name: "Reflect and validate",
      detail: "The Reflect step evaluates outcomes against the original goal: Was the objective achieved? Were there errors? Was execution efficient? Extract insights for the next cycle. This is what separates agents from pipelines — it catches compounding errors before they propagate and makes the reasoning process auditable.",
      agent: "architecture", phase: "orchestration", color: AGENT_DEFS.architecture.color
    });
  }

  // ── Output generation (always) ──
  const outputDescs = {
    answer: "Generate grounded answer with citations",
    converse: "Generate contextual response maintaining conversation flow",
    autonomous: "Compile results and deliver completed work",
    decide: "Present recommendation with supporting analysis",
    process: "Output processed content in specified format",
    build: "Generate code, create files, run tests"
  };
  steps.push({
    name: outputDescs[answers.ai_job] || "Generate response",
    detail: agentIds.includes("knowledge")
      ? "Synthesize the retrieved context, reasoning output, and any tool results into a final response. Cite sources where applicable. If retrieval found no relevant information, communicate this transparently rather than hallucinating."
      : "Compile all intermediate results into the final output. Validate format and completeness against the original request.",
    agent: null,
    phase: "output",
    color: "#E8945A"
  });

  // ── Quality gate (if improvement agent is active) ──
  if (agentIds.includes("improvement")) {
    const a = agentMap.improvement;
    steps.push({
      name: "Evaluate output quality",
      detail: `Run the output through the evaluation pipeline before delivery. Track the primary quality metric. Compare against baseline. Flag outputs that fall below the confidence threshold for human review. Feed failures back into the ${a.technique} improvement cycle.`,
      agent: "improvement", phase: "quality", color: AGENT_DEFS.improvement.color
    });
  }

  // ── Memory: Store (if active, always last) ──
  if (agentIds.includes("memory")) {
    const a = agentMap.memory;
    const storeDescs = {
      "Buffer Memory": "Append the current exchange (user message + AI response) to the conversation buffer.",
      "Summary Memory": "Update the running summary with key information from this exchange. Condense older details while preserving recent messages in full.",
      "Entity Memory": "Extract any new or updated entity information from this exchange. Update entity profiles with new attributes, relationships, or status changes.",
      "Knowledge Long-Term Memory (KLTM)": "Process this interaction into meaningful chunks, embed them, and store in the vector database for future semantic retrieval."
    };
    steps.push({
      name: "Store to memory",
      detail: storeDescs[a.technique] || "Persist relevant information from this interaction.",
      agent: "memory", phase: "persist", color: AGENT_DEFS.memory.color
    });
  }

  return steps;
}

/* ── EXECUTION STEPS COMPONENT ── */

function ExecutionSteps({ steps }) {
  const phaseLabels = { input:"INPUT", context:"CONTEXT", retrieval:"RETRIEVAL", execution:"EXECUTION", reasoning:"REASONING", orchestration:"ORCHESTRATION", output:"OUTPUT", quality:"QUALITY GATE", persist:"PERSIST" };
  let lastPhase = "";

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#5A564F", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
        Execution Pipeline — {steps.length} steps
      </div>
      <div style={{ position: "relative", paddingLeft: 28 }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: 9, top: 8, bottom: 8, width: 1, background: "rgba(255,255,255,0.06)" }} />

        {steps.map((step, i) => {
          const showPhase = step.phase !== lastPhase;
          lastPhase = step.phase;
          return (
            <div key={i}>
              {showPhase && (
                <div style={{ position: "relative", marginBottom: 6, marginTop: i === 0 ? 0 : 16, marginLeft: -28 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.1em", color: "#3A3630", textTransform: "uppercase"
                  }}>{phaseLabels[step.phase] || step.phase}</span>
                </div>
              )}
              <div style={{
                position: "relative", paddingBottom: i < steps.length - 1 ? 12 : 0,
              }}>
                {/* Node dot */}
                <div style={{
                  position: "absolute", left: -23, top: 5,
                  width: 10, height: 10, borderRadius: 5,
                  background: step.color + "30",
                  border: `2px solid ${step.color}`,
                  boxShadow: `0 0 6px ${step.color}25`
                }} />

                {/* Step card */}
                <div style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${step.color}20`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: "#1A1714",
                      background: step.color, padding: "1px 8px", borderRadius: 3,
                      fontFamily: "'DM Mono', monospace"
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#E8E6E3" }}>{step.name}</span>
                    {step.agent && (
                      <span style={{
                        fontSize: 9, color: step.color, fontFamily: "'DM Mono', monospace",
                        marginLeft: "auto", opacity: 0.7
                      }}>{AGENT_DEFS[step.agent]?.icon} {AGENT_DEFS[step.agent]?.name}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#9A958D", lineHeight: 1.6 }}>
                    {step.detail}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── UI COMPONENTS ── */

function ProgressBar({current,total}){return(<div style={{width:"100%",height:3,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:32}}><div style={{width:`${(current/total)*100}%`,height:"100%",background:"#E8945A",borderRadius:2,transition:"width 0.4s cubic-bezier(0.4,0,0.2,1)"}}/></div>);}

function TextInput({value,onChange,placeholder}){return(<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={{width:"100%",padding:"14px 16px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#E8E6E3",fontSize:14,fontFamily:"'DM Sans',sans-serif",resize:"vertical",outline:"none",lineHeight:1.6,boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor="rgba(232,148,90,0.5)"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}/>);}

function OptionCard({option,selected,onClick,multi}){
  const isSel=multi?(selected||[]).includes(option.value):selected===option.value;
  return(<div onClick={()=>onClick(option.value)} style={{padding:"13px 16px",borderRadius:10,cursor:"pointer",background:isSel?"rgba(232,148,90,0.12)":"rgba(255,255,255,0.03)",border:`1px solid ${isSel?"rgba(232,148,90,0.5)":"rgba(255,255,255,0.08)"}`,transition:"all 0.15s",display:"flex",alignItems:"flex-start",gap:12}} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="rgba(255,255,255,0.05)";}} onMouseLeave={e=>{e.currentTarget.style.background=isSel?"rgba(232,148,90,0.12)":"rgba(255,255,255,0.03)";}}>
    <div style={{width:18,height:18,borderRadius:multi?4:9,flexShrink:0,marginTop:1,border:`2px solid ${isSel?"#E8945A":"rgba(255,255,255,0.2)"}`,background:isSel?"#E8945A":"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{isSel&&<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#1A1714" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}</div>
    <div><div style={{fontSize:14,fontWeight:500,color:isSel?"#E8E6E3":"#B5B0A8",lineHeight:1.3}}>{option.label}</div>{option.desc&&<div style={{fontSize:12,color:"#7A756D",marginTop:2,lineHeight:1.4}}>{option.desc}</div>}</div>
  </div>);
}

function WorkflowMap({agents,framework}){
  const allKeys=["knowledge","reasoning","memory","tools","improvement","architecture"];
  const activeIds=agents.map(a=>a.id);
  return(
    <div style={{marginBottom:28}}>
      <div style={{fontSize:11,fontWeight:600,color:"#5A564F",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>System Workflow</div>
      <svg viewBox="0 0 500 320" style={{width:"100%",background:"rgba(0,0,0,0.2)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
        <defs><marker id="aha" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><polygon points="0 0,6 2,0 4" fill="#E8945A"/></marker><filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <text x="12" y="24" fill="#3A3630" fontSize="7" fontFamily="DM Mono,monospace" fontWeight="500">INPUT</text>
        <text x="12" y="78" fill="#3A3630" fontSize="7" fontFamily="DM Mono,monospace" fontWeight="500">ROUTE</text>
        <text x="12" y="168" fill="#3A3630" fontSize="7" fontFamily="DM Mono,monospace" fontWeight="500">ADVISE</text>
        <text x="12" y="300" fill="#3A3630" fontSize="7" fontFamily="DM Mono,monospace" fontWeight="500">OUTPUT</text>
        <rect x="160" y="8" width="180" height="30" rx="7" fill="rgba(232,148,90,0.12)" stroke="#E8945A" strokeWidth="1"/><text x="250" y="20" textAnchor="middle" fill="#E8945A" fontSize="9" fontWeight="700" fontFamily="DM Sans,sans-serif" letterSpacing="0.06em">PROJECT INTAKE</text><text x="250" y="31" textAnchor="middle" fill="#7A756D" fontSize="7" fontFamily="DM Sans,sans-serif">11 questions → signals</text>
        <line x1="250" y1="38" x2="250" y2="56" stroke="#E8945A" strokeWidth="1.5" markerEnd="url(#aha)"/>
        <rect x="155" y="56" width="190" height="38" rx="8" fill="rgba(232,148,90,0.06)" stroke="#E8945A" strokeWidth="1.5"/><text x="250" y="72" textAnchor="middle" fill="#E8945A" fontSize="10" fontWeight="700" fontFamily="DM Sans,sans-serif">⚡ ORCHESTRATOR</text><text x="250" y="86" textAnchor="middle" fill="#7A756D" fontSize="7.5" fontFamily="DM Sans,sans-serif">diagnose → score {framework ? DEFAULT_FRAMEWORKS.find(f=>f&&f.id===framework)?.name||"" : ""} → route</text>
        {allKeys.map((key,i)=>{
          const isActive=activeIds.includes(key);const agent=agents.find(a=>a.id===key);
          const colors={knowledge:"#DDA0DD",reasoning:"#7CB9E8",memory:"#90EE90",tools:"#FFD700",improvement:"#FF6B6B",architecture:"#E8945A"};
          const icons={knowledge:"📚",reasoning:"🧠",memory:"💾",tools:"🔧",improvement:"📈",architecture:"🏗️"};
          const names={knowledge:"Knowledge",reasoning:"Reasoning",memory:"Memory",tools:"Tools",improvement:"Improvement",architecture:"Architecture"};
          const col=i%3,row=Math.floor(i/3),x=45+col*150,y=140+row*76,cx=x+60;
          return(<g key={key}>{isActive&&<path d={`M250,94 C250,${110+row*12} ${cx},${110+row*12} ${cx},${y}`} fill="none" stroke={colors[key]} strokeWidth="1" strokeDasharray="4,3" opacity="0.5" markerEnd="url(#aha)"/>}<g opacity={isActive?1:0.18}><rect x={x} y={y} width="120" height="56" rx="7" fill={isActive?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.01)"} stroke={isActive?colors[key]:"rgba(255,255,255,0.05)"} strokeWidth={isActive?1.5:0.5} filter={isActive?"url(#gl)":"none"}/><text x={cx} y={y+18} textAnchor="middle" fill={isActive?colors[key]:"#3A3630"} fontSize="9" fontWeight="600" fontFamily="DM Sans,sans-serif">{icons[key]} {names[key]}</text><text x={cx} y={y+32} textAnchor="middle" fill={isActive?"#B5B0A8":"#2A2620"} fontSize="6.5" fontFamily="DM Mono,monospace" fontWeight="500">{isActive&&agent?(agent.technique.length>28?agent.technique.substring(0,28)+"…":agent.technique):"—"}</text>{isActive&&agent&&agent.technique.length>28&&<text x={cx} y={y+43} textAnchor="middle" fill="#7A756D" fontSize="6" fontFamily="DM Mono,monospace">{agent.technique.substring(28,56)}</text>}</g></g>);
        })}
        <line x1="250" y1="272" x2="250" y2="284" stroke="#E8945A" strokeWidth="1.5" markerEnd="url(#aha)"/>
        <rect x="110" y="284" width="280" height="28" rx="7" fill="rgba(232,148,90,0.1)" stroke="#E8945A" strokeWidth="1"/><text x="250" y="302" textAnchor="middle" fill="#E8945A" fontSize="9" fontWeight="700" fontFamily="DM Sans,sans-serif">{framework ? (DEFAULT_FRAMEWORKS.find(f=>f.id===framework)?.name||framework) : "FRAMEWORK"} → WORKSPACE</text>
      </svg>
    </div>
  );
}

function AgentCard({agent}){
  return(<div style={{padding:"16px 18px",borderRadius:12,background:"rgba(255,255,255,0.02)",border:`1px solid ${agent.color}30`}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><span style={{fontSize:16}}>{agent.icon}</span><span style={{fontSize:14,fontWeight:700,color:agent.color}}>{agent.name}</span></div>
    <div style={{fontSize:12,color:"#9A958D",lineHeight:1.6,marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${agent.color}15`}}>{agent.purpose}</div>
    <div style={{marginBottom:14}}><div style={{display:"inline-block",fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"#1A1714",background:agent.color,padding:"3px 10px",borderRadius:4,marginBottom:8}}>Recommendation</div><div style={{fontSize:15,fontWeight:700,color:"#E8E6E3",marginBottom:6}}>{agent.technique}</div><div style={{fontSize:12,color:"#B5B0A8",lineHeight:1.65}}>{agent.rationale}</div></div>
    <div style={{fontSize:11,color:"#6A655D",lineHeight:1.5,padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,marginBottom:14}}><span style={{fontWeight:600,color:"#7A756D"}}>Not chosen: </span>{agent.notChosen}</div>
    <div style={{padding:"12px 14px",background:"rgba(0,0,0,0.15)",borderRadius:8}}><div style={{fontSize:10,fontWeight:600,color:"#5A564F",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Behavior Spec</div><div style={{fontSize:12,lineHeight:1.85}}>
      <div style={{display:"flex",gap:10}}><span style={{color:agent.color,fontWeight:700,fontFamily:"'DM Mono',monospace",fontSize:11,flexShrink:0,width:44}}>Given</span><span style={{color:"#B5B0A8"}}>{agent.given}</span></div>
      <div style={{display:"flex",gap:10}}><span style={{color:agent.color,fontWeight:700,fontFamily:"'DM Mono',monospace",fontSize:11,flexShrink:0,width:44}}>When</span><span style={{color:"#B5B0A8"}}>{agent.when}</span></div>
      <div style={{display:"flex",gap:10}}><span style={{color:agent.color,fontWeight:700,fontFamily:"'DM Mono',monospace",fontSize:11,flexShrink:0,width:44}}>Then</span><span style={{color:"#B5B0A8"}}>{agent.then}</span></div>
    </div></div>
  </div>);
}

function FrameworkCard({fw,rank,maxScore}){
  const isTop=rank===0;
  return(<div style={{padding:isTop?"20px 22px":"12px 16px",borderRadius:12,background:isTop?"rgba(232,148,90,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${isTop?"rgba(232,148,90,0.3)":"rgba(255,255,255,0.06)"}`,position:"relative",overflow:"hidden"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:isTop?10:4}}>
      <div><div style={{display:"flex",alignItems:"center",gap:8}}>{isTop&&<span style={{fontSize:10,fontWeight:700,color:"#1A1714",background:"#E8945A",padding:"2px 8px",borderRadius:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Best fit</span>}<span style={{fontSize:isTop?16:13,fontWeight:600,color:"#E8E6E3"}}>{fw.name}</span></div><div style={{fontSize:11,color:"#7A756D",marginTop:2}}>{fw.tagline}</div></div>
      <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:18,fontWeight:700,color:isTop?"#E8945A":"#7A756D",fontFamily:"'DM Mono',monospace"}}>{fw.score}</div></div>
    </div>
    {isTop&&(<div style={{marginTop:12}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><div style={{fontSize:10,fontWeight:600,color:"#E8945A",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Best for</div><div style={{fontSize:12,color:"#B5B0A8",lineHeight:1.4}}>{fw.best}</div></div><div><div style={{fontSize:10,fontWeight:600,color:"#E85A5A",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Avoid</div><div style={{fontSize:12,color:"#B5B0A8",lineHeight:1.4}}>{fw.avoid}</div></div></div><div style={{marginTop:8}}><div style={{fontSize:10,fontWeight:600,color:"#7CB9E8",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>Why</div><div style={{fontSize:12,color:"#B5B0A8",lineHeight:1.5}}>{fw.why}</div></div></div>)}
    <div style={{position:"absolute",bottom:0,left:0,height:2,width:`${(fw.score/maxScore)*100}%`,background:isTop?"#E8945A":"rgba(255,255,255,0.06)"}}/>
  </div>);
}

/* ── FRAMEWORK CONFIG PANEL ── */
function FrameworkConfig({frameworks,onClose}){
  const table=frameworks.map(f=>`| ${f.name} | ${f.best} | ${f.why} | ${f.avoid} |`).join("\n");
  const header=`| Framework | Best For | Why | Avoid |\n| --- | --- | --- | --- |`;
  const full=`${header}\n${table}`;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"#1E1C19",borderRadius:14,border:"1px solid rgba(255,255,255,0.1)",maxWidth:640,width:"100%",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:14,fontWeight:700,color:"#E8E6E3"}}>Framework Registry</div><div style={{fontSize:11,color:"#7A756D",marginTop:2}}>{frameworks.length} frameworks · send to chat to update</div></div>
          <div onClick={onClose} style={{cursor:"pointer",color:"#7A756D",fontSize:18,padding:"4px 8px"}}>✕</div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:"12px 20px"}}>
          {frameworks.map((f,i)=>(
            <div key={f.id} style={{padding:"10px 0",borderBottom:i<frameworks.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
              <div style={{fontSize:13,fontWeight:600,color:"#E8E6E3"}}>{f.name}</div>
              <div style={{fontSize:11,color:"#7A756D",marginTop:2}}>{f.best}</div>
              <div style={{fontSize:11,color:"#5A564F",marginTop:1}}>Avoid: {f.avoid}</div>
            </div>
          ))}
        </div>
        <div style={{padding:"12px 20px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:8}}>
          <div onClick={()=>{
            if(typeof sendPrompt==="function") sendPrompt(`Here is my current AI framework registry. Please update it based on my instructions:\n\n${full}\n\nScoring signals per framework (JSON):\n${JSON.stringify(frameworks.map(f=>({id:f.id,name:f.name,scores:f.scores})),null,2)}`);
            onClose();
          }} style={{flex:1,textAlign:"center",padding:"10px",background:"#E8945A",color:"#1A1714",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>
            Send to Chat to Update
          </div>
          <div onClick={()=>{navigator.clipboard?.writeText(full);}} style={{padding:"10px 16px",background:"rgba(255,255,255,0.06)",color:"#B5B0A8",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>
            Copy Table
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN APP ── */
export default function App(){
  const[step,setStep]=useState(0);const[answers,setAnswers]=useState({});const[showResults,setShowResults]=useState(false);const[fadeIn,setFadeIn]=useState(true);const[showConfig,setShowConfig]=useState(false);
  const[frameworks]=useState(DEFAULT_FRAMEWORKS);
  const question=QUESTIONS[step];
  const canProceed=question?.type==="text"?(answers[question.id]||"").trim().length>0:question?.type==="multi"?(answers[question.id]||[]).length>0:!!answers[question?.id];
  const transition=fn=>{setFadeIn(false);setTimeout(()=>{fn();setFadeIn(true);},200);};
  const handleNext=()=>{if(step<QUESTIONS.length-1)transition(()=>setStep(step+1));else transition(()=>setShowResults(true));};
  const handleBack=()=>{if(showResults)transition(()=>setShowResults(false));else if(step>0)transition(()=>setStep(step-1));};
  const handleSelect=val=>{if(question.type==="multi"){const c=answers[question.id]||[];if(val==="none"||val==="info_only"){setAnswers({...answers,[question.id]:c.includes(val)?[]:[val]});}else{const f=c.filter(v=>v!=="none"&&v!=="info_only");setAnswers({...answers,[question.id]:f.includes(val)?f.filter(v=>v!==val):[...f,val]});}}else setAnswers({...answers,[question.id]:val});};

  const ranked=showResults?scoreFrameworks(answers,frameworks):[];
  const agents=showResults?buildAgentRecommendations(answers):[];
  const maxScore=ranked.length?ranked[0].score:1;

  return(
    <div style={{minHeight:"100vh",background:"#141210",color:"#E8E6E3",fontFamily:"'DM Sans',sans-serif",padding:"0 16px"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      {showConfig&&<FrameworkConfig frameworks={frameworks} onClose={()=>setShowConfig(false)}/>}
      <div style={{maxWidth:600,margin:"0 auto",paddingTop:40,paddingBottom:60}}>
        <div style={{marginBottom:32,textAlign:"center",position:"relative"}}>
          <div style={{fontSize:10,fontWeight:700,color:"#E8945A",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>AI Project Advisor</div>
          <div style={{fontSize:22,fontWeight:700,color:"#E8E6E3",lineHeight:1.3}}>{showResults?"Your Project Architecture":"Structure your AI project"}</div>
          <div style={{fontSize:13,color:"#7A756D",marginTop:6}}>{showResults?`${agents.length} advisor${agents.length!==1?"s":""} · ${frameworks.length} frameworks scored`:`Question ${step+1} of ${QUESTIONS.length}`}</div>
          {/* Config gear */}
          <div onClick={()=>setShowConfig(true)} style={{position:"absolute",top:0,right:0,cursor:"pointer",color:"#5A564F",fontSize:11,padding:"4px 8px",borderRadius:6,border:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",gap:4}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(232,148,90,0.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.06)"}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 10a2 2 0 100-4 2 2 0 000 4z" stroke="#7A756D" strokeWidth="1.3"/><path d="M13.5 8c0-.3 0-.6-.1-.9l1.5-1.2-1.5-2.6-1.8.6c-.4-.4-.9-.6-1.4-.8L9.8 1H6.8l-.4 2.1c-.5.2-1 .5-1.4.8l-1.8-.6L1.7 5.9l1.5 1.2c-.1.3-.1.6-.1.9s0 .6.1.9L1.7 10.1l1.5 2.6 1.8-.6c.4.4.9.6 1.4.8l.4 2.1h3l.4-2.1c.5-.2 1-.5 1.4-.8l1.8.6 1.5-2.6-1.5-1.2c.1-.3.1-.6.1-.9z" stroke="#7A756D" strokeWidth="1.3"/></svg>
            <span style={{fontFamily:"'DM Mono',monospace"}}>{frameworks.length}</span>
          </div>
        </div>

        {!showResults&&<ProgressBar current={step+1} total={QUESTIONS.length}/>}

        <div style={{opacity:fadeIn?1:0,transform:fadeIn?"translateY(0)":"translateY(8px)",transition:"opacity 0.25s,transform 0.25s"}}>
          {!showResults?(
            <div>
              <div style={{fontSize:10,fontWeight:600,color:"#5A564F",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:6}}>{question.section}</div>
              <div style={{fontSize:17,fontWeight:600,color:"#E8E6E3",marginBottom:4,lineHeight:1.4}}>{question.question}</div>
              <div style={{fontSize:13,color:"#7A756D",marginBottom:20}}>{question.subtitle}</div>
              {question.type==="text"?<TextInput value={answers[question.id]} onChange={val=>setAnswers({...answers,[question.id]:val})} placeholder={question.placeholder}/>:
              <div style={{display:"flex",flexDirection:"column",gap:8}}>{question.options.map(opt=><OptionCard key={opt.value} option={opt} selected={answers[question.id]} onClick={handleSelect} multi={question.type==="multi"}/>)}</div>}
            </div>
          ):(
            <div>
              <WorkflowMap agents={agents} framework={ranked[0]?.id}/>

              <ExecutionSteps steps={buildExecutionSteps(answers, agents)} />

              <div style={{fontSize:11,fontWeight:600,color:"#5A564F",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Framework — top 5 of {frameworks.length}</div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:28}}>{ranked.slice(0,5).map((fw,i)=><FrameworkCard key={fw.id} fw={fw} rank={i} maxScore={maxScore}/>)}</div>

              <div style={{fontSize:11,fontWeight:600,color:"#5A564F",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Advisory Agents ({agents.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:28}}>{agents.map(agent=><AgentCard key={agent.id} agent={agent}/>)}</div>

              <div style={{marginTop:28,textAlign:"center"}}>
                <div onClick={()=>{
                  const fw=ranked[0];
                  const specs=agents.map(a=>`## ${a.name}\n**Technique:** ${a.technique}\n**Purpose:** ${a.purpose}\n\nGiven ${a.given}\nWhen ${a.when}\nThen ${a.then}\n\n**Rationale:** ${a.rationale}`).join("\n\n---\n\n");
                  const exSteps=buildExecutionSteps(answers,agents);
                  const pipeline=exSteps.map((s,i)=>`${i+1}. **${s.name}**${s.agent?` [${AGENT_DEFS[s.agent]?.name}]`:""}\n   ${s.detail}`).join("\n\n");
                  if(typeof sendPrompt==="function")sendPrompt(`Create an Antigravity workspace for my project using ${fw.name}.\n\nProject: ${answers.problem||"Untitled"}\nUser: ${answers.user||""}\nFramework: ${fw.name} — ${fw.why}\n\n## Execution Pipeline\n\n${pipeline}\n\n## Advisory Agents\n\n${specs}`);
                }} style={{display:"inline-flex",alignItems:"center",gap:8,padding:"12px 28px",background:"#E8945A",color:"#1A1714",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",boxShadow:"0 2px 12px rgba(232,148,90,0.25)"}}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-1px)";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#1A1714" strokeWidth="2" strokeLinecap="round"/></svg>
                  Generate Workspace
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:32}}>
          <div onClick={handleBack} style={{fontSize:13,color:step===0&&!showResults?"transparent":"#7A756D",cursor:step===0&&!showResults?"default":"pointer",padding:"8px 0",pointerEvents:step===0&&!showResults?"none":"auto"}} onMouseEnter={e=>{if(step>0||showResults)e.currentTarget.style.color="#B5B0A8";}} onMouseLeave={e=>e.currentTarget.style.color="#7A756D"}>← Back</div>
          {!showResults&&<div onClick={canProceed?handleNext:undefined} style={{padding:"10px 24px",borderRadius:8,fontSize:13,fontWeight:600,background:canProceed?"#E8945A":"rgba(255,255,255,0.06)",color:canProceed?"#1A1714":"#5A564F",cursor:canProceed?"pointer":"not-allowed"}}>{step===QUESTIONS.length-1?"Get Recommendation":"Continue"}</div>}
        </div>
      </div>
    </div>
  );
}
