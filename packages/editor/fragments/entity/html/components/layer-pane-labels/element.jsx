import './layer-input.scss';
import './element.scss';
import React from 'react';
import AutosizeInput from 'react-input-autosize';
import FocusComponent from 'common/components/focus';
import trim from 'lodash/string/trim';
//import TextInputComponent from 'common/components/text';

import {
  SetFocusMessage
} from 'editor/message-types';

const CLASS_NAME_PRIORITY = [
  'id',
  'class',
  'src'
];

class ElementLayerLabelComponent extends React.Component {

  constructor() {
    super();
    this.state = {};
  }

  editHTML(event) {
    this.setState({
      editTagName: true,
      source: this.getHTMLValue()
    });
  }

  render() {
    var entity = this.props.entity;

    var buffer = [
      <span className='m-element-layer-label--tag'>&lt;</span>
    ];

    if (this.state.editTagName) {
      buffer.push(this.renderHTMLInput());
    } else {
      buffer.push(this.state.editTagName ?
        this.renderTagNameInput() :
        <span className='m-element-layer-label--tag-name'>{entity.tagName}</span>
      );

      var attrs = [];

      // pluck out the attributes
      for (var property in entity.attributes) {
        attrs.push({
          key: property,
          value: entity.attributes[property]
        });
      }

      // filter them, and remove the items we do not want to display
      // (for now)
      attrs = attrs.filter(function (a) {
        return !!~CLASS_NAME_PRIORITY.indexOf(a.key);
      }).sort(function (a, b) {
        return CLASS_NAME_PRIORITY.indexOf(a.key) > CLASS_NAME_PRIORITY.indexOf(b.key) ? 1 : -1;
      });

      attrs.forEach(function (attr) {
        buffer.push(
          <span className='m-element-layer-label--key'>&nbsp;{attr.key}</span>,
          <span className='m-element-layer-label--operator'>=</span>,
          <span className='m-element-layer-label--string'>"{attr.value}"</span>
        )
      });
    }

    buffer.push(
      <span className='m-element-layer-label--tag'>
        { entity.children.length === 0 ? ' /' : void 0 }
        &gt;
      </span>
    );

    return <div className='m-label m-element-layer-label' onDoubleClick={this.editHTML.bind(this)}>
      { buffer }
    </div>;
  }

  onInputKeyDown(event) {
    if (event.keyCode === 13) {
      this.doneEditing();
    }
  }

  onInputChange(event) {
    this.setState({
      source: event.target.value
    })
  }

  doneEditing(event) {

    var entity = this.props.entity;

    var source = trim(String(this.state.source || ''));

    // dumb parser here...
    var tagName = source.match(/\w+/);
    var attrRegExp = /\s+(\w+)(=['"](.*?)['"])?/g;
    var attributes = source.match(attrRegExp) || [];

    if (tagName) {
      entity.tagName = tagName[0];
    }

    // delete ALL attributes
    for (var key in entity.attributes) {
      if (key === 'style') continue;
      entity.setAttribute(key, void 0);
    }

    // reset attributes with inserted text
    attributes.forEach(function(attr) {
      var match = attr.match(new RegExp(attrRegExp.source));
      entity.setAttribute(match[1], match[3]);
    });

    // TODO - this smells funny here - need to reset selection
    // otherwise stuff breaks.
    this.props.app.notifier.notify(SetFocusMessage.create([entity]));


    this.setState({
      editTagName: false
    });
  }

  onInputFocus(event) {
    event.target.select();
  }

  renderHTMLInput() {
    return <FocusComponent><AutosizeInput
      type='text'
      className='m-layer-label-input'
      onFocus={this.onInputFocus.bind(this)}
      value={this.state.source}
      onChange={this.onInputChange.bind(this)}
      onBlur={this.doneEditing.bind(this)}
      onKeyDown={this.onInputKeyDown.bind(this)}
    /></FocusComponent>;
  }

  getHTMLValue() {

    var entity = this.props.entity;
    var buffer = [entity.tagName];

    for (var key in entity.attributes) {
      var value = entity.attributes[key];
      if (typeof value === 'object') continue;
      buffer.push(' ', key, '=', '"', value, '"');
    }

    return buffer.join('');
  }
}

export default ElementLayerLabelComponent;