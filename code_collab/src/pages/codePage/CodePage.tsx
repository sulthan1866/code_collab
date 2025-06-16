import { useEffect, useState } from "react";
import Toast from "../../components/Toast";
import CodeEditor from "./CodeEditor";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";

const CodePage = () => {
    const nav = useNavigate()
    const [message, setMessage] = useState('');
    const [code, setCode] = useState('');
    const [sessionId] = useState(() => {
        return localStorage.getItem('current-session') || null
    });
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || "javascript"
    })

    useEffect(() => {
        if (!sessionId) {
            nav('/');
            return;
        }
        socket.emit("join-session", sessionId);
        localStorage.setItem('current-session', sessionId);

        socket.on("receive-code", ({ code }) => {
            setCode(code);
        });

        return () => {
            socket.off("receive-code");
        };
    }, []);

    useEffect(() => {
        socket.on('message', (data: string) => {
            setMessage(data)
        })

        socket.on("language", ({ language }) => {
            setLanguage(language);
        })
    })

    useEffect(() => {
        socket.emit('send-code', { sessionId, code })
    }, [code])

    useEffect(() => {
        localStorage.setItem('language', language);
        socket.emit("language", { sessionId, language })
    }, [language])

    const handleCloseToast = () => {
        setMessage('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Toast message={message} onClose={handleCloseToast} />

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Code Editor
                            </h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Session: {sessionId}
                            </p>
                        </div>

                        {/* Language Selector */}
                        <div className="flex items-center space-x-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Language:
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-[120px]"
                            >
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="cpp">C++</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Code Editor Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-4">
                                {language.charAt(0).toUpperCase() + language.slice(1)} Editor
                            </span>
                        </div>
                    </div>

                    <div className="h-[calc(100vh-280px)] min-h-[400px]">
                        <CodeEditor code={code} setCode={setCode} language={language} />
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Changes are automatically synchronized across all connected clients
                    </p>
                </div>
            </div>
        </div>
    )
}

export default CodePage
