import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import reportWebVitals from './reportWebVitals';
import { UserProvider } from './UserContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ControlRoomProvider } from './ControlRoomContext';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const { store } = configureStore();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ControlRoomProvider>
          <App />
        </ControlRoomProvider>
      </UserProvider>
      <ToastContainer />
    </QueryClientProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
