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
    let frames = [];
    let pageFaults = 0;
    let history = [];
  
    pages.forEach((page, index) => {
      let fault = false;
      if (!frames.includes(page)) {
        fault = true;
        if (frames.length < frameCount) {
          frames.push(page);
        } else {
          frames.shift();
          frames.push(page);
        }
        pageFaults++;
      }
      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
      });
    });
  
    return { history, pageFaults };
  }
  
  // LRU Algorithm Implementation
  function simulateLRU(pages, frameCount) {
    let frames = [];
    let pageFaults = 0;
    let history = [];
    let recentUsage = [];
  
    pages.forEach((page, index) => {
      let fault = false;
      if (!frames.includes(page)) {
        fault = true;
        if (frames.length < frameCount) {
          frames.push(page);
        } else {
          // Find least recently used page
          let lruPage = recentUsage.shift();
          let lruIndex = frames.indexOf(lruPage);
          frames[lruIndex] = page;
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
      });
    });
  
    return { history, pageFaults };
  }
  
  // Optimal Algorithm Implementation
  function simulateOptimal(pages, frameCount) {
    let frames = [];
    let pageFaults = 0;
    let history = [];
  
    pages.forEach((page, index) => {
      let fault = false;
      if (!frames.includes(page)) {
        fault = true;
        if (frames.length < frameCount) {
          frames.push(page);
        } else {
          // Predict future usage
          let futureIndices = frames.map((framePage) => {
            let nextUse = pages.slice(index + 1).indexOf(framePage);
            return nextUse === -1 ? Infinity : nextUse;
          });
          let victimIndex = futureIndices.indexOf(Math.max(...futureIndices));
          frames[victimIndex] = page;
        }
        pageFaults++;
      }
      history.push({
        step: index + 1,
        page: page,
        frames: [...frames],
        fault: fault,
      });
    });
  
    return { history, pageFaults };
  }
  
  // Visualization Function
  function visualizeSimulation(history) {
    const visualizationArea = document.getElementById('visualizationArea');
    visualizationArea.innerHTML = ''; // Clear previous visualization
  
    const table = document.createElement('table');
    table.className = 'w-full border-collapse';
  
    // Create table header
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th class="border px-2 py-1">Step</th><th class="border px-2 py-1">Page</th>';
  
    for (let i = 0; i < history[0].frames.length; i++) {
      const th = document.createElement('th');
      th.className = 'border px-2 py-1';
      th.innerText = `Frame ${i + 1}`;
      headerRow.appendChild(th);
    }
  
    headerRow.innerHTML += '<th class="border px-2 py-1">Page Fault</th>';
    table.appendChild(headerRow);
  
    // Create table rows
    history.forEach((step) => {
      const row = document.createElement('tr');
      row.classList.add('fade-in');
      row.innerHTML = `<td class="border px-2 py-1">${step.step}</td><td class="border px-2 py-1">${step.page}</td>`;
  
      step.frames.forEach((frame) => {
        const td = document.createElement('td');
        td.className = 'border px-2 py-1';
        td.innerText = frame !== undefined ? frame : '';
        row.appendChild(td);
      });
  
      const faultTd = document.createElement('td');
      faultTd.className = 'border px-2 py-1';
      faultTd.innerHTML = step.fault ? '<span class="text-red-500">Yes</span>' : 'No';
      row.appendChild(faultTd);
  
      if (step.fault) {
        row.classList.add('bg-red-100');
      }
  
      table.appendChild(row);
    });
  
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
  