export const filterUndefinedValues = (obj: any) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => value !== undefined)
    );
};
