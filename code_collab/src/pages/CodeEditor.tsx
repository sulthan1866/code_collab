import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import socket from "../socket"

const CodeEditor = () => {

    const nav = useNavigate()
    const [message, setMessage] = useState('');
    const [code, setCode] = useState('');
    const [sessionId] = useState(() => {
        return localStorage.getItem('current-session') || "default";
    });

    useEffect(() => {
        if (sessionId === 'default')
            nav('/')
        socket.emit("join-session", sessionId);
        localStorage.setItem('current-session', sessionId);
        //setSessionId(sessionId);

        socket.on("receive-code", ({ code }) => {
            setCode(code);
        });

        return () => {
            socket.off("receive-code");
        };
    }, []);

    useEffect(() => {
        socket.on('receive-code', ({ code }) => {
            setCode(code)
        })
        socket.on('message', (data: string) => {
            setMessage(data)
        })
    })

    useEffect(() => {
        socket.emit('send-code', { sessionId, code })
    }, [code])



    return (
        <div>
            <p>message:{message}</p>
            <textarea value={code} onChange={(e) => { setCode(e.currentTarget.value) }} ></textarea>
        </div>
    )
}

export default CodeEditor
