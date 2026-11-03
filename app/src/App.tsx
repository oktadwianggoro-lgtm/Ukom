import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import MateriKilat from './pages/MateriKilat'
import Latihan from './pages/Latihan'
import LatihanSesi from './pages/LatihanSesi'
import FokusMerah from './pages/FokusMerah'
import TryoutList from './pages/TryoutList'
import TryoutDetail from './pages/TryoutDetail'
import TryoutRunner from './pages/TryoutRunner'
import Hasil from './pages/Hasil'
import Flashcard from './pages/Flashcard'
import BankSoal from './pages/BankSoal'
import Statistik from './pages/Statistik'
import Pengaturan from './pages/Pengaturan'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materi" element={<MateriKilat />} />
          <Route path="/materi/:slug" element={<MateriKilat />} />
          <Route path="/latihan" element={<Latihan />} />
          <Route path="/latihan/sesi" element={<LatihanSesi />} />
          <Route path="/fokus-merah" element={<FokusMerah />} />
          <Route path="/tryout" element={<TryoutList />} />
          <Route path="/tryout/:id" element={<TryoutDetail />} />
          <Route path="/tryout/:id/ujian" element={<TryoutRunner />} />
          <Route path="/tryout/:id/hasil" element={<Hasil />} />
          <Route path="/flashcard" element={<Flashcard />} />
          <Route path="/bank-soal" element={<BankSoal />} />
          <Route path="/statistik" element={<Statistik />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
