// AI to Glorified Autocomplete - Content Script Engine

(function () {
  "use strict";

  // --- Marker characters for highlight mode ---
  var MARK_START = "\uFFF0";
  var MARK_END = "\uFFF1";

  // --- Quick pre-check: skip text nodes that can't possibly match any pattern ---
  var QUICK_TEST =
    /ai|gpt|llm|openai|anthropic|deepmind|altman|musk|zuckerberg|hallucin|neural|machine|chatbot|copilot|gemini|nvidia|multimodal|agentic|guardrail|transformer|superintelligen|groundbreak|revolutionar|unprecedented|game.chang|generative|fine.tun|reinforc|perplexity|midjourney|dall.e|stable.diffusion|hugging|powered.by|reshap|digital.transform|prompt.engineer|computer.vision|scaling.law|context.window|synthetic.data|latent.space|existential.risk|vector.data|zero.shot|few.shot|foundation.model|frontier.model|autonomous|chain.of.thought|reasoning.model|model.collaps|data.poison|billion.param|compute.budget|compute.cost|compute.resource|more.compute|GPU.shortage|emergent|jensen.huang/i;

  // --- AI signal detection for page confidence ---
  var AI_SIGNALS =
    /\b(?:AI|artificial intelligence|LLM|GPT|ChatGPT|OpenAI|machine learning|neural network|deep learning|large language model)\b/gi;
  var AI_CONFIDENCE_THRESHOLD = 2;

  // --- State ---
  var highlightEnabled = false;
  var replacementCount = 0;
  var processedNodes = new WeakSet();
  var activeReplacements = [];
  var isApplying = false;

  // --- Forbidden tags ---
  var FORBIDDEN_TAGS = [
    "SCRIPT",
    "STYLE",
    "TEXTAREA",
    "INPUT",
    "SELECT",
    "NOSCRIPT",
  ];

  function isForbiddenNode(node) {
    if (!node || !node.parentNode) return false;
    var parent = node.parentNode;
    if (parent.isContentEditable) return true;
    if (FORBIDDEN_TAGS.indexOf(parent.tagName) !== -1) return true;
    if (parent.classList && parent.classList.contains("ga-highlight"))
      return true;
    return false;
  }

  // --- Wrap replacements for counting and optional highlighting ---
  function countWrapper(original) {
    if (typeof original === "function") {
      return function () {
        replacementCount++;
        return original.apply(null, arguments);
      };
    }
    return function () {
      replacementCount++;
      return original;
    };
  }

  function highlightWrapper(original) {
    if (typeof original === "function") {
      return function () {
        replacementCount++;
        return MARK_START + original.apply(null, arguments) + MARK_END;
      };
    }
    return function () {
      replacementCount++;
      return MARK_START + original + MARK_END;
    };
  }

  // --- Build the active replacement list, filtering by page context ---
  function buildActiveReplacements(isAiPage) {
    activeReplacements = [];
    var wrapper = highlightEnabled ? highlightWrapper : countWrapper;
    for (var i = 0; i < REPLACEMENTS.length; i++) {
      var r = REPLACEMENTS[i];
      if (r.aiContext && !isAiPage) continue;
      activeReplacements.push({
        pattern: r.pattern,
        replacement: wrapper(r.replacement),
      });
    }
  }

  // --- Core replacement ---
  function replaceText(str) {
    for (var i = 0; i < activeReplacements.length; i++) {
      var r = activeReplacements[i];
      str = str.replace(r.pattern, r.replacement);
    }
    return str;
  }

  // --- Flatten nested highlight markers ---
  // Cascading replacements (e.g. ChatGPT → "the chatbot" → "the bot") can
  // produce nested markers like ‹‹the ‹‹bot››››. This flattens them to
  // a single level: ‹‹the bot›› so the highlight parser works correctly.
  function flattenMarkers(str) {
    var result = "";
    var depth = 0;
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === MARK_START) {
        if (depth === 0) result += ch;
        depth++;
      } else if (ch === MARK_END) {
        depth--;
        if (depth === 0) result += ch;
      } else {
        result += ch;
      }
    }
    return result;
  }

  // --- Strip marker characters (for contexts like titles) ---
  function stripMarkers(str) {
    return str.replace(/[\uFFF0\uFFF1]/g, "");
  }

  // --- Handle a single text node ---
  function handleText(textNode) {
    if (isForbiddenNode(textNode)) return;
    if (processedNodes.has(textNode)) return;
    processedNodes.add(textNode);

    // Guard: node may have been detached by a previous highlight replacement
    if (!textNode.parentNode) return;

    var oldValue = textNode.nodeValue;
    if (!oldValue || !QUICK_TEST.test(oldValue)) return;

    var newValue = replaceText(oldValue);
    if (newValue === oldValue) return;

    isApplying = true;
    try {
      if (highlightEnabled && newValue.indexOf(MARK_START) !== -1) {
        newValue = flattenMarkers(newValue);
        replaceWithHighlight(textNode, newValue);
      } else {
        textNode.nodeValue = newValue;
      }
    } finally {
      isApplying = false;
    }
  }

  // --- Highlight mode: replace text node with fragment of spans ---
  function replaceWithHighlight(textNode, newValue) {
    var fragment = document.createDocumentFragment();
    var remaining = newValue;
    var startIdx;

    while ((startIdx = remaining.indexOf(MARK_START)) !== -1) {
      // Plain text before the marker
      if (startIdx > 0) {
        fragment.appendChild(
          document.createTextNode(remaining.slice(0, startIdx))
        );
      }
      remaining = remaining.slice(startIdx + 1);

      var endIdx = remaining.indexOf(MARK_END);
      if (endIdx === -1) break;

      // Highlighted replacement
      var span = document.createElement("span");
      span.className = "ga-highlight";
      span.textContent = remaining.slice(0, endIdx);
      fragment.appendChild(span);

      remaining = remaining.slice(endIdx + 1);
    }

    // Remaining plain text
    if (remaining) {
      fragment.appendChild(document.createTextNode(remaining));
    }

    textNode.parentNode.replaceChild(fragment, textNode);
  }

  // --- DOM walking ---
  // Collect all text nodes first, then process. This prevents the TreeWalker
  // from being invalidated when highlight mode replaces text nodes with
  // fragments (spans + text nodes), which would cause nodes to be skipped.
  function walk(rootNode) {
    var walker = document.createTreeWalker(
      rootNode,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) {
      nodes.push(node);
    }
    for (var i = 0; i < nodes.length; i++) {
      handleText(nodes[i]);
    }
  }

  // --- Walk existing content and observe future changes ---
  function walkAndObserve(doc) {
    walk(doc.body);

    // Replace title (strip markers — highlight spans can't go in the title)
    if (doc.title) {
      var newTitle = replaceText(doc.title);
      if (highlightEnabled) newTitle = stripMarkers(newTitle);
      if (newTitle !== doc.title) {
        isApplying = true;
        doc.title = newTitle;
        isApplying = false;
      }
    }

    // Observe future changes (SPAs, dynamic content)
    var observer = new MutationObserver(function (mutations) {
      if (isApplying) return;
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type === "childList") {
          for (var j = 0; j < mutation.addedNodes.length; j++) {
            var node = mutation.addedNodes[j];
            if (node.nodeType === Node.TEXT_NODE) {
              handleText(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              walk(node);
            }
          }
        } else if (mutation.type === "characterData") {
          // Allow re-processing of changed text
          processedNodes.delete(mutation.target);
          handleText(mutation.target);
        }
      }
      updateBadge();
    });

    observer.observe(doc.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Also observe title changes
    var titleEl = doc.querySelector("title");
    if (titleEl) {
      var titleObserver = new MutationObserver(function () {
        if (isApplying) return;
        isApplying = true;
        var newTitle = replaceText(doc.title);
        if (highlightEnabled) newTitle = stripMarkers(newTitle);
        if (newTitle !== doc.title) doc.title = newTitle;
        isApplying = false;
      });
      titleObserver.observe(titleEl, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    // Send initial count
    updateBadge();
  }

  // --- Send replacement count to background for badge ---
  function updateBadge() {
    try {
      chrome.runtime.sendMessage({
        type: "updateCount",
        count: replacementCount,
      });
    } catch (e) {
      // Extension context may be invalidated on navigation
    }
  }

  // --- Inject CSS for highlight underlines ---
  function injectHighlightStyles() {
    var style = document.createElement("style");
    style.id = "ga-highlight-styles";
    style.textContent =
      ".ga-highlight { border-bottom: 1.5px dotted rgba(231, 76, 60, 0.6); cursor: help; }";
    document.head.appendChild(style);
  }

  // --- Detect whether this page is AI-related ---
  function detectAiConfidence(doc) {
    // Sample the first 5000 chars to avoid scanning huge DOMs
    var text = doc.body ? doc.body.textContent.slice(0, 5000) : "";
    var matches = text.match(AI_SIGNALS);
    return matches ? matches.length >= AI_CONFIDENCE_THRESHOLD : false;
  }

  // --- Initialize ---
  function init() {
    chrome.storage.local.get(
      { enabled: true, highlight: false, blocklist: [] },
      function (result) {
        if (!result.enabled) return;
        if (!document.body) return;

        // Per-site blocklist
        var hostname = window.location.hostname;
        if (result.blocklist.indexOf(hostname) !== -1) return;

        highlightEnabled = result.highlight;
        if (highlightEnabled) injectHighlightStyles();

        var isAiPage = detectAiConfidence(document);
        buildActiveReplacements(isAiPage);
        walkAndObserve(document);
      }
    );
  }

  init();
})();
