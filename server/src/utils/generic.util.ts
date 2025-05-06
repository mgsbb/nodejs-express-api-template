export const filterUndefinedValues = (obj: any) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => value !== undefined)
    );
};

export const filterNullValues = (obj: any) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => value !== null)
    );
};

/**
 *
 * @param date - new Date().toISOString()
 *
 * @returns date string in the format yyyymmdd_HHMMSS
 */
export const formatDateISO = (date: string) => {
    const dateStr = date.split('T')[0].replace(/-/g, '');
    const timeStr = date.split('T')[1].split('.')[0].replace(/:/g, '');

    return `${dateStr}_${timeStr}`;
};
