import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RouteGuard from '../components/RouteGuard';
import { ToastProvider } from '../context/ToastContext';

export default function App({ Component, pageProps }) {
  return (
    <ToastProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main className="container" style={{ flex: 1, width: '100%', paddingTop: 32, paddingBottom: 64 }}>
          <RouteGuard>
            <Component {...pageProps} />
          </RouteGuard>
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
