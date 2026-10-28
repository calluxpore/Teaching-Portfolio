/* Teaching Dossier interaction layer
   Theme toggle, print, section spy, entrances, rolling figures, the studio
   register filter and the footage loop. */

(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canObserve = "IntersectionObserver" in window;

    document.addEventListener("DOMContentLoaded", function () {
        initTheme();
        initPrint();
        initSectionSpy();
        initRolls();
        initReveal();
        initRegister();
        initLoop();
    });

    /* ---------------------------------------------------------------- Theme */
    function initTheme() {
        const root = document.documentElement;
        const toggle = document.getElementById("theme-toggle");
        if (!toggle) return;

        syncLabel();
        toggle.addEventListener("click", function () {
            const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
            root.setAttribute("data-theme", next);
            try {
                localStorage.setItem("theme", next);
            } catch (err) {
                /* Storage can be blocked; the choice then lasts for this visit. */
            }
            syncLabel();
        });

        function syncLabel() {
            const isLight = root.getAttribute("data-theme") === "light";
            toggle.setAttribute("aria-label", isLight ? "Switch to green" : "Switch to light mode");
        }
    }

    /* ---------------------------------------------------------------- Print */
    function initPrint() {
        const buttons = document.querySelectorAll("[data-print]");
        const hint = document.getElementById("print-hint");

        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                // Show every entrance and figure in its final state before printing.
                document.querySelectorAll("[data-reveal], .roll, .place__picture, .pin__photo").forEach(function (el) {
                    el.classList.add("is-in");
                });
                // The browser's own header/footer cannot be turned off from CSS, so
                // surface the one control that does it once the dialog is open.
                if (hint) hint.hidden = false;
                window.print();
            });
        });
    }

    /* -------------------------------------------------------- Section spy */
    function initSectionSpy() {
        const links = Array.prototype.slice.call(document.querySelectorAll(".bar__nav a[href^='#']"));
        if (!links.length || !canObserve) return;

        const sections = links
            .map(function (link) {
                return document.querySelector(link.getAttribute("href"));
            })
            .filter(Boolean);

        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    links.forEach(function (link) {
                        const on = link.getAttribute("href") === "#" + entry.target.id;
                        if (on) link.setAttribute("aria-current", "true");
                        else link.removeAttribute("aria-current");
                    });
                });
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );

        sections.forEach(function (section) {
            observer.observe(section);
        });
    }

    /* ------------------------------------------------------ Rolling figures */
    function initRolls() {
        const els = Array.prototype.slice.call(document.querySelectorAll("[data-roll]"));
        if (!els.length) return;

        els.forEach(function (el) {
            const value = el.textContent.trim();
            const said = document.createElement("span");
            said.className = "sr-only";
            said.textContent = value;

            const shown = document.createElement("span");
            shown.className = "roll__digits";
            shown.setAttribute("aria-hidden", "true");

            let i = 0;
            for (const ch of value) {
                if (!/\d/.test(ch)) {
                    shown.append(ch);
                    continue;
                }
                const col = document.createElement("span");
                col.className = "roll__col";
                const strip = document.createElement("span");
                strip.className = "roll__strip";
                strip.style.setProperty("--d", ch);
                strip.style.setProperty("--i", i++);
                col.append(strip);
                shown.append(col);
            }

            el.classList.add("roll");
            el.replaceChildren(said, shown);
        });

        if (reduceMotion || !canObserve) {
            els.forEach(function (el) {
                el.classList.add("is-in");
            });
            return;
        }

        const io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-in");
                    io.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -15% 0px" }
        );
        els.forEach(function (el) {
            io.observe(el);
        });
    }

    /* --------------------------------------------------------------- Reveal */
    function initReveal() {
        const items = Array.prototype.slice.call(
            document.querySelectorAll("[data-reveal], .place__picture, .pin__photo")
        );
        if (!items.length) return;

        // Stagger each section's parts in reading order rather than one block at a time.
        document.querySelectorAll("main > section, footer").forEach(function (section) {
            section.querySelectorAll("[data-reveal]").forEach(function (el, i) {
                el.style.setProperty("--i", Math.min(i, 5));
            });
        });

        if (reduceMotion || !canObserve) {
            items.forEach(function (el) {
                el.classList.add("is-in");
            });
            return;
        }

        const observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-in");
                    obs.unobserve(entry.target);
                });
            },
            { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
        );
        items.forEach(function (el) {
            observer.observe(el);
        });

        // Jumping to a section must never land on a blank screen.
        function revealTarget(hash) {
            if (!hash || hash === "#") return;
            let target;
            try {
                target = document.querySelector(hash);
            } catch (err) {
                return;
            }
            if (!target) return;
            target.querySelectorAll("[data-reveal], .place__picture, .pin__photo").forEach(function (el) {
                el.style.setProperty("--i", 0);
                el.classList.add("is-in");
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
    }

    /* ------------------------------------------------------ Studio register */
    function initRegister() {
        const buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        const groups = Array.prototype.slice.call(document.querySelectorAll(".reg tbody[data-year]"));
        const totals = document.querySelector("[data-totals]");
        if (!buttons.length || !groups.length) return;

        const fmt = new Intl.NumberFormat("en-GB");

        buttons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                apply(btn.getAttribute("data-filter"));
                buttons.forEach(function (b) {
                    b.setAttribute("aria-pressed", b === btn ? "true" : "false");
                });
            });
        });

        function apply(inst) {
            let count = 0;
            let hours = 0;
            let students = 0;
            let n = 0;

            groups.forEach(function (group) {
                let visible = 0;
                group.querySelectorAll("tr[data-inst]").forEach(function (row) {
                    const show = inst === "all" || row.getAttribute("data-inst") === inst;
                    row.hidden = !show;
                    row.classList.remove("is-shown");
                    if (!show) return;
                    visible++;
                    count++;
                    hours += Number(row.getAttribute("data-h"));
                    students += Number(row.getAttribute("data-s"));
                    row.style.setProperty("--n", n++);
                    // Restart the arrival for the rows that remain.
                    void row.offsetWidth;
                    row.classList.add("is-shown");
                });
                group.hidden = visible === 0;
            });

            if (totals) {
                totals.textContent =
                    count + (count === 1 ? " studio, " : " studios, ") +
                    fmt.format(hours) + " hours, " +
                    fmt.format(students) + " students";
            }
        }
    }

    /* -------------------------------------------------------- Footage loop */
    function initLoop() {
        const video = document.querySelector("[data-loop]");
        if (!video) return;
        // Reduced motion keeps the poster frame.
        if (reduceMotion) return;

        function play() {
            const p = video.play();
            if (p && p.catch) p.catch(function () { });
        }

        if (!canObserve) {
            play();
            return;
        }

        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !document.hidden) play();
                else video.pause();
            });
        }).observe(video);

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) video.pause();
        });
    }
})();
