import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Chatbot from "./pages/Chatbot";
import Navbar from "./components/Navbar";
import ManageBooks from "./pages/ManageBooks";
import ManageUsers from "./pages/ManageUsers";
import Analysis from "./pages/Analysis";
import MyBorrowings from "./pages/MyBorrowings";

function App() {
    return (
        
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/manage-books" element={<ManageBooks />} />
                <Route path="/manage-users" element={<ManageUsers />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/my-borrowings" element={<MyBorrowings />}
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

