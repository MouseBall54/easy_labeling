/**
 * Controllers Index
 *
 * Central export point for all controller classes and related types.
 */

// Canvas Controller
export {
  CanvasController,
  createCanvasController,
  type ICanvasController
} from './CanvasController';

// Event Manager
export {
  EventManager,
  createEventManager,
  type IEventManager,
  type EventManagerConfig,
  type KeyboardShortcut
} from './EventManager';

// Re-export related types
export type {
  CanvasState,
  CanvasConfig,
  BoundingBox,
  YOLOLabel,
  CanvasEvent,
  CanvasEventHandler,
  CanvasEventType
} from '../types/canvas';

export type {
  EventManagerEvent,
  EventManagerEventHandler,
  ContextMenuEvent,
  MouseEventType
} from '../types/ui';