import uuid from 'uuid';
import Node from 'common/node';
import assert from 'assert';
import { clone } from 'common/utils/object';
import BaseObject from 'common/object/base';

export function deserialize(data, rootProps, plugins) {
  var entityPlugin = plugins.queryOne({
    id: data.props.pluginId
  });

  var entity = entityPlugin.factory.create({ ...data.props, ...rootProps }, data.children.map(function(childData) {
    return deserialize(childData, {}, plugins);
  }));

  return entity;
};

class Entity extends Node {

  constructor(properties, children) {

    assert(properties.pluginId, 'Plugin id must exist');

    // entities are represented by other things, and so an ID is necessary
    // for quickly finding related objects
    super({
      pluginId: properties.pluginId,
      id: properties.id || uuid.v1(),
      ...properties
    }, children);
  }

  serialize() {

    var data = {
      children: this.children.map(function(child) {
        return child.serialize();
      }),
      props: {}
    };

    // might break, but simple enough. Should work
    // for most cases.
    for (var key in this) {
      var value = this[key];
      if (key === 'parent' || key === 'notifier' || typeof value === 'function' || key.charAt(0) === '_') continue;
      data.props[key] = clone(value);
    }

    return data;
  }
};

export default Entity;