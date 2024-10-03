// app.js

// ----------------------
// Dark Mode Toggle
// ----------------------
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
  });
  
  // ----------------------
  // Simulation Variables
  // ----------------------
  let simulationHistory = []; // Stores the history of simulation steps
  let currentStep = 0;        // Tracks the current step in the simulation
  let intervalId;             // Stores the interval ID for play/pause functionality
  
  // ----------------------
  // Event Listener for Start Simulation Button
  // ----------------------
  document.getElementById('startSimulation').addEventListener('click', () => {
    // Retrieve and process user inputs
    const pageRefsInput = document.getElementById('pageReferences').value.trim();
    const pageRefs = pageRefsInput.split(/\s+/).map(Number);
    const frameCount = parseInt(document.getElementById('frameCount').value);
    const algorithm = document.getElementById('algorithm').value;
  
    // Validate inputs
    if (validateInput(pageRefs, frameCount)) {
      let simulationResult;
  
      // Execute the selected algorithm
      switch (algorithm) {
        case 'FIFO':
          simulationResult = simulateFIFO(pageRefs, frameCount);
          break;
        case 'LRU':
          simulationResult = simulateLRU(pageRefs, frameCount);
          break;
        case 'Optimal':
          simulationResult = simulateOptimal(pageRefs, frameCount);
          break;
        // Add FIFOM implementation here if needed
        default:
          alert('Algorithm not implemented.');
          return;
      }
  
      // Update simulation history and reset current step
      simulationHistory = simulationResult.history;
      currentStep = 0;
  
      // Display total page faults
      document.getElementById('totalPageFaults').innerText = `Total Page Faults: ${simulationResult.pageFaults}`;
  
      // Enable simulation controls
      document.getElementById('nextStep').disabled = false;
      document.getElementById('playPause').disabled = false;
      document.getElementById('prevStep').disabled = true;
  
      // Clear previous visualization, narration, and feedback
      document.getElementById('visualizationArea').innerHTML = '';
      document.getElementById('narrationText').innerText = '';
      document.getElementById('aiFeedback').innerText = '';
      document.getElementById('simulationError').innerText = ''; // Clear any previous simulation errors
  
      // Generate the initial visualization (all steps up to currentStep)
      visualizeSimulation(simulationHistory.slice(0, currentStep));
  
      // Generate AI feedback based on the simulation results
      generateFeedback({
        algorithm: algorithm,
        pageFaults: simulationResult.pageFaults,
        frames: frameCount,
        pageReferences: pageRefs,
      });
    } else {
      // If validation fails, do not proceed with simulation
      console.log('Validation failed.');
    }
  });
  
  // ----------------------
  // Input Validation Function
  // ----------------------
  function validateInput(pages, frameCount) {
    let isValid = true;
  
    // Validate Page References
    const pageReferencesInput = document.getElementById('pageReferences');
    const pageReferencesError = document.getElementById('pageReferencesError');
    if (pages.length === 0 || pages.some((p) => isNaN(p))) {
      isValid = false;
      pageReferencesInput.classList.add('input-error');
      pageReferencesError.classList.remove('hidden');
    } else {
      pageReferencesInput.classList.remove('input-error');
      pageReferencesError.classList.add('hidden');
    }
  
    // Validate Frame Count
    const frameCountInput = document.getElementById('frameCount');
    const frameCountError = document.getElementById('frameCountError');
    if (isNaN(frameCount) || frameCount <= 0) {
      isValid = false;
      frameCountInput.classList.add('input-error');
      frameCountError.classList.remove('hidden');
    } else {
      frameCountInput.classList.remove('input-error');
      frameCountError.classList.add('hidden');
    }
  
    return isValid;
  }
  
  // ----------------------
  // Remove Error Styles on Input
  // ----------------------
  document.getElementById('pageReferences').addEventListener('input', () => {
    const input = document.getElementById('pageReferences');
    const error = document.getElementById('pageReferencesError');
    input.classList.remove('input-error');
    error.classList.add('hidden');
  });
  
  document.getElementById('frameCount').addEventListener('input', () => {
    const input = document.getElementById('frameCount');
    const error = document.getElementById('frameCountError');
    input.classList.remove('input-error');
    error.classList.add('hidden');
  });
  
  // ----------------------
  // Page Replacement Algorithms
  // ----------------------
  
  // FIFO Algorithm Implementation
  function simulateFIFO(pages, frameCount) {
    let frames = Array(frameCount).fill(null); // Initialize frames
    let pageFaults = 0;
    let history = [];
    let pointer = 0; // Points to the frame to be replaced next
  
    pages.forEach((page, index) => {
      let fault = false;
      let frameUpdated = null;
  
      if (!frames.includes(page)) {
        fault = true;
        frames[pointer] = page;
        frameUpdated = pointer;
        pointer = (pointer + 1) % frameCount;
        pageFaults++;
      }
  
      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
        frameUpdated: frameUpdated,
      });
    });
  
    return { history, pageFaults };
  }
  
  // LRU Algorithm Implementation
  function simulateLRU(pages, frameCount) {
    let frames = Array(frameCount).fill(null);
    let pageFaults = 0;
    let history = [];
    let recentUsage = []; // Tracks the order of page usage
  
    pages.forEach((page, index) => {
      let fault = false;
      let frameUpdated = null;
  
      if (!frames.includes(page)) {
        fault = true;
        if (frames.includes(null)) {
          const emptyIndex = frames.indexOf(null);
          frames[emptyIndex] = page;
          frameUpdated = emptyIndex;
        } else {
          // Find the least recently used page
          const lruPage = recentUsage.shift();
          const lruIndex = frames.indexOf(lruPage);
          frames[lruIndex] = page;
          frameUpdated = lruIndex;
        }
        pageFaults++;
      } else {
        // Update recent usage by removing the page from its current position
        recentUsage.splice(recentUsage.indexOf(page), 1);
      }
  
      // Update recent usage by adding the current page
      recentUsage.push(page);
  
      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
        frameUpdated: frameUpdated,
      });
    });
  
    return { history, pageFaults };
  }
  
  // Optimal Algorithm Implementation
  function simulateOptimal(pages, frameCount) {
    let frames = Array(frameCount).fill(null);
    let pageFaults = 0;
    let history = [];
  
    pages.forEach((page, index) => {
      let fault = false;
      let frameUpdated = null;
  
      if (!frames.includes(page)) {
        fault = true;
        if (frames.includes(null)) {
          const emptyIndex = frames.indexOf(null);
          frames[emptyIndex] = page;
          frameUpdated = emptyIndex;
        } else {
          // Predict future usage for each page in frames
          let futureIndices = frames.map((framePage) => {
            let nextUse = pages.slice(index + 1).indexOf(framePage);
            return nextUse === -1 ? Infinity : nextUse;
          });
  
          // Select the frame with the farthest next use
          let victimIndex = futureIndices.indexOf(Math.max(...futureIndices));
          frames[victimIndex] = page;
          frameUpdated = victimIndex;
        }
        pageFaults++;
      }
  
      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
        frameUpdated: frameUpdated,
      });
    });
  
    return { history, pageFaults };
  }
  
  // ----------------------
  // Visualization Function
  // ----------------------
  function visualizeSimulation(history) {
    const visualizationArea = document.getElementById('visualizationArea');
    visualizationArea.innerHTML = ''; // Clear previous content
  
    if (history.length === 0) return; // If no history, do nothing
  
    const frameCount = history[0].frames.length;
  
    // Create the table element
    const table = document.createElement('table');
    table.className = 'w-full border-collapse text-center';
  
    // Create the header row
    const headerRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    emptyHeader.className = 'border px-2 py-1';
    emptyHeader.innerText = 'Frame';
    headerRow.appendChild(emptyHeader);
  
    history.forEach((step) => {
      const th = document.createElement('th');
      th.className = 'border px-2 py-1';
      th.innerText = `T${step.step}`;
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);
  
    // Create rows for each frame
    for (let i = 0; i < frameCount; i++) {
      const row = document.createElement('tr');
  
      // Frame label cell
      const frameCell = document.createElement('td');
      frameCell.className = 'border px-2 py-1 font-semibold';
      frameCell.innerText = `Frame ${i + 1}`;
      row.appendChild(frameCell);
  
      // Cells for each time step
      history.forEach((step) => {
        const cell = document.createElement('td');
        cell.className = 'border px-2 py-1 relative';
        const pageInFrame = step.frames[i];
  
        if (pageInFrame !== null) {
          cell.innerText = pageInFrame;
  
          if (step.frameUpdated === i) {
            if (step.fault) {
              cell.classList.add('bg-red-200', 'pulse-animation', 'has-tooltip');
              cell.setAttribute('data-tippy-content', `Page fault: Loaded page ${pageInFrame} into Frame ${i + 1}`);
            } else {
              cell.classList.add('bg-green-200', 'has-tooltip');
              cell.setAttribute('data-tippy-content', `Page hit: Page ${pageInFrame} was already in Frame ${i + 1}`);
            }
          }
        }
  
        row.appendChild(cell);
      });
  
      table.appendChild(row);
    }
  
    visualizationArea.appendChild(table);
  
    // Add Legend (if not already present)
    if (!document.getElementById('legend')) {
      const legend = document.createElement('section');
      legend.id = 'legend';
      legend.className = 'mt-4';
      legend.innerHTML = `
        <h3 class="text-lg font-semibold">Legend:</h3>
        <ul class="list-disc list-inside">
          <li><span class="inline-block w-4 h-4 bg-red-200 mr-2"></span>Page Fault (Page loaded into memory)</li>
          <li><span class="inline-block w-4 h-4 bg-green-200 mr-2"></span>Page Hit (Page already in memory)</li>
        </ul>
      `;
      visualizationArea.appendChild(legend);
    }
  
    // Initialize Tippy.js tooltips
    tippy('.has-tooltip', {
      placement: 'top',
      arrow: true,
      animation: 'scale',
    });
  }
  
  // ----------------------
  // Controls Event Listeners
  // ----------------------
  document.getElementById('nextStep').addEventListener('click', () => {
    if (currentStep < simulationHistory.length) {
      showStep(currentStep);
      currentStep++;
      document.getElementById('prevStep').disabled = false;
    }
    if (currentStep >= simulationHistory.length) {
      document.getElementById('nextStep').disabled = true;
    }
  });
  
  document.getElementById('prevStep').addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep - 1);
      document.getElementById('nextStep').disabled = false;
    }
    if (currentStep <= 0) {
      document.getElementById('prevStep').disabled = true;
    }
  });
  
  document.getElementById('playPause').addEventListener('click', () => {
    if (intervalId) {
      // If currently playing, pause the simulation
      clearInterval(intervalId);
      intervalId = null;
      document.getElementById('playPause').innerText = 'Play';
    } else {
      // If currently paused, start playing the simulation
      intervalId = setInterval(() => {
        if (currentStep < simulationHistory.length) {
          showStep(currentStep);
          currentStep++;
          document.getElementById('prevStep').disabled = false;
          if (currentStep >= simulationHistory.length) {
            clearInterval(intervalId);
            intervalId = null;
            document.getElementById('playPause').innerText = 'Play';
            document.getElementById('nextStep').disabled = true;
          }
        }
      }, 1000); // Adjust the speed as needed (milliseconds)
      document.getElementById('playPause').innerText = 'Pause';
    }
  });
  
  // ----------------------
  // Show Step Function
  // ----------------------
  function showStep(stepIndex) {
    const historySlice = simulationHistory.slice(0, stepIndex + 1);
    visualizeSimulation(historySlice);
  
    // Update narration
    const step = simulationHistory[stepIndex];
    const narrationText = document.getElementById('narrationText');
  
    if (step.fault) {
      narrationText.innerText = `At time T${step.step}, page ${step.page} caused a page fault and was loaded into Frame ${step.frameUpdated + 1}.`;
    } else {
      narrationText.innerText = `At time T${step.step}, page ${step.page} was already in memory. No page fault occurred.`;
    }
  
    // Re-initialize tooltips for the new content
    tippy('.has-tooltip', {
      placement: 'top',
      arrow: true,
      animation: 'scale',
    });
  }
  
  // ----------------------
  // Generate AI Feedback Function
  // ----------------------
  async function generateFeedback(simulationData) {
    const prompt = `The user has just completed a page replacement simulation using the ${simulationData.algorithm} algorithm with ${simulationData.frames} frames and the page reference sequence ${simulationData.pageReferences.join(
      ', '
    )}. There were ${simulationData.pageFaults} page faults. Provide a simple explanation of the results and suggest if a different algorithm might perform better.`;
  
    try {
      const response = await fetch('/api/ai-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt }),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      document.getElementById('aiFeedback').innerText = data.feedback;
    } catch (error) {
      console.error('Error fetching AI feedback:', error);
      // Display error message with highlighting
      const aiFeedback = document.getElementById('aiFeedback');
      aiFeedback.innerText = 'Error fetching AI feedback.';
      aiFeedback.classList.add('text-red-500');
      aiFeedback.classList.remove('text-gray-800', 'dark:text-gray-200');
    }
  }
  