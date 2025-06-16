import React, { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const languageMap: Record<string, number> = {
    javascript: 63,
    python: 71,
    cpp: 54,
};

interface Props {
    code: string;
    setCode: React.Dispatch<React.SetStateAction<string>>
    language: string;
}

const CodeEditor = ({ code, setCode, language }: Props) => {
    const [output, setOutput] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isFormatting, setIsFormatting] = useState(false);
    const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
    const [fontSize, setFontSize] = useState(16);
    const [showOutput, setShowOutput] = useState(false);
    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const pollForResult = async (token: string): Promise<any> => {
        const url = `https://judge029.p.rapidapi.com/submissions/${token}`;
        const headers = {
            'x-rapidapi-key': 'a500a81788msh9f235c522746470p1c2072jsnfa012f1d9553',
            'x-rapidapi-host': 'judge029.p.rapidapi.com',
        };

        for (let i = 0; i < 20; i++) {
            const { data } = await axios.get(url, { headers, params: { base64_encoded: 'true', fields: '*' } });
            if (data.status?.id >= 3) return data;
            await new Promise(res => setTimeout(res, 1000));
        }

        throw new Error("Timeout while waiting for execution result");
    };

    const runCode = async () => {
        setIsRunning(true);
        setShowOutput(true);
        setOutput("🚀 Submitting code for execution...");

        const encodedSourceCode = btoa(code);
        const encodedStdin = btoa("");
        const languageId = languageMap[language];

        const options = {
            method: 'POST',
            url: 'https://judge029.p.rapidapi.com/submissions',
            params: {
                base64_encoded: 'true',
                wait: 'false',
                fields: '*',
            },
            headers: {
                'x-rapidapi-key': 'a500a81788msh9f235c522746470p1c2072jsnfa012f1d9553',
                'x-rapidapi-host': 'judge029.p.rapidapi.com',
                'Content-Type': 'application/json',
            },
            data: {
                source_code: encodedSourceCode,
                language_id: languageId,
                stdin: encodedStdin,
            },
        };

        try {
            const response = await axios.request(options);
            const token = response.data.token;

            setOutput("⏳ Executing code, please wait...");

            const result = await pollForResult(token);
            const { stdout, stderr, compile_output } = result;

            if (stdout) {
                setOutput(`✅ Execution completed successfully:\n\n${atob(stdout)}`);
            } else if (stderr) {
                setOutput(`❌ Runtime Error:\n\n${atob(stderr)}`);
            } else if (compile_output) {
                setOutput(`⚠️ Compilation Error:\n\n${atob(compile_output)}`);
            } else {
                setOutput("✅ Code executed successfully (no output)");
            }
        } catch (error: any) {
            setOutput(`💥 Error: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const formatCode = async () => {
        setIsFormatting(true);
        try {
            await editorRef.current?.getAction("editor.action.formatDocument")?.run();
        } catch (error) {
            console.error("Format error:", error);
        } finally {
            setIsFormatting(false);
        }
    };

    const handleSave = () => {
        localStorage.setItem("saved", code);
        // You could add a toast notification here
    };

    const handleLoad = () => {
        const savedCode = localStorage.getItem("saved") || "";
        setCode(savedCode);
    };

    const getLanguageIcon = () => {
        switch (language) {
            case 'javascript':
                return '🟨';
            case 'python':
                return '🐍';
            case 'cpp':
                return '⚙️';
            default:
                return '📝';
        }
    };

    const toggleTheme = () => {
        setTheme(theme === "vs-dark" ? "light" : "vs-dark");
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
            {/* Enhanced Toolbar */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left side - Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={formatCode}
                            disabled={isFormatting}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors duration-200"
                        >
                            {isFormatting ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                            Format
                        </button>

                        <button
                            onClick={runCode}
                            disabled={isRunning}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white transition-colors duration-200"
                        >
                            {isRunning ? (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                            {isRunning ? 'Running...' : 'Run Code'}
                        </button>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleSave}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Save
                            </button>

                            <button
                                onClick={handleLoad}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition-colors duration-200"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Load
                            </button>
                        </div>
                    </div>

                    {/* Right side - Settings and info */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Language indicator */}
                        <div className="flex items-center px-3 py-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <span className="mr-2">{getLanguageIcon()}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                                {language}
                            </span>
                        </div>

                        {/* Font size controls */}
                        <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 px-3 py-1">
                            <button
                                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                </svg>
                            </button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[24px] text-center">
                                {fontSize}
                            </span>
                            <button
                                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </button>
                        </div>

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                            title="Toggle theme"
                        >
                            {theme === "vs-dark" ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Output toggle */}
                        <button
                            onClick={() => setShowOutput(!showOutput)}
                            className={`p-2 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors ${showOutput
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                            title="Toggle output panel"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Editor Container */}
            <div className={`flex-1 ${showOutput ? 'grid grid-cols-1 lg:grid-cols-2 gap-0' : ''}`}>
                {/* Code Editor */}
                <div className="relative border-r border-gray-200 dark:border-gray-700">
                    <Editor
                        height={showOutput ? "calc(70vh - 120px)" : "70vh"}
                        defaultLanguage={language}
                        language={language}
                        value={code}
                        onMount={handleEditorDidMount}
                        onChange={(value) => setCode(value || "")}
                        theme={theme}
                        options={{
                            fontSize: fontSize,
                            wordWrap: "on",
                            minimap: { enabled: false },
                            suggestOnTriggerCharacters: true,
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                            insertSpaces: true,
                            renderLineHighlight: "line",
                            cursorBlinking: "smooth",
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                            fontLigatures: true,
                        }}
                    />
                </div>

                {/* Output Panel */}
                {showOutput && (
                    <div className="flex flex-col bg-gray-900 text-gray-100">
                        {/* Output Header */}
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <h3 className="text-sm font-medium">Output</h3>
                            </div>
                            <button
                                onClick={() => setOutput("")}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                                title="Clear output"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        {/* Output Content */}
                        <div className="flex-1 p-4 overflow-auto">
                            {output ? (
                                <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-words">
                                    {output}
                                </pre>
                            ) : (
                                <div className="text-gray-500 text-sm italic">
                                    Click "Run Code" to see output here...
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;

