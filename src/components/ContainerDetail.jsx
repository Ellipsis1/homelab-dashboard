import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './ContainerDetail.css'
import { useContainerActions } from '../hooks/useContainerActions'
import { API_BASE, SERVICE_URLS } from '../config'

function ContainerDetail() {
    const { name } = useParams()
    const navigate = useNavigate()
    const [history, setHistory] = useState([])
    const [current, setCurrent] = useState(null)
    const [restarting, setRestarting] = useState(false)
    const [hours, setHours] = useState(24)
    const { restart, stop } = useContainerActions()

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current status
                const currentRes = await fetch(`${API_BASE}/api/containers`)
                const containers = await currentRes.json()
                const found = containers.find(c => c.name === name)
                setCurrent(found)

                // Fetch history for this container
                const historyRes = await fetch(
                    `${API_BASE}/api/containers/history/${name}?hours=${hours}`
                )
                const historyData = await historyRes.json()
                setHistory(historyData)
            } catch (error) {
                console.error('Failed to fetch container details:', error)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [name, hours])

    const handleRestart = async () => {
        setRestarting(true)
        try {
            await restart(name)
        } catch (error) {
            console.error('Restart failed:', error)
        } finally {
            setTimeout(() => setRestarting(false), 5000)
        }
    }

    const handleStop = async () => {
        try {
            await stop(name)
        } catch (error) {
            console.error('Stop failed:', error)
        }
    }

    // Format history for chart
    const chartData = history.map(h => ({
        time: new Date(h.checkedAt).toLocaleTimeString(),
        status: h.status.toLowerCase().startsWith('up') ? 1 : 0
    }))

    // Calculate uptime percentage
    const uptimePercent = history.length > 0
        ? Math.round((history.filter(h =>
            h.status.toLowerCase().startsWith('up')
        ).length / history.length) * 100)
        : null

    const isRunning = current?.status.toLowerCase().startsWith('up')

    return (
        <div className="detail">
            <button className="back-btn" onClick={() => navigate('/')}>
                ← Back
            </button>

            <div className="detail-header">
                {SERVICE_URLS[name] && (
                    <a
                        href={SERVICE_URLS[name]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="service-link"
                    >
                        Open {name} →
                    </a>
                )}
                <div className={`detail-dot ${isRunning ? 'running' : 'stopped'}`} />
                <h2>{name}</h2>
                <span className={`detail-status ${isRunning ? 'running' : 'stopped'}`}>
          {isRunning ? 'Running' : 'Stopped'}
        </span>
            </div>

            {current && (
                <div className="detail-meta">
                    <span>Image: {current.image}</span>
                    {uptimePercent !== null && (
                        <span>24h Uptime: <strong>{uptimePercent}%</strong></span>
                    )}
                    <span>Snapshots: {history.length}</span>
                </div>
            )}

            <div className="detail-card">
                <div className="chart-header">
                    <h3>Status History</h3>
                    <div className="hours-toggle">
                        {[1, 6, 24].map(h => (
                            <button
                                key={h}
                                className={`toggle-btn ${hours === h ? 'active' : ''}`}
                                onClick={() => setHours(h)}
                            >
                                {h}h
                            </button>
                        ))}
                    </div>
                </div>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={120}>
                        <LineChart data={chartData}>
                            <XAxis dataKey="time" hide />
                            <YAxis domain={[0, 1]} hide />
                            <Tooltip
                                formatter={(value) => [value === 1 ? 'Running' : 'Stopped', 'Status']}
                            />
                            <Line
                                type="stepAfter"
                                dataKey="status"
                                stroke="#48bb78"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="no-data">No history yet — check back after a few minutes</p>
                )}
            </div>

            <div className="detail-actions">
                {isRunning && (
                    <button className="stop-btn-large" onClick={handleStop}>
                        ⏹️ Stop Container
                    </button>
                )}
                <button className="restart-btn-large" onClick={handleRestart} disabled={restarting}>
                    {restarting ? '⏳ Restarting...' : '🔄 Restart Container'}
                </button>
            </div>
        </div>
    )
}

export default ContainerDetail