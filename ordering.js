export function reorderVisibleProjects(projects, ids) {
  const visible = projects.filter(piece => piece.hidden !== true);
  const byId = new Map(visible.map(piece => [String(piece.idKey), piece]));
  if (ids.length !== visible.length || new Set(ids).size !== ids.length || ids.some(id => !byId.has(id))) {
    throw new Error("La lista de piezas ha cambiado. Vuelve a abrir el editor para ordenar.");
  }
  let index = 0;
  return projects.map(piece => piece.hidden === true ? piece : byId.get(ids[index++]));
}

export function moveVisibleProject(projects, ids, id, direction) {
  const current = ids.indexOf(id);
  const target = current + direction;
  if (current === -1 || target < 0 || target >= ids.length) return null;
  const first = projects.findIndex(piece => String(piece.idKey) === id && piece.hidden !== true);
  const second = projects.findIndex(piece => String(piece.idKey) === ids[target] && piece.hidden !== true);
  if (first === -1 || second === -1) return null;
  const reordered = [...projects];
  [reordered[first], reordered[second]] = [reordered[second], reordered[first]];
  return { projects: reordered, index: target };
}

export function enableReordering(list, announce) {
  let drag = null;
  let frame = 0;

  function report(row) {
    const position = Array.from(list.children).indexOf(row) + 1;
    announce(row.querySelector(".order-name").textContent + ", posición " + position + " de " + list.children.length + ".");
  }

  function moveUnderPointer() {
    const target = document.elementFromPoint(drag.x, drag.y)?.closest("[data-project-id]");
    if (!target || target.parentElement !== list || target === drag.row) return;
    const bounds = target.getBoundingClientRect();
    list.insertBefore(drag.row, drag.y < bounds.top + bounds.height / 2 ? target : target.nextElementSibling);
  }

  function updateDrag() {
    frame = 0;
    if (!drag) return;
    const bounds = list.getBoundingClientRect();
    const edge = 45;
    const before = list.scrollTop;
    if (drag.y < bounds.top + edge) list.scrollTop -= 14;
    if (drag.y > bounds.bottom - edge) list.scrollTop += 14;
    moveUnderPointer();
    if (list.scrollTop !== before) frame = requestAnimationFrame(updateDrag);
  }

  function finishDrag(event, cancel = false) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    cancelAnimationFrame(frame);
    frame = 0;
    if (!cancel) {
      drag.x = event.clientX;
      drag.y = event.clientY;
      moveUnderPointer();
    }
    const { row, next, pointerId } = drag;
    drag = null;
    row.classList.remove("dragging");
    if (cancel) list.insertBefore(row, next);
    else report(row);
    if (list.hasPointerCapture(pointerId)) list.releasePointerCapture(pointerId);
  }

  list.addEventListener("pointerdown", event => {
    const handle = event.target.closest("[data-order-handle]");
    if (!handle || drag || event.button !== 0) return;
    const row = handle.closest("[data-project-id]");
    drag = { row, next: row.nextElementSibling, pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    row.classList.add("dragging");
    list.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  list.addEventListener("pointermove", event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (!frame) frame = requestAnimationFrame(updateDrag);
  });
  list.addEventListener("pointerup", event => finishDrag(event));
  list.addEventListener("pointercancel", event => finishDrag(event, true));
  list.addEventListener("lostpointercapture", event => finishDrag(event, true));

  list.addEventListener("click", event => {
    const button = event.target.closest("[data-order-move]");
    if (!button) return;
    const row = button.closest("[data-project-id]");
    const direction = button.dataset.orderMove;
    if (direction === "first") list.prepend(row);
    if (direction === "up" && row.previousElementSibling) list.insertBefore(row, row.previousElementSibling);
    if (direction === "down" && row.nextElementSibling) list.insertBefore(row.nextElementSibling, row);
    button.focus({ preventScroll: true });
    row.scrollIntoView({ block: "nearest" });
    report(row);
  });
}
