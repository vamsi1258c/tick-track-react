import { useEffect, useRef } from 'react';

function useIdleTimeout(onTimeout, timeoutDuration = 300000) { // 300,000 ms = 5 minutes
    const timeoutRef = useRef(null);

    useEffect(() => {
        const resetTimer = () => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(onTimeout, timeoutDuration);
        };

        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        // Reset the timer on any of these events
        const handleActivity = () => resetTimer();

        events.forEach(event =>
            window.addEventListener(event, handleActivity)
        );

        // Set the initial timer
        resetTimer();

        return () => {
            // Cleanup on component unmount
            clearTimeout(timeoutRef.current);
            events.forEach(event =>
                window.removeEventListener(event, handleActivity)
            );
        };
    }, [onTimeout, timeoutDuration]);

    return null;
}

export default useIdleTimeout;
