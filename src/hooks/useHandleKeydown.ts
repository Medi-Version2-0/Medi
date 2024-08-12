import { useEffect } from 'react'

export default function useHandleKeydown(handler: (event: KeyboardEvent) => void, dependencies: React.DependencyList = []) {
    useEffect(() => {
        document.addEventListener('keydown', handler);
        return () => {
            document.removeEventListener('keydown', handler);
        };
    }, dependencies)
}
