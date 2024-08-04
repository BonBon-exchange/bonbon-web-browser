// seludom/state.ts

class StateManager {
    private state = new Map<string, any>();

    setState(key: string, value: any): void {
        this.state.set(key, value);
    }

    getState<T = any>(key: string): T | undefined {
        return this.state.get(key);
    }

    removeState(key: string): void {
        this.state.delete(key);
    }
}

export const stateManager = new StateManager();
