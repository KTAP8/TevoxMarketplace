import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Chatbot from './components/Chatbot'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Gallery from './pages/Gallery'
import About from './pages/About'
import OrderCheckout from './pages/OrderCheckout'
import OrderSuccess from './pages/OrderSuccess'
import OrderCancel from './pages/OrderCancel'
import FAQ from './pages/FAQ'
import HowItWorks from './pages/HowItWorks'

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const openChat  = () => setChatOpen(true)
  const closeChat = () => setChatOpen(false)

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-brand-dark">
        <Navbar onChatOpen={openChat} />
        <main className="flex-1">
          <Routes>
            <Route path="/"             element={<Home onChatOpen={openChat} />} />
            <Route path="/products"     element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/gallery"           element={<Gallery />} />
            <Route path="/about"             element={<About />} />
            <Route path="/order/:productId"  element={<OrderCheckout />} />
            <Route path="/order/success"     element={<OrderSuccess />} />
            <Route path="/order/cancel"      element={<OrderCancel />} />
            <Route path="/faq"               element={<FAQ />} />
            <Route path="/how-it-works"      element={<HowItWorks />} />
          </Routes>
        </main>
        <Footer />
        <Chatbot isOpen={chatOpen} onClose={closeChat} />
      </div>
    </BrowserRouter>
  )
}
