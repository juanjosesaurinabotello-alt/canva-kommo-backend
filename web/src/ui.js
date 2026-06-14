// Capa de UI (DOM): ficha comercial, panel de unidades y formulario de lead.
import { postLead } from './api.js';

const ESTADO_LABEL = { available: 'Disponible', reserved: 'Reservada', sold: 'Vendida' };
const $ = (id) => document.getElementById(id);

let currentUnit = null;

// --- Ficha comercial de una unidad ---
export function openUnitCard(unit) {
  currentUnit = unit;
  $('card-tipologia').textContent = unit.tipologia;
  $('card-area').textContent = `${unit.areaM2} m²`;
  $('card-precio').textContent = unit.precio;
  $('card-pago').textContent = unit.formaPago;
  const badge = $('card-estado');
  badge.textContent = ESTADO_LABEL[unit.estado] || unit.estado;
  badge.className = `badge ${unit.estado}`;

  const img = $('card-img');
  if (unit.imagen) { img.src = unit.imagen; img.style.display = 'block'; }
  else { img.removeAttribute('src'); img.style.display = 'none'; }

  // Reset formulario
  $('lead-form').classList.add('hidden');
  $('lead-form').reset();
  $('lead-status').textContent = '';
  $('card-interest').classList.remove('hidden');
  // No se vende lo vendido
  $('card-interest').disabled = unit.estado === 'sold';
  $('card-interest').textContent = unit.estado === 'sold' ? 'Unidad vendida' : 'Me interesa';

  $('unit-card').classList.remove('hidden');
}

export function closeUnitCard() {
  $('unit-card').classList.add('hidden');
  currentUnit = null;
}

// --- Panel lateral de unidades ---
export function renderUnitsPanel(units, onSelect) {
  let filter = '';
  const list = $('units-list');

  function draw() {
    list.innerHTML = '';
    const filtered = filter ? units.filter((u) => u.estado === filter) : units;
    for (const u of filtered) {
      const li = document.createElement('li');
      li.className = 'unit-item';
      li.innerHTML = `
        <div class="row">
          <h3>${u.tipologia}</h3>
          <span class="dot ${u.estado}" title="${ESTADO_LABEL[u.estado]}"></span>
        </div>
        <div class="row">
          <span class="meta">${u.unitId} · ${u.areaM2} m²</span>
          <span class="price">${u.precio}</span>
        </div>`;
      li.addEventListener('click', () => onSelect(u));
      list.appendChild(li);
    }
    if (!filtered.length) list.innerHTML = '<li class="meta">Sin unidades en este estado.</li>';
  }

  document.querySelectorAll('.filters button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filters button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.estado;
      draw();
    });
  });

  draw();
}

export function toggleUnitsPanel(show) {
  $('units-panel').classList.toggle('hidden', !show);
}

// --- Formulario de lead ---
export function initLeadForm() {
  $('card-interest').addEventListener('click', () => {
    $('lead-form').classList.remove('hidden');
    $('card-interest').classList.add('hidden');
    $('lead-name').focus();
  });

  $('lead-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('lead-status');
    const lead = {
      name: $('lead-name').value.trim(),
      email: $('lead-email').value.trim(),
      phone: $('lead-phone').value.trim(),
      message: $('lead-message').value.trim(),
      unitId: currentUnit?.unitId,
    };
    if (!lead.name || (!lead.email && !lead.phone)) {
      status.className = 'lead-status err';
      status.textContent = 'Completá tu nombre y un email o teléfono.';
      return;
    }
    status.className = 'lead-status';
    status.textContent = 'Enviando…';
    try {
      const res = await postLead(lead);
      status.className = 'lead-status ok';
      status.textContent = res.offline
        ? '¡Gracias! Guardamos tu consulta y te contactaremos.'
        : '¡Gracias! Un asesor te va a contactar a la brevedad.';
      $('lead-form').reset();
    } catch (err) {
      status.className = 'lead-status err';
      status.textContent = `No se pudo enviar: ${err.message}`;
    }
  });
}

// --- Caption del recorrido guiado ---
export function showTourCaption(text, i, total) {
  $('tour-caption').classList.remove('hidden');
  $('tour-text').textContent = `(${i + 1}/${total}) ${text}`;
}
export function hideTourCaption() {
  $('tour-caption').classList.add('hidden');
}
