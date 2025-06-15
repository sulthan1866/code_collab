import { useState } from "react"
import { useNavigate } from "react-router-dom";
import socket from "../socket";
const SelectSesson = () => {
    const nav = useNavigate()
    const [sessionId, setSessionId] = useState('')

    const joinSession = () => {
        // check if session already exixts
        // get permmision from creater
        socket.emit('join-session', sessionId);
        nav(`/code`);
        localStorage.setItem('current-session', sessionId);

    }
    const createSession = () => {
        // chak if already exists
        socket.emit('join-session', sessionId);
        nav(`/code`);
        localStorage.setItem('current-session', sessionId);

    }

    return (
        <div>

            <input type='text' value={sessionId} onChange={(e) => { setSessionId(e.currentTarget.value) }} />
            <button onClick={joinSession}>join session</button>
            <button onClick={createSession}>create Session</button>

        </div>
    )
}

export default SelectSesson
