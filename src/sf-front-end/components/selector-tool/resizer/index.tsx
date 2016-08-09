import * as React from "react";
import { startDrag } from "sf-front-end/utils/component";
import PathComponent from "./path";
import { BoundingRect } from "sf-core/geom";
import { FrontEndApplication } from "sf-front-end/application";
import { DisplayEntityCollection } from "sf-front-end/selection";

const POINT_STROKE_WIDTH = 0;
const POINT_RADIUS       = 3;

class ResizerComponent extends React.Component<{ app: FrontEndApplication, selection: DisplayEntityCollection, zoom: number, pointRadius?: number, strokeWidth?: number }, any> {

  private _dragger: any;
  private _movingTimer: any;
  private _dragTimer: any;

  constructor() {
    super();
    this.state = {};
  }

  onDoubleClick = () => {
    // this.props.bus.execute({
    //   type      : ENTITY_PREVIEW_DOUBLE_CLICK,
    //   selection : this.props.selection,
    // });
  }

  get targetDisplay() {
    return this.props.selection.display;
  }

  get file() {
    return this.props.app.editor.file;
  }

  updatePoint = (point, event) => {

    const keepAspectRatio = event.shiftKey;
    const keepCenter      = event.altKey;

    const selection = this.props.selection;

    // no ZOOM
    const style = this.targetDisplay.bounds;

    const props = {
      left   : style.left,
      top    : style.top,
      width  : style.width,
      height : style.height
    };

    if (/^n/.test(point.id)) {
      props.top    = point.currentStyle.top + point.top / this.props.zoom;
      props.height = point.currentStyle.height - point.top / this.props.zoom;
    }

    if (/e$/.test(point.id)) {
      props.width = point.left / this.props.zoom;
    }

    if (/^s/.test(point.id)) {
      props.height = point.top / this.props.zoom;
    }

    if (/w$/.test(point.id)) {
      props.width = point.currentStyle.width - point.left / this.props.zoom;
      props.left  = point.currentStyle.left + point.left / this.props.zoom;
    }

    // ensure that the ratio between the width & the height
    // is always the same (no skewing) if the shift key is down.
    if (keepAspectRatio) {
      const diffPerc = Math.min(props.width / point.currentStyle.width, props.height / point.currentStyle.height);

      props.width = point.currentStyle.width * diffPerc;
      props.height = point.currentStyle.height * diffPerc;
    }

    if (keepCenter) {
      props.left = point.currentStyle.left + (point.currentStyle.width / 2 - props.width / 2);
      props.top  = point.currentStyle.top + (point.currentStyle.height / 2 - props.height / 2);
    }

    this.targetDisplay.bounds = new BoundingRect(
      props.left,
      props.top,
      props.left + props.width,
      props.top + props.height
    );
    // this.targetDisplay.setBoundingRect(props);
    this._isMoving();
  }

  /**
   */

  _isMoving() {
    clearTimeout(this._movingTimer);
    clearTimeout(this._dragTimer);
    // this.props.selection.preview.setProperties({ moving: true });
    this.setState({ dragging: true });
    this._movingTimer = setTimeout(() => {
      // this.props.selection.preview.setProperties({ moving: false });
    }, 1000);
    this._dragTimer = setTimeout(() => {
      this.setState({ dragging: false });
    }, 100);
  }

  startDragging = (event) => {
    event.stopPropagation();
    const selection = this.props.selection;

    // when dragging, need to fetch style of the selection
    // so that the dragger is relative to the entity"s position
    const style = this.targetDisplay.bounds;

    const sx2 = style.left;
    const sy2 = style.top;


    this._dragger = startDrag(event, (event2, { delta }) => {

      // if (!this.targetDisplay.capabilities.movable) return;

      const nx = sx2 + delta.x / this.props.zoom;
      const ny = sy2 + delta.y / this.props.zoom;

      // guide.snap - todo
      const bounds = {
        left   : nx,
        top    : ny,
        width  : style.width,
        height : style.height,
      };

      this.setState({
        dragBounds: bounds
      });

      this.moveTarget(bounds.left, bounds.top);
    }, () => {
      this.file.save();
      this._dragger = void 0;
    });
  }

  onPointMouseUp = () => {
    this.file.save();
  }


  moveTarget(left, top) {
    this._isMoving();
    this.targetDisplay.position = { left, top };
  }

  render() {

    const pointRadius = (this.props.pointRadius || POINT_RADIUS);
    const strokeWidth = (this.props.strokeWidth || POINT_STROKE_WIDTH);
    const preview = this.props.selection.display;

    const rect       = preview.bounds;
    const zoomedRect = rect.zoom(this.props.zoom);

    const cw = (pointRadius + strokeWidth) * 2;

    // offset stroke
    const resizerStyle = {
      left     : zoomedRect.left - cw / 2 - 1,
      top      : zoomedRect.top  - cw / 2 - 1
    };

    const capabilities = preview.capabilities;
    const movable = capabilities.movable;

    const points = [
      ["nw", movable === true, 0, 0],
      ["n", movable === true, zoomedRect.width / 2, 0],
      ["ne", movable === true, zoomedRect.width, 0],
      ["e", true, zoomedRect.width, zoomedRect.height / 2],
      ["se", true, zoomedRect.width, zoomedRect.height],
      ["s", true, zoomedRect.width / 2, zoomedRect.height],
      ["sw", movable === true, 0, zoomedRect.height],
      ["w", movable === true, 0, zoomedRect.height / 2],
    ].map(([id, show, left, top], i) => ({
      id: id,
      index: i,
      show: show,

      // no zoom
      currentStyle: rect,
      left: left,
      top: top
    }));

    return (
      <div
        ref="selection"
        className="m-selector-component--selection"
        style={resizerStyle}
        onMouseDown={this.startDragging}
        onDoubleClick={this.onDoubleClick}
      >
        <PathComponent
          showPoints={capabilities.resizable && !this.state.dragging}
          onPointChange={this.updatePoint}
          onPointMouseUp={this.onPointMouseUp}
          zoom={this.props.zoom}
          points={points}
          strokeWidth={strokeWidth}
          pointRadius={pointRadius}
        />
      </div>
    );
  }
}

export default ResizerComponent;