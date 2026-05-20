import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { IndexPage } from './pages/IndexPage'
import { ProfitTree } from './pages/tree/ProfitTree'
import { ThreeCFrame } from './pages/tree/ThreeCFrame'
import { WhyWhyTree } from './pages/tree/WhyWhyTree'
import { PenWrite } from './pages/whiteboard/PenWrite'
import { FadeIn } from './pages/whiteboard/FadeIn'
import { InterviewChat } from './pages/chat/InterviewChat'
import { OneOnOne } from './pages/chat/OneOnOne'
import { MeceSort } from './pages/dnd/MeceSort'
import { WhyWhyBuild } from './pages/dnd/WhyWhyBuild'
import { SalonCalc } from './pages/fermi/SalonCalc'
import { CafeRevenue } from './pages/fermi/CafeRevenue'
import { LeftIcon } from './pages/icon/LeftIcon'
import { HeaderIcon } from './pages/icon/HeaderIcon'
import { ChipQuote } from './pages/icon/ChipQuote'

// v2: 本体トーン × 上級レッスン図解
import { DeductionInduction } from './pages/v2/DeductionInduction'
import { CorrelationCausation } from './pages/v2/CorrelationCausation'
import { AbstractionLadder } from './pages/v2/AbstractionLadder'
import { PyramidPrinciple } from './pages/v2/PyramidPrinciple'
import { BayesUpdate } from './pages/v2/BayesUpdate'
import { SystemsFeedbackLoop } from './pages/v2/SystemsFeedbackLoop'

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />

        {/* v1 — 手書きノート風 14 案 */}
        <Route path="/tree/profit" element={<ProfitTree />} />
        <Route path="/tree/3c" element={<ThreeCFrame />} />
        <Route path="/tree/whywhy" element={<WhyWhyTree />} />

        <Route path="/whiteboard/pen" element={<PenWrite />} />
        <Route path="/whiteboard/fade" element={<FadeIn />} />

        <Route path="/chat/interview" element={<InterviewChat />} />
        <Route path="/chat/1on1" element={<OneOnOne />} />

        <Route path="/dnd/mece" element={<MeceSort />} />
        <Route path="/dnd/whywhy-build" element={<WhyWhyBuild />} />

        <Route path="/fermi/salons" element={<SalonCalc />} />
        <Route path="/fermi/cafe" element={<CafeRevenue />} />

        <Route path="/icon/left" element={<LeftIcon />} />
        <Route path="/icon/header" element={<HeaderIcon />} />
        <Route path="/icon/chip" element={<ChipQuote />} />

        {/* v2 — 本体トーン上級レッスン 6 案 */}
        <Route path="/v2/deduction-induction" element={<DeductionInduction />} />
        <Route path="/v2/correlation-causation" element={<CorrelationCausation />} />
        <Route path="/v2/abstraction-ladder" element={<AbstractionLadder />} />
        <Route path="/v2/pyramid-principle" element={<PyramidPrinciple />} />
        <Route path="/v2/bayes-update" element={<BayesUpdate />} />
        <Route path="/v2/systems-feedback-loop" element={<SystemsFeedbackLoop />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
