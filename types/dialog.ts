/**
 * Describes the shared state required to render an action confirmation or
 * informational dialog and execute its confirmed action.
 */
export interface DialogState {
  title: string;
  message: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}
