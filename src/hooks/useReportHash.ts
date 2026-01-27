import { useEffect } from 'react';
import type { ReportOption } from '@/components/ReportTypeSelector';

/**
 * Custom hook to handle URL hash-based report selection
 * Reads initial hash on mount and listens for hash changes
 */
export function useReportHash<T extends string>(
    reportOptions: ReportOption<T>[],
    setSelectedReport: React.Dispatch<React.SetStateAction<T>>
) {
    // Read URL hash on mount and select corresponding report
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash && reportOptions.find(opt => opt.value === hash)) {
            setSelectedReport(hash as T);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Listen for hash changes
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && reportOptions.find(opt => opt.value === hash)) {
                setSelectedReport(hash as T);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [reportOptions, setSelectedReport]);
}
