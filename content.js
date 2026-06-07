function hijackCopyHiddenButtons() {
    const rows = document.querySelectorAll(".resultset .row");

    rows.forEach(row => {
        // Grab the hidden copy button
        const hiddenCopy = row.querySelector(".copy.hidden");
        if (!hiddenCopy) return;
        if (hiddenCopy.dataset.patched) return;

        // Skip gems & currency
        const popup = row.querySelector(".item-popup");
        if (popup && (popup.classList.contains("item-popup--gem") || popup.classList.contains("item-popup--currency"))) {
            return;
        }

        hiddenCopy.dataset.patched = "true";

        const leftDiv = row.querySelector(".left");
        if (leftDiv) leftDiv.style.overflow = "visible";

        hiddenCopy.classList.remove("hidden");
        hiddenCopy.style.removeProperty("display");

        // Keep hover and click behavior intact
        hiddenCopy.addEventListener("click", () => {
            const itemText = parseItemDataSimple(row);
            const nameEl = row.querySelector(".item-popup__header-line");
            const itemName = nameEl ? nameEl.textContent.trim() : "Item";
            const itemColor = nameEl ? getComputedStyle(nameEl).color : "#fff";

            navigator.clipboard.writeText(itemText)
                .then(() => showCopyToast(itemName, itemColor))
                .catch(() => showCopyToast("Failed to copy!", "#fff"));
        });
    });
}

// Run initially and after DOM changes
hijackCopyHiddenButtons();
const observer = new MutationObserver(hijackCopyHiddenButtons);
observer.observe(document.body, { childList: true, subtree: true });

// Toast function
function showCopyToast(itemName, itemColor) {
    // Create isolated bottom-center container
    let container = document.querySelector('.my-copy-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'my-copy-toast-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
        });
        document.body.appendChild(container);
    }

    // Create the toast
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    Object.assign(toast.style, {
        position: 'relative',
        pointerEvents: 'auto',
        overflow: 'hidden',
        margin: '0 0 6px',
        padding: '14px 14px 14px 48px',
        backgroundColor: '#1e2124',
        opacity: '0',
        minWidth: '300px',
        borderRadius: '0px',
        boxSizing: 'border-box',
        fontFamily: 'FontinSmallCaps, Verdana, Arial, sans-serif',
        backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVEhLY2AYBfQMgf///3P8+/evAIgvA/FsIF+BavYDDWMBGroaSMMBiE8VC7AZDrIFaMFnii3AZTjUgsUUWUDA8OdAH6iQbQEhw4HyGsPEcKBXBIC4ARhex4G4BsjmweU1soIFaGg/WtoFZRIZdEvIMhxkCCjXIVsATV6gFGACs4Rsw0EGgIIH3QJYJgHSARQZDrWAB+jawzgs+Q2UO49D7jnRSRGoEFRILcdmEMWGI0cm0JJ2QpYA1RDvcmzJEWhABhD/pqrL0S0CWuABKgnRki9lLseS7g2AlqwHWQSKH4oKLrILpRGhEQCw2LiRUIa4lwAAAABJRU5ErkJggg==)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '15px',
    });

    // Message
    const text = document.createElement('div');
    text.className = 'toast-message';
    Object.assign(text.style, {
        fontSize: '16px',     // ⬅ base size ("Copied:")
        lineHeight: '1.2',
        color: '#fff',
    });

    text.innerHTML = `
        Copied:
        <span style="
            display: inline-block;
            margin-left: 6px;
            color: ${itemColor};
            font-family: FontinSmallCaps, Verdana, Arial, sans-serif;
            font-size: 16px;   /* ⬅ BIG item name */
        ">
            ${itemName}
        </span>
    `;

    toast.appendChild(text);
    container.appendChild(toast);

    // Animate in
    toast.animate(
        [
            { transform: 'translateY(20px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 0.8 }
        ],
        {
            duration: 300,
            easing: 'ease-out',
            fill: 'forwards'
        }
    );

    // Auto-remove
    setTimeout(() => {
        const fadeOut = toast.animate(
            [{ opacity: 0.8 }, { opacity: 0 }],
            {
                duration: 300,
                easing: 'ease-in',
                fill: 'forwards'
            }
        );
        fadeOut.onfinish = () => toast.remove();
    }, 3000);
}

function parseItemDataSimple(itemElement) {
    // Extract item class
    var itemClassEl = itemElement.querySelector(".item-popup__property .lc span");
    var itemClass = itemClassEl ? itemClassEl.textContent.trim() : "";

    // Extract rarity from popup
    var rarityMap = {
        "item-popup--rare": "Rare",
        "item-popup--magic": "Magic",
        "item-popup--normal": "Normal",
        "item-popup--unique": "Unique",
        "item-popup--relic": "Relic",
    };
    var rarity = "Unknown";
    var popup = itemElement.querySelector(".item-popup");
    if (popup) {
        var classList = popup.classList;
        for (var i = 0; i < classList.length; i++) {
            if (rarityMap[classList[i]]) {
                rarity = rarityMap[classList[i]];
                break;
            }
        }
    }

    var headerLines = itemElement.querySelectorAll(".item-popup__header-line");
    var itemName = "";
    var typeLine = "";
    if (headerLines.length >= 2) {
        itemName = headerLines[0].textContent.trim();
        typeLine = headerLines[1].textContent.trim();
    } else if (headerLines.length === 1) {
        typeLine = headerLines[0].textContent.trim();
    }

    // Extract properties (skip first .property)
    var properties = "";
    var skillsText = "";
    var propertyEls = itemElement.querySelectorAll(".item-property");
    for (var i = 1; i < propertyEls.length; i++) {
        if (propertyEls[i].classList.contains("item-popup__property--skill")) {
            // Treat skills separately
            skillsText += propertyEls[i].textContent.trim() + "\n";
        } else {
            properties += propertyEls[i].textContent.trim() + "\n";
        }
    }

    // Extract sockets
    var socketsLine = "";
    var iconContainer = itemElement.querySelector(".newItemContainer.itemRendered .iconContainer .icon");
    if (iconContainer) {
        var socketElements = iconContainer.querySelectorAll(".socket");
        if (socketElements.length > 0) {
            var socketText = [];
            for (var i = 0; i < socketElements.length; i++) socketText.push("S");
            socketsLine = "Sockets: " + socketText.join(" ");
        }
    }

    // Extract mods
    function extractMods(selector, label) {
        var mods = "";
        var modBlocks = itemElement.querySelectorAll(selector);

        for (var i = 0; i < modBlocks.length; i++) {
            var block = modBlocks[i];

            // Prefer normal stat lines
            var lines = block.querySelectorAll(".lc.s");

            // Fallback: bonded-style line
            if (lines.length === 0) {
                lines = block.querySelectorAll(".lc");
            }

            for (var j = 0; j < lines.length; j++) {
                // Split by <br> rendered as newlines
                var parts = lines[j].innerText
                    .split(/\n+/)
                    .map(s => s.trim())
                    .filter(Boolean);

                for (var k = 0; k < parts.length; k++) {
                    mods += parts[k];
                    if (label) mods += " (" + label + ")";
                    mods += "\n";
                }
            }
        }
        return mods;
    }

    var enchantMods = extractMods(".item-mod--enchant", "enchant");
    var runeMods = extractMods(".item-mod--rune", "rune");
    var implicitMods = extractMods(".item-mod--implicit", "implicit");
    var fracturedMods = extractMods(".item-mod--fractured", "fractured");
    var explicitMods = extractMods(".item-mod--explicit");
    var desecratedMods = extractMods(".item-mod--desecrated", "desecrated");
    var veiledMods = extractMods(".item-mod--veiled", "desecrated");
    var mutatedMods = extractMods(".item-mod--mutated", "mutated");

    var statusTexts = [];
    var statusDivs = itemElement.querySelectorAll('.item-popup__content > div:not([class])');
    const wordFilter = ["Sanctified", "Mirrored", "Unidentified", "Corrupted"]
    for (var i = 0; i < statusDivs.length; i++) {
        var statusText = statusDivs[i].textContent.trim();
        if (statusText && wordFilter.includes(statusText)) {
            statusTexts.push(statusText);
        }
    }

    // Build final string step by step
    var lines = [];
    if (itemClass) lines.push("Item Class: " + itemClass);
    lines.push("Rarity: " + rarity);
    if (itemName) lines.push(itemName);
    if (typeLine) lines.push(typeLine);

    if (properties) {
        lines.push("--------");
        lines.push(properties.trim());
    }
    if (socketsLine) {
        lines.push(socketsLine);
    }
    if (skillsText) {
        lines.push("--------");
        lines.push(skillsText.trim());
    }
    if (enchantMods) {
        lines.push("--------");
        lines.push(enchantMods.trim());
    }
    if (runeMods) {
        lines.push("--------");
        lines.push(runeMods.trim());
    }
    if (implicitMods) {
        lines.push("--------");
        lines.push(implicitMods.trim());
    }
    if (explicitMods) {
        lines.push("--------");
        lines.push(explicitMods.trim());
    }
    if (fracturedMods) lines.push(fracturedMods.trim());
    if (desecratedMods) lines.push(desecratedMods.trim());
    if (veiledMods) lines.push(veiledMods.trim());
    if (mutatedMods) lines.push(mutatedMods.trim());
    for (var i = 0; i < statusTexts.length; i++) {
        lines.push("--------");
        lines.push(statusTexts[i]);
    }

    return lines.join("\n");
}
