# 🚀 SUPERNATURAL CSS - QUICK REFERENCE CARD

## ⚡ MOST POPULAR EFFECTS

### 🎴 Premium 3D Cards

```html
<!-- Holographic Glass Card -->
<div class="card-3d glass-holographic animate-slide-in-up hover-lift">
  Your content here
</div>

<!-- Layered Depth Card -->
<div class="card-layered neuro-card animate-tilt-3d">
  Creates 3 layers of depth
</div>

<!-- Perspective Card -->
<div class="perspective-card">
  <div class="tricolor-border p-6">Rotates in 3D on hover</div>
</div>
```

### 🇮🇳 Indian Cultural Elements

```html
<!-- Ashoka Chakra (Spinning) -->
<div class="ashoka-chakra animate-chakra"></div>

<!-- Lotus Decoration -->
<div class="lotus-petals animate-lotus"></div>

<!-- Institutional Pillar -->
<div class="institutional-pillar animate-pillar-rise">
  <div class="dome-shape"></div>
</div>

<!-- Rupee Symbol -->
<div class="rupee-symbol animate-rupee-bounce">₹</div>

<!-- Official Seal -->
<div class="official-seal">
  <div class="p-8">Content</div>
</div>

<!-- Academic Badge -->
<div class="academic-badge"></div>
```

### 💻 Hackathon/Tech Effects

```html
<!-- Terminal Window -->
<div class="terminal-window">
  <pre class="text-green-400 p-4">Your code here</pre>
</div>

<!-- Glitch Text -->
<h1 class="glitch-text animate-glitch" data-text="BLOCKCHAIN">BLOCKCHAIN</h1>

<!-- Hologram Text -->
<h2 class="hologram-text">Shimmering Text</h2>

<!-- Neon Border Box -->
<div class="neon-border p-6">Glowing edges</div>

<!-- Blockchain Link -->
<div class="blockchain-link">Shows ⛓ emoji on top</div>

<!-- Data Visualization Bar -->
<div class="data-viz-bar" style="height: 120px;"></div>
```

### 🎨 Background Patterns

```html
<!-- Indian Pattern -->
<section class="bg-indian-pattern">...</section>

<!-- Mandala Pattern -->
<section class="bg-mandala">...</section>

<!-- Notebook Lines -->
<section class="notebook-bg">...</section>

<!-- Binary Code -->
<section class="bg-binary">...</section>

<!-- Circuit Board -->
<section class="circuit-board">...</section>

<!-- Hexagon Grid -->
<section class="hex-grid">...</section>

<!-- Matrix Rain -->
<section class="matrix-rain">...</section>

<!-- Aurora Background -->
<section class="aurora-bg">...</section>

<!-- Mesh Gradient -->
<section class="mesh-gradient">...</section>
```

### 🌈 Tricolor Elements

```html
<!-- Tricolor Border (Animated) -->
<div class="tricolor-border p-6">Content</div>

<!-- Tricolor Text (Gradient) -->
<h1 class="tricolor-text">Gradient Text</h1>

<!-- Tricolor Card -->
<div class="card-tricolor p-6">Has left + top border</div>

<!-- Tricolor Button -->
<button class="btn-tricolor">Click Me</button>

<!-- Gradient Border (Rotating) -->
<div class="gradient-border p-8">Rotating gradient border</div>
```

### ✨ Special Effects

```html
<!-- Shine Sweep on Hover -->
<div class="shine-overlay">Sweeping light</div>

<!-- Ripple on Click -->
<div class="ripple-container">
  <button>Click Me</button>
</div>

<!-- Hover Lift -->
<div class="hover-lift">Lifts on hover</div>

<!-- Text Glow -->
<h1 class="text-glow">Glowing Text</h1>

<!-- Neon Glow (Animated) -->
<h1 class="animate-neon-glow">Pulsing Glow</h1>

<!-- Iridescent -->
<div class="iridescent p-6">Color shifting</div>

<!-- Frosted Overlay -->
<div class="frosted-overlay p-8">Blurred glass</div>
```

## 🎭 ANIMATION COMBOS

### Floating Elements

```html
<!-- Slow Float -->
<div class="animate-float-slow">Gentle floating</div>

<!-- Parallax Float (3D) -->
<div class="animate-parallax-float">Deep floating</div>

<!-- With Rotation -->
<div class="animate-rotate-slow animate-float">Spin & float</div>
```

### Entrance Animations

```html
<!-- Slide Up with Bounce -->
<div class="animate-slide-in-up delay-100">1st element</div>
<div class="animate-slide-in-up delay-200">2nd element</div>
<div class="animate-slide-in-up delay-300">3rd element</div>

<!-- Scale In with Pop -->
<div class="animate-scale-in delay-200">Pops in</div>

<!-- Slide from Right -->
<div class="animate-slide-in-right">From right</div>
```

### Continuous Animations

```html
<!-- Morphing Shape -->
<div class="animate-morph">Shape shifter</div>

<!-- Holographic Glow -->
<div class="animate-holographic">Hologram effect</div>

<!-- Gradient Shift -->
<div
  class="animate-gradient-shift bg-gradient-to-r from-saffron via-green to-navy"
>
  Animated gradient
</div>

<!-- 3D Tilt -->
<div class="animate-tilt-3d">Subtle 3D tilt</div>

<!-- Pulse Glow -->
<div class="animate-pulse-glow">Pulsing</div>
```

## 🎯 COMMON PATTERNS

### Hero Section

```html
<section class="aurora-bg mesh-gradient min-h-screen">
  <div class="max-w-7xl mx-auto px-4 py-20">
    <div class="animate-slide-in-up">
      <h1 class="tricolor-text text-6xl font-bold animate-neon-glow">
        Welcome to KK Verifier
      </h1>
      <p class="text-xl mt-4 animate-slide-in-up delay-200">
        Secure Certificate Verification
      </p>
      <button
        class="btn-tricolor shine-overlay mt-8 animate-scale-in delay-300"
      >
        Get Started
      </button>
    </div>
  </div>
</section>
```

### Certificate Card

```html
<div class="card-3d glass-holographic hover-lift">
  <div class="card-tricolor p-6">
    <div class="flex items-center gap-4">
      <div class="ashoka-chakra animate-chakra"></div>
      <div>
        <h3 class="tricolor-text text-2xl">Certificate #12345</h3>
        <p class="text-gray-600">Issued on Oct 26, 2025</p>
      </div>
    </div>
    <div class="mt-4">
      <button class="btn-tricolor shine-overlay">Verify Now</button>
    </div>
  </div>
</div>
```

### Dashboard Stats

```html
<div class="circuit-board hex-grid p-8">
  <div class="grid grid-cols-3 gap-6">
    <div class="neuro-card glass-holographic p-6 animate-slide-in-up">
      <div class="data-viz-bar mb-4" style="height: 80px;"></div>
      <h3 class="hologram-text text-2xl">1,234</h3>
      <p>Certificates Issued</p>
    </div>

    <div class="neuro-card glass-holographic p-6 animate-slide-in-up delay-100">
      <div class="data-viz-bar mb-4" style="height: 120px;"></div>
      <h3 class="hologram-text text-2xl">987</h3>
      <p>Verifications</p>
    </div>

    <div class="neuro-card glass-holographic p-6 animate-slide-in-up delay-200">
      <div class="data-viz-bar mb-4" style="height: 60px;"></div>
      <h3 class="hologram-text text-2xl">56</h3>
      <p>Organizations</p>
    </div>
  </div>
</div>
```

### Feature Section

```html
<section class="bg-mandala bg-indian-pattern py-20">
  <div class="max-w-7xl mx-auto">
    <h2 class="text-4xl font-bold text-center tricolor-text mb-12">Features</h2>

    <div class="grid md:grid-cols-3 gap-8">
      <div class="perspective-card">
        <div class="card-layered p-8 ripple-container">
          <div class="ashoka-chakra animate-chakra mx-auto mb-4"></div>
          <h3 class="text-2xl font-bold mb-2">Secure</h3>
          <p>Blockchain-verified certificates</p>
        </div>
      </div>

      <div class="perspective-card">
        <div class="card-layered p-8 ripple-container">
          <div class="lotus-petals animate-lotus mx-auto mb-4"></div>
          <h3 class="text-2xl font-bold mb-2">Instant</h3>
          <p>Real-time verification</p>
        </div>
      </div>

      <div class="perspective-card">
        <div class="card-layered p-8 ripple-container">
          <div class="official-seal mx-auto mb-4">
            <div class="p-4">✓</div>
          </div>
          <h3 class="text-2xl font-bold mb-2">Authentic</h3>
          <p>Government-grade security</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Tech Section

```html
<section class="matrix-rain bg-binary py-20">
  <div class="frosted-overlay p-12">
    <h2
      class="glitch-text text-4xl font-bold text-center mb-12"
      data-text="POWERED BY BLOCKCHAIN"
    >
      POWERED BY BLOCKCHAIN
    </h2>

    <div class="terminal-window max-w-3xl mx-auto">
      <pre class="text-green-400 p-6">
<span class="hologram-text">$ verify-certificate --id=12345</span>
✓ Certificate found on blockchain
✓ Issuer verified: XYZ University
✓ Signature valid
✓ Status: AUTHENTIC
      </pre>
    </div>

    <div class="blockchain-link neon-border mt-8 p-6 max-w-xl mx-auto">
      <p class="text-center">
        <span class="rupee-symbol animate-rupee-bounce">₹</span>
        Zero fees • Instant verification
      </p>
    </div>
  </div>
</section>
```

## 🎨 COLOR CLASSES

Use these with Tailwind:

- `text-saffron` or `bg-saffron` - #FF9933
- `text-green` or `bg-green` - #138808
- `text-navy` or `bg-navy` - #000080

## 📚 FULL DOCUMENTATION

See `SUPERNATURAL_CSS_GUIDE.md` for complete reference with all 30+ animations, 15+ 3D effects, and detailed examples.

---

**Made with ❤️ for KK Verifier**
_Supernatural CSS • World-Class UI • Indian Pride_ 🇮🇳
