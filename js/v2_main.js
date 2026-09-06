/**
 * Teaching Dossier Version 2 (Executive 2-Page Edition)
 * Interactive behaviors: Discipline filtering, modal preview, print trigger
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Discipline Filter Chips in Curriculum Section
    const filterChips = document.querySelectorAll(".filter-chip");
    const epochCards = document.querySelectorAll(".epoch-card");

    const categoryKeywords = {
        "all": [],
        "ai-code": ["AI", "Creative Coding", "ComfyUI", "LoRA", "Algorithm", "p5.js", "Python"],
        "phys-comp": ["Physical Computation", "Microcontrollers", "Arduino", "ESP32", "Circuits", "Sensors"],
        "speculative": ["Speculative", "Design Fiction", "Future Labs", "Agency", "Memory", "Theory"],
        "fabrication": ["3D Printing", "Fabrication", "Lighting", "CAD", "Rhino", "FEA", "Manufacturing"]
    };

    filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const filter = chip.dataset.filter || "all";

            // Update active state
            filterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");

            // Filter or highlight cards
            if (filter === "all") {
                epochCards.forEach(card => {
                    card.style.opacity = "1";
                    card.style.borderColor = "var(--border-subtle)";
                    card.style.transform = "none";
                });
            } else {
                const keywords = categoryKeywords[filter] || [];
                epochCards.forEach(card => {
                    const cardText = card.textContent.toLowerCase();
                    const hasMatch = keywords.some(kw => cardText.includes(kw.toLowerCase()));
                    if (hasMatch) {
                        card.style.opacity = "1";
                        card.style.borderColor = "var(--accent-light)";
                        card.style.transform = "translateY(-3px)";
                    } else {
                        card.style.opacity = "0.45";
                        card.style.borderColor = "var(--border-subtle)";
                        card.style.transform = "none";
                    }
                });
            }
        });
    });

    // 2. Print Executive 2-Page PDF Trigger
    const printBtns = document.querySelectorAll("[data-action='print-dossier']");
    printBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            window.print();
        });
    });

    // 3. Smooth scroll with offset for internal anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });
});
