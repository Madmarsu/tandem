import "reflect-metadata";

import "./preview.scss";
import * as React from "react";
import { Workspace } from "@tandem/editor/browser/models";
import { GutterComponent } from "@tandem/uikit";
import { reactEditorPreview } from "@tandem/editor/browser/preview";
import { ServiceApplication, ApplicationServiceProvider } from "@tandem/core";
import { createTestSandboxProviders } from "@tandem/sandbox/test";
import { createTestMasterApplication } from "@tandem/editor/test";
import { ReceiverService } from "@tandem/editor/common";
import { SyntheticBrowser, NoopRenderer } from "@tandem/synthetic-browser";
import { createHTMLSandboxProviders, createHTMLCoreProviders } from "@tandem/html-extension";
import { createHTMLEditorBrowserProviders } from "@tandem/html-extension/editor/browser";
import { Injector, PrivateBusProvider, BrokerBus, InjectorProvider, RootApplicationComponent } from "@tandem/common";
import {
  LayersPaneComponent,
  HTMLStylePaneComponent,
  ElementCSSPaneComponent,
  ElementAttributesPaneComponent,
} from "@tandem/html-extension/editor/browser/components";

export const renderPreview = reactEditorPreview(async () => {

  const bus = new BrokerBus();
  const injector = new Injector(
    new InjectorProvider(),
    new PrivateBusProvider(bus),
    createHTMLSandboxProviders(),
    createHTMLEditorBrowserProviders(),
    new ApplicationServiceProvider("receiver", ReceiverService),
    createTestSandboxProviders({
      mockFiles: {
        "index.css": `
        .container {
          color: red;
          background: rgba(255, 255, 255, 0);
          box-sizing: border-box;
          padding-right: border-box;
        }

        div {
          color: blue;
        }

        span {
          letter-spacing: 0.01em;
          color: red;
          display: block;
        }
        `,
        "index.html": `
          <link rel="stylesheet" href="index.css" />
          <span>
            <div class="container" style="color:#F60;">
            </div>
          </span>
        `
      }
    })
  );

  const app = new ServiceApplication(injector);
  await app.initialize();

  const workspace = injector.inject(new Workspace());
  const browser = workspace.browser = new SyntheticBrowser(injector, new NoopRenderer());
  await browser.open({ url: "index.html" });

  const document = browser.document;

  workspace.select([document.querySelector(".container")]);

  return <RootApplicationComponent bus={bus} injector={injector}>
    <div className="editor flex">
      <GutterComponent className="left">
        <LayersPaneComponent workspace={workspace} />
      </GutterComponent>
      <div className="center">
        center
      </div>
      <GutterComponent className="right">
        <ElementAttributesPaneComponent workspace={workspace} />
        <HTMLStylePaneComponent workspace={workspace} />
        <ElementCSSPaneComponent workspace={workspace} />
      </GutterComponent>
    </div>
  </RootApplicationComponent>
});