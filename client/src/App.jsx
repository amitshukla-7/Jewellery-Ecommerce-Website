import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatBubble from './components/ChatBubble';

const App = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <ChatBubble />
      <Footer />
    </>
  );
};

export default App;
