import type { LessonData } from './lessonData'

// The evolution of strategy — from classics to modern (lineage inspired by
// Mitani Koji's "The Evolution of Management Strategy")
// Course A (320-324): Origins of strategy and competitive strategy
// Course B (325-329): Resources, capabilities, and co-evolution
export const strategyLessonMapEn: Record<number, LessonData> = {
  320: {
    id: 320,
    title: 'The origins of strategy — Taylor and Ford',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'Before "management strategy" was born',
        content:
          'Until the early 20th century, management ran on "intuition and experience." The first to bring science into it was Frederick Taylor with his "scientific management."\n\nTaylor observed and timed work, deriving the "best motion" and "standard time" for each task. This made labor planable and manageable, and productivity soared.\n\nTaylor\'s contribution was not mere efficiency. By creating the very idea that "management can be measured and planned," he laid the foundation for later strategy theory.',
      },
      {
        type: 'explain',
        title: 'Ford and the strategy of mass production',
        content:
          'Henry Ford pushed Taylor\'s thinking further. Using a moving assembly line he mass-produced the Model T, slashing prices and turning the automobile into a product for the masses.\n\nWhat emerged was the strategic concept of "economies of scale." The more you produce, the lower the cost per unit. Lower prices drive sales. More sales let you produce even more — a virtuous cycle.\n\nStrategy was not yet a "framework."\n\n:::point\nThe idea of "winning on cost and scale" still lives on today as the prototype of cost leadership strategy.\n:::',
      },
      {
        type: 'quiz',
        question: 'What was the biggest impact of Taylor\'s scientific management on later strategy theory?',
        options: [
          { label: 'The idea of shortening labor hours to satisfy workers', correct: false },
          { label: 'Establishing the view that "management can be measured, analyzed, and planned"', correct: true },
          { label: 'Showing the importance of brand building', correct: false },
          { label: 'Clarifying the goal of maximizing shareholder value', correct: false },
        ],
        explanation:
          'Taylor\'s essential contribution was less the efficiency itself than installing the idea that "the fuzzy practice of management can be observed and measured." This became the premise behind every later strategy framework (PPM, Five Forces, etc.).',
      },
      {
        type: 'quiz',
        question: 'Which strategic principle can we read from Ford\'s mass-production model?',
        options: [
          { label: 'Capture a high price through differentiation', correct: false },
          { label: 'Serve diverse needs with low-volume, high-variety production', correct: false },
          { label: 'Expand scale to lower unit cost, then expand the market with low prices', correct: true },
          { label: 'Build one-on-one relationships with customers to maximize LTV', correct: false },
        ],
        explanation:
          'Ford rode "economies of scale" — unit cost falls as volume rises — and expanded the market itself with low prices. This is the prototype of modern cost leadership strategy.',
      },
    ],
  },

  321: {
    id: 321,
    title: 'The Ansoff Matrix — choosing the direction of growth',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'The first to systematize "strategy"',
        content:
          'In 1965, Igor Ansoff in "Corporate Strategy" presented strategy as a systematic framework for the first time. He defined strategy as "the decision about which direction the company will grow."\n\nFamous above all is the "Ansoff Matrix." With "products (existing / new)" on one axis and "markets (existing / new)" on the other, growth options are organized into four quadrants.\n\nThis simple 2×2 turned a vague "we want to grow" into the concrete question "in which direction?"',
        outro:
          'Translating "we want to grow" into "which of these four quadrants are we betting on" instantly makes the discussion concrete. Whether you choose market penetration, new product, new market, or diversification comes down to each company\'s resources and tolerance for risk.',
        visual: 'Two2MatrixDiagram',
        visualProps: {
          sectionLabel: 'Ansoff Matrix — Product × Market',
          xAxis: { low: 'Existing market', high: 'New market', label: 'Market' },
          yAxis: { low: 'Existing product', high: 'New product', label: 'Product' },
          cells: [
            {
              title: '② New product development',
              items: ['New product to same customers', 'Leverage existing brand'],
            },
            {
              title: '④ Diversification (high risk)',
              items: ['Enter wholly new domains', 'Synergy design is the key'],
            },
            {
              title: '① Market penetration (safest)',
              items: ['Grow share', 'Promotion, pricing, LTV gains'],
            },
            {
              title: '③ New market development',
              items: ['Overseas or new segment', 'Channel build-out required'],
            },
          ],
          hint: 'The further top-right you go, the more unknowns and risk pile up. Diversification lives or dies on whether the "2 + 2 = 5" synergy actually shows up.',
        },
      },
      {
        type: 'explain',
        title: 'Four growth strategies',
        content:
          '① Market penetration: existing product × existing market. The safest path — gain share.\n② Product development: new product × existing market. Sell something new to the same customers.\n③ Market development: existing product × new market. Go overseas, or to a new segment.\n④ Diversification: new product × new market. Highest risk, highest possible return.\n\nThe further toward the bottom-right, the more "unknowns" — and the more capabilities required change. Ansoff also noted: "diversification succeeds or fails on synergy." Synergy is the "2 + 2 = 5" effect.',
      },
      {
        type: 'quiz',
        question: 'A coffee chain "starts offering takeaway desserts at its existing stores." Which Ansoff cell is this?',
        options: [
          { label: 'Market penetration', correct: false },
          { label: 'Product development', correct: true },
          { label: 'Market development', correct: false },
          { label: 'Diversification', correct: false },
        ],
        explanation:
          'The customer base (market) remains the existing café visitors, while a new product (desserts) is added. Therefore "product development."',
      },
      {
        type: 'quiz',
        question: 'Which strategy did Ansoff call "the riskiest"?',
        options: [
          { label: 'Market penetration', correct: false },
          { label: 'Product development', correct: false },
          { label: 'Market development', correct: false },
          { label: 'Diversification', correct: true },
        ],
        explanation:
          'Both product and market are new, so existing experience, resources, and customer base do not transfer directly. Without designed-in synergy, diversification tends to fail.',
      },
    ],
  },

  322: {
    id: 322,
    title: 'PPM — managing a portfolio of businesses',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'How to handle multiple businesses',
        content:
          'In the 1970s, conglomerates multiplied and "how to manage many businesses simultaneously" became a major problem. BCG (Boston Consulting Group) devised PPM (Product Portfolio Management) in response.\n\nThe horizontal axis is "relative market share" (your share ÷ largest competitor\'s share), the vertical axis is "market growth rate." Each business is plotted into one of four quadrants.\n\nPPM rests on two theories: ① the experience curve (unit cost falls as cumulative production rises) → share generates profit; ② the product life cycle → growth rate determines investment need.',
      },
      {
        type: 'explain',
        title: 'Meaning of the four quadrants and resource allocation',
        content:
          'Cash cow (high share × low growth): generates cash. Profitable without further investment.\nStar (high share × high growth): needs investment to maintain growth. The future cash cow.\nQuestion mark (low share × high growth): with share gain, becomes a star. Cut or commit.\nDog (low share × low growth): consider exit.\n\nThe basic logic: "earn from cash cows, invest in question marks to grow them into stars, and eventually turn them into cash cows." It is a tool to make the "money flow across businesses" visible.',
        outro:
          'PPM is the device that makes the cash flow across your whole portfolio visible. How much of the cash cow\'s profit should be routed into the up-and-coming question marks? Once you can argue the rationale through these four quadrants, board-room debates change in tone.',
        visual: 'Two2MatrixDiagram',
        visualProps: {
          sectionLabel: 'PPM — 4 businesses by growth × relative share',
          xAxis: { low: 'Low share', high: 'High share', label: 'Relative market share' },
          yAxis: { low: 'Low growth', high: 'High growth', label: 'Market growth' },
          cells: [
            { title: 'Question mark', items: ['Grow share → becomes Star', 'Cut or commit'] },
            { title: 'Star ★', items: ['Invest to maintain growth', 'Future cash cow'] },
            { title: 'Dog', items: ['Consider exit', 'Drains cash'] },
            { title: 'Cash cow', items: ['Profits with little investment', 'Harvest and redeploy'] },
          ],
          hint: 'Build the cash cycle: cow → question mark → star → cow',
        },
      },
      {
        type: 'quiz',
        question: 'What is the basic policy for a "cash cow" business in PPM?',
        options: [
          { label: 'Invest heavily to grow it further', correct: false },
          { label: 'Harvest cash and reinvest in businesses in other quadrants', correct: true },
          { label: 'Sell or exit immediately', correct: false },
          { label: 'Diversify it into another category', correct: false },
        ],
        explanation:
          'A cash cow is a mature business that needs little additional investment. Channel its cash into "question marks" or "stars" to grow tomorrow\'s revenue sources — that\'s the basic PPM logic.',
      },
      {
        type: 'quiz',
        question: 'Which is the most valid critique of PPM\'s limits?',
        options: [
          { label: 'It cannot show the executive team a holistic view of the business', correct: false },
          { label: 'It only looks at share and growth rate, missing synergies between businesses and differences in resources or capabilities', correct: true },
          { label: 'It is too complex for practical use', correct: false },
          { label: 'Growth-rate forecasts are too accurate, so it lacks flexibility', correct: false },
        ],
        explanation:
          'PPM\'s strength is "simple two-axis view," but that means it misses sources of competitive advantage like brand, technology, or customer relationships. RBV later emerged precisely as a counter to this weakness.',
      },
    ],
  },

  323: {
    id: 323,
    title: 'Porter\'s Five Forces — reading industry structure',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'The structure that splits "profitable industries from unprofitable ones"',
        content:
          'In 1980, Michael Porter in "Competitive Strategy" argued that "industry profitability is determined by five forces." This is Five Forces analysis.\n\n① Rivalry within the industry — how fierce the price wars are among competitors.\n② Threat of new entrants — low entry barriers thin out profits.\n③ Threat of substitutes — products in adjacent categories that can satisfy customers instead.\n④ Bargaining power of buyers — strong customers can force price cuts.\n⑤ Bargaining power of suppliers — strong suppliers raise costs.\n\nThe essence of Five Forces is a lens that diagnoses "whether an industry is structurally profitable."',
        outro:
          'Five Forces is the lens that decides "is this an industry where effort can earn a profit, or one that is structurally unprofitable?" The same effort produces wildly different results depending on the industry, so it is the analysis you should run once both before entry and at any exit decision.',
        visual: 'FiveForcesDiagram',
      },
      {
        type: 'explain',
        title: 'How to use it, and cautions',
        content:
          'Three steps: ① define the industry boundary (by product, by use, by region). ② evaluate each of the five forces as "strong / medium / weak." ③ think about levers to weaken the strong forces.\n\nExample: in convenience-store retail, buyer power is weak (individual customers are dispersed), supplier (manufacturer) power is moderately strong, and new entry is hard to mount thanks to capital and franchise networks.\n\nTwo cautions. First, misdefining the industry skews the diagnosis. Second, Five Forces look at "industry-wide profitability"; an individual company still needs another strategy (next lesson) to win within it.',
      },
      {
        type: 'quiz',
        question: 'Which most appropriately weakens the "threat of new entrants" in an industry?',
        options: [
          { label: 'Products are barely differentiated and competition is purely on price', correct: false },
          { label: 'Massive upfront investment, brand, patents, and other entry barriers are high', correct: true },
          { label: 'Demand is growing rapidly', correct: false },
          { label: 'Customers face low switching costs', correct: false },
        ],
        explanation:
          'High entry barriers (capital, brand, patents, distribution networks, etc.) make it harder for outsiders to enter, protecting incumbents\' profits.',
      },
      {
        type: 'quiz',
        question: 'What is the most valid original purpose of Five Forces analysis?',
        options: [
          { label: 'Diagnose an individual company\'s organizational capabilities', correct: false },
          { label: 'Diagnose how structurally profitable an industry is', correct: true },
          { label: 'Forecast changes in consumer needs', correct: false },
          { label: 'Forecast stock prices from financial indicators', correct: false },
        ],
        explanation:
          'Five Forces is the "lens of industry profitability." It is a framework for judging whether the industry as a whole is structurally attractive — not for assessing one firm\'s advantage.',
      },
    ],
  },

  324: {
    id: 324,
    title: 'The three generic strategies — choosing where to win',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'There are only three ways to win',
        content:
          'In a follow-up, Porter argued that "within an industry, only three generic strategies can win." ① Cost leadership, ② Differentiation, ③ Focus.\n\n① Cost leadership: produce at the lowest cost in the industry. You can sell the same product cheaper, or earn more on the same price. Scale, the experience curve, and efficient operations are the weapons.\n② Differentiation: provide unique value that customers will pay extra for. Build difference through brand, quality, technology, or experience.\n③ Focus: specialize in a particular segment and play either ① or ② within that narrow market.',
        outro:
          'Cost, differentiation, and focus are an either-or choice — mixing them half-heartedly lands you in the "stuck in the middle" zone where none of them wins. A clear call about which axis you will win on, grounded in your own strengths and the structure of the market, is the decisive move.',
        visual: 'TriadDiagram',
        visualProps: {
          sectionLabel: 'Porter\'s 3 generic strategies — pick where you win',
          top: { label: '①', name: 'Cost leadership' },
          left: { label: '②', name: 'Differentiation' },
          right: { label: '③', name: 'Focus' },
          primary: 'top',
          hint: 'Half-mix the three and you fall into "stuck in the middle." Pick one.',
        },
      },
      {
        type: 'explain',
        title: 'The "stuck in the middle" trap',
        content:
          'Porter\'s warning was about the danger of being half-hearted.\n\nA company that wins on neither cost nor differentiation — "stuck in the middle" — will lose to competitors choosing either strategy. Neither cheap nor special, it is a sitting duck.\n\nIf you choose differentiation, don\'t fight on cost; if you choose cost, don\'t add elaborate features.\n\n:::point\nStrategy is fundamentally about "throwing things away." Deciding what not to do — not what to do — is what strategy is.\n:::',
      },
      {
        type: 'quiz',
        question: 'Which generic strategy best fits a luxury-brand handbag maker?',
        options: [
          { label: 'Cost leadership', correct: false },
          { label: 'Differentiation', correct: true },
          { label: 'Broad cost focus', correct: false },
          { label: 'Stuck in the middle', correct: false },
        ],
        explanation:
          'Brand, materials, and craftsmanship create value customers will pay a premium for. This is the textbook differentiation strategy. Instead of competing on cost, the firm captures a price premium.',
      },
      {
        type: 'quiz',
        question: 'What is the most valid reason Porter called "stuck in the middle" dangerous?',
        options: [
          { label: 'It is half-hearted on both cost and differentiation, so it loses to competitors using either strategy', correct: true },
          { label: 'Mid-sized companies are easy M&A targets', correct: false },
          { label: 'The middle market has few competitors and is hard to profit in', correct: false },
          { label: 'Decision-making slows down', correct: false },
        ],
        explanation:
          'If you cannot win on either price or distinctiveness, you lose customers to both low-cost and differentiated rivals. Strategy is "the courage to throw something away," not "have it all."',
      },
    ],
  },

  325: {
    id: 325,
    title: 'RBV and VRIO — explaining advantage from internal resources',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'Look inside, not outside',
        content:
          'Until the 1980s, strategy theory emphasized "industry structure" (the outside). But why do "winners and losers diverge within the same industry"?\n\nRBV (Resource-Based View), proposed by Barney and others, located the answer in the firm\'s "internal resources." People, things, money, information, brand, technology, organizational culture — resources the firm controls — are the source of competitive advantage.\n\nIf the industry is the same, what decides the contest is "what only we have."',
      },
      {
        type: 'explain',
        title: 'VRIO — diagnosing resources with four questions',
        content:
          'Barney\'s framework checks whether a resource generates competitive advantage with four questions. This is VRIO.\n\nV (Valuable) — does the resource create customer value?\nR (Rare) — is it rare among competitors?\nI (Inimitable) — is it hard to imitate? (historical paths, social complexity, causal ambiguity)\nO (Organized) — is the organization set up to leverage it?\n\nIf all four are "yes," the resource yields "sustained competitive advantage." Miss even one, and the value won\'t last.\n\nExample: Starbucks\' barista service know-how is valuable, scarce among other chains, embedded in culture and hard to imitate, and organized around store operations → sustained advantage.',
        outro:
          'The four VRIO questions act as filters that get progressively stricter. V alone is something anyone can hold, R adds rarity, I means imitation is hard, and only when O is also satisfied do you have sustained advantage. Running your strengths through the four-step sieve is what surfaces the resources that actually win.',
        visual: 'VrioDiagram',
      },
      {
        type: 'think',
        question: 'Pick one "strength" of your company (or a familiar one) and diagnose it with VRIO. Where is the weak spot, and how can you reinforce it?',
        hint: 'Answer V→R→I→O in order with "Yes/No"; the first "No" is the reinforcement point. E.g., "we have technology but no brand awareness" (R is weak); "the organization can\'t leverage it" (O is weak).',
        modelAnswer:
          'Example (a long-established regional Japanese sweets shop):\n\nV (Value): Yes — "100 years of trust in the local area" provides genuine value to customers.\nR (Rarity): Yes — few shops in the region share that history.\nI (Inimitability): Yes — historical path and ties to the local community can\'t be reproduced by a new entrant.\nO (Organization): No — craft skills haven\'t been documented and successors haven\'t been developed; the resource isn\'t fully leveraged.\n\nReinforcement: codify recipes + run a young-craftsperson development program; build an EC channel to deliver to customers the value currently "stuck at O."',
        points: [
          'Order matters in VRIO — a non-V is not a resource to begin with',
          'Japanese firms often have high I (inimitability) but get stuck at O (organization)',
          'Used as a "find the weak spot" diagnostic, the framework becomes far more practical',
        ],
      },
      {
        type: 'quiz',
        question: 'What is the most fundamental difference between RBV and Porter\'s industry analysis?',
        options: [
          { label: 'RBV is quantitative, Porter is qualitative', correct: false },
          { label: 'RBV looks for the source of advantage in internal resources; Porter in industry structure', correct: true },
          { label: 'RBV is for large firms, Porter for small ones', correct: false },
          { label: 'RBV addresses short-term strategy, Porter long-term', correct: false },
        ],
        explanation:
          'RBV\'s core claim: "even within the same industry, winners and losers diverge — and the gap lies in internal resources." Porter (Five Forces, generic strategies) looks at the outside (industry); RBV looks inside.',
      },
      {
        type: 'quiz',
        question: 'A company holds a "rare and valuable patent technology" but lacks the organization to commercialize it. How is this evaluated under VRIO?',
        options: [
          { label: 'It has sustained competitive advantage', correct: false },
          { label: 'It gains temporary advantage but, lacking organization, the advantage does not persist', correct: true },
          { label: 'It is at a competitive disadvantage', correct: false },
          { label: 'It cannot be evaluated', correct: false },
        ],
        explanation:
          'V, R, and I are present, but O (organization) is missing — the resource cannot be fully exploited. Resources without the organizational ability to leverage them do not yield sustained advantage.',
      },
    ],
  },

  326: {
    id: 326,
    title: 'Core competence — turning organizational capability into competitive source',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'See the company through "capabilities," not businesses',
        content:
          'In 1990, C.K. Prahalad and Gary Hamel proposed a major shift in viewpoint in "The Core Competence of the Corporation": "view the firm as a portfolio of competencies (capabilities), not as a portfolio of businesses."\n\nA core competence is an organizational capability that meets three conditions: ① delivers value to customers, ② can be deployed across multiple businesses, ③ is hard for competitors to imitate.\n\nExample: Honda\'s engine technology was deployed in motorcycles, cars, lawnmowers, and generators. Sony\'s "miniaturization" and Canon\'s "precision optics" are similar. The unit of competitive advantage is not the business name but "what kind of organization, capable of doing what."',
      },
      {
        type: 'explain',
        title: 'How competencies grow',
        content:
          'Core competencies cannot be bought. They develop only over time through cycles of "try → learn → accumulate within the organization."\n\nPrahalad and Hamel also proposed "strategic intent." Set an ambitious goal beyond what current capabilities can reach, and develop capabilities to fill the gap. By "stretching" beyond current ability, the organization grows.\n\n:::point\nCore competence is not a "stocktake of resources today." It is a dynamic question: "looking back from the future, which capabilities should we be growing now?"\n:::',
      },
      {
        type: 'quiz',
        question: 'Which is the correct combination of the three conditions of a core competence?',
        options: [
          { label: '① low cost, ② mass production, ③ brand power', correct: false },
          { label: '① creates customer value, ② can be deployed across multiple businesses, ③ hard to imitate', correct: true },
          { label: '① has patents, ② is publicly listed, ③ many employees', correct: false },
          { label: '① domestic share #1, ② high overseas sales ratio, ③ high profit margin', correct: false },
        ],
        explanation:
          'Prahalad & Hamel\'s definition is "customer value, deployability, inimitability." Not a mere strength but "a capability that runs through multiple businesses and creates the future."',
      },
      {
        type: 'quiz',
        question: 'Which is the most valid difference between core-competence management and PPM?',
        options: [
          { label: 'PPM treats businesses as "cash-generating units"; core competence treats them as "capability-generating units"', correct: true },
          { label: 'PPM is modern; core competence is classical theory', correct: false },
          { label: 'Both are the same concept under different names', correct: false },
          { label: 'PPM recommends diversification; core competence recommends focus', correct: false },
        ],
        explanation:
          'PPM treats businesses as independent "cash-generating units" and ignores common capabilities. Core competence sees "capabilities running through businesses" as the competitive source. The viewpoint shifts from business to capability.',
      },
    ],
  },

  327: {
    id: 327,
    title: 'Blue Ocean Strategy — creating uncontested markets',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'Win without fighting',
        content:
          'In 2005, Kim & Mauborgne proposed a different angle in "Blue Ocean Strategy."\n\nRed Ocean = the bloody fight inside an existing market. The world where Porter\'s generic strategies apply.\nBlue Ocean = a new market space free of competition.\n\nSaid to be impossible, this dual goal becomes possible if you redraw the market\'s boundaries — that\'s their claim.\n\n:::point\nTheir question is not "cost or differentiation?" but "is there a way to lower cost while raising value?"\n:::',
      },
      {
        type: 'explain',
        title: 'ERRC — redesigning value and boundaries',
        content:
          'The tool for creating blue oceans is the "ERRC grid."\n\nE (Eliminate) — among industry conventions, what is truly unnecessary? → eliminate (lowers cost)\nR (Reduce) — which elements are over-served? → reduce (lowers cost)\nR (Raise) — what should we raise above industry norms? → raise (lifts value)\nC (Create) — what does the industry not yet provide? → create (lifts value)\n\nExample: Cirque du Soleil eliminated "animals and star performers" from traditional circus and created "artistic and narrative content." It built a new market combining circus and theater, raising customer spend along the way.',
      },
      {
        type: 'quiz',
        question: 'What is the biggest difference between Blue Ocean Strategy and Porter\'s generic strategies?',
        options: [
          { label: 'It is meant for small and medium-sized firms', correct: false },
          { label: 'It pursues simultaneous low cost and differentiation (high value)', correct: true },
          { label: 'It specializes in overseas-market strategies', correct: false },
          { label: 'It is exclusive to the IT industry', correct: false },
        ],
        explanation:
          'Porter forces a tradeoff — "cost or differentiation." Blue Ocean argues both are achievable when you redraw market boundaries. Cutting waste with ERRC while adding new value is the core of dual achievement.',
      },
      {
        type: 'quiz',
        question: 'Which is the most appropriate use of "Eliminate" in ERRC?',
        options: [
          { label: 'Cut out elements competitors all do but customers don\'t much value', correct: true },
          { label: 'Shrink your own core feature', correct: false },
          { label: 'Imitate every feature competitors have', correct: false },
          { label: 'Cut the feature that ranks #1 in customer surveys', correct: false },
        ],
        explanation:
          'Eliminate means dropping "industry-standard elements that don\'t actually contribute to customer value." This drops cost dramatically and frees up budget to fund Raise/Create.',
      },
    ],
  },

  328: {
    id: 328,
    title: 'Dynamic capabilities — organizational ability to adapt to change',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'Advantage no longer "persists"',
        content:
          'RBV taught that "hard-to-imitate resources yield sustained advantage." But after 2000, in a world where technology, customer needs, and regulations shift rapidly, "sustained advantage" became an illusion. Today\'s strength can become tomorrow\'s shackle.\n\nThis is where David Teece proposed "dynamic capabilities." Rather than fixed resources, the source of advantage is "the ability to continually reconfigure your resources and capabilities to match the changing environment."',
      },
      {
        type: 'explain',
        title: 'Sense, Seize, Transform',
        content:
          'Teece broke dynamic capabilities into three organizational abilities.\n\nSense: detect environmental change, new opportunities, and threats. Continuously read markets, technology, and competitors.\nSeize: deploy resources against detected opportunities and design and execute new business models.\nTransform: reconfigure existing organizations and assets and evolve into new forms. Includes the courage to shed old success patterns.\n\nExample: Fujifilm sensed the collapse of the photographic-film market, seized opportunities in cosmetics and pharmaceuticals, and transformed R&D and the organization. The gap with Kodak — which failed at this — lay precisely here.',
      },
      {
        type: 'think',
        question: 'Pick one company you know that "failed to adapt to environmental change," and articulate where it got stuck — Sense, Seize, or Transform.',
        hint: 'Did it stop at "couldn\'t notice (Sense)," "noticed but couldn\'t move (Seize)," or "moved but couldn\'t let go of the old organization (Transform)"?',
        modelAnswer:
          'Example (Kodak):\n\nSense: ◯ It internally invented the world\'s first digital camera. It did detect the change.\nSeize: △ It invested in the digital business but delayed the decision that would cannibalize its core film business.\nTransform: It could not bring itself to reconfigure film-manufacturing facilities, distribution, and people — and kept the legacy business propped up.\n\nConclusion: Kodak is the textbook case of "sensed but failed to transform." Fujifilm, from the same sensing, boldly reconfigured into cosmetics (collagen technology) and pharmaceuticals. The gap was the Transform capability.',
        points: [
          '"Notice," "move," and "let go" are different abilities — missing even one leads to failure',
          'Many Japanese firms are strong at Sense but lack the courage to Transform by shedding legacy businesses',
          'Acting only when crisis hits is too late. The essence is to "exercise the muscle of reconfiguration" in peacetime',
        ],
      },
      {
        type: 'quiz',
        question: 'What is the biggest difference in viewpoint between dynamic capabilities and the original RBV?',
        options: [
          { label: 'It looks at industry structure rather than internal resources', correct: false },
          { label: 'It values "reconfiguring" capabilities to match a changing environment over "having" resources', correct: true },
          { label: 'It focuses solely on cost reduction', correct: false },
          { label: 'It seeks to maximize short-term profit', correct: false },
        ],
        explanation:
          'RBV centers on "owning hard-to-imitate resources." Dynamic capabilities evolved this: "since the environment changes, the source of advantage is the ability to keep reconfiguring resources, not the resources themselves."',
      },
      {
        type: 'quiz',
        question: 'Among Teece\'s "Sense, Seize, Transform," which is the "detecting change" stage?',
        options: [
          { label: 'Sense', correct: true },
          { label: 'Seize', correct: false },
          { label: 'Transform', correct: false },
          { label: 'All three happen simultaneously', correct: false },
        ],
        explanation:
          'Sense = detect opportunities and threats; Seize = grasp the opportunity and deploy resources; Transform = reconfigure the organization. The first gateway is Sense.',
      },
    ],
  },

  329: {
    id: 329,
    title: 'Platform strategy — ecosystems and co-evolution',
    category: 'Business strategy',
    steps: [
      {
        type: 'explain',
        title: 'From single-firm wins to ecosystem wins',
        content:
          'The protagonist of 21st-century strategy theory is the "platform." Apple\'s App Store, Google\'s Android, Amazon, Mercari, Uber — none of them build everything in-house. They generate value by drawing in external participants (developers, sellers, drivers).\n\nThe essence of a platform is the network effect. The more users, the more attractive it is to developers; the more developers, the more attractive it is to users. Ride this self-reinforcing loop and latecomers cannot catch up.\n\nHere the unit of strategy expands from "the firm" to "the ecosystem (the biome of participants)."',
      },
      {
        type: 'explain',
        title: 'Co-evolution — growing alongside participants',
        content:
          'Traditional competitive strategy was "the fight against rivals." Platform strategy centers on "collaboration with participants." If the platform doesn\'t let participants make money, the ecosystem dies.\n\nKey design points: ① rules under which participants can prosper, ② trustworthy mechanisms (payments, ratings, dispute resolution), ③ accelerating network effects, ④ keep the platform\'s take "appropriately thin."\n\nPlatform and participants evolve each other, and the entire biome grows. This is called "co-evolution."\n\n:::point\nNo longer self-contained, but growing together with outside parties. That is the keyword of modern strategy.\n:::',
      },
      {
        type: 'quiz',
        question: 'In platform strategy, what does "network effect" refer to?',
        options: [
          { label: 'The effect that faster internet connections raise sales', correct: false },
          { label: 'The effect that as participants (users or developers) increase, the value to each participant also increases', correct: true },
          { label: 'The effect that running social-media ads grows sales', correct: false },
          { label: 'The effect that a wider employee network makes hiring easier', correct: false },
        ],
        explanation:
          'A network effect is a self-reinforcing loop where "number of participants × utility per participant" rises together. It is a platform\'s greatest source of advantage; once it spins, latecomers struggle to catch up.',
      },
      {
        type: 'quiz',
        question: 'Which sentence best summarizes the evolution of management strategy?',
        options: [
          { label: 'The unit of competitive advantage has expanded from industry structure (outside) → internal resources → dynamic capabilities → ecosystems', correct: true },
          { label: 'It has evolved single-mindedly toward cost reduction', correct: false },
          { label: 'It has been exported from Japanese firms to the West', correct: false },
          { label: 'The theory has stayed the same; only the terminology changes', correct: false },
        ],
        explanation:
          'Since Taylor, strategy theory has expanded the unit of advantage from "outside (industry structure, Five Forces)" → "inside (RBV, core competence)" → "dynamic (dynamic capabilities)" → "co-evolution with the outside (platforms)." This is the historical arc of "the evolution of management strategy."',
      },
    ],
  },
}
