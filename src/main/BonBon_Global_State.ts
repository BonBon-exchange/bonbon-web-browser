let state: Record<string, any> = {
    isChatActive: false
}

export const setState = (key: string, value: any) => {
    state = { ...state, [key]: value }
}
export const getState = (key?: string) => key ? state[key] : state

export const getStateAt = (path: string) => {
    const keys = path.split('.');
    let stateOperator = state; // Use the original state reference

    const stateAt = keys.reduce((acc, val) => {
        if (acc && typeof acc === 'object') {
            return acc[val] ?? undefined;
        }
        return undefined;
    }, stateOperator);

    return stateAt;
};

export const setStateAt = (path: string, value: any) => {
    const keys = path.split('.');
    const lastKey = keys.pop();
    if (!lastKey) return;

    let nested = state;

    keys.reduce((acc, val) => {
        if (!acc[val] || typeof acc[val] !== 'object') {
            acc[val] = {}; // Ensure to initialize the path if it doesn't exist
        }
        return acc[val];
    }, nested)[lastKey] = value; // Set the value at the last key
};