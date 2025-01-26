export class VisualSettings {
    private static instance: VisualSettings;
    private darkMode = false;
    private brightness = 1;

    private constructor() {}

    public static getInstance(): VisualSettings {
        if (!VisualSettings.instance) {
            VisualSettings.instance = new VisualSettings();
        }
        return VisualSettings.instance;
    }

    public isDarkMode(): boolean {
        return this.darkMode;
    }

    public setDarkMode(value: boolean): void {
        this.darkMode = value;
    }

    public getBrightness(): number {
        return this.brightness;
    }

    public setBrightness(value: number): void {
        this.brightness = value;
    }
}
