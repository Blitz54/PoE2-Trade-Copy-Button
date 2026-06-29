function hijackCopyHiddenButtons() {
	const rows = document.querySelectorAll(".resultset .row");

	rows.forEach(row => {
		const hiddenCopy = row.querySelector(".copy.hidden");
		if (!hiddenCopy) return;
		if (hiddenCopy.dataset.patched) return;

		const popup = row.querySelector(".item-popup");
		if (popup && (popup.classList.contains("item-popup--gem") || popup.classList.contains("item-popup--currency"))) {
			return;
		}

		hiddenCopy.dataset.patched = "true";

		const leftDiv = row.querySelector(".left");
		if (leftDiv) leftDiv.style.overflow = "visible";

		hiddenCopy.classList.remove("hidden");
		hiddenCopy.style.removeProperty("display");

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

hijackCopyHiddenButtons();
const observer = new MutationObserver(hijackCopyHiddenButtons);
observer.observe(document.body, { childList: true, subtree: true });

function showCopyToast(itemName, itemColor) {
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

	const text = document.createElement('div');
	text.className = 'toast-message';
	Object.assign(text.style, {
		fontSize: '16px',
		lineHeight: '1.2',
		color: '#fff',
	});

	text.appendChild(document.createTextNode("Copied:"));

	const span = document.createElement("span");
	Object.assign(span.style, {
		display: "inline-block",
		marginLeft: "6px",
		color: itemColor,
		fontFamily: "FontinSmallCaps, Verdana, Arial, sans-serif",
		fontSize: "16px",
	});

	span.textContent = itemName;
	text.appendChild(span);

	toast.appendChild(text);
	container.appendChild(toast);

	toast.animate(
		[
			{ transform: 'translateY(20px)', opacity: 0 },
			{ transform: 'translateY(0)', opacity: 0.8 }
		],
		{ duration: 300, easing: 'ease-out', fill: 'forwards' }
	);

	setTimeout(() => {
		const fadeOut = toast.animate(
			[{ opacity: 0.8 }, { opacity: 0 }],
			{ duration: 300, easing: 'ease-in', fill: 'forwards' }
		);
		fadeOut.onfinish = () => toast.remove();
	}, 3000);
}

function parseItemDataSimple(itemElement) {
	var itemClassEl = itemElement.querySelector(".item-popup__property .lc span");
	var itemClass = itemClassEl ? itemClassEl.textContent.trim() : "";

	var rarityMap = {
		"item-popup--rare": "Rare",
		"item-popup--runic-rare": "Rare",
		"item-popup--magic": "Magic",
		"item-popup--runic-magic": "Magic",
		"item-popup--normal": "Normal",
		"item-popup--runic-normal": "Normal",
		"item-popup--unique": "Unique",
		"item-popup--runic-unique": "Unique",
		"item-popup--relic": "Relic",
		"item-popup--runic-relic": "Relic", // May not exist, none on trade to test.
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

	var qualitySpiritLines = [];
	var requiresLines = [];
	var itemLevelLines = [];
	var otherPropLines = [];

	var propertyEls = itemElement.querySelectorAll(".item-property");
	for (var i = 1; i < propertyEls.length; i++) {
		var el = propertyEls[i];
		if (el.classList.contains("item-popup__property--skill")) continue;
		var text = el.textContent.trim();
		if (!text) continue;
		if (/^(Quality|Spirit)\b/.test(text)) {
			qualitySpiritLines.push(text);
		} else if (/^Requires:/.test(text)) {
			requiresLines.push(text);
		} else if (/^Item Level:/.test(text)) {
			itemLevelLines.push(text);
		} else {
			otherPropLines.push(text);
		}
	}

	var skillLines = [];
	var skillEls = itemElement.querySelectorAll(".item-property.item-popup__property--skill");
	for (var i = 0; i < skillEls.length; i++) {
		skillLines.push(skillEls[i].textContent.trim());
	}

	var socketsLine = "";
	var iconContainer = itemElement.querySelector(".newItemContainer.itemRendered .iconContainer .icon");
	if (iconContainer) {
		var socketElements = iconContainer.querySelectorAll(".socket");
		if (socketElements.length > 0) {
			var socketText = [];
			for (var i = 0; i < socketElements.length; i++) {
				if (socketElements[i].classList.contains("socket--jewel")) {
					socketText.push("J");
				} else if (socketElements[i].classList.contains("socket--rune")) {
					socketText.push("S");
				}
			}
			socketsLine = "Sockets: " + socketText.join(" ");
		}
	}

	// Parse "[37—42]" or "[11—17 to 20—30]" into [{min,max}, ...]
	function parseRangeText(rangeText) {
		var dual = rangeText.match(/\[(\d+(?:\.\d+)?)—(\d+(?:\.\d+)?)\s+to\s+(\d+(?:\.\d+)?)—(\d+(?:\.\d+)?)\]/);
		if (dual) {
			return [
				{ min: parseFloat(dual[1]), max: parseFloat(dual[2]) },
				{ min: parseFloat(dual[3]), max: parseFloat(dual[4]) }
			];
		}
		var single = rangeText.match(/\[(\d+(?:\.\d+)?)—(\d+(?:\.\d+)?)\]/);
		if (single) {
			return [{ min: parseFloat(single[1]), max: parseFloat(single[2]) }];
		}
		return [];
	}

	// Split a total across per-segment ranges using greedy clamping to midpoint
	function splitValue(total, segRanges) {
		var results = [];
		var remaining = total;
		for (var s = 0; s < segRanges.length; s++) {
			if (s === segRanges.length - 1) {
				results.push(Math.round(remaining * 100) / 100);
			} else {
				var rest = segRanges.slice(s + 1);
				var minRest = rest.reduce(function(a, r) { return a + r.min; }, 0);
				var maxRest = rest.reduce(function(a, r) { return a + r.max; }, 0);
				var assignMin = Math.max(segRanges[s].min, remaining - maxRest);
				var assignMax = Math.min(segRanges[s].max, remaining - minRest);
				var assign = Math.round(((assignMin + assignMax) / 2) * 100) / 100;
				results.push(assign);
				remaining -= assign;
			}
		}
		return results;
	}

	// Inject range(s) after first/second number in a stat line
	function injectRanges(line, ranges) {
		if (!ranges || ranges.length === 0) return line;
		if (ranges.length === 1) {
			return line.replace(/(-?\d+(?:\.\d+)?)/, function(m, num) {
				return num + "(" + ranges[0].min + "-" + ranges[0].max + ")";
			});
		}
		var count = 0;
		return line.replace(/(-?\d+(?:\.\d+)?)/g, function(m, num) {
			count++;
			if (count === 1) return num + "(" + ranges[0].min + "-" + ranges[0].max + ")";
			if (count === 2) return num + "(" + ranges[1].min + "-" + ranges[1].max + ")";
			return m;
		});
	}

	var suffixMap = {
		"item-mod--fractured":  "fractured",
		"item-mod--crafted":    "crafted",
		"item-mod--implicit":   "implicit",
		"item-mod--desecrated": "desecrated",
		"item-mod--veiled":     "veiled",
		"item-mod--mutated":    "mutated",
	};

	function extractModBlocks(selector, modEls) {
		var blocks = [];
		if (!modEls) modEls = Array.from(itemElement.querySelectorAll(selector));

		for (var i = 0; i < modEls.length; i++) {
			var mod = modEls[i];

			var modSuffixes = [];
			for (var cls in suffixMap) {
				if (mod.classList.contains(cls)) modSuffixes.push(suffixMap[cls]);
			}

			var leftEl = mod.querySelector(".lc.l.pr, .lc.l.su");
			if (!leftEl) {
				// No tier header (enchant/implicit/rune) — grab stat lines and inject range from .lc.l .d
				var statLines = [];
				var statEls = mod.querySelectorAll(".lc.s");
				if (statEls.length === 0) statEls = mod.querySelectorAll(".lc:not(.l):not(.r)");
				for (var j = 0; j < statEls.length; j++) {
					var parts = statEls[j].innerText.split(/\n+/).map(function(s) { return s.trim(); }).filter(Boolean);
					for (var k = 0; k < parts.length; k++) statLines.push(parts[k]);
				}
				var leftD = mod.querySelector(".lc.l .d");
				if (leftD && statLines.length > 0) {
					var ranges = parseRangeText(leftD.textContent.trim());
					var last = statLines.length - 1;
					statLines[last] = injectRanges(statLines[last], ranges);
				}
				if (statLines.length > 0) blocks.push({ header: null, lines: statLines, suffixes: modSuffixes });
				continue;
			}

			var leftRaw = leftEl.innerHTML;
			var leftSegments = leftRaw.split(/\s*\+\s*/);

			var rightD = mod.querySelector(".lc.r.pr .d, .lc.r.su .d");
			var rightRaw = rightD ? rightD.textContent.trim() : "";
			var rightSegments = rightRaw.split(/\s*\+\s*/);

			var statLines = [];
			var statEls = mod.querySelectorAll(".lc.s");
			if (statEls.length === 0) statEls = mod.querySelectorAll(".lc:not(.l):not(.r)");
			for (var j = 0; j < statEls.length; j++) {
				var parts = statEls[j].innerText.split(/\n+/).map(function(s) { return s.trim(); }).filter(Boolean);
				for (var k = 0; k < parts.length; k++) statLines.push(parts[k]);
			}
			if (statLines.length === 0) continue;

			if (leftSegments.length > 1) {
				// Combined mod — parse each segment independently
				var segHeaders = [];
				var segRangeArrays = [];

				for (var s = 0; s < leftSegments.length; s++) {
					var parser = new DOMParser();
					var tmp = parser.parseFromString(leftSegments[s], "text/html").body;
					var dEl = tmp.querySelector(".d");
					var rangeText = dEl ? dEl.textContent.trim() : "";
					if (dEl) dEl.remove();
					var psRaw = tmp.textContent.trim();
					var psMatch = psRaw.match(/^([PS])(\d+)$/);
					if (psMatch) {
						var type = psMatch[1] === "P" ? "Prefix" : "Suffix";
						var tier = psMatch[2];
						var rightSeg = (rightSegments[s] || "").trim();
						var modName = rightSeg.replace(/\s*\([^)]*\)\s*$/, "").trim();
						segHeaders.push('{ ' + type + ' Modifier "' + modName + '" (Tier: ' + tier + ') }');
					} else {
						segHeaders.push(psRaw || null);
					}
					segRangeArrays.push(parseRangeText(rangeText));
				}

				// Build per-segment copies of stat lines with split values injected
				var segLines = [];
				for (var s = 0; s < leftSegments.length; s++) segLines.push(statLines.slice());

				for (var li = 0; li < statLines.length; li++) {
					var line = statLines[li];
					var nums = [];
					line.replace(/(-?\d+(?:\.\d+)?)/g, function(m, num) { nums.push(parseFloat(num)); return m; });

					for (var ni = 0; ni < nums.length; ni++) {
						var rangesForPos = segRangeArrays.map(function(sr) {
							return (sr && sr[ni]) ? sr[ni] : (sr && sr[0]) ? sr[0] : null;
						});
						var validRanges = rangesForPos.filter(function(r) { return r !== null; });
						if (validRanges.length === 0) continue;

						var isInteger = (nums[ni] === Math.floor(nums[ni]));
						var splits = splitValue(nums[ni], validRanges);
						var splitIdx = 0;

						for (var s = 0; s < leftSegments.length; s++) {
							var r = rangesForPos[s];
							if (!r) continue;
							var val = splits[splitIdx++];
							if (isInteger) val = Math.round(val);
							var numCount = 0;
							segLines[s][li] = segLines[s][li].replace(/(-?\d+(?:\.\d+)?)/g, function(m, num) {
								if (numCount === ni) {
									numCount++;
									return val + "(" + r.min + "-" + r.max + ")";
								}
								numCount++;
								return m;
							});
						}
					}
				}

				// Merge segments with matching headers into one block
				for (var s = 0; s < leftSegments.length; s++) {
					var h = segHeaders[s];
					var existing = null;
					for (var b = 0; b < blocks.length; b++) {
						if (blocks[b].header === h) { existing = blocks[b]; break; }
					}
					if (existing) {
						for (var li = 0; li < segLines[s].length; li++) existing.lines.push(segLines[s][li]);
					} else {
						blocks.push({ header: h, lines: segLines[s], suffixes: modSuffixes });
					}
				}

			} else {
				// Single segment
				var parser = new DOMParser();
				var tmp = parser.parseFromString(leftSegments[0], "text/html").body;
				var dEl = tmp.querySelector(".d");
				var rangeText = dEl ? dEl.textContent.trim() : "";
				if (dEl) dEl.remove();
				var psRaw = tmp.textContent.trim();

				var header = null;
				var psMatch = psRaw.match(/^([PS])(\d+)$/);
				if (psMatch) {
					var type = psMatch[1] === "P" ? "Prefix" : "Suffix";
					var tier = psMatch[2];
					var modName = rightD ? rightD.textContent.trim().replace(/\s*\([^)]*\)\s*$/, "").trim() : "";
					header = '{ ' + type + ' Modifier "' + modName + '" (Tier: ' + tier + ') }';
				} else {
					header = psRaw || null;
				}

				var ranges = parseRangeText(rangeText);
				var last = statLines.length - 1;
				statLines[last] = injectRanges(statLines[last], ranges);

				// Merge into existing block with same header if present
				var existing = null;
				for (var b = 0; b < blocks.length; b++) {
					if (blocks[b].header === header) { existing = blocks[b]; break; }
				}
				if (existing) {
					for (var li = 0; li < statLines.length; li++) existing.lines.push(statLines[li]);
				} else {
					blocks.push({ header: header, lines: statLines, suffixes: modSuffixes });
				}
			}
		}
		return blocks;
	}

	var claimedMods = new Set();
	function claimAndExtract(selector) {
		var els = Array.from(itemElement.querySelectorAll(selector)).filter(function(el) {
			return !claimedMods.has(el);
		});
		els.forEach(function(el) { claimedMods.add(el); });
		return extractModBlocks(null, els);
	}

	var enchantBlocks    = claimAndExtract(".item-mod--enchant");
	var runeBlocks       = claimAndExtract(".item-mod--rune");
	var implicitBlocks   = claimAndExtract(".item-mod--implicit");
	var fracturedBlocks  = claimAndExtract(".item-mod--fractured");
	var explicitBlocks   = claimAndExtract(".item-mod--explicit");
	var desecratedBlocks = claimAndExtract(".item-mod--desecrated");
	var veiledBlocks     = claimAndExtract(".item-mod--veiled");
	var craftedBlocks    = claimAndExtract(".item-mod--crafted");
	var mutatedBlocks    = claimAndExtract(".item-mod--mutated");

	function renderBlocks(blocks, labelSuffix, uniqueFallback) {
		var out = "";
		for (var i = 0; i < blocks.length; i++) {
			var b = blocks[i];
			var header = b.header;
			if (!header && uniqueFallback) header = "{ Unique Modifier }";
			if (header) out += header + "\n";
			var suffix = (b.suffixes && b.suffixes.length > 0)
				? b.suffixes.join(") (")
				: labelSuffix;
			for (var j = 0; j < b.lines.length; j++) {
				out += b.lines[j];
				if (suffix) out += " (" + suffix + ")";
				out += "\n";
			}
		}
		return out;
	}

	// Enchant blocks always get { Corruption Enhancement } header — no tier info in DOM
	function renderEnchantBlocks(blocks) {
		var out = "";
		for (var i = 0; i < blocks.length; i++) {
			var b = blocks[i];
			out += "{ Corruption Enhancement }\n";
			for (var j = 0; j < b.lines.length; j++) {
				out += b.lines[j] + "\n";
			}
		}
		return out;
	}

	var enchantMods    = renderEnchantBlocks(enchantBlocks);
	var runeMods       = renderBlocks(runeBlocks, "rune");
	var implicitMods   = renderBlocks(implicitBlocks, "implicit");
	var fracturedMods  = renderBlocks(fracturedBlocks, null);
	var explicitMods   = renderBlocks(explicitBlocks, null, rarity === "Unique" || rarity === "Relic");
	var craftedMods    = renderBlocks(craftedBlocks, null);
	var veiledMods     = renderBlocks(veiledBlocks, null);
	var desecratedMods = renderBlocks(desecratedBlocks, null);
	var mutatedMods    = renderBlocks(mutatedBlocks, null);

	var statusTexts = [];
	var statusDivs = itemElement.querySelectorAll('.item-popup__content > div:not([class])');
	var wordFilter = ["Sanctified", "Mirrored", "Unidentified", "Corrupted", "Twice Corrupted"];
	for (var i = 0; i < statusDivs.length; i++) {
		var statusText = statusDivs[i].textContent.trim();
		if (statusText && wordFilter.includes(statusText)) {
			statusTexts.push(statusText);
		}
	}

	var lines = [];
	if (itemClass) lines.push("Item Class: " + itemClass);
	lines.push("Rarity: " + rarity);
	if (itemName) lines.push(itemName);
	if (typeLine) lines.push(typeLine);

	if (qualitySpiritLines.length > 0) {
		lines.push("--------");
		lines.push(qualitySpiritLines.join("\n"));
	}
	if (otherPropLines.length > 0) {
		lines.push("--------");
		lines.push(otherPropLines.join("\n"));
	}
	if (requiresLines.length > 0) {
		lines.push("--------");
		lines.push(requiresLines.join("\n"));
	}
	if (socketsLine) {
		lines.push("--------");
		lines.push(socketsLine);
	}
	if (itemLevelLines.length > 0) {
		lines.push("--------");
		lines.push(itemLevelLines.join("\n"));
	}
	if (enchantMods) {
		lines.push("--------");
		lines.push(enchantMods.trim());
	}
	if (runeMods) {
		lines.push("--------");
		lines.push(runeMods.trim());
	}
	if (skillLines.length > 0) {
		lines.push("--------");
		lines.push(skillLines.join("\n"));
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
	if (craftedMods) lines.push(craftedMods.trim());
	if (veiledMods) lines.push(veiledMods.trim());
	if (desecratedMods) lines.push(desecratedMods.trim());
	if (mutatedMods) lines.push(mutatedMods.trim());
	for (var i = 0; i < statusTexts.length; i++) {
		lines.push("--------");
		lines.push(statusTexts[i]);
	}

	return lines.join("\n");
}