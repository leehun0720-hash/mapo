import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** localStorage 기반 상태는 서버 렌더와 다를 수 있으므로, 클라이언트 마운트 뒤에만 그린다. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
