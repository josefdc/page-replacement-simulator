// chart.js

document.addEventListener('DOMContentLoaded', () => {
    const showChartBtn = document.getElementById('showChartBtn');
    const performanceChartSection = document.getElementById('performanceChartSection');
    const performanceChartCanvas = document.getElementById('performanceChart');
    let chartInstance = null; // To keep track of the chart instance
  
    if (showChartBtn) {
      showChartBtn.addEventListener('click', () => {
        // Toggle the visibility of the chart section
        performanceChartSection.classList.toggle('hidden');
  
        // If the section is now visible and the chart hasn't been created yet, generate it
        if (!performanceChartSection.classList.contains('hidden') && !chartInstance) {
          generatePerformanceChart();
        }
      });
    }
  
    function generatePerformanceChart() {
      if (!window.simulationHistory || window.simulationHistory.length === 0) {
        console.error('No simulation history available to generate the chart.');
        return;
      }
  
      // Extract data from simulationHistory
      const steps = window.simulationHistory.map(step => `T${step.step}`);
      const pageFaults = window.simulationHistory.map(step => step.fault ? 1 : 0);
      const cumulativeFaults = pageFaults.reduce((acc, curr, idx) => {
        acc.push((acc[idx - 1] || 0) + curr);
        return acc;
      }, []);
  
      const pageHits = window.simulationHistory.map(step => step.fault ? 0 : 1);
      const cumulativeHits = pageHits.reduce((acc, curr, idx) => {
        acc.push((acc[idx - 1] || 0) + curr);
        return acc;
      }, []);
  
      // Create the chart
      chartInstance = new Chart(performanceChartCanvas, {
        type: 'line',
        data: {
          labels: steps,
          datasets: [
            {
              label: 'Cumulative Page Faults',
              data: cumulativeFaults,
              borderColor: 'rgba(255, 99, 132, 1)', // Red
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: false,
              tension: 0.1,
              pointRadius: 3,
              pointHoverRadius: 5
            },
            {
              label: 'Cumulative Page Hits',
              data: cumulativeHits,
              borderColor: 'rgba(75, 192, 192, 1)', // Green
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
              tension: 0.1,
              pointRadius: 3,
              pointHoverRadius: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Cumulative Page Faults and Hits Over Time',
              font: {
                size: 18
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: function(context) {
                  return `${context.dataset.label}: ${context.parsed.y}`;
                }
              }
            },
            legend: {
              labels: {
                font: {
                  size: 14
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Cumulative Count',
                font: {
                  size: 16
                }
              },
              ticks: {
                font: {
                  size: 14
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Time (Steps)',
                font: {
                  size: 16
                }
              },
              ticks: {
                font: {
                  size: 14
                }
              }
            }
          }
        }
      });
    }
  });
  