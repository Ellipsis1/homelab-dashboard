import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

function Reports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth()

    // Get all days in current month
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
                const response = await fetch(`api/reports?start=${start}&end=${end}`)
                const data = await response.json()
                if (Array.isArray(data)) {
                    setReports(data)
                } else {
                    setReports([])
                }
                setLoading(false)
            } catch (error) {
                console.error('Failed to fetch reports', error)
                setLoading(false)
            }
        }

        fetchReports()
    }, [])

    // Get average uptime for a specific date
    const getDateUptime = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padEnd(2, '0')}`
        const dayReports = reports.filter(r => r.reportDate === dateStr)
        if (dayReports.length === 0) return null
        const avg = dayReports.reduce((sum, r) => sum + r.uptimePercentage, 0) / dayReports.length
        return avg
    }

    const getDateColor = (uptime) => {
        if (uptime === null) return '#2d3748'
        if (uptime === 100) return '#48bb78'
        if (uptime >= 90) return '#f6ad55'
        return '#fc8181'
    }

    const handleDayClick = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const dayReports = reports.filter(r => r.reportDate === dateStr)
        if (dayReports.length > 0) setSelectedDate({ date: dateStr, reports: dayReports })
    }

    return (
        <div className="reports">
            <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

            <h2>{monthNames[month]} {year} — Uptime Report</h2>

            {loading ? (
                <p className="loading">Loading reports...</p>
            ) : (
                <>
                    <div className="calendar">
                        <div className="calendar-header">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
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
                                const isToday = day === today.getDate()
                                return (
                                    <div
                                        key={day}
                                        className={`day-cell ${uptime !== null ? 'has-data' : ''} ${isToday ? 'today' : ''}`}
                                        style={{ backgroundColor: getDateColor(uptime) }}
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

                    <div className="legend">
                        <span className="legend-item"><span className="legend-dot green" />100% uptime</span>
                        <span className="legend-item"><span className="legend-dot yellow" />90-99% uptime</span>
                        <span className="legend-item"><span className="legend-dot red" />Below 90%</span>
                        <span className="legend-item"><span className="legend-dot gray" />No data</span>
                    </div>

                    {selectedDate && (
                        <div className="day-detail">
                            <h3>{selectedDate.date}</h3>
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Container</th>
                                    <th>Uptime</th>
                                    <th>Snapshots</th>
                                    <th>Incidents</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedDate.reports.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.containerName}</td>
                                        <td className={r.uptimePercentage === 100 ? 'green' : 'red'}>
                                            {r.uptimePercentage}%
                                        </td>
                                        <td>{r.totalSnapshots}</td>
                                        <td>{r.incidentCount}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default Reports