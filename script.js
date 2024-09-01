const apiKey = '4eae4d3056f0538af743fd4a';
const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'EGP', 'SAR', 'OMR', 'AED', 'KWD'];
let chart;

const theme = {
    backgroundColor: '#f0f0f0',
    buttonColor: '#007bff'
};

let isDarkMode = false;

function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');

    if (isDarkMode) {
        body.style.backgroundColor = theme.backgroundColor;
        themeToggle.innerText = 'Toggle to Dark Mode';
        isDarkMode = false;
    } else {
        body.style.backgroundColor = '#0f0f3f'; // Dark background
        themeToggle.innerText = 'Toggle to Light Mode';
        isDarkMode = true;
    }
}

function populateCurrencyDropdowns() {
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    
    currencies.forEach(currency => {
        fromCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
        toCurrency.innerHTML += `<option value="${currency}">${currency}</option>`;
    });

    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
}

async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    if (isNaN(amount) || amount <= 0) {
        document.getElementById('result').innerText = 'Please enter a valid positive number for the amount.';
        return;
    }

    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`);
        const data = await response.json();
        
        if (data.result === "success") {
            const rate = data.conversion_rates[toCurrency];
            const result = (amount * rate).toFixed(2);

            document.getElementById('result').innerText = `${amount} ${fromCurrency} = ${result} ${toCurrency}`;
            
            await fetchHistoricalRates(fromCurrency, toCurrency);
        } else {
            throw new Error(data['error-type']);
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerText = 'An error occurred. Please try again.';
    }
}

async function fetchHistoricalRates(fromCurrency, toCurrency) {
    const loadingMessage = document.getElementById('loadingMessage');
    loadingMessage.innerText = 'Fetching historical data...';

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);

    const dates = [];
    const rates = [];

    try {
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const year = d.getFullYear();
            const month = d.getMonth() + 1; // JavaScript months are 0-indexed
            const day = d.getDate();

            const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/history/${fromCurrency}/${year}/${month}/${day}`);
            const data = await response.json();

            if (data.result === "success") {
                dates.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
                rates.push(data.conversion_rates[toCurrency]);
            } else if (data['error-type'] === "no-data-available") {
                console.log(`No data available for ${year}-${month}-${day}`);
            } else {
                throw new Error(data['error-type']);
            }

            // Add a small delay to avoid hitting rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        updateChart(dates, rates, fromCurrency, toCurrency);
        loadingMessage.innerText = '';
    } catch (error) {
        console.error('Error fetching historical rates:', error);
        loadingMessage.innerText = 'Failed to fetch historical data. Please try again later.';
    }
}

function updateChart(dates, rates, fromCurrency, toCurrency) {
    const ctx = document.getElementById('chart').getContext('2d');

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: `${fromCurrency} to ${toCurrency} Exchange Rate`,
                data: rates,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false
                }
            },
            plugins: {
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'x'
                    },
                    zoom: {
                        enabled: true,
                        limits: {
                            x: {
                                min: 'start',
                                max: 'end'
                            },
                            y: {
                                min: 'dataMin',
                                max: 'dataMax'
                            }
                        }
                    }
                }
            }
        }
    });
}

window.onload = function() {
    populateCurrencyDropdowns();
    initParticles();
};

function initParticles() {
    particlesJS("particles-js", {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#ffffff",
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
}