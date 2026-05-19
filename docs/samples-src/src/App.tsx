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

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />

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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
