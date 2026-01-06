let trips = JSON.parse(localStorage.getItem("trips")) || [];

function saveTrip() {
  const plate = document.getElementById("plate").value.trim();
  const start = Number(document.getElementById("start").value);
  const end = Number(document.getElementById("end").value);
  const plz = document.getElementById("plz").value.trim();

  if (!plate || !start || !end || end <= start) {
    alert("Bitte alle Felder korrekt ausfüllen");
    return;
  }

  trips.push({ date: new Date().toISOString(), plate, start, end, plz });
  localStorage.setItem("trips", JSON.stringify(trips));
  updateYearFilter();
  render();
}

function updateYearFilter() {
  const years = [...new Set(trips.map(t => new Date(t.date).getFullYear()))].sort();
  const sel = document.getElementById("yearFilter");
  sel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("");
  if (years.length) sel.value = years[years.length-1];
}

function render() {
  const year = Number(document.getElementById("yearFilter").value);
  const body = document.getElementById("tableBody");
  body.innerHTML = "";
  trips.filter(t => new Date(t.date).getFullYear() === year)
       .forEach((t, i) => {
    const km = t.end - t.start;
    body.innerHTML += `<tr>
      <td>${new Date(t.date).toLocaleDateString("de-DE")}</td>
      <td>${t.plate}</td><td>${t.start}</td><td>${t.end}</td>
      <td>${km}</td><td>${t.plz}</td>
      <td><button onclick="deleteTrip(${i})">Löschen</button></td>
    </tr>`;
  });
}

function deleteTrip(index) {
  if (confirm("Diesen Eintrag wirklich löschen?")) {
    trips.splice(index, 1);
    localStorage.setItem("trips", JSON.stringify(trips));
    updateYearFilter();
    render();
  }
}

function createPDF() {
  const year = Number(document.getElementById("yearFilter").value);
  const data = trips.filter(t => new Date(t.date).getFullYear() === year);
  if (data.length === 0) { alert("Keine Daten für dieses Jahr."); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(`Fahrtenbuch ${year}`, 10, 10);

  let y=20, total=0;
  doc.setFontSize(10);
  doc.text("Datum | Kennz. | Start | Ende | KM | Ziel", 10, y); y+=6;

  data.forEach(t => {
    const km = t.end - t.start; total+=km;
    doc.text(`${new Date(t.date).toLocaleDateString("de-DE")} | ${t.plate} | ${t.start} | ${t.end} | ${km} | ${t.plz}`, 10, y);
    y+=6;
    if (y>190) { doc.addPage(); y=20; }
  });

  y+=8;
  doc.setFontSize(12);
  doc.text(`Gesamtkilometer ${year}: ${total} km`, 10, y);

  doc.save(`Fahrtenbuch_${year}.pdf`);
}

updateYearFilter();
render();
