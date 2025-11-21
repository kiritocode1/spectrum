"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
// Note: SplitText is a Club GSAP plugin. If you don't have a license,
// you might need to use a free alternative or the trial version.
// For this translation, we'll attempt to import it, but provide a fallback if it fails.
import { SplitText } from "gsap/SplitText"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
  if (SplitText) {
    gsap.registerPlugin(SplitText)
  }
}

export default function Page() {
  const heroTitleRef = useRef<HTMLHeadingElement>(null)
  const soundEnabledRef = useRef(false)
  const currentThemeRef = useRef("original")
  const blurEnabledRef = useRef(true)
  const rainbowAnimationTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const audioFilesRef = useRef<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    // Audio setup
    audioFilesRef.current = {
      whoosh: new Audio("https://assets.codepen.io/7558/whoosh-fx-001.mp3"),
      glitch: new Audio("https://assets.codepen.io/7558/glitch-fx-001.mp3"),
      reverb: new Audio("https://assets.codepen.io/7558/click-reverb-001.mp3"),
    }
    Object.values(audioFilesRef.current).forEach((sound) => {
      sound.volume = 0.3
    })

    const colorThemes: { [key: string]: string[] } = {
      original: ["#340B05", "#0358F7", "#5092C7", "#E1ECFE", "#FFD400", "#FA3D1D", "#FD02F5", "#FFC0FD"],
      "blue-pink": ["#1E3A8A", "#3B82F6", "#A855F7", "#EC4899", "#F472B6", "#F9A8D4", "#FBCFE8", "#FDF2F8"],
      "blue-orange": ["#1E40AF", "#3B82F6", "#60A5FA", "#FFFFFF", "#FED7AA", "#FB923C", "#EA580C", "#9A3412"],
      sunset: ["#FEF3C7", "#FCD34D", "#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F", "#451A03"],
      purple: ["#F3E8FF", "#E9D5FF", "#D8B4FE", "#C084FC", "#A855F7", "#9333EA", "#7C3AED", "#6B21B6"],
      monochrome: ["#1A1A1A", "#404040", "#666666", "#999999", "#CCCCCC", "#E5E5E5", "#F5F5F5", "#FFFFFF"],
      "pink-purple": ["#FDF2F8", "#FCE7F3", "#F9A8D4", "#F472B6", "#EC4899", "#BE185D", "#831843", "#500724"],
      "blue-black": ["#000000", "#0F172A", "#1E293B", "#334155", "#475569", "#64748B", "#94A3B8", "#CBD5E1"],
      "beige-black": ["#FEF3C7", "#F59E0B", "#D97706", "#92400E", "#451A03", "#1C1917", "#0C0A09", "#000000"],
    }

    const darkThemes = ["blue-black", "beige-black", "monochrome"]

    function playSound(soundName: string) {
      if (soundEnabledRef.current && audioFilesRef.current[soundName]) {
        audioFilesRef.current[soundName].currentTime = 0
        audioFilesRef.current[soundName].play().catch(() => {})
      }
    }

    function blendColors(color1: string, color2: string, percentage: number) {
      percentage = Math.max(0, Math.min(1, percentage))
      const hexToRgb = (hex: string) => {
        const bigint = Number.parseInt(hex.slice(1), 16)
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
      }
      const rgbToHex = (rgb: number[]) =>
        "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)
      const rgb1 = hexToRgb(color1)
      const rgb2 = hexToRgb(color2)
      const r = Math.round(rgb1[0] * (1 - percentage) + rgb2[0] * percentage)
      const g = Math.round(rgb1[1] * (1 - percentage) + rgb2[1] * percentage)
      const b = Math.round(rgb1[2] * (1 - percentage) + rgb2[2] * percentage)
      return rgbToHex([r, g, b])
    }

    function updateColors(theme: string) {
      const colors = colorThemes[theme]
      if (!colors) return

      const isDarkTheme = darkThemes.includes(theme)
      document.documentElement.style.setProperty("--color-bg", isDarkTheme ? "#1a1a1a" : "#f5f5f5")
      document.documentElement.style.setProperty("--color-text", isDarkTheme ? "#ffffff" : "#333")
      document.documentElement.style.setProperty("--color-text-light", isDarkTheme ? "#cccccc" : "#666")
      document.documentElement.style.setProperty("--color-text-lighter", isDarkTheme ? "#999999" : "#999")

      document.querySelectorAll(".main-title, .wavelength-label").forEach((el) => {
        ;(el as HTMLElement).style.color = isDarkTheme ? "#FFFFFF" : "#333333"
      })

      const emailLink = document.querySelector(".email-link") as HTMLElement
      if (emailLink) {
        emailLink.style.setProperty("--bg-color", isDarkTheme ? "#FFFFFF" : "#333333")
        emailLink.style.setProperty("--hover-color", isDarkTheme ? "#333333" : "#f5f5f5")
      }

      document.documentElement.style.setProperty("--grad-color-1", colors[0])
      document.documentElement.style.setProperty("--grad-color-2", colors[1])
      document.documentElement.style.setProperty("--grad-color-3", colors[4])
      document.documentElement.style.setProperty("--grad-color-4", colors[5])
      document.documentElement.style.setProperty("--grad-color-5", colors[6])
      document.documentElement.style.setProperty("--grad-color-6", colors[2])

      updateGradients(theme)
      updateTitleGradient(colors)
    }

    function updateTitleGradient(colors: string[]) {
      document.documentElement.style.setProperty("--grad-1", colors[0] || "#340B05")
      document.documentElement.style.setProperty("--grad-2", colors[1] || "#0358F7")
      document.documentElement.style.setProperty("--grad-3", colors[4] || "#FFD400")
      document.documentElement.style.setProperty("--grad-4", colors[5] || "#FA3D1D")
      document.documentElement.style.setProperty("--grad-5", colors[6] || "#FD02F5")
    }

    function createRainbowAnimation() {
      const heroTitle = document.querySelector(".hero-title")
      if (!heroTitle) return
      const chars = heroTitle.querySelectorAll(".char")
      const themeColors = colorThemes[currentThemeRef.current] || colorThemes.original
      const defaultTextColor = getComputedStyle(document.documentElement).getPropertyValue("--color-text").trim()

      const waveLength = 6
      const fadeLength = 3
      const totalAnimationRange = chars.length + waveLength + fadeLength

      if (rainbowAnimationTimelineRef.current) {
        rainbowAnimationTimelineRef.current.kill()
      }
      gsap.killTweensOf(chars)

      gsap.set(chars, { color: defaultTextColor, opacity: 1, filter: "blur(0px)", x: 0 })

      rainbowAnimationTimelineRef.current = gsap.timeline({ repeat: 0, ease: "none" })

      rainbowAnimationTimelineRef.current.to(
        { x: 0 },
        {
          x: totalAnimationRange,
          duration: 2.5,
          onUpdate: function () {
            const wavePosition = (this.targets()[0] as any).x
            chars.forEach((char, index) => {
              const charRelativePosition = wavePosition - index
              let colorToApply = defaultTextColor

              if (charRelativePosition >= 0 && charRelativePosition < totalAnimationRange) {
                if (charRelativePosition < fadeLength) {
                  const progress = charRelativePosition / fadeLength
                  colorToApply = blendColors(defaultTextColor, themeColors[0], progress)
                } else if (charRelativePosition >= fadeLength && charRelativePosition < fadeLength + waveLength) {
                  const waveProgress = (charRelativePosition - fadeLength) / waveLength
                  const colorIndex = Math.floor(waveProgress * themeColors.length)
                  colorToApply = themeColors[Math.min(themeColors.length - 1, colorIndex)]
                } else if (
                  charRelativePosition >= fadeLength + waveLength &&
                  charRelativePosition < fadeLength + waveLength + fadeLength
                ) {
                  const progress = (charRelativePosition - (fadeLength + waveLength)) / fadeLength
                  colorToApply = blendColors(themeColors[themeColors.length - 1], defaultTextColor, progress)
                }
              }
              ;(char as HTMLElement).style.color = colorToApply
            })
          },
        },
      )
    }

    function toggleBlur() {
      const svgGroup = document.querySelector('g[clipPath="url(#clip)"]')
      const blurBtn = document.querySelector(".blur-btn")
      playSound("whoosh")

      if (blurEnabledRef.current) {
        svgGroup?.removeAttribute("filter")
        if (blurBtn) blurBtn.textContent = "Blur On"
        blurEnabledRef.current = false
      } else {
        svgGroup?.setAttribute("filter", "url(#blur)")
        if (blurBtn) blurBtn.textContent = "Blur Off"
        blurEnabledRef.current = true
      }
    }

    function updateGradients(theme: string) {
      const colors = colorThemes[theme]
      for (let i = 0; i < 9; i++) {
        const gradient = document.getElementById(`grad${i}`)
        if (gradient && colors) {
          gradient.querySelectorAll("stop").forEach((stop, idx) => {
            if (colors[idx]) stop.setAttribute("stop-color", colors[idx])
            else if (colors[colors.length - 1]) stop.setAttribute("stop-color", colors[colors.length - 1])
          })
        }
      }
    }

    function generateRandomColor() {
      const hue = Math.floor(Math.random() * 360)
      const saturation = Math.floor(Math.random() * 40) + 60
      const lightness = Math.floor(Math.random() * 50) + 30
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`
    }

    function randomizeColors() {
      playSound("glitch")
      const randomColors = Array.from({ length: 8 }, () => generateRandomColor())

      for (let i = 0; i < 9; i++) {
        const gradient = document.getElementById(`grad${i}`)
        if (gradient && randomColors) {
          gradient.querySelectorAll("stop").forEach((stop, idx) => {
            if (randomColors[idx]) stop.setAttribute("stop-color", randomColors[idx])
            else if (randomColors[randomColors.length - 1])
              stop.setAttribute("stop-color", randomColors[randomColors.length - 1])
          })
        }
      }

      document.documentElement.style.setProperty("--grad-color-1", randomColors[0])
      document.documentElement.style.setProperty("--grad-color-2", randomColors[1])
      document.documentElement.style.setProperty("--grad-color-3", randomColors[4])
      document.documentElement.style.setProperty("--grad-color-4", randomColors[5])
      document.documentElement.style.setProperty("--grad-color-5", randomColors[6])
      document.documentElement.style.setProperty("--grad-color-6", randomColors[2])

      updateTitleGradient(randomColors)

      const tempTheme = currentThemeRef.current
      currentThemeRef.current = "randomized"
      setTimeout(() => {
        createRainbowAnimation()
        currentThemeRef.current = tempTheme
      }, 100)

      gsap.to(".svg-container", {
        scale: 1.02,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }

    function toggleSound() {
      const waveLine = document.querySelector(".wave-line")
      if (soundEnabledRef.current) {
        waveLine?.classList.remove("wave-animated")
        soundEnabledRef.current = false
      } else {
        waveLine?.classList.add("wave-animated")
        soundEnabledRef.current = true
      }
    }

    // Color button handlers
    document.querySelectorAll(".color-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".color-btn").forEach((b) => b.classList.remove("active"))
        this.classList.add("active")
        currentThemeRef.current = this.getAttribute("data-theme") || "original"
        updateColors(currentThemeRef.current)
        setTimeout(() => {
          createRainbowAnimation()
        }, 100)
        gsap.to(".svg-container", {
          scale: 1.02,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
        })
      })
    })

    document.querySelector(".blur-btn")?.addEventListener("click", toggleBlur)
    document.querySelector(".randomize-btn")?.addEventListener("click", randomizeColors)
    document.querySelector(".sound-toggle")?.addEventListener("click", toggleSound)

    // Hero nav hover effects
    const heroNavItems = document.querySelectorAll(".hero-nav-item")
    const heroNav = document.querySelector(".hero-nav")
    const gradientOverlay = document.querySelector(".gradient-overlay")
    const navGradients = [
      "radial-gradient(circle, #340B05 0%, #0358F7 50%, transparent 100%)",
      "radial-gradient(circle, #0358F7 0%, #5092C7 50%, transparent 100%)",
      "radial-gradient(circle, #FFD400 0%, #FA3D1D 50%, transparent 100%)",
      "radial-gradient(circle, #5092C7 0%, #E1ECFE 50%, transparent 100%)",
      "radial-gradient(circle, #FA3D1D 0%, #FD02F5 50%, transparent 100%)",
      "radial-gradient(circle, #E1ECFE 0%, #FFD400 50%, transparent 100%)",
      "radial-gradient(circle, #FD02F5 0%, #340B05 50%, transparent 100%)",
      "radial-gradient(circle, #FFD400 0%, #5092C7 50%, transparent 100%)",
      "radial-gradient(circle, #5092C7 0%, #FD02F5 50%, transparent 100%)",
    ]

    heroNav?.addEventListener("mouseleave", () => {
      heroNavItems.forEach((navItem) => {
        ;(navItem as HTMLElement).style.opacity = "1"
        navItem.classList.remove("active")
      })
      ;(gradientOverlay as HTMLElement).style.opacity = "0"
    })

    heroNavItems.forEach((item, index) => {
      item.addEventListener("mouseenter", () => {
        playSound("reverb")
        ;(gradientOverlay as HTMLElement).style.background = navGradients[index]
        ;(gradientOverlay as HTMLElement).style.opacity = "0.3"
        heroNavItems.forEach((navItem, navIndex) => {
          navItem.classList.remove("active")
          const distance = Math.abs(index - navIndex)
          let opacity = 1
          if (navIndex === index) {
            opacity = 1
            navItem.classList.add("active")
          } else if (distance === 1) {
            opacity = 0.6
          } else if (distance === 2) {
            opacity = 0.4
          } else if (distance === 3) {
            opacity = 0.3
          } else if (distance >= 4) {
            opacity = 0.2
          }
          ;(navItem as HTMLElement).style.opacity = opacity.toString()
        })
      })
    })

    function isMobile() {
      return window.innerWidth <= 768
    }

    // Initial animations after fonts load
    document.fonts.ready.then(() => {
      updateColors(currentThemeRef.current)

      const heroTl = gsap.timeline({ delay: 0.5 })

      // Title animation
      const heroTitle = document.querySelector(".hero-title")
      if (heroTitle && SplitText) {
        let titleSplit: any
        let titleElementsToAnimate: any
        let titleStagger: number

        if (isMobile()) {
          titleSplit = new SplitText(heroTitle, { type: "words" })
          titleElementsToAnimate = titleSplit.words
          titleStagger = 0.1
        } else {
          titleSplit = new SplitText(heroTitle, { type: "chars", charsClass: "char" })
          titleElementsToAnimate = titleSplit.chars
          titleStagger = 0.03
        }

        gsap.set(titleElementsToAnimate, { opacity: 0, filter: "blur(8px)", x: -20 })
        heroTl.to(
          titleElementsToAnimate,
          {
            opacity: 1,
            filter: "blur(0px)",
            x: 0,
            duration: 0.8,
            stagger: titleStagger,
            ease: "power2.out",
          },
          0,
        )
      } else if (heroTitle) {
        // Fallback if SplitText is not available
        gsap.set(heroTitle, { opacity: 0, filter: "blur(8px)", x: -20 })
        heroTl.to(
          heroTitle,
          {
            opacity: 1,
            filter: "blur(0px)",
            x: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          0,
        )
      }

      // Nav items animation
      const navItems = document.querySelectorAll(".hero-nav-item")
      navItems.forEach((item) => {
        if (SplitText) {
          const split = new SplitText(item, { type: "lines" })
          gsap.set(split.lines, { opacity: 0, y: 30, filter: "blur(8px)" })
          heroTl.to(
            split.lines,
            {
              autoAlpha: 1,
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.8,
              stagger: 0.08,
              ease: "power2.out",
            },
            0.4,
          )
        } else {
          gsap.set(item, { opacity: 0, y: 30, filter: "blur(8px)" })
          heroTl.to(
            item,
            {
              autoAlpha: 1,
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.8,
              ease: "power2.out",
            },
            0.4,
          )
        }
      })

      // Text content animation
      const textElements = document.querySelectorAll(".hero-text")
      textElements.forEach((textEl, index) => {
        if (SplitText) {
          const textSplit = new SplitText(textEl, { type: "lines" })
          gsap.set(textSplit.lines, { opacity: 0, y: 50, clipPath: "inset(0 0 100% 0)" })
          heroTl.to(
            textSplit.lines,
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              duration: 0.8,
              stagger: 0.1,
              ease: "power2.out",
            },
            0.8 + index * 0.2,
          )
        } else {
          gsap.set(textEl, { opacity: 0, y: 50 })
          heroTl.to(
            textEl,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
            },
            0.8 + index * 0.2,
          )
        }
      })

      // Scroll hint animation
      const scrollHint = document.querySelector(".nav-bottom-center")
      if (scrollHint && SplitText) {
        const scrollHintSplit = new SplitText(scrollHint, { type: "chars" })
        gsap.set(scrollHintSplit.chars, { opacity: 0, filter: "blur(3px)" })
        gsap.to(scrollHintSplit.chars, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.6,
          stagger: { each: 0.08, repeat: -1, yoyo: true },
          ease: "sine.inOut",
          delay: 1,
        })
        gsap.to(scrollHintSplit.chars, {
          filter: "blur(1px)",
          duration: 0.8,
          stagger: { each: 0.08, repeat: -1, yoyo: true },
          ease: "sine.inOut",
          delay: 1.04,
        })
      } else if (scrollHint) {
        gsap.set(scrollHint, { opacity: 0, filter: "blur(3px)" })
        gsap.to(scrollHint, {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 1,
        })
      }

      // Scroll-triggered animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".animation-section",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
        },
      })

      const wavelengthLabels = document.querySelectorAll(".wavelength-label")
      const mainTitle = document.querySelector(".main-title")

      const allSplitLines: any[] = []

      if (SplitText) {
        wavelengthLabels.forEach((label) => {
          const split = new SplitText(label, { type: "lines" })
          gsap.set(split.lines, { opacity: 0, y: 30, filter: "blur(8px)" })
          allSplitLines.push(...split.lines)
        })

        if (mainTitle) {
          const mainTitleSplit = new SplitText(mainTitle, { type: "lines" })
          gsap.set(mainTitleSplit.lines, { opacity: 0, y: 30, filter: "blur(8px)" })
          allSplitLines.push(...mainTitleSplit.lines)
        }
      } else {
        // Fallback
        wavelengthLabels.forEach((label) => {
          gsap.set(label, { opacity: 0, y: 30, filter: "blur(8px)" })
          allSplitLines.push(label)
        })
        if (mainTitle) {
          gsap.set(mainTitle, { opacity: 0, y: 30, filter: "blur(8px)" })
          allSplitLines.push(mainTitle)
        }
      }

      tl.to(".svg-container", { scaleY: 1, y: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0)
        .to(".text-grid", { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.3)
        .to(".main-title", { opacity: 1, duration: 0.5, ease: "power2.out" }, 0.3)
        .to(
          allSplitLines,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            stagger: 0.05,
            ease: "power2.out",
          },
          0.5,
        )
    })

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  return (
    <>
      <noscript>
        <style>{`
          .hero-title, .hero-nav-item, .hero-text, .nav-bottom-center,
          .svg-container, .text-grid, .main-title, .wavelength-label {
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        `}</style>
      </noscript>

      <header>
        <div className="color-switcher">
          <div className="color-btn theme-original active" data-theme="original"></div>
          <div className="color-btn theme-blue-pink" data-theme="blue-pink"></div>
          <div className="color-btn theme-blue-orange" data-theme="blue-orange"></div>
          <div className="color-btn theme-sunset" data-theme="sunset"></div>
          <div className="color-btn theme-purple" data-theme="purple"></div>
          <div className="color-btn theme-monochrome" data-theme="monochrome"></div>
          <div className="color-btn theme-pink-purple" data-theme="pink-purple"></div>
          <div className="color-btn theme-blue-black" data-theme="blue-black"></div>
          <div className="color-btn theme-beige-black" data-theme="beige-black"></div>
        </div>
        <div className="blur-toggle">
          <span className="blur-btn">Blur Off</span>
        </div>
        <div className="randomize-toggle">
          <span className="randomize-btn">Randomize</span>
        </div>
        <nav>
          <div className="nav-item nav-top-left">Cosmic Spectrum</div>
          <div className="nav-item nav-top-right">
            <span>
              <a href="mailto:hi@filip.fyi" className="email-link">
                hi@filip.fyi
              </a>{" "}
              — 2024.25
            </span>
            <div className="sound-toggle">
              <svg className="sound-wave" viewBox="0 0 20 12">
                <path className="wave-line" d="M2 6 Q4 2 6 6 Q8 10 10 6 Q12 2 14 6 Q16 10 18 6" />
              </svg>
            </div>
          </div>
          <div className="nav-item nav-bottom-left">Stellar Radiation</div>
          <div className="nav-item nav-bottom-center split-text">Scroll to explore</div>
          <div className="nav-item nav-bottom-right">Color Wavelengths</div>
        </nav>
      </header>

      <div className="bg-gradients">
        <div className="bg-gradient bg-gradient-1"></div>
        <div className="bg-gradient bg-gradient-2"></div>
        <div className="bg-gradient bg-gradient-3"></div>
      </div>

      <div className="gradient-overlay"></div>

      <section className="hero-section">
        <h1 ref={heroTitleRef} className="hero-title split-text">
          Light Frequencies
        </h1>
        <div className="hero-content">
          <div className="hero-nav">
            <div className="hero-nav-item split-text">Wave</div>
            <div className="hero-nav-item split-text">Photons</div>
            <div className="hero-nav-item split-text">Spectrum</div>
            <div className="hero-nav-item split-text">Frequencies</div>
            <div className="hero-nav-item split-text">Electromagnetic</div>
            <div className="hero-nav-item split-text">Wavelength</div>
            <div className="hero-nav-item split-text">Radiation</div>
            <div className="hero-nav-item split-text">Energy</div>
            <div className="hero-nav-item split-text">Light</div>
          </div>
          <div className="hero-text-content">
            <div className="hero-text split-text">
              In a universe where light becomes the language of existence, our cosmic spectrum emerges as a bridge
              between the seen and unseen. We capture wavelengths that define reality, blending electromagnetic
              frequencies with visual poetry. Each spectrum tells a story of stellar birth and cosmic evolution, perfect
              for navigating the infinite expanses of space and time.
            </div>
            <div className="hero-text split-text">
              Our collection is inspired by the raw energy of distant galaxies, where physics meets pure beauty. From
              violet waves to infrared radiation, we reimagine the electromagnetic spectrum for the curious minds. Join
              us in exploring the unknown frequencies and redefining perception in a universe that reveals its secrets
              through light.
            </div>
          </div>
        </div>
      </section>

      <div className="scroll-space"></div>

      <div className="animation-section">
        <div className="footer-container">
          <div className="svg-container">
            <svg
              className="spectrum-svg"
              viewBox="0 0 1567 584"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip)" filter="url(#blur)">
                <path d="M1219 584H1393V184H1219V584Z" fill="url(#grad0)" />
                <path d="M1045 584H1219V104H1045V584Z" fill="url(#grad1)" />
                <path d="M348 584H174L174 184H348L348 584Z" fill="url(#grad2)" />
                <path d="M522 584H348L348 104H522L522 584Z" fill="url(#grad3)" />
                <path d="M697 584H522L522 54H697L697 584Z" fill="url(#grad4)" />
                <path d="M870 584H1045V54H870V584Z" fill="url(#grad5)" />
                <path d="M870 584H697L697 0H870L870 584Z" fill="url(#grad6)" />
                <path d="M174 585H0.000183105L-3.75875e-06 295H174L174 585Z" fill="url(#grad7)" />
                <path d="M1393 584H1567V294H1393V584Z" fill="url(#grad8)" />
              </g>
              <defs>
                <filter
                  id="blur"
                  x="-30"
                  y="-30"
                  width="1627"
                  height="644"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                  <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur" />
                </filter>
                <linearGradient id="grad0" x1="1306" y1="584" x2="1306" y2="184" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad1" x1="1132" y1="584" x2="1132" y2="104" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad2" x1="261" y1="584" x2="261" y2="184" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad3" x1="435" y1="584" x2="435" y2="104" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad4" x1="609.501" y1="584" x2="609.501" y2="54" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad5" x1="957.5" y1="584" x2="957.5" y2="54" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad6" x1="783.501" y1="584" x2="783.501" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad7" x1="87.0003" y1="585" x2="87.0003" y2="295" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="grad8" x1="1480" y1="584" x2="1480" y2="294" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#340B05" />
                  <stop offset="0.182709" stopColor="#0358F7" />
                  <stop offset="0.283673" stopColor="#5092C7" />
                  <stop offset="0.413484" stopColor="#E1ECFE" />
                  <stop offset="0.586565" stopColor="#FFD400" />
                  <stop offset="0.682722" stopColor="#FA3D1D" />
                  <stop offset="0.802892" stopColor="#FD02F5" />
                  <stop offset="1" stopColor="#FFC0FD" stopOpacity="0" />
                </linearGradient>
                <clipPath id="clip">
                  <rect width="1567" height="584" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="main-title split-text">
            Where Light Becomes Color
            <br />
            Across the Infinite Spectrum
          </div>
          <div className="text-grid">
            <div className="text-column">
              <div className="wavelength-label level-1 split-text">
                Violet
                <br />
                Waves
                <br />
                380nm
              </div>
            </div>
            <div className="text-column">
              <div className="wavelength-label level-2 split-text">
                Blue
                <br />
                Photons
                <br />
                450nm
              </div>
            </div>
            <div className="text-column">
              <div className="wavelength-label level-3 split-text">
                Cyan
                <br />
                Spectrum
                <br />
                490nm
              </div>
            </div>
            <div className="text-column">
              <div className="wavelength-label level-4 split-text">
                Green
                <br />
                Energy
                <br />
                530nm
              </div>
            </div>
            <div className="text-column">
              <div className="wavelength-label level-5 split-text">
                Yellow
                <br />
                Radiance
                <br />
                580nm
              </div>
            </div>
            <div className="text-column">
              <div className="wavelength-label level-4 split-text">
                Orange
                <br />
                Glow
                <br />
                620nm
              </div>
            </div>
            <div className="text-column">
              <div className="wavelength-label level-3 split-text">
                Red
                <br />
                Shift
                <br />
                680nm
              </div>
            </div>
            <div className="text-column">
              <div className="wavelength-label level-2 split-text">
                Infrared
                <br />
                Heat
                <br />
                750nm
              </div>
            </div>
            <div className="text-column">
              <div className="wavelength-label level-1 split-text">
                Beyond
                <br />
                Visible
                <br />
                800nm
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
