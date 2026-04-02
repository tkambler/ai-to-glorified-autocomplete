// AI to Glorified Autocomplete - Replacement definitions
// Ordered longest-first to prevent partial matches
// Tone: 70% dry/snide, 30% openly contemptuous (per guidelines)
//
// Patterns with aiContext:true only fire on pages with enough AI signals
// to avoid false positives on non-AI content.
//
// Singular/plural patterns are split to preserve grammatical number.
// Replacements avoid embedded articles (a/an/the) to prevent
// "an a chatbot" or "the the guessing machine" collisions.
//
// High-frequency terms use shuffled pools (via arrays) so replacements
// cycle through all options before repeating.

// --- Shuffled pool: cycles through all options before repeating ---
function createPool(options) {
  var pool = [];
  var index = 0;

  function shuffle() {
    pool = options.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }
    index = 0;
  }

  shuffle();

  return function () {
    if (index >= pool.length) shuffle();
    return pool[index++];
  };
}

// --- Case matching ---
function matchCase(original, replacement) {
  // Only apply ALL CAPS for longer strings (e.g. "ARTIFICIAL INTELLIGENCE").
  // Short acronyms like "AI", "AGI" get title case instead of shouty all-caps.
  if (original === original.toUpperCase() && original.length > 3) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement.toLowerCase();
}

// --- Case-aware replacement (for case-insensitive patterns) ---
// Accepts a string or array. Arrays create a shuffled pool.
function caseAware(replacement) {
  if (Array.isArray(replacement)) {
    var next = createPool(replacement);
    return function (match) {
      return matchCase(match, next());
    };
  }
  return function (match) {
    return matchCase(match, replacement);
  };
}

// --- Plain pool (for case-sensitive patterns that need variety) ---
// Returns a function replacement that cycles through options as-is.
function pool(options) {
  var next = createPool(options);
  return function () {
    return next();
  };
}

// --- Shared pools for patterns that should draw from the same rotation ---
// (e.g. AI, A.I., and A.I all share one pool so variety spans all forms)
var _aiPool = createPool([
  "glorified autocomplete",
  "fancy guesswork",
  "robot guesswork",
  "spicy autocomplete",
  "expensive autocomplete",
  "predictive bullshit",
  "turbocharged autocomplete",
  "silicon guesswork",
]);
function aiPoolReplacement(match) {
  return matchCase(match, _aiPool());
}

var _genAiPool = createPool([
  "industrial-grade bullshit",
  "mass-produced autocomplete",
  "wholesale guesswork",
]);


var REPLACEMENTS = [

  // ===== TIER 3: SENTENCE-LEVEL REWRITES (longest first) =====

  { pattern: /\busing AI to help people\b/gi, replacement: caseAware("using glorified autocomplete to insert itself into one more part of life") },
  { pattern: /\bannounced a new AI initiative\b/gi, replacement: caseAware("announced a new plan to pour software on the problem") },
  { pattern: /\bwill transform the economy\b/gi, replacement: caseAware("will allegedly transform the economy any day now") },
  { pattern: /\bis reshaping the future\b/gi, replacement: caseAware("is once again being described as the future") },
  { pattern: /\bpowered by AI\b/gi, replacement: caseAware("powered by vibes and electricity") },
  { pattern: /\bresearchers say\b/gi, replacement: caseAware("researchers, for whatever reason, say") },
  { pattern: /\bexperts warn\b/gi, replacement: caseAware("a fresh batch of extremely online men warn") },

  // ===== TIER 2: MULTI-WORD TERMS (article-enhancing, slightly longer) =====

  // People (before company/product terms they appear in)
  { pattern: /\bSam Altman\b/g, replacement: "tech's most camera-ready bullshit salesman" },
  { pattern: /\bAltman\b/g, replacement: "the bullshit salesman in chief" },
  { pattern: /\bElon Musk\b/g, replacement: "the divorced-dad prophet of doom" },
  { pattern: /\bMark Zuckerberg\b/g, replacement: "the nation's most determined indoor boy" },
  { pattern: /\bJensen Huang\b/g, replacement: "the leather-jacketed GPU landlord" },

  // Companies (before shorter terms they contain)
  { pattern: /\bGoogle DeepMind\b/g, replacement: "Google's expensive robot brain division" },
  { pattern: /\bOpenAI\b/g, replacement: pool(["the world's best-funded bullshit factory", "the nonprofit that forgot", "Sam Altman's guessing factory"]) },
  { pattern: /\bAnthropic\b/g, replacement: "the polite bullshit company" },
  { pattern: /\bMeta AI\b/g, replacement: "Facebook's latest attempt to sound important" },
  { pattern: /\bDeepMind\b/g, replacement: "Google's expensive robot brain division" },
  { pattern: /\bHugging Face\b/g, replacement: "the model zoo" },
  { pattern: /\bMidjourney\b/g, replacement: "the art photocopier" },
  { pattern: /\bDALL-E\b/g, replacement: "the other art photocopier" },
  { pattern: /\bStable Diffusion\b/g, replacement: "yet another art photocopier" },
  { pattern: /\bxAI\b/g, replacement: "Elon's chatbot company" },
  { pattern: /\bPerplexity\b/g, replacement: "the search engine that reads other search engines" },
  { pattern: /\bNvidia\b/g, replacement: "the GPU loan shark" },

  // Products (before shorter terms)
  { pattern: /\bChatGPT\b/g, replacement: "the chatbot" },
  { pattern: /\bMicrosoft Copilot\b/g, replacement: "the backseat driver from hell" },
  { pattern: /\bCopilot\b/g, replacement: "the backseat driver from hell" },
  { pattern: /\bGoogle Gemini\b/g, replacement: "Google's chatbot" },
  { pattern: /\bGemini\b/g, replacement: "Google's chatbot" },

  // Artificial general intelligence (before artificial intelligence, before AGI)
  { pattern: /\bartificial general intelligence\b/gi, replacement: caseAware("the robot messiah") },

  // Artificial intelligence (before AI)
  { pattern: /\bartificial intelligence\b/gi, replacement: caseAware(["computer program doing a lot of guesswork", "very expensive autocomplete", "math pretending to think"]) },

  // Large language models (before LLM)
  { pattern: /\blarge language models\b/gi, replacement: caseAware(["glorified word guessers", "industrial-scale text predictors", "very expensive parrots"]) },
  { pattern: /\blarge language model\b/gi, replacement: caseAware(["glorified word guesser", "industrial-scale text predictor", "very expensive parrot"]) },

  // Foundation model company
  { pattern: /\bfoundation model compan(?:y|ies)\b/gi, replacement: caseAware("company selling industrialized guesswork") },

  // Machine learning (before ML)
  { pattern: /\bmachine learning\b/gi, replacement: caseAware(["statistics with a marketing team", "math in a trench coat", "statistics wearing a lanyard"]) },

  // Deep learning
  { pattern: /\bdeep learning\b/gi, replacement: caseAware(["statistics with an ego", "math with delusions of grandeur", "very expensive statistics"]) },

  // Neural networks (split singular/plural, no embedded article)
  { pattern: /\bneural networks\b/gi, replacement: caseAware(["piles of math", "stacks of linear algebra", "heaps of matrix multiplication"]) },
  { pattern: /\bneural network\b/gi, replacement: caseAware(["pile of math", "stack of linear algebra", "heap of matrix multiplication"]) },

  // Generative AI (before AI) — includes "gen AI" abbreviation
  // All forms share one pool so variety spans "generative AI" and "gen AI"
  { pattern: /\bgenerative AI\b/g, replacement: function () { return _genAiPool(); } },
  { pattern: /\bGenerative AI\b/g, replacement: function () { var r = _genAiPool(); return r[0].toUpperCase() + r.slice(1); } },
  { pattern: /\bgen AI\b/g, replacement: function () { return _genAiPool(); } },
  { pattern: /\bGen AI\b/g, replacement: function () { var r = _genAiPool(); return r[0].toUpperCase() + r.slice(1); } },
  { pattern: /\bgenerative artificial intelligence\b/gi, replacement: function (match) { return matchCase(match, _genAiPool()); } },

  // Natural language processing (before NLP)
  { pattern: /\bnatural language processing\b/gi, replacement: caseAware("robot reading comprehension") },

  // Retrieval augmented generation (before RAG)
  { pattern: /\bretrieval[- ]augmented generation\b/gi, replacement: caseAware("looking stuff up first") },

  // Reinforcement learning
  { pattern: /\breinforcement learning from human feedback\b/gi, replacement: caseAware("paying people to babysit a robot") },
  { pattern: /\breinforcement learning\b/gi, replacement: caseAware("bribing a robot with points") },

  // Computer vision
  { pattern: /\bcomputer vision\b/gi, replacement: caseAware("a computer squinting really hard") },

  // Digital transformation
  { pattern: /\bdigital transformation\b/gi, replacement: caseAware("making everything worse with software") },

  // Prompt engineering / engineer (split singular/plural)
  { pattern: /\bprompt engineers\b/gi, replacement: caseAware("people who flatter the machine for a living") },
  { pattern: /\bprompt engineer\b/gi, replacement: caseAware("person who flatters the machine for a living") },
  { pattern: /\bprompt engineering\b/gi, replacement: caseAware("finding the exact phrasing that flatters the machine") },

  // AI-compound terms (before bare AI)
  // Hyphenated compounds first
  { pattern: /\bAI[- ]centric\b/gi, replacement: "autocomplete-obsessed" },
  { pattern: /\bAI[- ]powered\b/gi, replacement: pool(["bullshit-powered", "hype-powered", "autocomplete-enhanced"]) },
  { pattern: /\bAI[- ]enabled\b/gi, replacement: pool(["hype-enabled", "buzzword-enabled", "autocomplete-equipped"]) },
  { pattern: /\bAI[- ]generated\b/gi, replacement: pool(["bullshit-generated", "robot-generated", "autocomplete-produced"]) },
  { pattern: /\bAI[- ]driven\b/gi, replacement: pool(["bullshit-driven", "hype-driven", "autocomplete-fueled"]) },

  // AI + noun compounds (split singular/plural, no embedded articles)
  { pattern: /\bAI assistants\b/gi, replacement: caseAware("confident little bullshit machines") },
  { pattern: /\bAI assistant\b/gi, replacement: caseAware("confident little bullshit machine") },
  { pattern: /\bAI chatbots\b/gi, replacement: caseAware("plausible-nonsense machines") },
  { pattern: /\bAI chatbot\b/gi, replacement: caseAware("plausible-nonsense machine") },
  { pattern: /\bAI agents\b/gi, replacement: caseAware("bots pretending to run errands") },
  { pattern: /\bAI agent\b/gi, replacement: caseAware("bot pretending to run errands") },
  { pattern: /\bAI safety\b/gi, replacement: caseAware("trying to childproof the slot machine") },
  { pattern: /\bAI ethics\b/gi, replacement: caseAware("trying to childproof the slot machine, but with a committee") },
  { pattern: /\bAI governance\b/gi, replacement: caseAware("robot hall monitoring") },
  { pattern: /\bAI revolution\b/gi, replacement: caseAware("the current investor hallucination") },
  { pattern: /\bAI boom\b/gi, replacement: caseAware("the latest money fire") },
  { pattern: /\bAI race\b/gi, replacement: caseAware("frantic contest to lower standards faster") },
  { pattern: /\bAI strategy\b/gi, replacement: caseAware('putting "AI" in the deck until someone funds it') },
  { pattern: /\bAI adoption\b/gi, replacement: caseAware("everyone reluctantly pretending this is useful") },
  { pattern: /\bAI innovation\b/gi, replacement: caseAware("new and exciting bullshit") },
  { pattern: /\bAI disruption\b/gi, replacement: caseAware("the current investor hallucination") },
  { pattern: /\bAI startups\b/gi, replacement: caseAware("bullshit startups with GPU access") },
  { pattern: /\bAI startup\b/gi, replacement: caseAware("bullshit startup with GPU access") },
  { pattern: /\bAI labs\b/gi, replacement: caseAware("bullshit refineries") },
  { pattern: /\bAI lab\b/gi, replacement: caseAware("bullshit refinery") },
  { pattern: /\bAI sovereignty\b/gi, replacement: caseAware("keeping your bullshit in-house") },
  { pattern: /\bresponsible AI\b/gi, replacement: caseAware("the PR wing of the bullshit factory") },
  { pattern: /\bAI winter\b/gi, replacement: caseAware("the hangover after the hype") },
  { pattern: /\bAI detection\b/gi, replacement: caseAware(["bullshit detection", "autocomplete detection", "robot-writing detection"]) },
  { pattern: /\bAI products\b/gi, replacement: caseAware(["glorified autocomplete products", "fancy guesswork products", "robot guesswork products"]) },
  { pattern: /\bAI development\b/gi, replacement: caseAware(["glorified autocomplete development", "fancy guesswork development", "robot guesswork development"]) },
  { pattern: /\bAI integration\b/gi, replacement: caseAware(["glorified autocomplete integration", "fancy guesswork integration", "robot guesswork integration"]) },
  { pattern: /\bAI writing\b/gi, replacement: caseAware(["robot-generated writing", "autocomplete prose", "bot writing"]) },

  // New compound terms
  { pattern: /\bbillion[- ]parameters?\b/gi, replacement: caseAware("a very large number of knobs") },
  { pattern: /\bemergent (?:behavior|behaviours?|abilities|capabilities|properties)\b/gi, replacement: caseAware("a coincidence they're excited about") },
  { pattern: /\bmodel collapse\b/gi, replacement: caseAware("the snake eating its own tail") },
  { pattern: /\bdata poisoning\b/gi, replacement: caseAware("slipping the machine a mickey") },
  { pattern: /\bGPU shortage\b/gi, replacement: caseAware("the great nerd famine") },
  { pattern: /\bcompute (?:budget|costs?|resources?|capacity|infrastructure)\b/gi, replacement: caseAware("electricity bill") },
  { pattern: /\bmore compute\b/gi, replacement: caseAware("more expensive electricity") },

  // Reasoning models (split singular/plural, no embedded article)
  { pattern: /\breasoning models\b/gi, replacement: caseAware("word guessers wearing glasses") },
  { pattern: /\breasoning model\b/gi, replacement: caseAware("word guesser wearing glasses") },

  // Foundation / frontier models (uncountable replacements work for both)
  { pattern: /\bfoundation models?\b/gi, replacement: caseAware("industrialized guesswork") },
  { pattern: /\bfrontier models?\b/gi, replacement: caseAware("expensive guesswork") },

  // Autonomous agents (split singular/plural)
  { pattern: /\bautonomous agents\b/gi, replacement: caseAware("unsupervised chatbots") },
  { pattern: /\bautonomous agent\b/gi, replacement: caseAware("unsupervised chatbot") },

  // Chain of thought
  { pattern: /\bchain of thought\b/gi, replacement: caseAware("talking to itself") },

  // Fine-tuning
  { pattern: /\bfine[- ]tuning\b/gi, replacement: caseAware("teaching the bullshit machine new tricks") },
  { pattern: /\bfine[- ]tuned?\b/gi, replacement: caseAware("taught new tricks") },

  // Training data (keep compound, drop standalone "training")
  { pattern: /\btraining data\b/gi, replacement: caseAware(["stolen text", "borrowed-without-asking text", "scraped text"]) },
  { pattern: /\btraining runs\b/gi, replacement: caseAware("expensive mistakes"), aiContext: true },
  { pattern: /\btraining run\b/gi, replacement: caseAware("expensive mistake"), aiContext: true },

  // Scaling laws
  { pattern: /\bscaling laws\b/gi, replacement: '"just make it bigger"' },

  // Context window (split singular/plural)
  { pattern: /\bcontext windows\b/gi, replacement: caseAware("short-term memories") },
  { pattern: /\bcontext window\b/gi, replacement: caseAware("short-term memory") },

  // Synthetic data
  { pattern: /\bsynthetic data\b/gi, replacement: caseAware("made-up practice material") },

  // Latent space
  { pattern: /\blatent space\b/gi, replacement: caseAware("math purgatory") },

  // Existential risk
  { pattern: /\bexistential risk\b/gi, replacement: caseAware("robot apocalypse fan fiction") },

  // Vector database (split singular/plural)
  { pattern: /\bvector databases\b/gi, replacement: caseAware("big lists of numbers") },
  { pattern: /\bvector database\b/gi, replacement: caseAware("big list of numbers") },

  // Zero-shot / few-shot
  { pattern: /\bzero[- ]shot\b/gi, replacement: caseAware("without studying") },
  { pattern: /\bfew[- ]shot\b/gi, replacement: caseAware("after seeing a couple examples") },

  // ===== TIER 1: SHORT, DRY, REUSABLE (default swaps) =====

  // Hallucination variants
  // Nouns use pools; verb forms use "fabricating"/"fabricate" so transitive
  // use ("hallucinating names") stays grammatical
  { pattern: /\bhallucinations\b/gi, replacement: caseAware(["making shit up", "fabrications", "confident lies"]) },
  { pattern: /\bhallucination\b/gi, replacement: caseAware(["making shit up", "fabrication", "confident lying"]) },
  { pattern: /\bhallucinating\b/gi, replacement: caseAware("fabricating") },
  { pattern: /\bhallucinate\b/gi, replacement: caseAware("fabricate") },
  { pattern: /\bhallucinates\b/gi, replacement: caseAware("fabricates") },

  // Superintelligence — short enough to drop into any slot
  { pattern: /\bsuperintelligence\b/gi, replacement: caseAware("the robot god") },
  { pattern: /\bsuperintelligent\b/gi, replacement: caseAware("robot-god-level") },

  // Acronyms (case-sensitive — use pool() not caseAware())
  { pattern: /\bLLMs\b/g, replacement: pool(["word guessers", "text predictors", "stochastic parrots"]) },
  { pattern: /\bLLM\b/g, replacement: pool(["word guesser", "text predictor", "stochastic parrot"]) },
  { pattern: /\bGPT-?\d*\b/g, replacement: "Glorified Parrot Technology" },
  { pattern: /\bAGI\b/g, replacement: "the robot messiah" },
  { pattern: /\bNLP\b/g, replacement: "robot reading comprehension" },
  { pattern: /\bRLHF\b/g, replacement: "paying people to babysit a robot" },
  { pattern: /\bRAG\b/g, replacement: "looking stuff up" },
  { pattern: /\bML\b/g, replacement: "statistics" },

  // AI (the big one - must come after all AI-compound terms)
  // All three forms share one shuffled pool for maximum variety.
  // Pool uses modifier-safe terms (no articles) so "AI products" doesn't become
  // "the guessing machine products"
  { pattern: /\bAI\b/g, replacement: aiPoolReplacement },
  { pattern: /\bA\.I\.\b/g, replacement: aiPoolReplacement },
  { pattern: /\bA\.I\b/g, replacement: aiPoolReplacement },

  // Multimodal
  { pattern: /\bmultimodal\b/gi, replacement: caseAware("wrong in several formats") },

  // Agentic
  { pattern: /\bagentic\b/gi, replacement: caseAware("automated") },

  // Inference — only in AI contexts to avoid false positives
  { pattern: /\binference\b/gi, replacement: caseAware("guessing"), aiContext: true },

  // Evals / benchmarks — only in AI contexts
  { pattern: /\bevals\b/gi, replacement: caseAware("beauty pageants"), aiContext: true },
  { pattern: /\bbenchmarks\b/gi, replacement: caseAware("beauty pageants"), aiContext: true },
  { pattern: /\bbenchmark\b/gi, replacement: caseAware("beauty pageant"), aiContext: true },

  // Alignment / guardrails — alignment only in AI contexts, guardrails is specific enough
  { pattern: /\balignment\b/gi, replacement: caseAware("obedience training"), aiContext: true },
  { pattern: /\bguardrails\b/gi, replacement: caseAware('the "please behave" filter') },

  // Transformer (compound only — standalone matches movie franchise, phone codenames, etc.)
  { pattern: /\btransformer[- ](?:model|architecture|based|network)\b/gi, replacement: caseAware("the math behind the bullshit") },
  { pattern: /\btransformer models\b/gi, replacement: caseAware("the math behind the bullshit") },

  // Chatbot (standalone, after all compound chatbot terms — split singular/plural, no article)
  { pattern: /\bchatbots\b/gi, replacement: caseAware("bots") },
  { pattern: /\bchatbot\b/gi, replacement: caseAware("bot") },

  // Hype adjectives
  { pattern: /\bgroundbreaking\b/gi, replacement: caseAware(["iterative", "mildly interesting", "not entirely new"]) },
  { pattern: /\brevolutionary\b/gi, replacement: caseAware(["incremental", "marginally different", "slightly updated"]) },
  { pattern: /\bunprecedented\b/gi, replacement: caseAware(["sort of new", "vaguely novel", "not quite unprecedented"]) },
  { pattern: /\bgame[- ]changing\b/gi, replacement: caseAware(["somewhat useful", "mildly convenient", "moderately helpful"]) },

  // ===== CLEANUP: fix "an" article left over from AI replacements =====
  // Original text has "an AI..." (vowel sound); after replacement, the word
  // may start with a consonant. Only targets known replacement words.
  { pattern: /\ban (?=bullshit|hype|bots?\b|glorified|fancy|robot|plausible|confident|piles?\b|stacks?\b|heaps?\b|word|somewhat|sort|stochastic|text\s+predict|turbo|silicon|predict|mildly|marginally|slightly|moderately|not\s+(?:entirely|quite))/gi, replacement: caseAware("a ") },
];
