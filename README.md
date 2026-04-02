# AI to Glorified Autocomplete

A Chrome extension that replaces AI hype terminology with what it actually is.

"Artificial intelligence" becomes "a computer program doing a lot of guesswork." "Machine learning" becomes "statistics with a marketing team." Sam Altman becomes "tech's most camera-ready bullshit salesman." OpenAI becomes "the world's best-funded bullshit factory."

Inspired by the classic [Cloud to Butt](https://deepgram.com/learn/cloud-to-butt) extension, but with more contempt.

## Features

- **150+ replacement patterns** across companies, products, people, technical jargon, and hype adjectives
- **Shuffled replacement pools** for high-frequency terms like "AI" — cycles through 8 alternatives before repeating
- **Smart context detection** — ambiguous terms like "alignment" and "inference" only fire on pages with enough AI signals to avoid false positives
- **Per-site disable list** — turn it off on specific sites without disabling globally
- **Highlight mode** — subtle dotted underline shows exactly which words were changed
- **Replacement counter** — badge on the extension icon shows how many terms were swapped
- **Dynamic content support** — works on SPAs and lazy-loaded content via MutationObserver
- **Grammatically aware** — splits singular/plural patterns, avoids article collisions ("an AI agent" correctly becomes "a bot pretending to run errands"), and uses modifier-safe replacements

## Install

### From source

1. Clone this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select this directory

### Build for distribution

```
./build.sh
```

Produces a `.zip` ready for Chrome Web Store submission.

## How it works

The extension runs two content scripts on every page:

1. **replacements.js** — defines 150+ regex patterns organized into three tiers (sentence-level rewrites, multi-word terms, short swaps), plus helper functions for case matching and shuffled pool selection.
2. **content_script.js** — walks the DOM with a TreeWalker, applies replacements to text nodes, and sets up a MutationObserver for dynamic content. Includes a quick pre-check regex to skip text nodes that can't possibly match, and an `isApplying` flag to prevent the observer from re-processing its own changes.

A background service worker (`background.js`) tracks replacement counts per tab and updates the badge.

## Sample replacements

| Original         | Replacement                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| AI               | glorified autocomplete, fancy guesswork, spicy autocomplete, ... (8 options) |
| OpenAI           | the world's best-funded bullshit factory                                     |
| ChatGPT          | the chatbot                                                                  |
| machine learning | statistics with a marketing team, math in a trench coat, ...                 |
| hallucination    | making shit up, fabrication, confident lying                                 |
| LLM              | word guesser, text predictor, stochastic parrot                              |
| neural network   | pile of math, stack of linear algebra, ...                                   |
| groundbreaking   | iterative, mildly interesting, not entirely new                              |
| AI-powered       | bullshit-powered, hype-powered, autocomplete-enhanced                        |
| Nvidia           | the GPU loan shark                                                           |
