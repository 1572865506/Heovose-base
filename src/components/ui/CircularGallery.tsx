
"use client";

import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from 'ogl';
import { useEffect, useRef } from 'react';
import './CircularGallery.css';

interface GalleryItem {
  image: string;
  text: string;
  tag?: string;
  description?: string;
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(gl: any, text: string, tag = '', description = '', textColor = 'white') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return new Texture(gl);
  
  canvas.width = 400;
  canvas.height = 500; // 4:5 ratio for better balance
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  const safeTag = (tag || '').toUpperCase();
  const safeTitle = text || '';
  const safeDesc = description || '';

  const paddingLeft = 30;
  const maxWidth = canvas.width - paddingLeft * 2;
  
  // 1. Tag with Background Pill
  if (safeTag) {
    context.font = 'bold 16px sans-serif';
    const tagWidth = context.measureText(safeTag).width;
    const px = 12;
    const py = 6;
    const tx = paddingLeft; // Aligned with Title
    const ty = 280; // Moved up

    // Pill background
    context.fillStyle = '#0066FF';
    const r = 4;
    // Align the PILL'S left edge to paddingLeft
    const pillX = tx; 
    context.beginPath();
    context.roundRect(pillX, ty - py, tagWidth + px * 2, 16 + py * 2, r);
    context.fill();

    // Tag text
    context.fillStyle = '#FFFFFF';
    context.textBaseline = 'top';
    context.textAlign = 'left';
    context.fillText(safeTag, tx + px, ty);
  }

  // 2. Title with Character-based Wrapping (for Chinese support)
  context.font = 'bold 32px sans-serif';
  context.fillStyle = textColor;
  context.textBaseline = 'top';
  context.textAlign = 'left';
  
  const titleY = safeTag ? 325 : 280;
  const titleLineHeight = 38;
  let currentTitleY = titleY;
  
  function wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
    let lines = [];
    // Smart split: handles spaces for English, and maintains characters for CJK
    // A more robust way is to iterate and detect word boundaries
    let words = text.match(/[\u4e00-\u9fa5]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uac00-\ud7af]|[a-zA-Z0-9']+|[^\s]/g) || [];
    
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      // If it's an English word, add a space if not at the start of a line
      let testLine = currentLine;
      if (currentLine !== '' && word.match(/[a-zA-Z0-9']/)) {
        testLine += ' ' + word;
      } else {
        testLine += word;
      }
      
      const metrics = context!.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
        if (lines.length >= maxLines) {
          lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1) + '...';
          currentLine = '';
          break;
        }
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    
    lines.forEach((line, index) => {
      context!.fillText(line.trim(), x, y + index * lineHeight);
    });
    
    return lines.length * lineHeight;
  }

  const titleHeight = wrapText(safeTitle, paddingLeft, titleY, maxWidth, titleLineHeight, 2);

  // 3. Description with Character-based Wrapping
  if (safeDesc) {
    context.font = '16px sans-serif';
    context.fillStyle = 'rgba(255,255,255,0.85)';
    const descY = titleY + titleHeight + 10;
    const descLineHeight = 22;
    wrapText(safeDesc, paddingLeft, descY, maxWidth, descLineHeight, 3);
  }

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return texture;
}

class Media {
  extra: number;
  geometry: any;
  gl: any;
  image: string;
  index: number;
  length: number;
  renderer: any;
  scene: any;
  screen: any;
  text: string;
  tag: string;
  description: string;
  viewport: any;
  bend: number;
  textColor: string;
  borderRadius: number;
  font: string;
  program: any;
  plane: any;
  scale: number = 1;
  padding: number = 0;
  width: number = 0;
  widthTotal: number = 0;
  x: number = 0;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    tag,
    description
  }: any) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.tag = tag;
    this.description = description;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    
    this['createShader']();
    this['createMesh']();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true
    });

    const textTexture = createTextTexture(this.gl, this.text, this.tag, this.description, this.textColor);

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform sampler2D tText;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          // Image texture mapping (Cover style)
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 imageColor = texture2D(tMap, uv);
          
          // Dark gradient overlay for text area
          float gradient = smoothstep(0.0, 0.6, vUv.y);
          imageColor.rgb *= mix(0.1, 1.0, gradient);
          
          // Text texture mapping
          vec4 textColor = texture2D(tText, vUv);
          
          // Blend image and text
          vec3 finalRGB = mix(imageColor.rgb, textColor.rgb, textColor.a);
          
          // Rounded corners
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);
          
          gl_FragColor = vec4(finalRGB, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        tText: { value: textTexture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }
  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    // Use a fixed 4:5 ratio to avoid stretching
    const baseHeight = 1125;
    const baseWidth = 900; 
    this.plane.scale.y = (this.viewport.height * (baseHeight * this.scale)) / this.screen.height;
    this.plane.scale.x = this.plane.scale.y * (baseWidth / baseHeight);
    
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 3.0; 
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: any;
  onCheckDebounce: Function;
  renderer: any;
  gl: any;
  camera: any;
  scene: any;
  planeGeometry: any;
  mediasImages: any[] = [];
  medias: Media[] = [];
  storedItems: any[] = [];
  screen: any;
  viewport: any;
  isDown: boolean = false;
  start: number = 0;
  raf: number = 0;
  boundOnResize: any;
  boundOnWheel: any;
  boundOnTouchDown: any;
  boundOnTouchMove: any;
  boundOnTouchUp: any;

  constructor(
    container: HTMLElement,
    options: any = {}
  ) {
    const {
      items,
      bend = 3,
      textColor = 'white',
      borderRadius = 0,
      font = 'bold 30px Figtree',
      scrollSpeed = 2,
      scrollEase = 0.05
    } = options;

    document.documentElement.classList.remove('no-js');
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = {
      ease: scrollEase,
      current: 0,
      target: 0,
      last: 0,
    };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);

    this.storedItems = items || [];
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 2,
      widthSegments: 20
    });
  }
  createMedias(items: any[], bend = 1, textColor: string, borderRadius: number, font: string) {
    const galleryItems = items && items.length ? items : [];
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        tag: data.tag,
        description: data.description,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      });
    });
  }
  onTouchDown(e: any) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e: any) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e: any) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    if (!this.container) return;
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach(media => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    
    // Only update and render if there is movement or interaction
    const diff = Math.abs(this.scroll.target - this.scroll.current);
    const isMoving = diff > 0.01;

    if (isMoving || this.isDown) {
      if (this.medias) {
        this.medias.forEach(media => media.update(this.scroll, direction));
      }
      this.renderer.render({ scene: this.scene, camera: this.camera });
    }

    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    
    window.addEventListener('resize', this.boundOnResize);
    
    // Use container instead of window for interactive events to prevent shaking
    this.container.addEventListener('wheel', this.boundOnWheel, { passive: true });
    this.container.addEventListener('mousedown', this.boundOnTouchDown);
    this.container.addEventListener('mousemove', this.boundOnTouchMove);
    this.container.addEventListener('mouseup', this.boundOnTouchUp);
    this.container.addEventListener('touchstart', this.boundOnTouchDown, { passive: true });
    this.container.addEventListener('touchmove', this.boundOnTouchMove, { passive: true });
    this.container.addEventListener('touchend', this.boundOnTouchUp);
  }
  updateItems(items: any[]) {
    // Store items for comparison (including text)
    if (!this.storedItems) this.storedItems = [];
    
    if (JSON.stringify(items) === JSON.stringify(this.storedItems)) return;
    this.storedItems = items;

    this.medias.forEach(media => {
      if (media.plane && media.plane.program) {
        media.plane.setParent(null);
      }
    });
    this.createMedias(items, this.medias[0]?.bend || 3, this.medias[0]?.textColor || '#ffffff', this.medias[0]?.borderRadius || 0, this.medias[0]?.font || '');
  }
  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundOnResize);
    
    if (this.container) {
      this.container.removeEventListener('wheel', this.boundOnWheel);
      this.container.removeEventListener('mousedown', this.boundOnTouchDown);
      this.container.removeEventListener('mousemove', this.boundOnTouchMove);
      this.container.removeEventListener('mouseup', this.boundOnTouchUp);
      this.container.removeEventListener('touchstart', this.boundOnTouchDown);
      this.container.removeEventListener('touchmove', this.boundOnTouchMove);
      this.container.removeEventListener('touchend', this.boundOnTouchUp);
    }
    
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Figtree',
  scrollSpeed = 1.5,
  scrollEase = 0.1 
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<App | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!appRef.current) {
      console.log('Mounting CircularGallery App');
      appRef.current = new App(containerRef.current, { items: items || [], bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    } else {
      appRef.current.updateItems(items || []);
    }

    return () => {
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);

  return <div className="circular-gallery" ref={containerRef} />;
}
