function hijackCopyHiddenButtons() {
    const rows = document.querySelectorAll(".resultset .row");

    rows.forEach(row => {
        // Grab the hidden copy button
        const hiddenCopy = row.querySelector(".copy.hidden");
        if (!hiddenCopy) return;
        if (hiddenCopy.dataset.patched) return;
        hiddenCopy.dataset.patched = "true";

        // Skip if this row is a gem popup
        const popup = row.querySelector(".itemPopupContainer");
        if (popup && popup.classList.contains("gemPopup")) return;
        if (popup && popup.classList.contains("currencyPopup")) return;

        // Make parent container allow overflow
        const leftDiv = row.querySelector(".left");
        if (leftDiv) leftDiv.style.overflow = "visible";

        // Remove inline "display: none" or hidden class
        hiddenCopy.classList.remove("hidden");
        hiddenCopy.style.removeProperty("display");

        // Keep hover and click behavior intact
        hiddenCopy.addEventListener("click", () => {
            const itemText = parseItemDataSimple(row);
            const itemName = itemText.split("\n")[2] || "Item";
            navigator.clipboard.writeText(itemText)
                .then(() => showCopyToast("Copied: " + itemName))
                .catch(() => showCopyToast("Failed to copy!"));
        });
    });
}

// Run initially and after DOM changes
hijackCopyHiddenButtons();
const observer = new MutationObserver(hijackCopyHiddenButtons);
observer.observe(document.body, { childList: true, subtree: true });

// Toast function
function showCopyToast(message) {
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

    // Create the toast exactly as it was working before
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.style.position = 'relative';
    toast.style.pointerEvents = 'auto';
    toast.style.overflow = 'hidden';
    toast.style.margin = '0 0 6px';
    toast.style.padding = '14px 14px 14px 48px'; // leave space for icon
    toast.style.backgroundColor = '#1e2124';
    toast.style.color = '#fff';
    toast.style.opacity = '0';
    toast.style.minWidth = '300px';
    toast.style.borderRadius = '0px';
    toast.style.boxSizing = 'border-box';
    toast.style.backgroundImage = 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADsSURBVEhLY2AYBfQMgf///3P8+/evAIgvA/FsIF+BavYDDWMBGroaSMMBiE8VC7AZDrIFaMFnii3AZTjUgsUUWUDA8OdAH6iQbQEhw4HyGsPEcKBXBIC4ARhex4G4BsjmweU1soIFaGg/WtoFZRIZdEvIMhxkCCjXIVsATV6gFGACs4Rsw0EGgIIH3QJYJgHSARQZDrWAB+jawzgs+Q2UO49D7jnRSRGoEFRILcdmEMWGI0cm0JJ2QpYA1RDvcmzJEWhABhD/pqrL0S0CWuABKgnRki9lLseS7g2AlqwHWQSKH4oKLrILpRGhEQCw2LiRUIa4lwAAAABJRU5ErkJggg==)'; // ✅ same checkmark as before
    toast.style.backgroundRepeat = 'no-repeat';
    toast.style.backgroundPosition = '15px';
    toast.style.backgroundSize = 'auto';

    // Add text
    const text = document.createElement('div');
    text.className = 'toast-message';
    text.textContent = message;
    toast.appendChild(text);

    // Append to container
    container.appendChild(toast);

    // Animate in
    toast.animate([
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 0.8 }
    ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    });

    // Auto-remove
    setTimeout(() => {
        const fadeOut = toast.animate([
            { opacity: 0.8 },
            { opacity: 0 }
        ], {
            duration: 300,
            easing: 'ease-in',
            fill: 'forwards'
        });
        fadeOut.onfinish = () => toast.remove();
    }, 3000);
}

function parseItemDataSimple(itemElement) {
    // Extract item class
    var itemClassEl = itemElement.querySelector(".property .lc span");
    var itemClass = itemClassEl ? itemClassEl.textContent.trim() : "";

    // Extract rarity from popup
    var rarityMap = {
        rarePopup: "Rare",
        magicPopup: "Magic",
        normalPopup: "Normal",
        uniquePopup: "Unique",
        relicPopup: "Relic",
    };
    var rarity = "Unknown";
    var popup = itemElement.querySelector(".itemPopupContainer");
    if (popup) {
        var classList = popup.classList;
        for (var i = 0; i < classList.length; i++) {
            if (rarityMap[classList[i]]) {
                rarity = rarityMap[classList[i]];
                break;
            }
        }
    }

    // Extract item name
    var itemNameEl = itemElement.querySelector(".itemName .lc");
    var itemName = itemNameEl ? itemNameEl.textContent.trim() : "";

    // Extract type line
    var typeLineEl = itemElement.querySelector(".itemName.typeLine .lc");
    var typeLine = typeLineEl ? typeLineEl.textContent.trim() : "";

    // Extract properties (skip first .property)
    var properties = "";
    var skillsText = "";
    var propertyEls = itemElement.querySelectorAll(".property");
    for (var i = 1; i < propertyEls.length; i++) {
        if (propertyEls[i].classList.contains("skill")) {
            // Treat skills separately
            skillsText += propertyEls[i].textContent.trim() + "\n";
        } else {
            properties += propertyEls[i].textContent.trim() + "\n";
        }
    }

    // Extract requirements
    var requirements = "";
    var reqEl = itemElement.querySelector(".requirements");
    if (reqEl) {
        var reqText = reqEl.textContent.trim();
        if (reqText.match(/Level\s(\d+)/)) requirements += "Level " + reqText.match(/Level\s(\d+)/)[1] + ", ";
        if (reqText.match(/(\d+)\sStr/)) requirements += reqText.match(/(\d+)\sStr/)[1] + " Str, ";
        if (reqText.match(/(\d+)\sDex/)) requirements += reqText.match(/(\d+)\sDex/)[1] + " Dex, ";
        if (reqText.match(/(\d+)\sInt/)) requirements += reqText.match(/(\d+)\sInt/)[1] + " Int" + "\n";
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

    // Item level
    var itemLevelEl = itemElement.querySelector(".itemLevel .colourDefault");
    var itemLevel = itemLevelEl ? itemLevelEl.textContent.trim() : "";

    // Extract mods
    function extractMods(selector, label) {
        var mods = "";
        var elements = itemElement.querySelectorAll(selector + " .s, " + selector + " .suffix");
        for (var i = 0; i < elements.length; i++) {
            mods += elements[i].textContent.trim();
            if (label) mods += " (" + label + ")";
            mods += "\n";
        }
        return mods;
    }

    var enchantMods = extractMods(".enchantMod", "enchant");
    var runeMods = extractMods(".runeMod", "rune");
    var implicitMods = extractMods(".implicitMod", "implicit");
    var fracturedMods = extractMods(".fracturedMod", "fractured");
    var explicitMods = extractMods(".explicitMod");
    var desecratedMods = extractMods(".desecratedMod", "desecrated");
    var veiledMods = extractMods(".veiledMod", "desecrated");
    var mutatedMods = extractMods(".mutatedMod", "mutated");

    // Corrupted / Unidentified
    var unmetEl = itemElement.querySelector(".unmet");
    var unmet = unmetEl ? unmetEl.textContent.trim() : "";

    // Sanctified
    var sanctifiedEl = itemElement.querySelector(".sanctified");
    var sanctified = sanctifiedEl ? sanctifiedEl.textContent.trim() : "";
    
    // Mirrored
    var augmentedEl = itemElement.querySelector(".augmented");
    var augmented = augmentedEl ? augmentedEl.textContent.trim() : "";

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
    if (requirements) {
        lines.push("--------");
        lines.push("Requires: " + requirements.trim());
    }
    if (socketsLine) {
        lines.push("--------");
        lines.push(socketsLine);
    }
    if (itemLevel) {
        lines.push("--------");
        lines.push("Item Level: " + itemLevel);
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
    if (fracturedMods) lines.push(fracturedMods.trim());
    if (explicitMods) {
        lines.push("--------");
        lines.push(explicitMods.trim());
    }
    if (desecratedMods) lines.push(desecratedMods.trim());
    if (veiledMods) lines.push(veiledMods.trim());
    if (mutatedMods) lines.push(mutatedMods.trim());
    if (unmet) {
        lines.push("--------");
        lines.push(unmet);
    }
    if (sanctified) {
        lines.push("--------");
        lines.push(sanctified);
    }
    if (augmented) {
        lines.push("--------");
        lines.push(augmented);
    }

    return lines.join("\n");
}
