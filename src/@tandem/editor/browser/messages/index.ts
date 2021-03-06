import Url =  require("url");
import { uniq } from "lodash";
import { toArray } from "@tandem/common/utils/array";
import { IMessage } from "@tandem/mesh";
import { CoreEvent } from "@tandem/common/messages";
import { IRange, IPoint } from "@tandem/common/geom";
import { EditorRouteNames } from "@tandem/editor/browser/constants";
import { ISyntheticObject } from "@tandem/sandbox";
import { WorkspaceToolFactoryProvider } from "@tandem/editor/browser/providers";
import { serialize, deserialize, LogLevel, Mutation } from "@tandem/common";
import { Workspace, IWorkspaceTool, IHistoryItem, IRouterState } from "@tandem/editor/browser/stores";

export class MouseAction extends CoreEvent {

  static readonly CANVAS_MOUSE_DOWN = "canvasMouseDown";
  static readonly SELECTION_DOUBLE_CLICK = "selectionDoubleClick";

  constructor(type, readonly originalEvent: MouseEvent) {
    super(type);
    Object.assign(this, {
      clientX : originalEvent.clientX,
      clientY : originalEvent.clientY,
      metaKey : originalEvent.metaKey
    });
  }
  preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export class AlertMessage extends CoreEvent {
  static readonly ALERT = "alert";
  constructor(type: string, readonly level: LogLevel, readonly text: string) {
    super(type);
  }

  static createWarningMessage(text: string) {
    return new AlertMessage(this.ALERT, LogLevel.WARNING, text);
  }

  static createErrorMessage(text: string) {
    return new AlertMessage(this.ALERT, LogLevel.ERROR, text);
  }
}


export class ShowPromptRequest extends CoreEvent {
  static readonly PROMPT = "prompt";
  constructor(type: string, readonly render: (props: any) => any, readonly closeable: boolean = false, readonly buttons?) {
    super(type);
  }
}

export class KeyboardAction extends CoreEvent {

  static readonly CANVAS_KEY_DOWN = "canvasKeyDown";

  readonly keyCode: number;
  readonly which: number;
  constructor(type, readonly originalEvent: KeyboardEvent) {
    super(type);
    Object.assign(this, {
      which : originalEvent.which,
      keyCode: originalEvent.keyCode
    });
  }

  preventDefault() {
    this.originalEvent.preventDefault();
  }
}

export class SelectRequest extends CoreEvent {

  static readonly SELECT = "SELECT";

  public items: Array<any>;
  public keepPreviousSelection: boolean;
  public toggle: boolean;

  constructor(items: any = undefined, keepPreviousSelection = false, toggle = false) {
    super(SelectRequest.SELECT);
    this.items = toArray(items);
    this.keepPreviousSelection = !!keepPreviousSelection;
    this.toggle = toggle;
  }
}

export class RedirectRequest implements IMessage {
  static readonly REDIRECT = "redirect";
  readonly type = RedirectRequest.REDIRECT;
  constructor(readonly routeNameOrPath: string, public params?: any, readonly query?: any) {

  }

  static fromURL(value: string) {
    const parts = Url.parse(value, true);
    return new RedirectRequest(parts.pathname, {}, parts.query);
  }
}

export class DidRedirectMessage implements IMessage {
  static readonly DID_REDIRECT = "didRedirect";
  readonly type = DidRedirectMessage.DID_REDIRECT;
  constructor(readonly pathname: string, readonly state: IRouterState) {
    
  }
}

export class OpenContextMenuRequest extends CoreEvent {
  static readonly OPEN_CONTEXT_MENU = "openContextMenu";
  constructor(readonly name: string, readonly x: number, readonly y: number) {
    super(OpenContextMenuRequest.OPEN_CONTEXT_MENU);
  }
}

export class OpenLinkInNewWindowRequest extends CoreEvent {
  static readonly OPEN_LINK_IN_NEW_WINDOW = "openLinkInNewWindow";
  constructor() {
    super(OpenLinkInNewWindowRequest.OPEN_LINK_IN_NEW_WINDOW);
  }
}

export class OpenLinkInThisWindowRequest extends CoreEvent {
  static readonly OPEN_LINK_IN_THIS_WINDOW = "openLinkInThisWindow";
  constructor() {
    super(OpenLinkInThisWindowRequest.OPEN_LINK_IN_THIS_WINDOW);
  }
}

export function createWorkspaceRedirectRequest(projectId: string) {
  return new RedirectRequest("/workspace/" + projectId, {});
}

export class SelectionChangeEvent extends CoreEvent {
  static readonly SELECTION_CHANGE = "selectionChange";
  constructor(readonly items: any[] = []) {
    super(SelectionChangeEvent.SELECTION_CHANGE);
  }
}

export class SelectAllRequest extends CoreEvent {
  static readonly SELECT_ALL = "selectAll";
  constructor() {
    super(SelectAllRequest.SELECT_ALL);
  }
}


export class ToggleSelectRequest extends SelectRequest {
  constructor(items = undefined, keepPreviousSelection: boolean = false) {
    super(items, keepPreviousSelection, true);
  }
}

export class ZoomRequest extends CoreEvent {
  static readonly ZOOM = "zoom";
  constructor(readonly delta: number, readonly ease: boolean = false, readonly round: boolean = false) {
    super(ZoomRequest.ZOOM);
  }
}

export class ZoomInRequest extends CoreEvent {
  static readonly ZOOM_IN = "zoomIn";
  constructor() {
    super(ZoomInRequest.ZOOM_IN);
  }
}

export class ToggleSettingRequest extends CoreEvent {
  static readonly TOGGLE_SETTING = "toggleSetting";
  constructor(readonly settingName: string) {
    super(ToggleSettingRequest.TOGGLE_SETTING);
  }
}

export function createToggleSettingRequestClass(settingName: string): { new(): ToggleSettingRequest } {
  return class extends ToggleSettingRequest {
    constructor() {
      super(settingName);
    }
  }
} 

export class ToggleStageToolsRequest extends CoreEvent {
  static readonly TOGGLE_STAGE_TOOLS = "toggleStageTools";
  constructor() {
    super(ToggleStageToolsRequest.TOGGLE_STAGE_TOOLS);
  }
}

export class ZoomOutRequest extends CoreEvent {
  static readonly ZOOM_OUT = "zoomOut";
  constructor() {
    super(ZoomOutRequest.ZOOM_OUT);
  }
}

export class SetZoomRequest extends CoreEvent {
  static readonly SET_ZOOM = "setZoom";
  constructor(readonly value: number, readonly ease: boolean = false) {
    super(SetZoomRequest.SET_ZOOM);
  }
}

export class PasteRequest extends CoreEvent {
  constructor(readonly item: DataTransferItem) {
    super(PasteRequest.getRequestType(item));
  }

  static getRequestType(item: DataTransferItem | string) {
    return ["paste", typeof item === "string" ? item : item.type].join("/");
  }
}

export class SetToolRequest extends CoreEvent {
  static readonly SET_TOOL = "setTool";
  constructor(readonly toolFactory: { create(workspace: Workspace): IWorkspaceTool }) {
    super(SetToolRequest.SET_TOOL);
  }
}

export class AddSyntheticObjectRequest implements IMessage {
  static readonly ADD_SYNTHETIC_OBJECT = "addSyntheticObject";
  readonly type = AddSyntheticObjectRequest.ADD_SYNTHETIC_OBJECT;
  constructor(readonly item: ISyntheticObject) {
    
  }
}

export class KeyCommandEvent extends CoreEvent {
  static readonly KEY_COMMAND = "keyCommand";
  constructor(readonly combo: string) {
    super(KeyCommandEvent.KEY_COMMAND);
  }
}

export class RemoveSelectionRequest extends CoreEvent {
  static readonly REMOVE_SELECTION = "removeSelection";
  constructor() {
    super(RemoveSelectionRequest.REMOVE_SELECTION);
  }
}

export * from "../../common/messages";