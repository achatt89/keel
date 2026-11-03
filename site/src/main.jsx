import { createRoot } from 'react-dom/client';
import '@thelogicatelier/ui/fonts/fonts.css';
import '@thelogicatelier/ui/tla.css';
import './site.css';
import { App } from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
