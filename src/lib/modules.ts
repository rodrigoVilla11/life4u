export interface ModuleConfig {
  tasks: boolean;
  finances: boolean;
  accounts: boolean;
  goals: boolean;
  reports: boolean;
  gym: boolean;
  habits: boolean;
  study: boolean;
  calendar: boolean;
}

export const DEFAULT_MODULES: ModuleConfig = {
  tasks: true,
  finances: true,
  accounts: true,
  goals: true,
  reports: true,
  gym: true,
  habits: true,
  study: true,
  calendar: true,
};
