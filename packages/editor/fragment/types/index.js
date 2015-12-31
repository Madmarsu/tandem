// TODO - some of these components are fragment classes specific.
// to other fragment classes. These will need to be moved their own packages at some point (CC)

import React from 'react';
import assert from 'assert';
import { Fragment } from 'common/registry';

export const ROOT_COMPONENT_ID = 'rootComponent';

export { Fragment };

/**
 * fragment for a factory -- used to instantiate new objects
 */

export class FactoryFragment extends Fragment {

  /**
   * @param {{create:Function}} properties.factory the object factory
   */

  constructor(properties) {
    assert(properties.factory, 'factory is missing');
    var factory = properties.factory;
    super({
      ...properties,
      factory: {
        create: (props, ...args) => {
          props.fragmentId = this.id;
          return factory.create(props, ...args);
        }
      }
    });
  }
}

/**
 * React Component fragment used to compose other react components
 */

export class ComponentFragment extends Fragment {

  /**
   *
   * @param {{ componentClass:Class }} properties
   */

  constructor(properties) {

      assert(properties.componentClass, 'component class is missing');

      super({ type: 'component', ...properties, factory: {
        create(props, children) {
          return React.createElement(properties.componentClass, props, children);
        }
      }
    });
  }
}

/**
 * Fragment for the root react component
 */

export class RootComponentFragment extends ComponentFragment {
  constructor(properties) {
    super({ id: ROOT_COMPONENT_ID, ...properties });
  }
}

/**
 * Component fragment for sidebar panels
 */

export class PaneComponentFragment extends ComponentFragment {
  constructor(properties) {
    super({ componentType: 'pane', ...properties });
  }
}

/**
 * React component fragment for project-specific panels
 */

export class AppPaneComponentFragment extends ComponentFragment {
  constructor(properties) {
    super({ componentType: 'pane', paneType: 'app', ...properties });
  }
}

/**
 * React component fragment for entity specific panels
 */

export class EntityPaneComponentFragment extends ComponentFragment {
  constructor(properties) {
    super({ componentType: 'pane', paneType: 'entity', ...properties });
  }
  matchesQuery(query) {
    return query.paneType === this.paneType && query.entity && query.entity.type === this.entityType;
  }
}

/**
 * label fragment for entity layers
 */

export class EntityLayerLabelComponentFragment extends ComponentFragment {
  constructor(properties) {
    super({ componentType: 'label', labelType: 'text', ...properties });
  }
}

/**
 * Application plugin fragment
 */

export class ApplicationFragment extends FactoryFragment {
  constructor(properties) {
    super({ type: 'application', ...properties });
  }
}

/**
 * Preview fragment which displays visual representation of the entity that the
 * user is editing
 */

export class PreviewComponentFragment extends ComponentFragment {
  constructor(properties) {
    super({ componentType: 'preview', ...properties });
  }
}

/**
 * keyboard shortcut fragment
 */

export class KeyCommandFragment extends Fragment {

  /**
   *
   * @param {String} properties.keyCommand the keyboard binding to register
   * @param {BaseNotifier} properties.notifier the notifier to notify whenever the keyCommand is executed
   */

  constructor(properties) {

    assert(properties.keyCommand, 'key command must exist');
    assert(properties.notifier  , 'notifier must exist');

    super({ type: 'keyCommand', ...properties });
  }
}

/**
 * factory fragment for an entity which makes up a project
 */

export class EntityFragment extends FactoryFragment {

  /**
   *
   * @inherit
   */

  constructor(properties) {
    super({ type: 'entity', ...properties });
  }
}

/**
 * A unit of measurement such as px, %, em, cm.
 */

export class UnitFragment extends Fragment {
  constructor(unit) {
    super({ id: unit + 'UnitFragment', type: 'unit', unit: unit, label: unit, value: unit });
  }
}
