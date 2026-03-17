type LogoutListener = () => void;

let logoutListeners: LogoutListener[] = [];

export const subscribeLogout = (listener: LogoutListener) => {
  logoutListeners.push(listener);
};

export const unsubscribeLogout = (listener: LogoutListener) => {
  logoutListeners = logoutListeners.filter((l) => l !== listener);
};

export const triggerLogout = () => {
  logoutListeners.forEach((listener) => listener());
};
