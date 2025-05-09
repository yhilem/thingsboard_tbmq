///
/// Copyright © 2016-2025 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import {
  Directive,
  ElementRef,
  OnChanges,
  OnDestroy,
  Renderer2,
  SecurityContext,
  SimpleChanges,
  input,
  output
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TbAnchorComponent } from '@shared/components/tb-anchor.component';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Directive({
    selector: '[tb-fullscreen]',
})
export class FullscreenDirective implements OnChanges, OnDestroy {

  private overlayRef: OverlayRef;
  private parentElement: HTMLElement;

  readonly fullscreen = input<boolean>();
  readonly fullscreenElement = input<HTMLElement>();
  readonly fullscreenBackgroundStyle = input<{
      [klass: string]: any;
  }>();
  readonly fullscreenBackgroundImage = input<SafeStyle | string>();

  readonly fullscreenChanged = output<boolean>();

  constructor(public elementRef: ElementRef,
              private renderer: Renderer2,
              private sanitizer: DomSanitizer,
              private overlay: Overlay) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    let updateFullscreen = false;
    for (const propName of Object.keys(changes)) {
      const change = changes[propName];
      if (!change.firstChange && change.currentValue !== change.previousValue) {
        if (propName === 'fullscreen') {
          updateFullscreen = true;
        }
      }
    }
    if (updateFullscreen) {
      if (this.fullscreen()) {
        this.enterFullscreen();
      } else {
        this.exitFullscreen();
      }
    }
  }

  ngOnDestroy(): void {
    if (this.fullscreen()) {
      this.exitFullscreen();
    }
  }

  enterFullscreen() {
    const targetElement: HTMLElement = this.fullscreenElement() || this.elementRef.nativeElement;
    this.parentElement = targetElement.parentElement;
    this.parentElement.removeChild(targetElement);
    targetElement.classList.add('tb-fullscreen');
    const position = this.overlay.position();
    const config = new OverlayConfig({
      hasBackdrop: false,
      panelClass: 'tb-fullscreen-parent'
    });
    config.minWidth = '100%';
    config.minHeight = '100%';
    config.positionStrategy = position.global().top('0%').left('0%')
      .right('0%').bottom('0%');

    this.overlayRef = this.overlay.create(config);
    this.overlayRef.attach(new EmptyPortal());
    const fullscreenBackgroundStyle = this.fullscreenBackgroundStyle();
    if (fullscreenBackgroundStyle) {
      for (const key of Object.keys(fullscreenBackgroundStyle)) {
        this.setStyle(this.overlayRef.overlayElement, key, fullscreenBackgroundStyle[key]);
      }
    }
    const fullscreenBackgroundImage = this.fullscreenBackgroundImage();
    if (fullscreenBackgroundImage) {
      this.setStyle(this.overlayRef.overlayElement, 'backgroundImage', fullscreenBackgroundImage);
    }
    this.overlayRef.overlayElement.appendChild(targetElement);
    this.fullscreenChanged.emit(true);
  }

  private setStyle(el: any, nameAndUnit: string, value: any): void {
    const [name, unit] = nameAndUnit.split('.');
    let renderValue: string | null =
      this.sanitizer.sanitize(SecurityContext.STYLE, value as {} | string);
    if (renderValue != null) {
      renderValue = renderValue.toString();
    }
    renderValue = renderValue != null && unit ? `${renderValue}${unit}` : renderValue;
    if (renderValue != null) {
      this.renderer.setStyle(this.overlayRef.overlayElement, name, renderValue);
    } else {
      this.renderer.removeStyle(this.overlayRef.overlayElement, name);
    }
  }

  exitFullscreen() {
    const targetElement: HTMLElement = this.fullscreenElement() || this.elementRef.nativeElement;
    if (this.parentElement) {
      this.overlayRef.overlayElement.removeChild(targetElement);
      this.parentElement.appendChild(targetElement);
      this.parentElement = null;
    }
    targetElement.classList.remove('tb-fullscreen');
    if (this.elementRef) {
      this.elementRef.nativeElement.classList.remove('tb-fullscreen');
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
    this.fullscreenChanged.emit(false);
  }
}

class EmptyPortal extends ComponentPortal<TbAnchorComponent> {

  constructor() {
    super(TbAnchorComponent);
  }

}
