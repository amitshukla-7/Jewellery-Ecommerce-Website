import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store.js';
import axios from 'axios';
import './index.css';
import App from './App.jsx';

// Configure Axios for production
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

// Lazy-loaded screens
const CategoryScreen   = lazy(() => import('./screens/CategoryScreen.jsx'));
const LoginScreen      = lazy(() => import('./screens/LoginScreen.jsx'));
const ProductScreen    = lazy(() => import('./screens/ProductScreen.jsx'));
const CartScreen       = lazy(() => import('./screens/CartScreen.jsx'));
const ShippingScreen   = lazy(() => import('./screens/ShippingScreen.jsx'));
const PlaceOrderScreen = lazy(() => import('./screens/PlaceOrderScreen.jsx'));
const OrderScreen      = lazy(() => import('./screens/OrderScreen.jsx'));
const ProfileScreen    = lazy(() => import('./screens/ProfileScreen.jsx'));
const AdminScreen      = lazy(() => import('./screens/AdminScreen.jsx'));
const PrivateRoute     = lazy(() => import('./components/PrivateRoute.jsx'));
const AdminRoute       = lazy(() => import('./components/AdminRoute.jsx'));
import RatesWidget from './components/RatesWidget.jsx';

// Loading fallback
const Loader = () => (
  <div className="loading-wrapper">
    <div className="spinner"></div>
  </div>
);

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Public routes */}
      <Route index element={<CategoryScreen category="" />} />
      <Route path="/gold-silver"  element={<CategoryScreen category="gold-silver" />} />
      <Route path="/diamond"      element={<CategoryScreen category="diamond" />} />
      <Route path="/rings"        element={<CategoryScreen category="rings" />} />
      <Route path="/earrings"     element={<CategoryScreen category="earrings" />} />
      <Route path="/wedding"      element={<CategoryScreen category="wedding" />} />
      <Route path="/login"        element={<LoginScreen />} />
      <Route path="/product/:id"  element={<ProductScreen />} />
      <Route path="/cart"         element={<CartScreen />} />
      <Route path="/rates"        element={<RatesWidget />} />

      {/* Private (logged-in) routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/shipping"    element={<ShippingScreen />} />
        <Route path="/placeorder"  element={<PlaceOrderScreen />} />
        <Route path="/order/:id"   element={<OrderScreen />} />
        <Route path="/profile"     element={<ProfileScreen />} />
      </Route>

      {/* Admin-only routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminScreen />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </Suspense>
    </Provider>
  </StrictMode>
);
