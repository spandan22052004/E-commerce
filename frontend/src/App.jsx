import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderSuccess from './pages/OrderSuccess';
import About from './pages/About';
import Disclaimer from './pages/Disclaimer';
import ReturnPolicy from './pages/ReturnPolicy';
import AdminDashboard from './admin/AdminDashboard';
import AddProduct from './admin/AddProduct';
import AdminProducts from './admin/AdminProducts';
import EditProduct from './admin/EditProduct';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />      //done
          <Route path="/shop" element={<Shop />} />   //done
          <Route path="/product/:id" element={<ProductDetail />} />  //done   
          <Route path="/cart" element={<Cart />} />     //done
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} /> //done
          <Route path="/register" element={<Register />} />  //done
          <Route path="/profile" element={<Profile />} /> //done
          <Route path="/ordersuccess" element={<OrderSuccess />} /> //done
          <Route path="/about" element={<About />} />  //done
          <Route path="/disclaimer" element={<Disclaimer />} />  //done
          <Route path="/return" element={<ReturnPolicy />} /> //done
          <Route path="/admin" element={<AdminDashboard />} /> //done
          <Route path="/admin/add-product" element={<AddProduct />} />//done
          <Route path="/admin/products" element={<AdminProducts />} />  //done
          <Route path="/admin/edit-product/:id" element={<EditProduct />} /> //done
          <Route path="/admin/orders" element={<AdminOrders />} /> //done
          <Route path="/admin/users" element={<AdminUsers />} /> //done
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;