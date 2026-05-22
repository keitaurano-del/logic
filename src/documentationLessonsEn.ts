import type { LessonData } from './lessonData'

// ========================================
// Documentation Lessons (ID: 720-726)
// Course: documentation-01 — Slide & document craft
// 720 Structure / 721 One-message-per-slide / 722 Visualization
// 723 Layout & whitespace / 724 Typography / 725 Color / 726 Charts
// ========================================

// ── 720: Structure first ─────────────────────────────

const structureFirst: LessonData = {
  id: 720,
  title: 'Structure Is 90% of the Document',
  category: 'Documentation',
  steps: [
    {
      type: 'explain',
      title: 'Decide what you want to say first',
      content:
        "Great documents are won or lost at the structure stage, before any design.\n\nStructure design means fixing three things up front:\n\n[1] Purpose (Why)\nWhat do you want readers to do? Approve, decide, share information?\n\n[2] Reader (Who)\nWho will read it? What is their prior knowledge, interest, and how busy are they?\n\n[3] Key message (What)\nIf only one sentence is read, what should remain?\n\nWithout these three, every slide you add makes the focus blurrier.\n\nClassic failure patterns:\n• 'Just gather information and lay it out' → no clear point\n• 'Make it look beautiful' becomes the goal → the conclusion gets buried\n• 'Aim at everyone' → resonates with no one\n\nGolden time allocation: Structure 50% / Writing 30% / Design 20%. Investing heavily in structure design up front is the highest-ROI step.",
      visual: 'WhereWhyHowDiagram',
    },
    {
      type: 'quiz',
      question: 'What should you spend the most time on first when creating a document?',
      options: [
        { label: 'Articulate the reader, purpose, and key message', correct: true },
        { label: 'Decide on fonts and color palette in advance', correct: false },
        { label: 'Exhaustively collect information into a table', correct: false },
        { label: 'Prepare slide layout templates upfront', correct: false },
      ],
      explanation:
        'Without clarifying who you are speaking to and what you want to say, no amount of information or design will have a sharp point. "Exhaustive information gathering" seems thorough but typically inflates content without focus, requiring heavy trimming later.',
    },
    {
      type: 'explain',
      title: 'Build it as a pyramid',
      content:
        'Once you have a key message, build a pyramid of claim → support → evidence.\n\n[Top] Key message (one-sentence conclusion)\nExample: "We recommend investing in new business A."\n\n[Middle] 2–4 supporting reasons\nExample: ① Market is growing ② Our strengths apply ③ ROI is strong\n\n[Bottom] Specific facts and data for each reason\nExample: ① Market size 1.5× in 3 years ② Our ◯◯ tech ③ 180% ROI\n\nThe three rules of the pyramid (Barbara Minto, "The Pyramid Principle"):\n\n1. Higher-level messages summarize lower-level ones\n2. Items at the same level share the same abstraction\n3. Items at the same level are MECE (mutually exclusive, collectively exhaustive)\n\nMap this pyramid directly to "Table of Contents → Chapters" and your slide structure will not collapse.\n\nReaders process "conclusion → why → details" with the lowest cognitive load.',
      visual: 'PyramidDiagram',
    },
    {
      type: 'quiz',
      question: 'Which is the WORST structure for a pyramid?',
      options: [
        { label: 'Putting "market", "our strengths", and "next week\'s weather" on the same level', correct: true },
        { label: 'Conclusion at the top, with three supporting reasons at the same level', correct: false },
        { label: 'Each reason backed by two pieces of supporting data', correct: false },
        { label: 'Refining the supporting points to be MECE before listing them', correct: false },
      ],
      explanation:
        '"Next week\'s weather" has nothing to do with the key message and breaks MECE. This violates the third rule of the pyramid: items at the same level must share the same level of abstraction and perspective. The other three options all follow the pyramid principles correctly.',
    },
    {
      type: 'explain',
      title: 'Write the storyline first',
      content:
        'Before opening your slide tool, always write a "storyline" in text.\n\nA storyline is the list of every slide title (= each slide\'s key message), in order.\n\nExample:\n1. Recommend investing in new business A\n2. Market grows 1.5× over 3 years\n3. Our ◯◯ tech gives us a competitive edge\n4. Initial investment of $5M with 180% ROI in 3 years\n5. Regulatory risk exists but is absorbed by ◯◯\n6. Next action: decide at the June board meeting\n\nReading just the titles top-to-bottom should make the whole argument flow.\n\nThings to verify at the storyline stage:\n• Does each title stand as a complete argument on its own?\n• Are the transitions between adjacent slides natural?\n• Are there slides that do not connect to the conclusion?\n• Are there missing arguments?\n\nFix any awkwardness here, before building. Rebuilding the structure after creating 100 slides is the worst waste.',
      visual: 'ScrStructureDiagram',
    },
    {
      type: 'quiz',
      question: 'What is the main purpose of writing a storyline?',
      options: [
        { label: 'Verify that the argument flows before building any slides', correct: true },
        { label: 'Streamline font selection during the build phase', correct: false },
        { label: 'Prepare a visual checklist for post-build review', correct: false },
        { label: 'Lock in which diagrams to use so they can be reused', correct: false },
      ],
      explanation:
        'A storyline makes the argument skeleton visible so structural flaws can be spotted before you start building. Font and diagram decisions belong to the design phase and are separate from structural validation.',
    },
  ],
}

// ── 721: One message per slide ──────────────────────

const oneSlideOneMessage: LessonData = {
  id: 721,
  title: 'One Slide, One Message',
  category: 'Documentation',
  steps: [
    {
      type: 'explain',
      title: 'A slide carries one message only',
      content:
        "The cardinal rule of slide design: **one slide, one message**.\n\nStuffing two or more claims into one slide overruns working memory capacity, and neither claim sticks.\n\nThe test:\nCan you write the slide title (= the slide's key message) as one complete sentence?\n\n• ✓ 'New business A's market grows 1.5× over 3 years'\n• ✗ 'Market trends and competitive analysis' (no claim, just a topic list)\n\nIf your title ends in a noun like 'trends,' 'analysis,' or 'overview,' it is a warning sign. That is not a slide that says something; it is a 'place to put information.'\n\nHow to write a title-as-message:\n• Include a subject and a verb (X is Y)\n• Make a definitive claim (avoid hedging)\n• Include numbers or proper nouns (be specific)\n\nRewriting just the title dramatically improves a slide's communication power.",
      visual: 'GoodBadSlideDiagram',
    },
    {
      type: 'quiz',
      question: "Which title best embodies 'one slide, one message'?",
      options: [
        { label: 'Our EC sales grew 145% YoY among women in their 30s', correct: true },
        { label: 'Sales trends, customer analysis, and future strategy', correct: false },
        { label: 'A combined view of market, competitor, and internal status', correct: false },
        { label: 'A comprehensive summary of EC data and reference materials', correct: false },
      ],
      explanation:
        'A title with subject + verb + number works as a key message on its own. The other three end in nouns ("trends," "analysis," "summary") and are classic "information dump" slides with no clear point.',
    },
    {
      type: 'explain',
      title: 'Title and body must align',
      content:
        'The body of a slide should be "diagrams and facts that prove the title." Title = claim, body = evidence.\n\nCommon failures:\n\n[Failure 1] Title and body do not match\nTitle: "The market is expanding"\nBody: Competitor org chart\n→ Split into separate slides.\n\n[Failure 2] Unrelated info mixed into body\nTitle: "We will reach profitability"\nBody: Revenue trends + hiring plan + office relocation\n→ Hiring and office go to separate slides.\n\n[Failure 3] Body is a list of bullets\nTitle: "There are three issues"\nBody: 12 bullets listed\n→ Move the rest to other slides or cut.\n\nHow to check:\nPoint at every element on the slide and ask: "Does this prove the title?" If not, move it out or delete it.\n\nMisalignment here is the cause of 90% of "I cannot tell what you are trying to say" reactions.',
      visual: 'ThreePillarsDiagram',
    },
    {
      type: 'quiz',
      question: 'For the title "Sales productivity improved 130% YoY," which body content best supports it?',
      options: [
        { label: 'Monthly trend of revenue per salesperson, vs same month last year', correct: true },
        { label: 'Sales department org chart and next year\'s hiring plan', correct: false },
        { label: 'Total company headcount and salary curves including non-sales', correct: false },
        { label: 'Seat layout change plan for the sales office', correct: false },
      ],
      explanation:
        'The title claims improvement in productivity per salesperson, so the body must directly prove it with a per-person revenue trend. Org charts, headcount, and seat layouts all look related but do not prove productivity.',
    },
    {
      type: 'explain',
      title: 'Know the density limit',
      content:
        'There is a physical ceiling to information density per slide.\n\nGuidelines:\n• Characters: ~200–400 (or roughly 50–80 English words)\n• Bullets: up to 5 (ideally 3)\n• Diagram elements: 5–7 max\n• Colors: 3 (main / accent / gray)\n• Font families: 2 max\n\nBeyond this, cognitive load theory\'s "extraneous load" spikes and comprehension collapses.\n\nThree tactics to lower density:\n\n[1] Split\nIf a slide feels packed, split into two. Do not fear page count.\n\n[2] Abstract\nCompress 12 facts into "three trends."\n\n[3] Move to appendix\nKeep the main deck minimal. Save details for backup slides to open when questioned.\n\nProfessionals subtract rather than add. The communication power of a deck grows by removing information, not adding it. That is the paradox of senior-level document craft.',
      visual: 'MecePatternsDiagram',
    },
    {
      type: 'quiz',
      question: 'For a slide with 12 bullets and a 7-color diagram, what is the healthiest fix?',
      options: [
        { label: 'Split it so each key message lives on its own slide', correct: true },
        { label: 'Shrink the font size to cram everything onto one slide', correct: false },
        { label: 'Add 9 colors so each category can be color-coded distinctly', correct: false },
        { label: 'Eliminate all whitespace by filling gaps with extra text', correct: false },
      ],
      explanation:
        'The real fix for overload is "split" or "cut." Smaller fonts, more colors, and removing whitespace all increase extraneous load and break comprehension further.',
    },
  ],
}

// ── 722: Visualization ──────────────────────────────

const visualization: LessonData = {
  id: 722,
  title: 'When and How to Visualize',
  category: 'Documentation',
  steps: [
    {
      type: 'explain',
      title: 'When should you use a diagram?',
      content:
        'Diagrams are not universal. Diagramming the wrong things actually hurts communication.\n\nUse a diagram when:\n\n[1] There are relationships\n• Causal (A → B)\n• Hierarchical (parent ⊃ child)\n• Parallel (compare A, B, C)\n• Containment (overlapping circles)\n→ Faster to grasp than text\n\n[2] There is structure\n• Process (5 steps)\n• Matrix (2 axes → 4 quadrants)\n• Framework (3C, 4P, etc.)\n→ Spatial layout itself carries information\n\n[3] Showing numeric trends\n• Time series, composition, distribution\n→ Charts are overwhelmingly faster\n\nDo NOT use a diagram when:\n\n• It is a simple bullet list (text suffices)\n• It is a single supporting sentence (diagrams scatter attention)\n• The exact wording matters (slogans, taglines)\n\nThe test: "Can the reader grasp this structure in 3 seconds as text?" If yes, keep text. If no, diagram it.',
      visual: 'TriadDiagram',
    },
    {
      type: 'quiz',
      question: 'Which content has the LEAST value in being diagrammed?',
      options: [
        { label: 'Repeating the slogan "Quality First" for emphasis', correct: true },
        { label: 'A 5-step project process flow', correct: false },
        { label: 'A 2-axis competitive positioning of products', correct: false },
        { label: 'Composition ratio of three business segments to total revenue', correct: false },
      ],
      explanation:
        'Slogans live in the words themselves; a diagram dilutes their impact. Processes, matrices, and composition ratios all benefit from spatial layout that text alone cannot deliver.',
    },
    {
      type: 'explain',
      title: 'Five diagram archetypes',
      content:
        'In practice, business diagrams collapse into five archetypes.\n\n[Type 1] Flow (→)\nProcess, time series, causal chains.\nExample: A → B → C / Plan → Do → Check → Act\n\n[Type 2] Matrix (2x2)\nClassify by two axes into four quadrants.\nExample: Importance × Urgency, PPM (market growth × market share)\n\n[Type 3] Hierarchy (tree)\nDecompose top-down.\nExample: Logic trees, org charts, pyramids\n\n[Type 4] Venn (overlap)\nShow set relationships.\nExample: Three-circle intersection, MECE diagrams\n\n[Type 5] Graph (numeric)\nVisualize numeric trends.\nExample: Line, bar, pie, scatter, radar\n\nHow to pick:\n• Order matters → Flow\n• Two axes → Matrix\n• Decomposition → Hierarchy\n• Set relations → Venn\n• Numeric values → Graph\n\n"Just use a flow" or "everything is boxes and arrows" signals lazy thinking. The discipline is to pick the type that matches the information\'s structure.',
      visual: 'Two2MatrixDiagram',
    },
    {
      type: 'quiz',
      question: 'You want to organize businesses by "market attractiveness" and "internal competitiveness." Which diagram type fits best?',
      options: [
        { label: 'Matrix — classify across two axes into four quadrants', correct: true },
        { label: 'Flow — connect process or time series with arrows', correct: false },
        { label: 'Hierarchy — decompose from top-level to detailed nodes', correct: false },
        { label: 'Venn — show overlap or containment of sets', correct: false },
      ],
      explanation:
        '"Classification by two independent axes" is exactly what matrix diagrams do — and this is the classic PPM structure. Flow shows order, hierarchy shows decomposition, Venn shows overlap. None of those is a fit for two-axis classification.',
    },
    {
      type: 'explain',
      title: 'Diagramming traps to avoid',
      content:
        'Overuse of diagrams hurts comprehension. Five common traps:\n\n[Trap 1] Decorative-only graphics\nIcons or illustrations with no informational role.\n→ Steal cognitive resources and add zero meaning.\n\n[Trap 2] Box-and-arrow mazes\nRelationship diagrams with 15+ elements.\n→ Eyes get lost before structure is understood. Limit to 5–7 elements.\n\n[Trap 3] 3D charts\nPies and bars with depth effects.\n→ Front slices look bigger; values get distorted.\n\n[Trap 4] Forcing a diagram\nWrapping a single fact or claim in a box.\n→ Plain text reads faster.\n\n[Trap 5] Too many legends\nLine graphs with 10 colored lines and 10-item legends.\n→ Eyes ping-pong between the chart and the key, masking the trend.\n\nGuiding principle: **few, straight, aligned**.\n• Few elements (5–7)\n• Straight relationships (orthogonal arrows)\n• Things that should align actually align (position, size, color)\n\nA great diagram is built by subtraction, not addition.',
      visual: 'GraphPitfallsDiagram',
    },
    {
      type: 'quiz',
      question: 'Which is the most typical diagramming trap?',
      options: [
        { label: 'Cramming 15 elements connected by arrows into a single relationship diagram', correct: true },
        { label: 'Laying out a 5-step process left-to-right so order is clear', correct: false },
        { label: 'Placing initiatives on an importance × urgency 2x2 matrix', correct: false },
        { label: 'Combining composition into a single 100% stacked bar for easy comparison', correct: false },
      ],
      explanation:
        '15-element relationship diagrams exceed working memory and make the eye wander before structure can be grasped. The other three follow the correct uses of flow, matrix, and chart designs and match the structure of their information.',
    },
  ],
}

// ── 723: Layout and whitespace ──────────────────────

const layoutAndSpace: LessonData = {
  id: 723,
  title: 'Layout and Whitespace Guide the Eye',
  category: 'Documentation',
  steps: [
    {
      type: 'explain',
      title: 'Whitespace is the strongest design tool',
      content:
        'Beginners want to fill space; professionals protect it.\n\nWhat whitespace does:\n\n[1] Highlights important elements\nAn element surrounded by emptiness commands attention automatically.\n\n[2] Signals grouping\nElements separated by whitespace are perceived as different groups.\n→ Keep related items close, separate unrelated ones (Law of Proximity).\n\n[3] Lets the reader breathe\nDense slides are mentally tiring. Whitespace creates thinking space.\n\n[4] Conveys class\nLuxury brand ads use vast whitespace. Less information signals confidence.\n\nMinimum standards:\n• Slide margin: 5% (e.g. 50px on a 1000px stage)\n• Inter-element gap: at least 25% of element height\n• Text leading (line-height): 1.5–1.7× font size\n\nFight the urge to fill. Whitespace is not "unfinished" — it is the mark of completion.',
      visual: 'LayoutDiagram',
    },
    {
      type: 'quiz',
      question: 'Which use of whitespace best follows design principles?',
      options: [
        { label: 'Place related items close and unrelated items far apart', correct: true },
        { label: 'Push elements all the way to every edge to use the full canvas', correct: false },
        { label: 'Distribute all elements at perfectly equal mechanical spacing', correct: false },
        { label: 'Fill every empty area with copyright text and page numbers', correct: false },
      ],
      explanation:
        'The Law of Proximity says grouping is communicated by physical closeness. "Perfectly equal mechanical spacing" looks tidy but actually destroys grouping cues, making structure harder to read.',
    },
    {
      type: 'explain',
      title: 'Z-pattern vs F-pattern',
      content:
        'The eye does not move randomly. Two common reading patterns are worth designing around.\n\n[Z-pattern] (slide-oriented)\nTop-left → top-right → bottom-left → bottom-right.\n• Good for overview-style layouts\n• Standard for presentation slides\n• Place key info top-left; conclusion/action bottom-right\n\n[F-pattern] (text-oriented)\nThe eye reads the top horizontally, then biases leftward going down.\n• Good for text-heavy documents and web pages\n• Each paragraph is judged "skim or read" from the top\n• Place important info at the top and along the left\n\nDesign guideline:\n• Slide decks → think Z (title top-left, conclusion bottom-right)\n• Reports / white papers → think F (left-aligned headings)\n• Do not force a reader to read in two directions on the same slide\n\nLayouts that fight the natural eye path silently waste communication efficiency.',
      visual: 'LayoutDiagram',
    },
    {
      type: 'quiz',
      question: 'On a presentation slide, where is the best place for the conclusion or call to action?',
      options: [
        { label: 'Bottom-right, the endpoint of the Z-pattern', correct: true },
        { label: 'A narrow vertical band along the left edge', correct: false },
        { label: 'Top-left corner, the start of the F-pattern, in a small spot', correct: false },
        { label: 'Dead-center inside a large highlight box', correct: false },
      ],
      explanation:
        'The Z-pattern ends at the bottom-right, the natural last-impression position. Top-left is for titles or key messages; center placement is not wrong but loses the "final impression" of the Z-pattern.',
    },
    {
      type: 'explain',
      title: 'Align and repeat',
      content:
        'The two pillars of beautiful layouts are **alignment** and **repetition**.\n\n[Alignment]\nLine up edges.\n• Do not mix left/center/right alignment\n• Be aware of invisible vertical guides\n• "Roughly aligned" is not aligned. Snap to pixels.\n\nBad examples:\n• Title left-aligned on page 1, center-aligned on page 2 → feels chaotic\n• Bullet markers slightly off → looks sloppy\n\n[Repetition]\nRepeat the same pattern.\n• Keep title position, size, and color consistent across slides\n• Define a rule like "key messages in blue, supporting text in gray" and obey it\n• Maintain consistent logo, page numbers, and color use\n\nRepetition lets the reader internalize the document\'s pattern and stop spending energy on structure decoding.\n\nWhen alignment and repetition break, even good content reads as "a sloppy deck." Apply them rigorously and even ordinary content reads as "a professional deck."',
      visual: 'MeceVennDiagram',
    },
    {
      type: 'quiz',
      question: 'Which practice damages alignment and repetition most?',
      options: [
        { label: 'Changing the title position and font size from slide to slide', correct: true },
        { label: 'Placing every title in the top-left at the same size', correct: false },
        { label: 'Enforcing the rule "key messages in blue, supporting text in gray"', correct: false },
        { label: 'Aligning the start of every bullet to the same vertical pixel', correct: false },
      ],
      explanation:
        'Changing title placement and size per slide breaks both alignment and repetition entirely. Each slide forces the reader to rediscover the structure. The other three are textbook applications of alignment and repetition.',
    },
  ],
}

// ── 724: Typography ─────────────────────────────────

const typography: LessonData = {
  id: 724,
  title: 'Typography for Readability',
  category: 'Documentation',
  steps: [
    {
      type: 'explain',
      title: 'Principles for choosing a font',
      content:
        'Font selection is not about "expressing personality"; the priority is "not sacrificing legibility."\n\nFonts to use in business documents:\n\n[Latin]\n• Helvetica / Arial / Segoe UI / Inter / Noto Sans\n• Body: Regular / Medium\n• Headings: Bold / Black\n\n[Japanese / CJK]\n• Yu Gothic / Meiryo / Noto Sans JP / Noto Sans CJK\n• Match weight pairings between Latin and CJK versions\n\nFonts to avoid:\n• Decorative fonts (Comic Sans, script) → undermine credibility\n• Pixel/bitmap fonts → break on mobile\n• Hairline weights → invisible when projected\n\nThe iron rule of font count:\n**At most two families per document.** A heading face and a body face.\n• Safest: use weight variants from a single family\n• Express hierarchy with "jump ratio" (size gap between headings and body)\n\nThree or more font families distract from the content and reduce communication efficiency.',
      visual: 'TypographyDiagram',
    },
    {
      type: 'quiz',
      question: 'Which approach to font choice is most appropriate for a business document?',
      options: [
        { label: 'Limit to two fonts (body + heading) from the same family', correct: true },
        { label: 'Mix three or more decorative fonts for personality', correct: false },
        { label: 'Use pixel/bitmap fonts to align with mobile rendering', correct: false },
        { label: 'Use a brush/script font for headings to stand out', correct: false },
      ],
      explanation:
        'Business documents need credibility and readability above all, so two fonts max is the rule. Decorative, pixel, and brush fonts all damage either readability or credibility — classic anti-patterns.',
    },
    {
      type: 'explain',
      title: 'Sizes and jump ratio',
      content:
        'Font size is the visual representation of information hierarchy.\n\nRecommended sizes (16:9 slide, 1080p):\n• Title: 40–48 pt\n• Major heading: 28–32 pt\n• Body: 18–24 pt\n• Footnote: 14–16 pt\n\nLower bounds for legibility:\n• Projection: ≥ 18 pt (people in the back row should still read it)\n• Printed / PDF reading: ≥ 10 pt\n• Mobile reading: ≥ 14 pt\n\n[Jump ratio]\nJump ratio = heading size ÷ body size.\n\n• Low jump (~1.2×): refined, calm, sophisticated\n  → Reports, financial docs, consulting decks\n\n• High jump (≥ 2×): bold, easy to read, casual\n  → Presentations, ads, web landing pages\n\nDesign jump ratio deliberately to match the document\'s personality.\n\nWhat NOT to do:\n• Everything at 18 pt (jump ratio 1) → no visible hierarchy\n• Everything at 36 pt (jump ratio 1) → everything is shouting\n• Title at 20 pt next to body at 18 pt → too small a gap to register as hierarchy',
      visual: 'TypographyDiagram',
    },
    {
      type: 'quiz',
      question: 'Which "title vs body" jump ratio gives the strongest hierarchical contrast?',
      options: [
        { label: 'Title 40pt with body 20pt (jump ratio 2×)', correct: true },
        { label: 'Title 18pt with body 18pt (jump ratio 1×)', correct: false },
        { label: 'Title 20pt with body 18pt (jump ratio 1.1×)', correct: false },
        { label: 'Title 36pt with body 36pt (jump ratio 1×)', correct: false },
      ],
      explanation:
        'A 2× jump ratio communicates hierarchy intuitively and guides the eye. 1.1× is too small to register as intentional and looks like a sizing mistake. 1× provides no hierarchy at all.',
    },
    {
      type: 'explain',
      title: 'Contrast and line height',
      content:
        'Two hidden readability levers: **contrast** and **line height**.\n\n[Contrast]\nLuminance difference between text and background. WCAG (accessibility) standards:\n• Body text: contrast ratio ≥ 4.5:1\n• Large text (18 pt+): ≥ 3:1\n\nCommon mistakes:\n• Pale gray body text (#999) → disappears when projected\n• White text directly on photos → unreadable on bright areas\n• Brand color used as body text in pale tones → "stylish but unreadable"\n\nFixes:\n• Use solid dark colors (#000 to #333) for body text\n• Apply a translucent dark overlay over background photos\n• Reserve brand color for headings and highlights only\n\n[Line height]\n• Recommended: 1.5–1.7× the font size\n• For 18 pt body, that is 27–30 pt of line height\n\nToo tight feels suffocating; too loose feels scattered. 1.5–1.7× is the comfort zone.\n\nLetter spacing (tracking) matters too:\n• Japanese: 0 to +50\n• Uppercase Latin: +100 or so for logos and headlines\n\nFix these two and the same content "feels" twice as readable.',
      visual: 'Two2MatrixDiagram',
    },
    {
      type: 'quiz',
      question: 'Which setting damages body-text readability the most?',
      options: [
        { label: 'Pale gray text (#CCC) on white with 1.0× tight line height', correct: true },
        { label: 'Dark gray text (#222) on white with 1.6× line height', correct: false },
        { label: 'White text on a dark background with sufficient contrast ratio', correct: false },
        { label: 'White text on a photo with a translucent dark overlay underneath', correct: false },
      ],
      explanation:
        'Pale gray text plus cramped line height combines low contrast and visual claustrophobia. It will simply vanish in a projection setting. The other three honor both contrast and line-height standards.',
    },
  ],
}

// ── 725: Color ──────────────────────────────────────

const colorPalette: LessonData = {
  id: 725,
  title: 'The 3-Color Rule',
  category: 'Documentation',
  steps: [
    {
      type: 'explain',
      title: 'Base, Main, Accent — 70:25:5',
      content:
        "The golden ratio for color is **70:25:5**.\n\n[Base 70%]\n• Used for backgrounds and large surfaces\n• Usually white (#FFFFFF) or very light gray\n• Its job is to NOT compete\n\n[Main 25%]\n• Sets the document's overall impression\n• Usually a brand color, navy, or dark blue\n• Used for headings, key sections, and primary chart fills\n\n[Accent 5%]\n• Highlights the single most important point in red, orange, or green\n• Functions as a visual finger pointing to 'look here'\n• Loses its power if it exceeds 5%\n\nFollow this and your color use will look professional automatically.\n\nWhat NOT to do:\n• 7-color rainbow gradient → categorization becomes the goal itself\n• Neon-heavy palettes → painful and untrustworthy\n• Different color schemes per slide → zero consistency\n\nGreater communication power comes not from more colors, but from giving each color a fixed role.",
      visual: 'ColorPaletteDiagram',
    },
    {
      type: 'quiz',
      question: 'Which best applies the 70:25:5 rule?',
      options: [
        { label: 'White background, navy headings, with critical numbers highlighted in red', correct: true },
        { label: 'Equal-area rainbow 7-color blocks distributed across every slide', correct: false },
        { label: 'Different neon color as base on every slide', correct: false },
        { label: 'Neon-yellow full-bleed text on a pure-black background', correct: false },
      ],
      explanation:
        'White base (70%) + navy main (25%) + red accent (5%) is the textbook application. The other three are runaway color counts, broken consistency, and contrast overload — all classic NG patterns.',
    },
    {
      type: 'explain',
      title: 'How to handle brand colors',
      content:
        'If a brand color exists, use it as the main color (25%).\n\n[Rules]\n\n① Always look up the official color code\n• "Roughly this blue" is not good enough\n• Use the exact HEX (e.g. #1A4FA0)\n• Follow the brand guideline\n\n② Prepare 3–5 tonal variations\n• Darker brand color (header bars, strong emphasis)\n• Standard brand color (headings, primary)\n• Lighter brand (subtle emphasis, accents)\n• Complementary color for contrast highlights\n\n③ You do not have to use every color\n• Even if the brand has 5 colors, use only 1–2 on a single slide\n• Trying to "cover the full palette" breaks color harmony\n\n[Accent and discipline]\nFor the 5% accent:\n• "Dramatic number change" → red on a single number\n• "Conclusion line" → one bold red sentence\n• "Next action" → one note bottom-right\n\nIf you place the accent in two spots, neither captures attention. **One accent per slide** is the rule.',
      visual: 'ColorPaletteDiagram',
    },
    {
      type: 'quiz',
      question: 'Which use of an accent color is most effective?',
      options: [
        { label: 'Highlighting the single most important number per slide in red', correct: true },
        { label: 'Painting every noun in the slide with red highlights', correct: false },
        { label: 'Coloring each bullet with a different neon shade to stand out', correct: false },
        { label: 'Filling the entire background from title to body with brand red', correct: false },
      ],
      explanation:
        'An accent acts as a finger pointing to "look here." Limit it to one spot to actually guide the eye. The other three over-apply red so much that "everything stands out → nothing stands out."',
    },
    {
      type: 'explain',
      title: 'Color Universal Design',
      content:
        'About 5% of men and 0.2% of women have color vision differences (deficiency). Globally that is hundreds of millions of people.\n\nDo not rely on color alone:\n\n[Dangerous pairings]\n• Red and green (the hardest pair to distinguish)\n• Brown and green\n• Orange and yellow-green\n• Light blue and pink\n\n[Mitigations]\n\n① Color + shape/icon\n• Distinguish lines by color AND solid/dashed/dotted style\n• Add symbols (◯ ✗) alongside color\n\n② Increase brightness contrast\n• Even with red and green, a strong brightness delta makes them distinguishable\n• Brightness contrast matters more than saturation\n\n③ Label directly\n• Instead of "red = sales" in a far-off legend, write "Sales" next to the line itself\n• Eliminates back-and-forth eye movement for everyone\n\n④ Accessibility tools\n• Color Oracle, Stark, etc. to simulate color vision differences\n• Run a check before printing or publishing\n\nGood color design is measured not by beauty but by "does it reach everyone?"',
      visual: 'MecePatternsDiagram',
    },
    {
      type: 'quiz',
      question: 'Which choice best honors Color Universal Design?',
      options: [
        { label: 'Combine color with solid/dashed lines and put labels directly next to data', correct: true },
        { label: 'Ignore color vision differences and emphasize a bright red vs green contrast', correct: false },
        { label: 'Place a tiny legend in the corner and rely on color alone for identification', correct: false },
        { label: 'Compose the entire palette of similarly pale colors for aesthetics', correct: false },
      ],
      explanation:
        'Combining color + shape + direct labels works for everyone regardless of color vision. Red-vs-green and pale-vs-pale pairings are exactly the patterns that fail color vision differences, and small remote legends add cognitive cost for every reader.',
    },
  ],
}

// ── 726: Chart design ───────────────────────────────

const chartDesign: LessonData = {
  id: 726,
  title: 'Chart Design Without Lies',
  category: 'Documentation',
  steps: [
    {
      type: 'explain',
      title: 'How to pick a chart',
      content:
        'A chart visualizes numbers so they become intuitive. Pick the wrong type and the data starts to lie.\n\n[By purpose]\n\n① Time-series change → Line chart\n• Sales trend, stock price, user-count history\n• Time on x-axis, value on y-axis\n\n② Category comparison → Bar chart\n• Sales by department, units by product\n• Vertical bars for few categories; horizontal bars for many or long labels\n\n③ Composition → Pie chart or 100% stacked bar\n• Revenue mix by segment\n• Use pies for ≤ 5 categories; stacked bar for 6+\n\n④ Correlation → Scatter plot\n• "Ad spend vs sales," "temperature vs ice cream sales"\n\n⑤ Multi-dimensional comparison → Radar chart\n• Comparing 5 or fewer evaluation metrics\n• Too many categories and the shape becomes unreadable\n\nClassic mismatches:\n• Composition shown as a line (mistaken for trend)\n• Time series shown as a pie (change is invisible)\n• Category comparison as a 3D pie (numbers get distorted)',
      visual: 'ChartTypeGuideDiagram',
    },
    {
      type: 'quiz',
      question: 'Which chart best shows "monthly sales over the last 12 months"?',
      options: [
        { label: 'Line chart — directly conveys trend and turning points', correct: true },
        { label: 'Pie chart — shows each month\'s share of the total', correct: false },
        { label: 'Radar chart — compares up to five evaluation axes', correct: false },
        { label: 'Scatter plot — visualizes correlation between two variables', correct: false },
      ],
      explanation:
        'Time-series trends are overwhelmingly intuitive as line charts. Pies show composition, radars compare multi-dimensional metrics, and scatter plots visualize correlation. None of those matches a time-series purpose.',
    },
    {
      type: 'explain',
      title: 'Five misleading traps',
      content:
        'Charts can lie — unintentionally or otherwise. Professionals avoid five traps to keep charts honest.\n\n[Trap 1] Y-axis does not start at zero\nExample: Sales 100→105 with y-axis from 95 to 110.\n→ A 5% difference looks like dramatic growth.\n→ Bars must always start at 0. (Line charts may relax this in context.)\n\n[Trap 2] 3D charts\nExample: 3D pies make the front slice look bigger.\n→ Slices in the back are systematically undervalued.\n→ Avoid 3D unless purely decorative. Stick to 2D.\n\n[Trap 3] Silent log scale\nExample: 1 → 10 → 100 spaced evenly.\n→ Looks linear, hiding the real magnitude.\n→ If using log scale, label it clearly.\n\n[Trap 4] Cherry-picking\nExample: Showing only the last 3 months as "rapid growth" while a 3-year view is declining.\n→ Show the broader context so the position is honest.\n\n[Trap 5] Broken y-axis without indicator\nExample: Compressing top and bottom to amplify the middle.\n→ Always show a clear break mark (//) or start from 0.',
      visual: 'GraphPitfallsDiagram',
    },
    {
      type: 'quiz',
      question: 'Which counts as a misleading bar chart?',
      options: [
        { label: 'Sales 100→105 bars drawn with the y-axis cropped to 95–110 to inflate the difference', correct: true },
        { label: 'Y-axis starting at 0 with sales shown on a faithful scale', correct: false },
        { label: 'Sorting categories by descending sales to ease comparison', correct: false },
        { label: 'Two same-scale bars side-by-side comparing this year vs last year', correct: false },
      ],
      explanation:
        'A bar chart with a non-zero y-axis turns tiny differences into apparent surges and deceives readers regardless of intent. The other three honor the "zero-origin," "tidy ordering," and "fair comparison" basics.',
    },
    {
      type: 'explain',
      title: 'Finishing a chart that communicates',
      content:
        'A great chart goes beyond "showing numbers" to "carry the conclusion." Here is the finishing checklist.\n\n[1] Make the title carry the message\n× "Monthly Sales Trend" (too neutral)\n◯ "Sales accelerated to 130% YoY from Q3"\n→ The chart title IS the key message.\n\n[2] Highlight one focus point\n• Color just the relevant bar with brand color; gray the rest\n• Add a short annotation with an arrow at the turning point\n• Create exactly one "look here" spot\n\n[3] Strip the chartjunk\n• Cut excess gridlines, background patterns, and legends\n• Show units only once (e.g. "Sales (M$)")\n• Standardize number formats (use thousands separators or k/M)\n\n[4] Add source and footnotes\n• Source: "Internal data, FY2024"\n• Note: "*February is fiscal closing month and is non-standard"\n• These build trust\n\n[5] State the reader\'s next action\n• Beside the chart: "→ Reallocate sales resources to the Q3 segment"\n• Do not stop at data; add interpretation and recommendation\n\nA chart is not a data dump. It is evidence supporting a conclusion. Subtract decoration and finish with a message — that is the senior craft move.',
      visual: 'PyramidDiagram',
    },
    {
      type: 'quiz',
      question: 'Which chart finish reaches the highest professional standard?',
      options: [
        { label: 'Title carries the key message and exactly one spot is highlighted', correct: true },
        { label: 'Add more gridlines and background patterns for decorative flourish', correct: false },
        { label: 'Color every bar the same dark color and omit sources or annotations', correct: false },
        { label: 'Use a short neutral noun title like "Monthly Sales Trend"', correct: false },
      ],
      explanation:
        'A message-carrying title plus a single point of emphasis is the hallmark of a chart that supports a conclusion. Over-decoration, missing sources, and neutral titles all stop at "data on display" without the power to drive a decision.',
    },
  ],
}

// ========================================
// Map
// ========================================
export const documentationLessonMapEn: Record<number, LessonData> = {
  720: structureFirst,
  721: oneSlideOneMessage,
  722: visualization,
  723: layoutAndSpace,
  724: typography,
  725: colorPalette,
  726: chartDesign,
}
