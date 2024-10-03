// app.js

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
  });
  
  // Simulation Variables
  let simulationHistory = [];
  let currentStep = 0;
  let intervalId;
  
  // Event Listener for Start Simulation Button
  document.getElementById('startSimulation').addEventListener('click', () => {
    const pageRefsInput = document.getElementById('pageReferences').value.trim();
    const pageRefs = pageRefsInput.split(/\s+/).map(Number);
    const frameCount = parseInt(document.getElementById('frameCount').value);
    const algorithm = document.getElementById('algorithm').value;
  
    if (validateInput(pageRefs, frameCount)) {
      let simulationResult;
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
        // Implement FIFOM if needed
        default:
          alert('Algorithm not implemented.');
          return;
      }
  
      simulationHistory = simulationResult.history;
      currentStep = 0;
      document.getElementById('totalPageFaults').innerText = `Total Page Faults: ${simulationResult.pageFaults}`;
  
      // Enable controls
      document.getElementById('nextStep').disabled = false;
      document.getElementById('playPause').disabled = false;
  
      // Clear previous visualization and feedback
      document.getElementById('visualizationArea').innerHTML = '';
      document.getElementById('narrationText').innerText = '';
      document.getElementById('aiFeedback').innerText = '';
  
      // Generate initial visualization
      visualizeSimulation(simulationHistory);
  
      // Generate AI feedback
      generateFeedback({
        algorithm: algorithm,
        pageFaults: simulationResult.pageFaults,
        frames: frameCount,
        pageReferences: pageRefs,
      });
  
      // Initialize tooltips
      tippy('.has-tooltip', {
        content(reference) {
          return reference.getAttribute('data-tippy-content');
        },
      });
    } else {
      alert('Invalid input. Please enter valid page references and frame count.');
    }
  });
  
  // Input Validation Function
  function validateInput(pages, frameCount) {
    return pages.every((p) => !isNaN(p)) && frameCount > 0;
  }
  
  // FIFO Algorithm Implementation
  function simulateFIFO(pages, frameCount) {
    let frames = Array(frameCount).fill(null);
    let pageFaults = 0;
    let history = [];
    let pointer = 0;
  
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
    let recentUsage = [];
  
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
          // Find least recently used page
          const lruPage = recentUsage.shift();
          const lruIndex = frames.indexOf(lruPage);
          frames[lruIndex] = page;
          frameUpdated = lruIndex;
        }
        pageFaults++;
      } else {
        // Update recent usage
        recentUsage.splice(recentUsage.indexOf(page), 1);
      }
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
          // Predict future usage
          let futureIndices = frames.map((framePage) => {
            let nextUse = pages.slice(index + 1).indexOf(framePage);
            return nextUse === -1 ? Infinity : nextUse;
          });
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
  
  // Visualization Function
  function visualizeSimulation(history) {
    const visualizationArea = document.getElementById('visualizationArea');
    visualizationArea.innerHTML = ''; // Clear previous content
  
    const frameCount = history[0].frames.length;
  
    // Create the table
    const table = document.createElement('table');
    table.className = 'w-full border-collapse text-center';
  
    // Create header row
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
  
      const frameCell = document.createElement('td');
      frameCell.className = 'border px-2 py-1 font-semibold';
      frameCell.innerText = `Frame ${i + 1}`;
      row.appendChild(frameCell);
  
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
  }
  
  // Controls
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
      clearInterval(intervalId);
      intervalId = null;
      document.getElementById('playPause').innerText = 'Play';
    } else {
      intervalId = setInterval(() => {
        if (currentStep < simulationHistory.length) {
          showStep(currentStep);
          currentStep++;
          document.getElementById('prevStep').disabled = false;
          if (currentStep >= simulationHistory.length) {
            clearInterval(intervalId);
            document.getElementById('playPause').innerText = 'Play';
            document.getElementById('nextStep').disabled = true;
          }
        }
      }, 1000);
      document.getElementById('playPause').innerText = 'Pause';
    }
  });
  
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
      content(reference) {
        return reference.getAttribute('data-tippy-content');
      },
    });
  }
  
  // Generate AI Feedback
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
  
      const data = await response.json();
      document.getElementById('aiFeedback').innerText = data.feedback;
    } catch (error) {
      console.error(error);
      document.getElementById('aiFeedback').innerText = 'Error fetching AI feedback.';
    }
  }
  