/* ==========================================================================
   Hệ thống Quản lý Kho hàng — tương tác giao diện
   Không phụ thuộc thư viện ngoài ngoài Chart.js (đã tự host).
   ========================================================================== */
(function () {
  'use strict';

  var css = getComputedStyle(document.documentElement);
  function token(name) {
    return css.getPropertyValue(name).trim();
  }

  /* ------------------------------ Menu bên ------------------------------ */
  var shell = document.getElementById('appShell');
  var navToggle = document.getElementById('navToggle');

  if (navToggle && shell) {
    navToggle.addEventListener('click', function () {
      var open = shell.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    document.addEventListener('click', function (event) {
      if (!shell.classList.contains('nav-open')) return;
      if (event.target.closest('.sidebar')) return;
      if (event.target.closest('#navToggle')) return;
      shell.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  }

  /* ------------------------------- Toast -------------------------------- */
  var toastStack = document.getElementById('toastStack');
  if (toastStack) {
    Array.prototype.forEach.call(toastStack.querySelectorAll('.toast'), function (toast) {
      window.setTimeout(function () {
        toast.classList.add('is-hiding');
        window.setTimeout(function () {
          toast.remove();
        }, 200);
      }, 4000);
    });
  }

  /* ------------------------- Xác nhận trước khi xoá ---------------------- */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-confirm]'), function (form) {
    form.addEventListener('submit', function (event) {
      if (!window.confirm(form.getAttribute('data-confirm'))) {
        event.preventDefault();
      }
    });
  });

  /* -------------------------- Dòng hàng của phiếu ------------------------ */
  var lineBody = document.getElementById('lineBody');
  var addLineButton = document.getElementById('addLine');
  var template = document.getElementById('lineTemplate');
  var totalValueCell = document.getElementById('totalValue');

  function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  function recalcLine(row) {
    var productSelect = row.querySelector('select[name="productId"]');
    var quantityInput = row.querySelector('input[name="quantity"]');
    var priceInput = row.querySelector('input[name="unitPrice"]');
    var totalCell = row.querySelector('.line-total');
    var warn = row.querySelector('.line-warn');

    var quantity = Number.parseInt(quantityInput.value, 10) || 0;
    var price = priceInput.value === '' ? Number(productSelect.selectedOptions[0] && productSelect.selectedOptions[0].dataset.cost) || 0 : Number(priceInput.value) || 0;
    var total = quantity * price;

    totalCell.textContent = quantity > 0 ? formatCurrency(total) : '—';

    var option = productSelect.selectedOptions[0];
    if (option && option.value) {
      var stock = Number(option.dataset.stock) || 0;
      var unit = option.dataset.unit || '';
      quantityInput.title = 'Tồn thực hiện tại: ' + stock + ' ' + unit;
      if (warn) {
        if (quantity > stock) {
          warn.textContent = 'Vượt tồn hiện có (' + stock + ' ' + unit + ')';
          warn.hidden = false;
        } else {
          warn.textContent = '';
          warn.hidden = true;
        }
      }
    } else if (warn) {
      warn.textContent = '';
      warn.hidden = true;
    }
  }

  function recalcTotal() {
    var total = 0;
    Array.prototype.forEach.call(lineBody.querySelectorAll('.line-row'), function (row) {
      var quantity = Number.parseInt(row.querySelector('input[name="quantity"]').value, 10) || 0;
      var priceInput = row.querySelector('input[name="unitPrice"]');
      var select = row.querySelector('select[name="productId"]');
      var price = priceInput.value === ''
        ? Number(select.selectedOptions[0] && select.selectedOptions[0].dataset.cost) || 0
        : Number(priceInput.value) || 0;
      total += quantity * price;
    });
    if (totalValueCell) totalValueCell.textContent = formatCurrency(total);
  }

  function recalcAll() {
    Array.prototype.forEach.call(lineBody.querySelectorAll('.line-row'), recalcLine);
    recalcTotal();
  }

  if (lineBody) {
    lineBody.addEventListener('input', function (event) {
      var row = event.target.closest('.line-row');
      if (!row) return;
      recalcLine(row);
      recalcTotal();
    });

    lineBody.addEventListener('change', function (event) {
      var row = event.target.closest('.line-row');
      if (!row) return;
      recalcLine(row);
      recalcTotal();
    });

    lineBody.addEventListener('click', function (event) {
      var button = event.target.closest('.remove-line');
      if (!button) return;
      var rows = lineBody.querySelectorAll('.line-row');
      if (rows.length <= 1) {
        var row = button.closest('.line-row');
        row.querySelector('select[name="productId"]').value = '';
        row.querySelector('input[name="quantity"]').value = '';
        row.querySelector('input[name="unitPrice"]').value = '';
      } else {
        button.closest('.line-row').remove();
      }
      recalcAll();
    });

    if (addLineButton && template) {
      addLineButton.addEventListener('click', function () {
        var fragment = template.content.cloneNode(true);
        lineBody.appendChild(fragment);
        var lastRow = lineBody.querySelector('.line-row:last-child');
        if (lastRow) lastRow.querySelector('select[name="productId"]').focus();
      });
    }

    recalcAll();
  }

  /* ------------------------------ Biểu đồ -------------------------------- */
  var trendCanvas = document.getElementById('chartTrend');
  if (trendCanvas && window.Chart && window.__KHO_TREND__) {
    var trend = window.__KHO_TREND__;
    var labels = trend.map(function (row) {
      var d = new Date(row.day);
      return d.getDate() + '/' + (d.getMonth() + 1);
    });

    new window.Chart(trendCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Nhập',
            data: trend.map(function (row) { return row.units_in; }),
            backgroundColor: token('--color-chart-1'),
            borderRadius: 3,
            maxBarThickness: 14
          },
          {
            label: 'Xuất',
            data: trend.map(function (row) { return row.units_out; }),
            backgroundColor: token('--color-chart-3'),
            borderRadius: 3,
            maxBarThickness: 14
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: token('--color-ink'),
            titleFont: { family: 'Be Vietnam Pro', size: 12 },
            bodyFont: { family: 'Be Vietnam Pro', size: 12 },
            padding: 10,
            cornerRadius: 6,
            displayColors: true
          }
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: token('--color-line') },
            ticks: { color: token('--color-ink-muted'), font: { family: 'Be Vietnam Pro', size: 11 }, maxRotation: 0, autoSkipPadding: 12 }
          },
          y: {
            beginAtZero: true,
            grid: { color: token('--color-line') },
            border: { display: false },
            ticks: { color: token('--color-ink-muted'), font: { family: 'Be Vietnam Pro', size: 11 }, precision: 0 }
          }
        }
      }
    });
  }
})();
