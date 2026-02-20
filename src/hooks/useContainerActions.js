import { API_BASE } from '../config'


export function useContainerActions() {
    const restart = async (name) => {
        await fetch(`${API_BASE}/api/containers/restart/${name}`, {
            method: 'POST'
        })
    }

    const stop = async (name) => {
        await fetch(`${API_BASE}/api/containers/stop/${name}`, {
            method: 'POST'
        })
    }

    return { restart, stop }
}