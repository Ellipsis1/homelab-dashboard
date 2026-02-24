import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Reports.css'

function Reports() {
    const navigate = useNavigate()
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)

    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const monthStr = String(month + 1).padStart(2, '0')
                const start = `${year}-${monthStr}-01`
                const end = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`
                const response = await fetch(`/api/reports?start=${start}&end=${end}`)
                const data = await response.json()
                setReports(Array.isArray(data) ? data : [])
                setLoading(false)
            } catch (error) {
                console.error('Failed to fetch reports:', error)
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    const getDateUptime = (day) => {
        const monthStr = String(month + 1).padStart(2, '0')
        const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`
        const dayReports = reports.filter(r => r.reportDate === dateStr)
        if (dayReports.length === 0) return null
        return dayReports.reduce((sum, r) => sum + r.uptimePercentage, 0) / dayReports.length
    }

    const getDateColor = (uptime) => {
        if (uptime === null) return null
        if (uptime === 100) return 'cell-green'
        if (uptime >= 90) return 'cell-yellow'
        return 'cell-red'
    }

    const handleDayClick = (day) => {
        const monthStr = String(month + 1).padStart(2, '0')
        const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`
        const dayReports = reports.filter(r => r.reportDate === dateStr)
        if (dayReports.length > 0) setSelectedDate({ date: dateStr, reports: dayReports })
    }

    const overallUptime = reports.length > 0
        ? (reports.reduce((sum, r) => sum + r.uptimePercentage, 0) / reports.length).toFixed(2)
        : null

    const totalIncidents = reports.reduce((sum, r) => sum + r.incidentCount, 0)

    return (
        <div className="reports-page">
            <div className="reports-topbar">
                <button className="back-btn" onClick={() => navigate('/')}>← Dashboard</button>
                <div className="reports-title">
                    <span className="reports-label">UPTIME REPORT</span>
                    <span className="reports-period">{monthNames[month].toUpperCase()} {year}</span>
                </div>
                <div className="reports-stats">
                    {overallUptime && (
                        <>
                            <div className="stat-chip">
                                <span className="stat-chip-label">AVG UPTIME</span>
                                <span className={`stat-chip-value ${parseFloat(overallUptime) === 100 ? 'green' : 'yellow'}`}>
                  {overallUptime}%
                </span>
                            </div>
                            <div className="stat-chip">
                                <span className="stat-chip-label">INCIDENTS</span>
                                <span className={`stat-chip-value ${totalIncidents === 0 ? 'green' : 'red'}`}>
                  {totalIncidents}
                </span>
                            </div>
                            <div className="stat-chip">
                                <span className="stat-chip-label">SERVICES</span>
                                <span className="stat-chip-value">{new Set(reports.map(r => r.containerName)).size}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-bar" />
                    <span>Fetching report data...</span>
                </div>
            ) : (
                <div className="reports-body">
                    <div className="calendar-panel">
                        <div className="panel-header">
                            <span className="panel-title">DAILY UPTIME HEATMAP</span>
                            <div className="legend">
                                <span className="legend-item"><span className="legend-dot green" />100%</span>
                                <span className="legend-item"><span className="legend-dot yellow" />90-99%</span>
                                <span className="legend-item"><span className="legend-dot red" />&lt;90%</span>
                                <span className="legend-item"><span className="legend-dot empty" />No data</span>
                            </div>
                        </div>

                        <div className="calendar">
                            <div className="calendar-header">
                                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                                    <div key={d} className="day-label">{d}</div>
                                ))}
                            </div>
                            <div className="calendar-grid">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                    <div key={`empty-${i}`} className="day-cell empty" />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1
                                    const uptime = getDateUptime(day)
                                    const colorClass = getDateColor(uptime)
                                    const isToday = day === today.getDate()
                                    return (
                                        <div
                                            key={day}
                                            className={`day-cell ${colorClass || 'no-data'} ${isToday ? 'today' : ''} ${uptime !== null ? 'clickable' : ''}`}
                                            onClick={() => handleDayClick(day)}
                                        >
                                            <span className="day-number">{day}</span>
                                            {uptime !== null && (
                                                <span className="day-uptime">{uptime.toFixed(0)}%</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {selectedDate && (
                        <div className="detail-panel">
                            <div className="panel-header">
                                <span className="panel-title">SERVICES — {selectedDate.date}</span>
                                <button className="close-btn" onClick={() => setSelectedDate(null)}>✕</button>
                            </div>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>SERVICE</th>
                                    <th>UPTIME</th>
                                    <th>SNAPSHOTS</th>
                                    <th>INCIDENTS</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedDate.reports
                                    .sort((a, b) => a.containerName.localeCompare(b.containerName))
                                    .map(r => (
                                        <tr key={r.id}>
                                            <td className="service-name">{r.containerName}</td>
                                            <td>
                          <span className={`uptime-badge ${r.uptimePercentage === 100 ? 'badge-green' : r.uptimePercentage >= 90 ? 'badge-yellow' : 'badge-red'}`}>
                            {r.uptimePercentage}%
                          </span>
                                            </td>
                                            <td className="mono">{r.totalSnapshots.toLocaleString()}</td>
                                            <td className={r.incidentCount > 0 ? 'incident-count' : 'mono'}>{r.incidentCount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Reports