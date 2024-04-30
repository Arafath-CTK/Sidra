// Function to fetch orders data from the server and update the chart
async function fetchOrdersDataAndUpdateChart() {
  try {
    // Fetch orders data from the server
    const response = await axios.get("/admin/dashboard");
    const { months, ordersCount, categories, categoryCount } = response.data;

    // Update the chart with the received data
    const barChartOptions = {
      series: [
        {
          name: "Orders Count",
          data: ordersCount,
        },
      ],
      chart: {
        height: 350,
        type: "bar",
        toolbar: {
          show: false, // Disable the toolbar
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          dataLabels: {
            position: "top", // top, center, bottom
          },
          colors: {
            ranges: [
              {
                from: 0,
                to: 100,
                color: "#6aab9c", // Change the color here
              },
            ],
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val;
        },
        offsetY: -20,
        style: {
          fontSize: "12px",
          colors: ["#304758"],
        },
      },
      xaxis: {
        categories: months,
        position: "top",
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        crosshairs: {
          fill: {
            type: "gradient",
            gradient: {
              colorFrom: "#D8E3F0",
              colorTo: "#BED1E6",
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5,
            },
          },
        },
        tooltip: {
          enabled: true,
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
        },
      },
    };

    // Render the chart with updated options
    var barChart = new ApexCharts(
      document.querySelector("#monthsChart"),
      barChartOptions
    );
    barChart.render();

    const donutOptions = {
      series: categoryCount,
      chart: {
        type: "donut",
      },
      labels: categories.map(
        (category) => category.charAt(0).toUpperCase() + category.slice(1)
      ),
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              colors: ["#ffffff"], // Set the color of the percentage values to white
            },
          },
        },
      },
    };

    const donutChart = new ApexCharts(
      document.querySelector("#categoryPie"),
      donutOptions
    );
    donutChart.render();
  } catch (error) {
    console.error("Error fetching orders data:", error);
  }
}
fetchOrdersDataAndUpdateChart();

document
  .getElementById("downloadReportBtn")
  .addEventListener("click", async function () {
    let valid = true;
    const fromDateInput = document.getElementById("fromDate");
    const toDateInput = document.getElementById("toDate");
    const fromDateFeedback = document.getElementById("fromDateFeedback");
    const toDateFeedback = document.getElementById("toDateFeedback");
    const currentDate = new Date().toISOString().split("T")[0];

    // Validate the "From" date
    if (fromDateInput.checkValidity()) {
      fromDateInput.classList.remove("is-invalid");
      fromDateInput.classList.add("is-valid");
      fromDateFeedback.textContent = "";
    } else {
      valid = false;
      fromDateInput.classList.remove("is-valid");
      fromDateInput.classList.add("is-invalid");
      fromDateFeedback.textContent = "Please enter a valid date.";
    }

    // Validate the "To" date
    if (toDateInput.checkValidity()) {
      toDateInput.classList.remove("is-invalid");
      toDateInput.classList.add("is-valid");
      toDateFeedback.textContent = "";
    } else {
      valid = false;
      toDateInput.classList.remove("is-valid");
      toDateInput.classList.add("is-invalid");
      toDateFeedback.textContent = "Please enter a valid date.";
    }

    // Validate that "To" date is not greater than current date
    if (toDateInput.value > currentDate) {
      valid = false;
      toDateInput.classList.remove("is-valid");
      toDateInput.classList.add("is-invalid");
      toDateFeedback.textContent =
        "To date cannot be greater than current date.";
    }

    if (valid) {
        document.getElementById("reportGenerationForm").action = "/admin/generateReport";
        document.getElementById("reportGenerationForm").submit();
    }
  });
