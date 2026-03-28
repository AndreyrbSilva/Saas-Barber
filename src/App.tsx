import { BrowserRouter, Routes, Route } from "react-router-dom"
import BookingPage from "./pages/public/BookingPage"
import LoginPage from "./pages/admin/LoginPage"
import BarberSchedulePage from "./pages/admin/BarberSchedulePage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/agendar"  element={<BookingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/barbeiro" element={<BarberSchedulePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App