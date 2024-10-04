// chart.js

document.addEventListener('DOMContentLoaded', () => {
    const showChartBtn = document.getElementById('showChartBtn');
    const performanceChartSection = document.getElementById('performanceChartSection');
    const performanceChartCanvas = document.getElementById('performanceChart');
    const downloadChartBtn = document.getElementById('downloadChartBtn'); // New button to download the chart
    let chartInstance = null; // To keep track of the chart instance
  
    if (showChartBtn) {
      showChartBtn.addEventListener('click', () => {
        // Toggle the visibility of the performance chart section
        performanceChartSection.classList.toggle('hidden');
  
        // If the section is now visible and the chart hasn't been created yet, generate it
        if (!performanceChartSection.classList.contains('hidden') && !chartInstance) {
          generatePerformanceChart();
        }
      });
    }
  
    if (downloadChartBtn) {
      downloadChartBtn.addEventListener('click', () => {
        if (chartInstance) {
          const link = document.createElement('a');
          link.href = performanceChartCanvas.toDataURL('image/png');
          link.download = 'performance_chart.png';
          link.click();
        } else {
          alert('No chart available to download. Please generate the chart first.');
        }
      });
    }
  
    function generatePerformanceChart() {
      if (!window.simulationHistory || window.simulationHistory.length === 0) {
        console.error('No simulation history available to generate the chart.');
        return;
      }
  
      // Extract data from simulationHistory
      const steps = window.simulationHistory.map(step => step.step);
      const pageFaultsPerStep = window.simulationHistory.map(step => step.fault ? 1 : 0);
      const cumulativeFaults = pageFaultsPerStep.reduce((acc, curr, idx) => {
        acc.push((acc[idx - 1] || 0) + curr);
        return acc;
      }, []);
  
      const pageHitsPerStep = window.simulationHistory.map(step => step.fault ? 0 : 1);
      const cumulativeHits = pageHitsPerStep.reduce((acc, curr, idx) => {
        acc.push((acc[idx - 1] || 0) + curr);
        return acc;
      }, []);
  
      const faultRates = window.simulationHistory.map((step, idx) => {
        const total = (pageFaultsPerStep[idx] + pageHitsPerStep[idx]);
        return total > 0 ? ((pageFaultsPerStep[idx] / total) * 100).toFixed(2) : 0;
      });
  
      // Create the chart
      chartInstance = new Chart(performanceChartCanvas, {
        type: 'bar', // Main chart type
        data: {
          labels: steps.map(step => `T${step}`),
          datasets: [
            {
              type: 'bar',
              label: 'Page Faults per Step',
              data: pageFaultsPerStep,
              backgroundColor: 'rgba(255, 99, 132, 0.6)', // Red
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
              yAxisID: 'y',
            },
            {
              type: 'bar',
              label: 'Page Hits per Step',
              data: pageHitsPerStep,
              backgroundColor: 'rgba(75, 192, 192, 0.6)', // Green
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              yAxisID: 'y',
            },
            {
              type: 'line',
              label: 'Cumulative Page Faults',
              data: cumulativeFaults,
              borderColor: 'rgba(255, 99, 132, 1)', // Red
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: false,
              tension: 0.1,
              yAxisID: 'y1',
            },
            {
              type: 'line',
              label: 'Cumulative Page Hits',
              data: cumulativeHits,
              borderColor: 'rgba(75, 192, 192, 1)', // Green
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
              tension: 0.1,
              yAxisID: 'y1',
            },
            {
              type: 'line',
              label: 'Page Fault Rate (%)',
              data: faultRates,
              borderColor: 'rgba(255, 206, 86, 1)', // Yellow
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              fill: false,
              tension: 0.1,
              yAxisID: 'y2',
            }
          ]
        },
        options: {
          responsive: true,
          interaction: {
            mode: 'index',
            intersect: false
          },
          stacked: false,
          plugins: {
            title: {
              display: true,
              text: 'Page Replacement Performance Metrics'
            },
            tooltip: {
              enabled: true,
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  if (context.dataset.type === 'line' && context.dataset.label === 'Page Fault Rate (%)') {
                    return `${context.dataset.label}: ${context.parsed.y}%`;
                  }
                  return `${context.dataset.label}: ${context.parsed.y}`;
                }
              }
            },
            legend: {
              position: 'top',
            },
          },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Count'
              },
              grid: {
                drawOnChartArea: false, // Prevents overlapping with y1
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Cumulative Count'
              },
              grid: {
                drawOnChartArea: false, // Prevents overlapping with y
              },
            },
            y2: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Fault Rate (%)'
              },
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                callback: function(value) {
                  return value + '%';
                }
              },
              // Prevent y1 and y2 from overlapping
              afterDataLimits: function(scale) {
                scale.max = 100;
                scale.min = 0;
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time (Steps)'
              }
            }
          }
        }
      });
    }
});
