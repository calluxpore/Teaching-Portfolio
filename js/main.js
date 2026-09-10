/* Teaching Dossier interaction layer
   Theme toggle, reading progress, scroll-spy TOC, reveal-on-scroll, back-to-top. */

(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        initPrint();
        initProgressAndTopButton();
        initScrollSpy();
        initReveal();
    });

    /* ---------------------------------------------------------------- Theme */
    function initTheme() {
        const root = document.documentElement;
        const toggle = document.getElementById("theme-toggle");
        const media = window.matchMedia("(prefers-color-scheme: dark)");

        if (toggle) {
            syncLabel();
            toggle.addEventListener("click", function () {
                const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
                root.setAttribute("data-theme", next);
                localStorage.setItem("theme", next);
                syncLabel();
            });
        }

        // Follow the OS while the visitor has not made an explicit choice.
        media.addEventListener("change", function (e) {
            if (localStorage.getItem("theme")) return;
            root.setAttribute("data-theme", e.matches ? "dark" : "light");
            syncLabel();
        });

        function syncLabel() {
            if (!toggle) return;
            const isDark = root.getAttribute("data-theme") === "dark";
            const label = isDark ? "Switch to light mode" : "Switch to dark mode";
            toggle.setAttribute("aria-label", label);
            toggle.setAttribute("title", label);
        }
    }

    /* ---------------------------------------------------------------- Print */
    function initPrint() {
        const btn = document.getElementById("print-btn");
        if (!btn) return;
        btn.addEventListener("click", function () {
            // Expand every disclosure so nothing is lost in the printed dossier.
            document.querySelectorAll("details").forEach(function (d) {
                d.open = true;
            });
            window.print();
        });
    }

    /* ------------------------------------------- Reading progress + to-top */
    function initProgressAndTopButton() {
        const bar = document.getElementById("progress-bar");
        const toTop = document.getElementById("to-top");
        let ticking = false;

        function update() {
            const scrolled = window.scrollY;
            const max = document.documentElement.scrollHeight - window.innerHeight;

            if (bar) {
                const ratio = max > 0 ? Math.min(scrolled / max, 1) : 0;
                bar.style.transform = "scaleX(" + ratio + ")";
            }
            if (toTop) {
                toTop.classList.toggle("visible", scrolled > window.innerHeight * 0.75);
            }
            ticking = false;
        }

        window.addEventListener("scroll", function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        }, { passive: true });

        window.addEventListener("resize", update, { passive: true });
        update();

        if (toTop) {
            toTop.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
            });
        }
    }

    /* ------------------------------------------------------------ Scroll spy */
    function initScrollSpy() {
        const links = Array.prototype.slice.call(
            document.querySelectorAll("#toc-list a[href^='#']")
        );
        if (!links.length) return;

        const sections = links
            .map(function (link) {
                return document.querySelector(link.getAttribute("href"));
            })
            .filter(Boolean);
        if (!sections.length) return;

        function setActive(id) {
            links.forEach(function (link) {
                const on = link.getAttribute("href") === "#" + id;
                link.classList.toggle("active", on);
                if (on) {
                    link.setAttribute("aria-current", "true");
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }

        if (!("IntersectionObserver" in window)) {
            setActive(sections[0].id);
            return;
        }

        const visible = new Map();
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        visible.set(entry.target.id, entry.intersectionRatio);
                    } else {
                        visible.delete(entry.target.id);
                    }
                });

                if (visible.size) {
                    // Highest section currently in view wins.
                    const topmost = sections.filter(function (s) {
                        return visible.has(s.id);
                    })[0];
                    if (topmost) setActive(topmost.id);
                } else if (window.scrollY < window.innerHeight * 0.5) {
                    setActive(sections[0].id);
                }
            },
            { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
        );

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    /* --------------------------------------------------------------- Reveal */
    function initReveal() {
        const items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
        if (!items.length) return;

        if (reduceMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (el) {
                el.classList.add("in");
            });
            return;
        }

        const observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("in");
                    obs.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
        );

        items.forEach(function (el, i) {
            // Stagger siblings slightly so grids cascade rather than pop as one block.
            el.style.transitionDelay = (i % 4) * 60 + "ms";
            observer.observe(el);
        });

        // Jumping to a section must never land on a blank screen, so reveal the
        // whole target immediately rather than waiting for the observer.
        function revealTarget(hash) {
            if (!hash || hash === "#") return;
            let target;
            try {
                target = document.querySelector(hash);
            } catch (err) {
                return;
            }
            if (!target) return;
            target.querySelectorAll(".reveal").forEach(function (el) {
                el.style.transitionDelay = "0ms";
                el.classList.add("in");
                observer.unobserve(el);
            });
        }

        document.addEventListener("click", function (e) {
            const link = e.target.closest("a[href^='#']");
            if (link) revealTarget(link.getAttribute("href"));
        });

        window.addEventListener("hashchange", function () {
            revealTarget(location.hash);
        });

        revealTarget(location.hash);

        // Safety net: anything already on screen before the observer fires.
        window.addEventListener("load", function () {
            items.forEach(function (el) {
                const r = el.getBoundingClientRect();
                if (r.top < window.innerHeight) el.classList.add("in");
            });
        });
    }
})();
