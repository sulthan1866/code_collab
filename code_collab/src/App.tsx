import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import SelectSesson from "./pages/SelectSesson"
import CodeEditor from "./pages/CodeEditor"

function App() {

    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<SelectSesson />} />
                    <Route path="/code" element={<CodeEditor />} />
                </Routes>
            </Router>
        </>
    )
}

export default App
