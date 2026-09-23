const SESSION_KEY = "komahouse_started";
const firstSession = sessionStorage.getItem(SESSION_KEY) === null;
sessionStorage.setItem(SESSION_KEY, "true");
export function isFirstSession(): boolean {
  return firstSession;
}
