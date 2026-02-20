import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ContainerCard.css'
import { useContainerActions } from '../hooks/useContainerActions'

function ContainerCard({ container }) {
    const [restarting, setRestarting] = useState(false)
    const navigate = useNavigate()
    const { restart, stop } = useContainerActions()

    const isRunning = container.status.toLowerCase().startsWith('up')

    const handleRestart = async () => {
        setRestarting(true)
        try {
            await restart(container.name)
        } catch (error) {
            console.error('Restart failed:', error)
        } finally {
            setTimeout(() => setRestarting(false), 5000)
        }
    }

    const handleStop = async () => {
        try {
            await stop(container.name)
        } catch (error) {
            console.error('Stop failed:', error)
        }
    }

    return (
        <div className={`card ${isRunning ? 'running' : 'stopped'}`}>
            <div className="card-header" onClick={() => navigate(`/containers/${container.name}`)}>
                <div className="status-dot" />
                <span className="container-name">{container.name}</span>
                {restarting && <span className="restarting-badge">Restarting...</span>}
            </div>
            <div className="card-body">
                <span className="status-text">{container.status}</span>
                <span className="image-text">{container.image}</span>
            </div>
            <div className="card-footer">
                {isRunning && (
                    <button className="stop-btn" onClick={handleStop}>
                        ⏹️ Stop
                    </button>
                )}
                <button className="restart-btn" onClick={handleRestart} disabled={restarting}>
                    {restarting ? '⏳ Restarting...' : '🔄 Restart'}
                </button>
            </div>
        </div>
    )
}

export default ContainerCard