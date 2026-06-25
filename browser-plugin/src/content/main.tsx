import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PopoverApp from './popover/App'

console.log('Hello world from content script!')

const container = document.createElement('div')
container.id = 'whose-note-popover-app'
document.body.appendChild(container)
createRoot(container).render(
    <StrictMode>
        <PopoverApp />
    </StrictMode>,
)
