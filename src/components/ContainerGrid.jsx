import ContainerCard from './ContainerCard'
import './ContainerGrid.css'

function ContainerGrid({ containers, onRestart }) {
    return (
        <div>
            <h2 className="section-title">Containers ({containers.length})</h2>
            <div className="grid">
                {containers.map(container => (
                    <ContainerCard
                        key={container.id}
                        container={container}
                        onRestart={onRestart}
                    />
                ))}
            </div>
        </div>
    )
}

export default ContainerGrid