import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import ContainerGrid from './components/ContainerGrid'
import ContainerDetail from './components/ContainerDetail'
import './App.css'
import {API_BASE} from "./config.js";
import Reports from './components/Reports'

function App() {
    const navigate = useNavigate()
    const [containers, setContainers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchContainers = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/containers`)
                const data = await response.json()
                setContainers(data)
                setLoading(false)
            } catch (error) {
                console.error('Failed to fetch containers:', error)
                setLoading(false)
            }
        }

        fetchContainers()
        const interval = setInterval(fetchContainers, 5000)
        return () => clearInterval(interval)
    }, [])

    const runningCount = containers.filter(c =>
        c.status.toLowerCase().startsWith('up')
    ).length

    return (
        <div className="app">
            <header className="header">
                <h1> HomeLab Monitor</h1>
                <span className="subtitle">Raspberry Pi 5</span>
                <div className="header-nav">
                    <span className={runningCount === containers.length ? 'stat-good' : 'stat-warn'}>
                      {runningCount}/{containers.length} running
                    </span>
                    <button className="nav-btn" onClick={() => navigate('/reports')}>
                        Reports
                    </button>
                </div>
            </header>
            <main>
                {loading ? (
                    <p className="loading">Connecting to Docker...</p>
                ) : (
                    <Routes>
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/" element={<ContainerGrid containers={containers} />} />
                        <Route path="/containers/:name" element={<ContainerDetail />} />
                    </Routes>
                )}
            </main>
        </div>
    )
}

export default App