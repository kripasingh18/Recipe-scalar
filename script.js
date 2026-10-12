/**
 * MISE EN SCALE — Artisan Recipe & Baking Scaler
 * Pure Vanilla JavaScript (No frameworks, No external libraries)
 */

(function () {
  'use strict';

  // --- STORAGE KEYS ---
  const STORAGE_KEY = 'mise_en_scale_current_recipe';

  // --- PRESET RECIPES ---
  const PRESET_RECIPES = {
    cookies: {
      id: 'cookies',
      title: 'Artisan Chewy Chocolate Chip Cookies',
      baseYield: 24,
      yieldUnit: 'cookies',
      targetYield: 24,
      notes: 'Bake at 375°F (190°C) for 10-12 mins until edges are golden and center is soft.',
      ingredients: [
        { id: 'ing-1', qty: 2.25, unit: 'cups', name: 'All-purpose flour', prep: 'spooned and leveled' },
        { id: 'ing-2', qty: 1, unit: 'tsp', name: 'Baking soda', prep: '' },
        { id: 'ing-3', qty: 0.5, unit: 'tsp', name: 'Fine sea salt', prep: '' },
        { id: 'ing-4', qty: 1, unit: 'cups', name: 'Unsalted butter', prep: 'softened to room temp' },
        { id: 'ing-5', qty: 0.75, unit: 'cups', name: 'Granulated cane sugar', prep: '' },
        { id: 'ing-6', qty: 0.75, unit: 'cups', name: 'Packed dark brown sugar', prep: '' },
        { id: 'ing-7', qty: 2, unit: 'whole', name: 'Large eggs', prep: 'room temperature' },
        { id: 'ing-8', qty: 2, unit: 'tsp', name: 'Pure vanilla extract', prep: '' },
        { id: 'ing-9', qty: 2, unit: 'cups', name: 'Semisweet chocolate chunks (60%)', prep: '' }
      ]
    },
    focaccia: {
      id: 'focaccia',
      title: 'Rustic Rosemary & Olive Focaccia',
      baseYield: 8,
      yieldUnit: 'slices',
      targetYield: 8,
      notes: 'Ferment in fridge overnight. Bake at 425°F (220°C) in a seasoned 9x13 pan.',
      ingredients: [
        { id: 'ing-1', qty: 500, unit: 'grams', name: 'Bread flour (high protein)', prep: '' },
        { id: 'ing-2', qty: 420, unit: 'ml', name: 'Lukewarm water', prep: 'approx 84% hydration' },
        { id: 'ing-3', qty: 7, unit: 'grams', name: 'Instant dry yeast', prep: '1 packet' },
        { id: 'ing-4', qty: 10, unit: 'grams', name: 'Fine sea salt', prep: '' },
        { id: 'ing-5', qty: 4, unit: 'tbsp', name: 'Extra virgin olive oil', prep: 'divided' },
        { id: 'ing-6', qty: 2, unit: 'tbsp', name: 'Fresh rosemary leaves', prep: 'roughly bruised' },
        { id: 'ing-7', qty: 1, unit: 'tsp', name: 'Flaky Maldon finishing salt', prep: 'for topping' }
      ]
    },
    carbonara: {
      id: 'carbonara',
      title: 'Classic Roman Spaghetti alla Carbonara',
      baseYield: 4,
      yieldUnit: 'servings',
      targetYield: 4,
      notes: 'No cream! Temper eggs and cheese with reserved starchy pasta water.',
      ingredients: [
        { id: 'ing-1', qty: 400, unit: 'grams', name: 'Spaghetti or Rigatoni', prep: 'bronze-die cut' },
        { id: 'ing-2', qty: 200, unit: 'grams', name: 'Guanciale (or cured pancetta)', prep: 'sliced in 1/4" batons' },
        { id: 'ing-3', qty: 4, unit: 'whole', name: 'Fresh egg yolks', prep: 'large' },
        { id: 'ing-4', qty: 1, unit: 'whole', name: 'Whole egg', prep: '' },
        { id: 'ing-5', qty: 100, unit: 'grams', name: 'Pecorino Romano', prep: 'finely microplaned' },
        { id: 'ing-6', qty: 1.5, unit: 'tsp', name: 'Freshly cracked black pepper', prep: 'coarsely toasted' }
      ]
    }
  };

  // --- STANDARD UNITS ---
  const STANDARD_UNITS = [
    { value: 'cups', label: 'cups' },
    { value: 'tbsp', label: 'tbsp (tablespoons)' },
    { value: 'tsp', label: 'tsp (teaspoons)' },
    { value: 'grams', label: 'g (grams)' },
    { value: 'kg', label: 'kg (kilograms)' },
    { value: 'ml', label: 'ml (milliliters)' },
    { value: 'liters', label: 'liters' },
    { value: 'oz', label: 'oz (ounces)' },
    { value: 'lbs', label: 'lbs (pounds)' },
    { value: 'whole', label: 'whole / items' },
    { value: 'cloves', label: 'cloves' },
    { value: 'pinch', label: 'pinch' },
    { value: 'dash', label: 'dash' },
    { value: 'stalks', label: 'stalks' },
    { value: 'slices', label: 'slices' }
  ];

  // --- APPLICATION STATE ---
  let currentRecipe = {
    title: '',
    baseYield: 1,
    yieldUnit: 'servings',
    targetYield: 1,
    notes: '',
    ingredients: []
  };

  let displayFormat = 'fractions'; // 'fractions' | 'decimals'
  let checkedIngredientIds = new Set();
  let currentActivePresetId = null;

  // --- CULINARY FRACTION CONVERTER ---
  const CULINARY_FRACTIONS = [
    { decimal: 0.125, fraction: '⅛' },
    { decimal: 0.166, fraction: '⅙' },
    { decimal: 0.25,  fraction: '¼' },
    { decimal: 0.333, fraction: '⅓' },
    { decimal: 0.375, fraction: '⅜' },
    { decimal: 0.5,   fraction: '½' },
    { decimal: 0.625, fraction: '⅝' },
    { decimal: 0.666, fraction: '⅔' },
    { decimal: 0.75,  fraction: '¾' },
    { decimal: 0.833, fraction: '⅚' },
    { decimal: 0.875, fraction: '⅞' }
  ];

  /**
   * Sanitizes input to ensure it is a strictly positive number (> 0)
   */
  function sanitizeServingNumber(val) {
    if (typeof val === 'number') {
      return !isNaN(val) && val > 0 && isFinite(val) ? val : null;
    }
    if (!val || typeof val !== 'string') return null;
    const clean = val.trim();
    if (!clean) return null;
    const num = parseFloat(clean);
    if (isNaN(num) || num <= 0 || !isFinite(num)) {
      return null;
    }
    return num;
  }

  /**
   * Parses user input string (e.g., "1 1/2", "3/4", "2.5") into float
   */
  function parseCulinaryNumber(str) {
    if (typeof str === 'number') return isNaN(str) || str <= 0 ? 0 : str;
    if (!str || typeof str !== 'string') return 0;
    const clean = str.trim();
    if (!clean) return 0;

    // Mixed fraction like "1 1/2" or "2 3/4"
    if (clean.includes(' ') && clean.includes('/')) {
      const parts = clean.split(/\s+/);
      const whole = parseFloat(parts[0]) || 0;
      const fracParts = parts[1].split('/');
      if (fracParts.length === 2) {
        const num = parseFloat(fracParts[0]);
        const den = parseFloat(fracParts[1]);
        if (den !== 0) return Math.max(0, whole + (num / den));
      }
    }

    // Pure fraction like "1/2" or "3/4"
    if (clean.includes('/')) {
      const fracParts = clean.split('/');
      if (fracParts.length === 2) {
        const num = parseFloat(fracParts[0]);
        const den = parseFloat(fracParts[1]);
        if (den !== 0) return Math.max(0, num / den);
      }
    }

    // Standard decimal or integer
    const parsed = parseFloat(clean);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }

  /**
   * Formats a positive number into readable baking fraction or decimal
   */
  function formatQuantity(num, format) {
    if (num <= 0) return '0';
    if (format === 'decimals') {
      return parseFloat(num.toFixed(2)).toString();
    }

    // Fraction format
    const whole = Math.floor(num);
    const remainder = num - whole;

    if (remainder < 0.04) {
      return whole.toString();
    }

    let closestFrac = null;
    let minDiff = 0.08;

    for (const item of CULINARY_FRACTIONS) {
      const diff = Math.abs(remainder - item.decimal);
      if (diff < minDiff) {
        minDiff = diff;
        closestFrac = item.fraction;
      }
    }

    if (closestFrac) {
      return whole > 0 ? `${whole} ${closestFrac}` : closestFrac;
    }

    return parseFloat(num.toFixed(2)).toString();
  }

  // --- DOM ELEMENTS ---
  const el = {
    // Header
    recipeTitleInput: document.getElementById('recipeTitleInput'),
    baseYieldInput: document.getElementById('baseYieldInput'),
    yieldUnitInput: document.getElementById('yieldUnitInput'),
    recipeNotesInput: document.getElementById('recipeNotesInput'),
    baseYieldError: document.getElementById('baseYieldError'),
    baseYieldDec: document.getElementById('baseYieldDec'),
    baseYieldInc: document.getElementById('baseYieldInc'),

    // Presets & New Recipe
    presetCookies: document.getElementById('presetCookies'),
    presetFocaccia: document.getElementById('presetFocaccia'),
    presetCarbonara: document.getElementById('presetCarbonara'),
    newRecipeBtn: document.getElementById('newRecipeBtn'),
    syncStatusText: document.getElementById('syncStatusText'),

    // Ingredients Builder
    ingredientsList: document.getElementById('ingredientsList'),
    addIngredientBtn: document.getElementById('addIngredientBtn'),
    pasteRecipeBtn: document.getElementById('pasteRecipeBtn'),
    clearIngredientsBtn: document.getElementById('clearIngredientsBtn'),

    // Scaler Controls
    scaleMultiplierDisplay: document.getElementById('scaleMultiplierDisplay'),
    scaleFactorSubtext: document.getElementById('scaleFactorSubtext'),
    targetYieldInput: document.getElementById('targetYieldInput'),
    targetYieldUnitLabel: document.getElementById('targetYieldUnitLabel'),
    targetYieldDec: document.getElementById('targetYieldDec'),
    targetYieldInc: document.getElementById('targetYieldInc'),
    yieldSlider: document.getElementById('yieldSlider'),
    sliderMinLabel: document.getElementById('sliderMinLabel'),
    sliderMaxLabel: document.getElementById('sliderMaxLabel'),
    targetYieldError: document.getElementById('targetYieldError'),
    scaleByIngBtn: document.getElementById('scaleByIngBtn'),

    // Multiplier Quick Buttons
    scalePills: document.querySelectorAll('.scale-pill'),

    // Scaled List & View
    scaledOutputList: document.getElementById('scaledOutputList'),
    scaledTitleHeading: document.getElementById('scaledTitleHeading'),
    scaledYieldHeading: document.getElementById('scaledYieldHeading'),
    checkedProgressText: document.getElementById('checkedProgressText'),
    checkedProgressBar: document.getElementById('checkedProgressBar'),
    resetChecksBtn: document.getElementById('resetChecksBtn'),
    toggleFractionsBtn: document.getElementById('toggleFractionsBtn'),
    toggleDecimalsBtn: document.getElementById('toggleDecimalsBtn'),

    // Bottom Action Buttons
    copyRecipeBtn: document.getElementById('copyRecipeBtn'),
    printRecipeBtn: document.getElementById('printRecipeBtn'),
    cookModeBtn: document.getElementById('cookModeBtn'),

    // Print Header for media print
    printRecipeTitle: document.getElementById('printRecipeTitle'),
    printRecipeYield: document.getElementById('printRecipeYield'),
    printRecipeNotes: document.getElementById('printRecipeNotes'),

    // Modals
    pasteModal: document.getElementById('pasteModal'),
    closePasteModalBtn: document.getElementById('closePasteModalBtn'),
    pasteTextInput: document.getElementById('pasteTextInput'),
    executePasteBtn: document.getElementById('executePasteBtn'),

    scaleByModal: document.getElementById('scaleByModal'),
    closeScaleByModalBtn: document.getElementById('closeScaleByModalBtn'),
    scaleBySelect: document.getElementById('scaleBySelect'),
    scaleByCurrentQty: document.getElementById('scaleByCurrentQty'),
    scaleByNewQty: document.getElementById('scaleByNewQty'),
    executeScaleByBtn: document.getElementById('executeScaleByBtn'),

    cookModeOverlay: document.getElementById('cookModeOverlay'),
    closeCookModeBtn: document.getElementById('closeCookModeBtn'),
    cookModeTitle: document.getElementById('cookModeTitle'),
    cookModeGrid: document.getElementById('cookModeGrid'),

    // New Recipe Modal
    newRecipeModal: document.getElementById('newRecipeModal'),
    closeNewRecipeModalBtn: document.getElementById('closeNewRecipeModalBtn'),
    cancelNewRecipeBtn: document.getElementById('cancelNewRecipeBtn'),
    confirmNewRecipeBtn: document.getElementById('confirmNewRecipeBtn'),

    // Print Card Modal
    printModal: document.getElementById('printModal'),
    closePrintModalBtn: document.getElementById('closePrintModalBtn'),
    printCardPreview: document.getElementById('printCardPreview'),
    triggerBrowserPrintBtn: document.getElementById('triggerBrowserPrintBtn'),
    printModalCopyBtn: document.getElementById('printModalCopyBtn'),

    // Copy Fallback Modal
    copyModal: document.getElementById('copyModal'),
    closeCopyModalBtn: document.getElementById('closeCopyModalBtn'),
    copyModalTextArea: document.getElementById('copyModalTextArea'),
    copyModalSelectAllBtn: document.getElementById('copyModalSelectAllBtn'),
    copyModalCopyBtn: document.getElementById('copyModalCopyBtn'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
  };

  // --- TOAST NOTIFICATIONS ---
  let toastTimer = null;
  function showToast(msg) {
    if (!el.toast) return;
    el.toastMessage.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.classList.remove('show');
    }, 2800);
  }

  // --- PERSISTENCE (LOCAL STORAGE) ---
  function saveToStorage() {
    try {
      const dataToSave = {
        recipe: currentRecipe,
        displayFormat: displayFormat,
        checkedIds: Array.from(checkedIngredientIds),
        activePresetId: currentActivePresetId,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      if (el.syncStatusText) {
        el.syncStatusText.textContent = 'Auto-saved to device';
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.recipe && Array.isArray(parsed.recipe.ingredients)) {
          currentRecipe = parsed.recipe;
          // Ensure valid numeric values upon load
          currentRecipe.baseYield = Math.max(1, parseFloat(currentRecipe.baseYield) || 1);
          currentRecipe.targetYield = Math.max(1, parseFloat(currentRecipe.targetYield) || 1);
          displayFormat = parsed.displayFormat || 'fractions';
          checkedIngredientIds = new Set(parsed.checkedIds || []);
          currentActivePresetId = parsed.activePresetId || null;
          return true;
        }
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
    return false;
  }

  // --- VALIDATION HELPERS ---
  function validateServingInputs() {
    let isValid = true;

    // Validate Base Yield
    const baseNum = sanitizeServingNumber(currentRecipe.baseYield);
    if (!baseNum) {
      el.baseYieldInput.classList.add('input-error');
      el.baseYieldError.textContent = 'Original yield must be a positive number greater than 0';
      el.baseYieldError.classList.add('visible');
      isValid = false;
    } else {
      el.baseYieldInput.classList.remove('input-error');
      el.baseYieldError.classList.remove('visible');
    }

    // Validate Target Yield
    const targetNum = sanitizeServingNumber(currentRecipe.targetYield);
    if (!targetNum) {
      el.targetYieldInput.classList.add('input-error');
      el.targetYieldError.textContent = 'Target yield must be a positive number greater than 0';
      el.targetYieldError.classList.add('visible');
      isValid = false;
    } else {
      el.targetYieldInput.classList.remove('input-error');
      el.targetYieldError.classList.remove('visible');
    }

    return isValid;
  }

  // --- CALCULATION LOGIC ---
  function getScaleFactor() {
    const base = sanitizeServingNumber(currentRecipe.baseYield) || 1;
    const target = sanitizeServingNumber(currentRecipe.targetYield) || 1;
    if (base <= 0) return 1;
    return target / base;
  }

  function updateScaleMultiplierUI() {
    const factor = getScaleFactor();
    el.scaleMultiplierDisplay.textContent = factor.toFixed(2) + '×';
    el.scaleFactorSubtext.textContent = `Scaling from ${currentRecipe.baseYield} to ${currentRecipe.targetYield} ${currentRecipe.yieldUnit || 'units'}`;

    // Highlight matching pill if any
    el.scalePills.forEach(pill => {
      const pillVal = parseFloat(pill.dataset.scale);
      if (Math.abs(pillVal - factor) < 0.02) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Update Slider bounds
    const maxSlide = Math.max(100, Math.ceil((currentRecipe.baseYield || 1) * 4));
    el.yieldSlider.min = 1;
    el.yieldSlider.max = maxSlide;
    el.yieldSlider.value = Math.max(1, currentRecipe.targetYield || 1);
    el.sliderMinLabel.textContent = '1';
    el.sliderMaxLabel.textContent = maxSlide.toString();
  }

  // --- RENDER INGREDIENT BUILDER ROWS ---
  function renderBuilderRows() {
    el.ingredientsList.innerHTML = '';

    if (currentRecipe.ingredients.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.padding = '2rem 1rem';
      emptyDiv.style.textAlign = 'center';
      emptyDiv.style.color = 'var(--ink-muted)';
      emptyDiv.style.fontSize = '0.9rem';
      emptyDiv.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" style="margin: 0 auto 0.5rem; display: block; opacity: 0.6;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        No ingredients added yet. Click <strong>+ Add Ingredient</strong> or paste a recipe below.
      `;
      el.ingredientsList.appendChild(emptyDiv);
      return;
    }

    currentRecipe.ingredients.forEach((ing, index) => {
      const row = document.createElement('div');
      row.className = 'ingredient-row';
      row.dataset.id = ing.id;

      // Qty Input
      const qtyInput = document.createElement('input');
      qtyInput.type = 'text';
      qtyInput.className = 'form-input';
      qtyInput.placeholder = '1.5';
      qtyInput.value = formatQuantity(ing.qty, 'decimals');
      qtyInput.setAttribute('aria-label', `Quantity for ingredient ${index + 1}`);
      qtyInput.addEventListener('input', (e) => {
        ing.qty = parseCulinaryNumber(e.target.value);
        renderScaledOutput();
        saveToStorage();
      });

      // Unit Select
      const unitSelect = document.createElement('select');
      unitSelect.className = 'form-select';
      unitSelect.setAttribute('aria-label', `Unit for ingredient ${index + 1}`);

      let foundUnit = false;
      STANDARD_UNITS.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.value;
        opt.textContent = u.label;
        if (u.value.toLowerCase() === (ing.unit || '').toLowerCase()) {
          opt.selected = true;
          foundUnit = true;
        }
        unitSelect.appendChild(opt);
      });
      if (!foundUnit && ing.unit) {
        const customOpt = document.createElement('option');
        customOpt.value = ing.unit;
        customOpt.textContent = ing.unit;
        customOpt.selected = true;
        unitSelect.appendChild(customOpt);
      }
      unitSelect.addEventListener('change', (e) => {
        ing.unit = e.target.value;
        renderScaledOutput();
        saveToStorage();
      });

      // Name & Prep input
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'form-input';
      nameInput.placeholder = 'e.g., Unsalted butter, chilled';
      nameInput.value = ing.prep ? `${ing.name} (${ing.prep})` : ing.name;
      nameInput.setAttribute('aria-label', `Name for ingredient ${index + 1}`);
      nameInput.addEventListener('input', (e) => {
        ing.name = e.target.value;
        renderScaledOutput();
        saveToStorage();
      });

      // Delete Button
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'row-delete-btn';
      delBtn.title = 'Remove ingredient';
      delBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      delBtn.addEventListener('click', () => {
        currentRecipe.ingredients.splice(index, 1);
        checkedIngredientIds.delete(ing.id);
        renderBuilderRows();
        renderScaledOutput();
        saveToStorage();
      });

      row.appendChild(qtyInput);
      row.appendChild(unitSelect);
      row.appendChild(nameInput);
      row.appendChild(delBtn);

      el.ingredientsList.appendChild(row);
    });
  }

  // --- RENDER SCALED OUTPUT LIST ---
  function renderScaledOutput() {
    validateServingInputs();
    updateScaleMultiplierUI();

    const factor = getScaleFactor();
    const targetYield = currentRecipe.targetYield || 1;
    const yieldUnit = currentRecipe.yieldUnit || 'servings';

    // Update titles
    el.scaledTitleHeading.textContent = currentRecipe.title || 'Untitled Recipe';
    el.scaledYieldHeading.textContent = `${targetYield} ${yieldUnit}`;
    el.targetYieldUnitLabel.textContent = yieldUnit;

    // Print Header (for browser @media print)
    el.printRecipeTitle.textContent = currentRecipe.title || 'Untitled Recipe';
    el.printRecipeYield.textContent = `Yield: ${targetYield} ${yieldUnit} (Scaled ${factor.toFixed(2)}× from ${currentRecipe.baseYield} ${yieldUnit})`;
    el.printRecipeNotes.textContent = currentRecipe.notes ? `Kitchen Notes: ${currentRecipe.notes}` : '';

    el.scaledOutputList.innerHTML = '';

    if (currentRecipe.ingredients.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.style.padding = '2rem 1rem';
      emptyLi.style.textAlign = 'center';
      emptyLi.style.color = 'var(--ink-muted)';
      emptyLi.textContent = 'Add ingredients to see real-time scaled quantities.';
      el.scaledOutputList.appendChild(emptyLi);
      updateProgressCount();
      return;
    }

    currentRecipe.ingredients.forEach(ing => {
      const isChecked = checkedIngredientIds.has(ing.id);
      const scaledQty = ing.qty * factor;
      const formattedQty = formatQuantity(scaledQty, displayFormat);

      const li = document.createElement('li');
      li.className = `scaled-item ${isChecked ? 'checked' : ''}`;
      li.dataset.id = ing.id;

      // Left Section with Checkbox and Info
      const itemLeft = document.createElement('div');
      itemLeft.className = 'item-left';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'kitchen-checkbox';
      checkbox.checked = isChecked;
      checkbox.id = `chk-${ing.id}`;
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          checkedIngredientIds.add(ing.id);
          li.classList.add('checked');
        } else {
          checkedIngredientIds.delete(ing.id);
          li.classList.remove('checked');
        }
        updateProgressCount();
        saveToStorage();
      });

      const label = document.createElement('label');
      label.setAttribute('for', `chk-${ing.id}`);
      label.style.cursor = 'pointer';
      label.className = 'ingredient-info-col';

      const nameSpan = document.createElement('span');
      nameSpan.className = 'ingredient-name ingredient-text';
      nameSpan.textContent = ing.name || 'Unnamed ingredient';

      const origHint = document.createElement('span');
      origHint.className = 'ingredient-original-hint';
      const origQtyFormatted = formatQuantity(ing.qty, displayFormat);
      origHint.textContent = `Orig: ${origQtyFormatted} ${ing.unit || ''}`;

      label.appendChild(nameSpan);
      label.appendChild(origHint);

      itemLeft.appendChild(checkbox);
      itemLeft.appendChild(label);

      // Scaled Quantity Badge on Right
      const qtyBadge = document.createElement('div');
      qtyBadge.className = 'ingredient-qty-badge';
      qtyBadge.innerHTML = `
        ${formattedQty}
        <span class="unit-sub">${ing.unit || ''}</span>
      `;

      li.appendChild(itemLeft);
      li.appendChild(qtyBadge);

      el.scaledOutputList.appendChild(li);
    });

    updateProgressCount();
  }

  function updateProgressCount() {
    const total = currentRecipe.ingredients.length;
    const checked = checkedIngredientIds.size;
    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
    if (el.checkedProgressText) {
      el.checkedProgressText.textContent = total > 0 ? `${checked} of ${total} measured` : '';
    }
    if (el.checkedProgressBar) {
      el.checkedProgressBar.style.width = `${pct}%`;
    }
  }

  // --- LOAD FULL RECIPE OBJECT ---
  function loadRecipe(recipe, presetId = null) {
    currentRecipe = JSON.parse(JSON.stringify(recipe));
    currentActivePresetId = presetId;
    checkedIngredientIds.clear();

    // Fill inputs
    el.recipeTitleInput.value = currentRecipe.title;
    el.baseYieldInput.value = currentRecipe.baseYield;
    el.yieldUnitInput.value = currentRecipe.yieldUnit;
    el.targetYieldInput.value = currentRecipe.targetYield;
    el.recipeNotesInput.value = currentRecipe.notes || '';

    // Update Presets buttons
    [el.presetCookies, el.presetFocaccia, el.presetCarbonara].forEach(b => {
      if (b) b.classList.remove('active');
    });
    if (presetId === 'cookies' && el.presetCookies) el.presetCookies.classList.add('active');
    if (presetId === 'focaccia' && el.presetFocaccia) el.presetFocaccia.classList.add('active');
    if (presetId === 'carbonara' && el.presetCarbonara) el.presetCarbonara.classList.add('active');

    renderBuilderRows();
    renderScaledOutput();
    saveToStorage();
  }

  // --- CREATE BLANK RECIPE (NEW RECIPE) ---
  function createBlankRecipe() {
    loadRecipe({
      title: 'My Custom Recipe',
      baseYield: 4,
      yieldUnit: 'servings',
      targetYield: 4,
      notes: '',
      ingredients: [
        { id: 'ing-' + Date.now(), qty: 1, unit: 'cups', name: '', prep: '' }
      ]
    }, null);
    el.recipeTitleInput.focus();
    showToast('Created new blank recipe canvas.');
  }

  // --- PARSE BULK RECIPE TEXT ---
  function parseAndImportText(text) {
    if (!text || !text.trim()) return;
    const lines = text.split('\n');
    const newIngredients = [];

    lines.forEach((line, i) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.toLowerCase().startsWith('ingredients:')) {
        return;
      }

      let qty = 1;
      let unit = 'whole';
      let name = trimmed;

      const cleaned = trimmed.replace(/^[\*\-\•\d+\.]\s*/, '');
      const numMatch = cleaned.match(/^([0-9]+(?:\s+[0-9]+\/[0-9]+|\/[0-9]+|\.[0-9]+)?)\s*(.*)/);

      if (numMatch) {
        qty = parseCulinaryNumber(numMatch[1]) || 1;
        const remainder = numMatch[2].trim();
        const words = remainder.split(/\s+/);
        const firstWord = words[0].toLowerCase().replace(/[\,\.]/g, '');

        const matchedUnit = STANDARD_UNITS.find(u =>
          u.value === firstWord ||
          u.value + 's' === firstWord ||
          (firstWord === 'tablespoon' || firstWord === 'tablespoons' ? u.value === 'tbsp' : false) ||
          (firstWord === 'teaspoon' || firstWord === 'teaspoons' ? u.value === 'tsp' : false) ||
          (firstWord === 'gram' || firstWord === 'grams' ? u.value === 'grams' : false)
        );

        if (matchedUnit) {
          unit = matchedUnit.value;
          name = words.slice(1).join(' ');
        } else {
          name = remainder;
        }
      }

      newIngredients.push({
        id: 'ing-' + Date.now() + '-' + i,
        qty: qty,
        unit: unit,
        name: name,
        prep: ''
      });
    });

    if (newIngredients.length > 0) {
      currentRecipe.ingredients = currentRecipe.ingredients.concat(newIngredients);
      renderBuilderRows();
      renderScaledOutput();
      saveToStorage();
      showToast(`Imported ${newIngredients.length} ingredients!`);
    } else {
      showToast('No ingredients recognized in pasted text.');
    }
  }

  // --- SCALE BY INGREDIENT HELPER ---
  function openScaleByModal() {
    if (currentRecipe.ingredients.length === 0) {
      showToast('Add at least one ingredient first!');
      return;
    }

    el.scaleBySelect.innerHTML = '';
    currentRecipe.ingredients.forEach(ing => {
      const opt = document.createElement('option');
      opt.value = ing.id;
      opt.textContent = `${ing.name} (Current: ${formatQuantity(ing.qty, displayFormat)} ${ing.unit})`;
      el.scaleBySelect.appendChild(opt);
    });

    updateScaleBySelectedDetails();
    el.scaleByModal.classList.add('open');
  }

  function updateScaleBySelectedDetails() {
    const selectedId = el.scaleBySelect.value;
    const ing = currentRecipe.ingredients.find(i => i.id === selectedId);
    if (ing) {
      el.scaleByCurrentQty.textContent = `${formatQuantity(ing.qty, displayFormat)} ${ing.unit}`;
      el.scaleByNewQty.value = ing.qty;
      el.scaleByNewQty.focus();
    }
  }

  function executeScaleBy() {
    const selectedId = el.scaleBySelect.value;
    const ing = currentRecipe.ingredients.find(i => i.id === selectedId);
    const newQty = parseCulinaryNumber(el.scaleByNewQty.value);

    if (!ing || newQty <= 0 || ing.qty <= 0) {
      showToast('Please enter a valid positive quantity.');
      return;
    }

    const calculatedFactor = newQty / ing.qty;
    const newTargetYield = Math.max(1, Math.round((currentRecipe.baseYield * calculatedFactor) * 10) / 10);

    currentRecipe.targetYield = newTargetYield;
    el.targetYieldInput.value = newTargetYield;

    renderScaledOutput();
    saveToStorage();
    el.scaleByModal.classList.remove('open');
    showToast(`Recipe scaled ${calculatedFactor.toFixed(2)}× based on ${ing.name}!`);
  }

  // --- COOK MODE (FULLSCREEN HIGH-CONTRAST VIEW) ---
  function openCookMode() {
    const factor = getScaleFactor();
    el.cookModeTitle.textContent = `${currentRecipe.title || 'Recipe'} — ${currentRecipe.targetYield} ${currentRecipe.yieldUnit}`;
    el.cookModeGrid.innerHTML = '';

    if (currentRecipe.ingredients.length === 0) {
      el.cookModeGrid.innerHTML = '<div style="color:#aaa; font-size:1.2rem;">No ingredients to display.</div>';
    } else {
      currentRecipe.ingredients.forEach(ing => {
        const isChecked = checkedIngredientIds.has(ing.id);
        const scaledQty = ing.qty * factor;
        const formattedQty = formatQuantity(scaledQty, displayFormat);

        const card = document.createElement('div');
        card.className = `cook-mode-card ${isChecked ? 'done' : ''}`;
        card.innerHTML = `
          <div>
            <div class="cook-mode-name">${ing.name || 'Unnamed Ingredient'}</div>
            <div style="font-size: 0.85rem; color: #A8A29E;">${ing.prep || ''}</div>
          </div>
          <div class="cook-mode-qty">${formattedQty} <span style="font-size:1rem; font-family:var(--font-sans); color:#FDBA74;">${ing.unit || ''}</span></div>
        `;

        card.addEventListener('click', () => {
          if (checkedIngredientIds.has(ing.id)) {
            checkedIngredientIds.delete(ing.id);
            card.classList.remove('done');
          } else {
            checkedIngredientIds.add(ing.id);
            card.classList.add('done');
          }
          renderScaledOutput();
          saveToStorage();
        });

        el.cookModeGrid.appendChild(card);
      });
    }

    el.cookModeOverlay.classList.add('open');
  }

  // --- FORMAT RECIPE TEXT ---
  function generateFormattedRecipeText() {
    const factor = getScaleFactor();
    let text = `🍳 ${currentRecipe.title || 'Scaled Recipe'}\n`;
    text += `Yield: ${currentRecipe.targetYield} ${currentRecipe.yieldUnit || 'servings'} (Scaled ${factor.toFixed(2)}× from ${currentRecipe.baseYield} ${currentRecipe.yieldUnit || 'servings'})\n`;
    if (currentRecipe.notes) {
      text += `Notes: ${currentRecipe.notes}\n`;
    }
    text += `\nINGREDIENTS:\n`;

    if (currentRecipe.ingredients.length === 0) {
      text += `(No ingredients added)\n`;
    } else {
      currentRecipe.ingredients.forEach(ing => {
        const scaledQty = ing.qty * factor;
        const formattedQty = formatQuantity(scaledQty, displayFormat);
        text += `• ${formattedQty} ${ing.unit || ''} ${ing.name}${ing.prep ? ' (' + ing.prep + ')' : ''}\n`;
      });
    }

    text += `\nScaled with Mise en Scale`;
    return text;
  }

  // --- COPY RECIPE FUNCTIONALITY (MULTI-TIER ROBUST) ---
  function copyFormattedRecipe() {
    const text = generateFormattedRecipeText();

    // Strategy 1: Modern navigator.clipboard API if supported
    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text)
        .then(() => {
          showToast('Copied scaled recipe to clipboard!');
        })
        .catch(() => {
          fallbackClipboardCopy(text);
        });
      return;
    }

    // Strategy 2: Legacy execCommand copy
    fallbackClipboardCopy(text);
  }

  function fallbackClipboardCopy(text) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, 99999);
      const successful = document.execCommand('copy');
      document.body.removeChild(ta);
      if (successful) {
        showToast('Copied scaled recipe to clipboard!');
      } else {
        openCopyFallbackModal(text);
      }
    } catch (err) {
      openCopyFallbackModal(text);
    }
  }

  function openCopyFallbackModal(text) {
    if (el.copyModal && el.copyModalTextArea) {
      el.copyModalTextArea.value = text;
      el.copyModal.classList.add('open');
      setTimeout(() => {
        el.copyModalTextArea.focus();
        el.copyModalTextArea.select();
      }, 50);
    } else {
      showToast('Recipe prepared. Please check recipe card.');
    }
  }

  // --- PRINT CARD FUNCTIONALITY ---
  function openPrintCardModal() {
    const factor = getScaleFactor();
    const targetYield = currentRecipe.targetYield || 1;
    const yieldUnit = currentRecipe.yieldUnit || 'servings';

    // Populate preview card inside modal
    if (el.printCardPreview) {
      let previewHtml = `
        <h4>${currentRecipe.title || 'Untitled Recipe'}</h4>
        <div class="card-preview-meta">
          <strong>Yield:</strong> ${targetYield} ${yieldUnit}
          <span style="margin: 0 0.4rem; color: #BBB;">•</span>
          <strong>Scaling:</strong> ${factor.toFixed(2)}× (Original: ${currentRecipe.baseYield} ${yieldUnit})
          ${currentRecipe.notes ? `<div style="margin-top: 0.35rem; font-style: italic; color: #555;">${currentRecipe.notes}</div>` : ''}
        </div>
      `;

      if (currentRecipe.ingredients.length === 0) {
        previewHtml += `<p style="color: var(--ink-muted);">No ingredients listed.</p>`;
      } else {
        previewHtml += `<ul class="card-preview-list">`;
        currentRecipe.ingredients.forEach(ing => {
          const scaledQty = ing.qty * factor;
          const formattedQty = formatQuantity(scaledQty, displayFormat);
          previewHtml += `<li><strong>${formattedQty} ${ing.unit || ''}</strong> ${ing.name || ''} ${ing.prep ? `<em>(${ing.prep})</em>` : ''}</li>`;
        });
        previewHtml += `</ul>`;
      }

      el.printCardPreview.innerHTML = previewHtml;
    }

    // Open print preview modal
    if (el.printModal) {
      el.printModal.classList.add('open');
    }

    // Also attempt browser print safely (will print if in normal window or allow-modals iframe)
    try {
      window.print();
    } catch (err) {
      console.warn('Direct window.print() suppressed by frame, showing preview card instead:', err);
    }
  }

  // --- EVENT LISTENERS INITIALIZATION ---
  function setupEventListeners() {
    // Recipe Title
    el.recipeTitleInput.addEventListener('input', (e) => {
      currentRecipe.title = e.target.value;
      renderScaledOutput();
      saveToStorage();
    });

    // Base Yield (Original Servings) with validation
    el.baseYieldInput.addEventListener('input', (e) => {
      const sanitized = sanitizeServingNumber(e.target.value);
      if (sanitized) {
        currentRecipe.baseYield = sanitized;
        renderScaledOutput();
        saveToStorage();
      } else {
        el.baseYieldInput.classList.add('input-error');
        el.baseYieldError.textContent = 'Original yield must be a positive number greater than 0';
        el.baseYieldError.classList.add('visible');
      }
    });

    el.baseYieldInput.addEventListener('blur', () => {
      const sanitized = sanitizeServingNumber(el.baseYieldInput.value);
      if (!sanitized) {
        // Reset to last valid baseYield or 1
        currentRecipe.baseYield = Math.max(1, currentRecipe.baseYield || 1);
        el.baseYieldInput.value = currentRecipe.baseYield;
        el.baseYieldInput.classList.remove('input-error');
        el.baseYieldError.classList.remove('visible');
        renderScaledOutput();
        saveToStorage();
        showToast(`Original yield must be > 0. Restored to ${currentRecipe.baseYield}.`);
      }
    });

    el.baseYieldDec.addEventListener('click', () => {
      const cur = sanitizeServingNumber(currentRecipe.baseYield) || 1;
      const next = Math.max(1, cur > 1 ? (cur <= 2 ? 1 : Math.floor(cur - 1)) : 1);
      currentRecipe.baseYield = next;
      el.baseYieldInput.value = next;
      renderScaledOutput();
      saveToStorage();
    });

    el.baseYieldInc.addEventListener('click', () => {
      const cur = sanitizeServingNumber(currentRecipe.baseYield) || 1;
      const next = Math.floor(cur + 1);
      currentRecipe.baseYield = next;
      el.baseYieldInput.value = next;
      renderScaledOutput();
      saveToStorage();
    });

    el.yieldUnitInput.addEventListener('input', (e) => {
      currentRecipe.yieldUnit = e.target.value;
      renderScaledOutput();
      saveToStorage();
    });

    el.recipeNotesInput.addEventListener('input', (e) => {
      currentRecipe.notes = e.target.value;
      saveToStorage();
    });

    // Target Yield (Scaled Servings) with validation
    el.targetYieldInput.addEventListener('input', (e) => {
      const sanitized = sanitizeServingNumber(e.target.value);
      if (sanitized) {
        currentRecipe.targetYield = sanitized;
        renderScaledOutput();
        saveToStorage();
      } else {
        el.targetYieldInput.classList.add('input-error');
        el.targetYieldError.textContent = 'Target yield must be a positive number greater than 0';
        el.targetYieldError.classList.add('visible');
      }
    });

    el.targetYieldInput.addEventListener('blur', () => {
      const sanitized = sanitizeServingNumber(el.targetYieldInput.value);
      if (!sanitized) {
        currentRecipe.targetYield = Math.max(1, currentRecipe.targetYield || 1);
        el.targetYieldInput.value = currentRecipe.targetYield;
        el.targetYieldInput.classList.remove('input-error');
        el.targetYieldError.classList.remove('visible');
        renderScaledOutput();
        saveToStorage();
        showToast(`Target yield must be > 0. Restored to ${currentRecipe.targetYield}.`);
      }
    });

    el.targetYieldDec.addEventListener('click', () => {
      const cur = sanitizeServingNumber(currentRecipe.targetYield) || 1;
      const next = Math.max(1, cur > 1 ? (cur <= 2 ? 1 : Math.floor(cur - 1)) : 1);
      currentRecipe.targetYield = next;
      el.targetYieldInput.value = next;
      renderScaledOutput();
      saveToStorage();
    });

    el.targetYieldInc.addEventListener('click', () => {
      const cur = sanitizeServingNumber(currentRecipe.targetYield) || 1;
      const next = Math.floor(cur + 1);
      currentRecipe.targetYield = next;
      el.targetYieldInput.value = next;
      renderScaledOutput();
      saveToStorage();
    });

    // Range Slider
    el.yieldSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      currentRecipe.targetYield = Math.max(1, val || 1);
      el.targetYieldInput.value = currentRecipe.targetYield;
      renderScaledOutput();
      saveToStorage();
    });

    // Multiplier Pills
    el.scalePills.forEach(pill => {
      pill.addEventListener('click', () => {
        const factor = parseFloat(pill.dataset.scale);
        if (!isNaN(factor) && factor > 0) {
          const base = sanitizeServingNumber(currentRecipe.baseYield) || 1;
          const newTarget = Math.max(1, Math.round((base * factor) * 10) / 10);
          currentRecipe.targetYield = newTarget;
          el.targetYieldInput.value = newTarget;
          renderScaledOutput();
          saveToStorage();
        }
      });
    });

    // Presets
    if (el.presetCookies) {
      el.presetCookies.addEventListener('click', () => loadRecipe(PRESET_RECIPES.cookies, 'cookies'));
    }
    if (el.presetFocaccia) {
      el.presetFocaccia.addEventListener('click', () => loadRecipe(PRESET_RECIPES.focaccia, 'focaccia'));
    }
    if (el.presetCarbonara) {
      el.presetCarbonara.addEventListener('click', () => loadRecipe(PRESET_RECIPES.carbonara, 'carbonara'));
    }

    // 1. FIX: New Recipe Button & Modal
    if (el.newRecipeBtn) {
      el.newRecipeBtn.addEventListener('click', () => {
        if (el.newRecipeModal) {
          el.newRecipeModal.classList.add('open');
        } else {
          createBlankRecipe();
        }
      });
    }

    if (el.confirmNewRecipeBtn) {
      el.confirmNewRecipeBtn.addEventListener('click', () => {
        if (el.newRecipeModal) el.newRecipeModal.classList.remove('open');
        createBlankRecipe();
      });
    }

    if (el.cancelNewRecipeBtn) {
      el.cancelNewRecipeBtn.addEventListener('click', () => {
        if (el.newRecipeModal) el.newRecipeModal.classList.remove('open');
      });
    }

    if (el.closeNewRecipeModalBtn) {
      el.closeNewRecipeModalBtn.addEventListener('click', () => {
        if (el.newRecipeModal) el.newRecipeModal.classList.remove('open');
      });
    }

    // 2. FIX: Copy Recipe Button
    if (el.copyRecipeBtn) {
      el.copyRecipeBtn.addEventListener('click', copyFormattedRecipe);
    }

    // 3. FIX: Print Card Button & Modal
    if (el.printRecipeBtn) {
      el.printRecipeBtn.addEventListener('click', openPrintCardModal);
    }

    if (el.triggerBrowserPrintBtn) {
      el.triggerBrowserPrintBtn.addEventListener('click', () => {
        try {
          window.print();
        } catch (e) {
          showToast('Print blocked by iframe. Use Ctrl+P or Copy Card.');
        }
      });
    }

    if (el.printModalCopyBtn) {
      el.printModalCopyBtn.addEventListener('click', () => {
        copyFormattedRecipe();
      });
    }

    if (el.closePrintModalBtn) {
      el.closePrintModalBtn.addEventListener('click', () => {
        if (el.printModal) el.printModal.classList.remove('open');
      });
    }

    // Copy Fallback Modal Handlers
    if (el.closeCopyModalBtn) {
      el.closeCopyModalBtn.addEventListener('click', () => {
        if (el.copyModal) el.copyModal.classList.remove('open');
      });
    }

    if (el.copyModalSelectAllBtn) {
      el.copyModalSelectAllBtn.addEventListener('click', () => {
        if (el.copyModalTextArea) {
          el.copyModalTextArea.focus();
          el.copyModalTextArea.select();
        }
      });
    }

    if (el.copyModalCopyBtn) {
      el.copyModalCopyBtn.addEventListener('click', () => {
        if (el.copyModalTextArea) {
          el.copyModalTextArea.focus();
          el.copyModalTextArea.select();
          try {
            document.execCommand('copy');
            showToast('Copied to clipboard!');
            if (el.copyModal) el.copyModal.classList.remove('open');
          } catch (e) {
            showToast('Press Ctrl+C (Cmd+C) to copy highlighted text.');
          }
        }
      });
    }

    // Add Ingredient Row
    el.addIngredientBtn.addEventListener('click', () => {
      currentRecipe.ingredients.push({
        id: 'ing-' + Date.now(),
        qty: 1,
        unit: 'cups',
        name: '',
        prep: ''
      });
      renderBuilderRows();
      renderScaledOutput();
      saveToStorage();

      setTimeout(() => {
        const rows = el.ingredientsList.querySelectorAll('.ingredient-row');
        if (rows.length > 0) {
          const lastRow = rows[rows.length - 1];
          const nameInput = lastRow.querySelector('input[type="text"]:last-of-type');
          if (nameInput) nameInput.focus();
        }
      }, 50);
    });

    // Clear Ingredients
    el.clearIngredientsBtn.addEventListener('click', () => {
      if (currentRecipe.ingredients.length === 0) return;
      currentRecipe.ingredients = [];
      checkedIngredientIds.clear();
      renderBuilderRows();
      renderScaledOutput();
      saveToStorage();
      showToast('All ingredients cleared.');
    });

    // Fractions vs Decimals Toggle
    el.toggleFractionsBtn.addEventListener('click', () => {
      displayFormat = 'fractions';
      el.toggleFractionsBtn.classList.add('active');
      el.toggleDecimalsBtn.classList.remove('active');
      renderScaledOutput();
      saveToStorage();
    });

    el.toggleDecimalsBtn.addEventListener('click', () => {
      displayFormat = 'decimals';
      el.toggleDecimalsBtn.classList.add('active');
      el.toggleFractionsBtn.classList.remove('active');
      renderScaledOutput();
      saveToStorage();
    });

    // Reset Checklist
    el.resetChecksBtn.addEventListener('click', () => {
      checkedIngredientIds.clear();
      renderScaledOutput();
      saveToStorage();
      showToast('Checklist reset.');
    });

    // Scale by Ingredient Modal
    el.scaleByIngBtn.addEventListener('click', openScaleByModal);
    el.closeScaleByModalBtn.addEventListener('click', () => el.scaleByModal.classList.remove('open'));
    el.scaleBySelect.addEventListener('change', updateScaleBySelectedDetails);
    el.executeScaleByBtn.addEventListener('click', executeScaleBy);

    // Paste Recipe Modal
    el.pasteRecipeBtn.addEventListener('click', () => {
      el.pasteTextInput.value = '';
      el.pasteModal.classList.add('open');
      el.pasteTextInput.focus();
    });
    el.closePasteModalBtn.addEventListener('click', () => el.pasteModal.classList.remove('open'));
    el.executePasteBtn.addEventListener('click', () => {
      parseAndImportText(el.pasteTextInput.value);
      el.pasteModal.classList.remove('open');
    });

    // Cook Counter View
    el.cookModeBtn.addEventListener('click', openCookMode);
    el.closeCookModeBtn.addEventListener('click', () => el.cookModeOverlay.classList.remove('open'));

    // Backdrop click to close modals
    [el.pasteModal, el.scaleByModal, el.newRecipeModal, el.printModal, el.copyModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('open');
        });
      }
    });

    // Keyboard Escape closes all modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        [el.pasteModal, el.scaleByModal, el.newRecipeModal, el.printModal, el.copyModal, el.cookModeOverlay].forEach(m => {
          if (m) m.classList.remove('open');
        });
      }
    });
  }

  // --- INITIALIZE APPLICATION ---
  function init() {
    setupEventListeners();

    const hasStored = loadFromStorage();
    if (!hasStored) {
      loadRecipe(PRESET_RECIPES.cookies, 'cookies');
    } else {
      el.recipeTitleInput.value = currentRecipe.title || '';
      el.baseYieldInput.value = currentRecipe.baseYield || 1;
      el.yieldUnitInput.value = currentRecipe.yieldUnit || 'servings';
      el.targetYieldInput.value = currentRecipe.targetYield || 1;
      el.recipeNotesInput.value = currentRecipe.notes || '';

      if (displayFormat === 'decimals') {
        el.toggleDecimalsBtn.classList.add('active');
        el.toggleFractionsBtn.classList.remove('active');
      } else {
        el.toggleFractionsBtn.classList.add('active');
        el.toggleDecimalsBtn.classList.remove('active');
      }

      // Restore preset buttons active styling if applicable
      [el.presetCookies, el.presetFocaccia, el.presetCarbonara].forEach(b => {
        if (b) b.classList.remove('active');
      });
      if (currentActivePresetId === 'cookies' && el.presetCookies) el.presetCookies.classList.add('active');
      if (currentActivePresetId === 'focaccia' && el.presetFocaccia) el.presetFocaccia.classList.add('active');
      if (currentActivePresetId === 'carbonara' && el.presetCarbonara) el.presetCarbonara.classList.add('active');

      renderBuilderRows();
      renderScaledOutput();
    }
  }

  // Run on ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
