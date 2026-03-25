import { BrowserRouter, Routes, Route } from "react-router-dom";
import BookingPage from "./pages/public/BookingPage";
import LoginPage from "./pages/admin/LoginPage";

function App() {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/agendar" element={<BookingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App