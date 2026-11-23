import {
  client, configured, initialCatalog, legacyCatalog, readCatalog, readLocal, safeMediaUrl,
  saveLocal, uploadMedia, validateFile, writeCatalog
} from "./catalog.js?v=crochet-3";
import { enableReordering, moveVisibleProject, reorderVisibleProjects } from "./ordering.js?v=orden-5";

const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
);
const fold = value => String(value ?? "").toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
const favoritesKey = "bosqueCrochetFavorites.v2";
const notesKey = "bosqueCrochetPrivateNotes";
const favorites = new Set(readLocal(favoritesKey, []).map(String));
const privateNotes = readLocal(notesKey, {});
const legacyNotes = readLocal("bosqueCrochetProjectMeta.v2", {});
const legacyProjects = new Map(readLocal("bosqueCrochetUserProjects.v2", []).map(item => [String(item.idKey || item.id), item]));
const pageSize = 12;
const categoryIcons = new Set(["all", "amigurumi", "flores", "navidad", "llaveros", "hogar", "accesorios", "letras", "textil", "decoracion"]);
const cardMediaIndexes = new Map();
const coverSlots = ["cover-first", "cover-second", "cover-third"];
const defaultCover = ["17", "grupo-raton", "38"];

let catalog = configured ? { ...initialCatalog, projects: [] } : initialCatalog;
let publicRevision = null;
let workshop = null;
let revision = null;
let admin = false;
let activeCategory = new URLSearchParams(location.search).get("categoria") || "all";
let onlyFavorites = false;
let showHidden = false;
let limit = pageSize;
let detailId = "";
let mediaIndex = 0;
let editId = "";
let files = [];
let categoryDraft = [];
let editorRevision = null;
let busy = false;

function categoryName(id) {
  return catalog.categories.find(cat => cat.id === id)?.name || "Decoración";
}

function categoryIcon(id) {
  return "assets/categorias/" + (categoryIcons.has(id) ? id : "custom") + ".png";
}

function projectById(id) {
  return (workshop || catalog).projects.find(project => String(project.idKey) === String(id));
}

function categoryUrl(id) {
  const url = new URL(location.href);
  if (id === "all") url.searchParams.delete("categoria");
  else url.searchParams.set("categoria", id);
  url.hash = "coleccion";
  return url.pathname + url.search + url.hash;
}

function mediaHtml(media, title, controls = false) {
  const src = safeMediaUrl(media?.src);
  if (!src) return '<span>Sin imagen</span>';
  if (media.type === "video") {
    return '<video playsinline preload="' + (controls ? "metadata" : "none")
      + '" src="' + esc(src) + '" ' + (controls ? 'controls aria-label="Vídeo de ' + esc(title) + '"' : "muted aria-hidden=true") + '></video>';
  }
  return '<img src="' + esc(src) + '" alt="' + esc(title) + '" loading="' + (controls ? "eager" : "lazy") + '" decoding="async">';
}

function renderCategories() {
  const nav = $("categories");
  const scroll = nav.scrollLeft;
  nav.innerHTML = catalog.categories.map(cat => '<a href="' + esc(categoryUrl(cat.id)) + '" data-category="' + esc(cat.id)
    + '"' + (cat.id === activeCategory && !onlyFavorites && !showHidden ? ' aria-current="true"' : "") + '>'
    + '<img width="27" height="27" src="' + categoryIcon(cat.id) + '" alt=""><span>'
    + (cat.id === "all" ? "Todas las piezas" : esc(cat.name)) + '</span></a>').join("");
  nav.scrollLeft = scroll;
}

function coverPhoto(piece) {
  if (!piece || piece.hidden === true) return "";
  return piece.media.filter(item => item.type === "image").map(item => safeMediaUrl(item.src)).find(Boolean) || "";
}

function coverProjects(state) {
  const available = state.projects.filter(coverPhoto);
  const selected = state.coverIds ?? defaultCover;
  const ordered = [...new Set(selected)].map(id =>
    available.find(piece => String(piece.idKey) === String(id))
  ).filter(Boolean);
  if (!state.coverIds) {
    ordered.push(...available.filter(piece => !ordered.includes(piece)));
  }
  return ordered.slice(0, coverSlots.length);
}

function renderCover() {
  const cover = $("hero-photos");
  const selected = coverProjects(catalog);
  cover.hidden = !selected.length;
  cover.classList.toggle("single", selected.length === 1);
  cover.classList.toggle("pair", selected.length === 2);
  const html = selected.map((piece, index) =>
    '<figure class="hero-photo"><img src="' + esc(coverPhoto(piece)) + '" alt="' + esc(piece.title)
    + '" decoding="async"' + (index === 0 ? ' fetchpriority="high"' : "") + '><figcaption>'
    + esc(piece.title) + '</figcaption></figure>'
  ).join("");
  if (cover.innerHTML !== html) cover.innerHTML = html;
}

function cardMediaIndex(project) {
  const index = cardMediaIndexes.get(String(project.idKey)) || 0;
  return index < project.media.length ? index : 0;
}

function cardPreview(project) {
  const item = project.media[cardMediaIndex(project)];
  if (item?.type === "video") return mediaHtml(item, project.title, true);
  return '<button class="card-photo-hit" data-piece="' + esc(project.idKey)
    + '" aria-label="Ampliar foto de ' + esc(project.title) + '">'
    + mediaHtml(item, project.title) + '</button>';
}

function cardMediaCount(project) {
  const index = cardMediaIndex(project);
  const type = project.media[index]?.type === "video" ? "Vídeo" : "Foto";
  return type + " " + (index + 1) + " de " + project.media.length;
}

function cardMediaControls(project) {
  if (project.media.length < 2) return "";
  return '<div class="card-media-controls" role="group" aria-label="Archivos de ' + esc(project.title) + '">'
    + '<button type="button" data-media-step="-1" aria-label="Archivo anterior"><span aria-hidden="true">‹</span></button>'
    + '<span class="card-media-position" aria-live="polite">' + cardMediaCount(project) + '</span>'
    + '<button type="button" data-media-step="1" aria-label="Archivo siguiente"><span aria-hidden="true">›</span></button></div>';
}

function canReorderGallery() {
  return admin && workshop !== null && !showHidden && $("sort").value === "collection";
}

function cardOrderControls(project, index, count) {
  const title = esc(project.title);
  return '<div class="card-order" role="group" aria-label="Orden de ' + title + '">'
    + '<button type="button" data-card-move="-1" aria-label="Subir ' + title + '"'
    + (index === 0 ? " disabled" : "") + '><span aria-hidden="true">↑</span></button>'
    + '<button type="button" data-card-move="1" aria-label="Bajar ' + title + '"'
    + (index === count - 1 ? " disabled" : "") + '><span aria-hidden="true">↓</span></button>'
    + '</div>';
}

function matchingProjects(query) {
  const source = showHidden ? workshop?.projects || [] : catalog.projects;
  return source.filter(project => {
    const text = fold([project.title, project.desc, categoryName(project.cat), ...(project.tags || [])].join(" "));
    return (!showHidden || project.hidden === true) && (activeCategory === "all" || project.cat === activeCategory)
      && (!onlyFavorites || favorites.has(String(project.idKey))) && text.includes(query);
  });
}

function renderGallery() {
  $("collection-name").textContent = showHidden ? "Piezas ocultas" : onlyFavorites ? "Favoritas"
    : activeCategory === "all" ? "La colección" : categoryName(activeCategory);
  const icon = $("collection-icon");
  icon.hidden = showHidden || onlyFavorites;
  if (!icon.hidden) icon.src = categoryIcon(activeCategory);
  const query = fold($("search").value.trim());
  const sort = $("sort").value;
  const pieces = matchingProjects(query);
  if (sort === "name") pieces.sort((a, b) => a.title.localeCompare(b.title, "es"));
  if (sort === "newest") pieces.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  const showOrder = canReorderGallery() && pieces.length > 1;
  $("gallery").innerHTML = pieces.slice(0, limit).map((project, index) => {
    const id = esc(project.idKey);
    const marked = favorites.has(String(project.idKey));
    return '<article class="card" data-card="' + id + '"><div class="card-photo">' + cardPreview(project)
      + '</div>' + cardMediaControls(project) + '<div class="card-body"><button class="card-open" data-piece="' + id
      + '" aria-label="Ver ' + esc(project.title) + '"><span class="eyebrow">' + esc(categoryName(project.cat))
      + '</span><span class="card-title">' + esc(project.title) + '</span><span class="card-desc">' + esc(project.desc)
      + '</span></button>'
      + (showHidden ? "" : '<button class="heart" data-favorite="' + id + '" aria-label="Favorita: ' + esc(project.title)
      + '" aria-pressed="' + marked + '">' + (marked ? "♥" : "♡") + '</button>') + '</div>'
      + (showOrder ? cardOrderControls(project, index, pieces.length) : "") + '</article>';
  }).join("");
  const count = pieces.length + (pieces.length === 1 ? " pieza" : " piezas");
  const waitingForCatalog = !showHidden && configured && publicRevision === null;
  $("result-count").textContent = waitingForCatalog ? "" : onlyFavorites ? count + " en favoritas" : count;
  $("empty").textContent = showHidden && !query ? "Aún no hay piezas ocultas."
    : onlyFavorites && !query && activeCategory === "all"
    ? "Todavía no tienes favoritas. Pulsa el corazón de una pieza para guardarla." : "No hay piezas con estos filtros.";
  $("empty").hidden = waitingForCatalog || pieces.length > 0;
  $("close-hidden").hidden = !showHidden;
  $("more").hidden = pieces.length <= limit;
  $("clear-filters").hidden = activeCategory === "all" && !query && !onlyFavorites;
  $("show-favorites").setAttribute("aria-pressed", onlyFavorites);
}

function updateGallery() {
  if (!catalog.categories.some(category => category.id === activeCategory)) activeCategory = "all";
  renderCategories();
  renderCover();
  renderGallery();
}

function setCategory(id, pushHistory = true) {
  activeCategory = id;
  limit = pageSize;
  if (pushHistory) history.pushState(null, "", categoryUrl(id));
  updateGallery();
}

function toggleFavorite(id, button) {
  const marked = !favorites.has(id);
  if (marked) favorites.add(id);
  else favorites.delete(id);
  saveLocal(favoritesKey, [...favorites]);
  button.setAttribute("aria-pressed", marked);
  if (button.id !== "detail-favorite") button.textContent = marked ? "♥" : "♡";
  if (onlyFavorites) {
    renderGallery();
    if (button.id !== "detail-favorite") $("gallery").querySelector("button")?.focus();
  } else if (button.id === "detail-favorite") {
    const cardButton = [...$("gallery").querySelectorAll("[data-favorite]")].find(item => item.dataset.favorite === id);
    if (cardButton) {
      cardButton.setAttribute("aria-pressed", marked);
      cardButton.textContent = marked ? "♥" : "♡";
    }
  }
  updateDetailFavorite();
}

function updateDetailFavorite() {
  const marked = favorites.has(detailId);
  $("detail-favorite").textContent = marked ? "♥ Guardada en favoritas" : "♡ Guardar en favoritas";
  $("detail-favorite").setAttribute("aria-pressed", marked);
}

function restoreMergedFavorites(projects) {
  let changed = false;
  for (const project of projects) {
    for (const previousId of project.previousIds || []) {
      if (!favorites.delete(String(previousId))) continue;
      favorites.add(String(project.idKey));
      changed = true;
    }
  }
  if (changed) saveLocal(favoritesKey, [...favorites]);
}

function renderNotes() {
  const ids = [detailId, ...(projectById(detailId)?.previousIds || [])].map(String);
  const notes = ids.flatMap(id => [
    ...(legacyNotes[id]?.comments ?? legacyProjects.get(id)?.comments ?? []),
    ...(privateNotes[id] || [])
  ]);
  $("notes").innerHTML = notes
    .map(note => "<p>" + esc(note) + "</p>").join("");
}

function renderDetailMedia() {
  const project = projectById(detailId);
  $("detail-media").innerHTML = mediaHtml(project.media[mediaIndex], project.title, true);
  $("thumbs").innerHTML = project.media.length < 2 ? "" : project.media.map((item, index) =>
    '<button type="button" data-index="' + index + '" aria-label="Ver ' + (item.type === "video" ? "vídeo " : "foto ")
      + (index + 1) + '" aria-current="' + (index === mediaIndex) + '">' + mediaHtml(item, "") + '</button>'
  ).join("");
}

function openDetail(id) {
  const project = projectById(id);
  if (!project) return;
  detailId = id;
  mediaIndex = cardMediaIndex(project);
  $("detail-title").textContent = project.title;
  $("detail-category").textContent = categoryName(project.cat);
  $("detail-description").textContent = project.desc;
  $("detail-tags").innerHTML = (project.tags || []).map(tag => "<span>" + esc(tag) + "</span>").join("");
  $("detail-status").textContent = "";
  $("note-status").textContent = "";
  $("notes-form").reset();
  $("detail").querySelector("details").open = false;
  updateDetailFavorite();
  refreshVisibility(project);
  renderNotes();
  renderDetailMedia();
  $("detail").showModal();
}

function refreshVisibility(project) {
  const hidden = project.hidden === true;
  $("toggle-visibility").textContent = hidden ? "Volver a mostrar" : "Ocultar pieza";
  $("detail-favorite").hidden = hidden;
  $("detail").querySelector("details").hidden = hidden;
}

function refreshAdmin() {
  $("login").hidden = !client || admin;
  $("admin-panel").hidden = !admin || revision === null;
  $("detail-actions").hidden = !admin || revision === null;
  $("import-local").hidden = !(admin && revision === 0 && legacyCatalog());
}

function clearWorkshop() {
  const hadAdmin = admin;
  const wasBrowsingHidden = showHidden;
  const viewedHidden = projectById(detailId)?.hidden === true;
  admin = false;
  workshop = null;
  revision = null;
  showHidden = false;
  if (viewedHidden) $("detail").close();
  $("editor").close();
  $("category-editor").close();
  $("order-editor").close();
  $("cover-editor").close();
  refreshAdmin();
  if (wasBrowsingHidden) updateGallery();
  else if (hadAdmin) renderGallery();
  if (hadAdmin) setStatus("gallery-order-status", "");
}

async function checkSession() {
  if (!client) return;
  const { data } = await client.auth.getSession();
  if (!data.session) {
    clearWorkshop();
    return;
  }
  const result = await client.rpc("bosque_is_admin");
  if (result.error) throw new Error("No se pudo comprobar el acceso al taller.");
  if (result.data !== true) {
    await client.auth.signOut({ scope: "local" });
    clearWorkshop();
    throw new Error("Esta cuenta no tiene permiso para publicar en el taller.");
  }
  const dataWorkshop = await readCatalog(true);
  workshop = dataWorkshop.catalog;
  revision = dataWorkshop.revision;
  admin = true;
  refreshAdmin();
  renderGallery();
}

async function loadPublished() {
  if (!configured) return;
  try {
    if (!client) throw new Error("No se pudo cargar la conexión con el catálogo.");
    const published = await readCatalog();
    if (publicRevision === null || published.revision >= publicRevision) {
      catalog = published.catalog;
      publicRevision = published.revision;
      restoreMergedFavorites(catalog.projects);
    }
    $("catalog-status").hidden = true;
    updateGallery();
    refreshAdmin();
  } catch (error) {
    $("admin-status").textContent = error.message + " Recarga la página para volver a intentarlo.";
    $("catalog-status").textContent = "No se pudo cargar la colección. Recarga la página para volver a intentarlo.";
    $("catalog-status").hidden = false;
  }
}

async function save(next, expectedRevision) {
  if (!admin || revision === null) throw new Error("Inicia sesión con la cuenta del taller.");
  if (expectedRevision !== revision) throw new Error("Vuelve a abrir el formulario para editar la última versión del catálogo.");
  revision = await writeCatalog(next, expectedRevision);
  workshop = next;
  catalog = { ...next, projects: next.projects.filter(item => item.hidden !== true) };
  publicRevision = revision;
  updateGallery();
  refreshAdmin();
}

async function runAction(button, statusId, action) {
  if (busy) return;
  const status = $(statusId);
  busy = true;
  button.disabled = true;
  status.textContent = "Procesando…";
  try {
    const message = await action();
    status.textContent = message || "";
  } catch (error) {
    status.textContent = error.message || "Algo ha fallado. Vuelve a intentarlo.";
  } finally {
    busy = false;
    button.disabled = false;
  }
}

function renderFiles() {
  $("file-list").innerHTML = files.map((item, index) => '<li><span>' + esc(item.name)
    + '</span><button type="button" class="text-button danger" data-remove-file="' + index
    + '" aria-label="Quitar ' + esc(item.name) + '">Quitar</button></li>').join("");
}

function openEditor(project) {
  if (!admin) return;
  $("piece-form").reset();
  $("editor-status").textContent = "";
  editId = project?.idKey || "";
  editorRevision = revision;
  files = [...(project?.media || [])];
  $("editor-title").textContent = project ? "Editar pieza" : "Nueva pieza";
  $("piece-category").innerHTML = catalog.categories.filter(cat => cat.id !== "all").map(cat =>
    '<option value="' + esc(cat.id) + '">' + esc(cat.name) + '</option>').join("");
  $("piece-category").value = project?.cat || "decoracion";
  $("piece-name").value = project?.title || "";
  $("piece-description").value = project?.desc || "";
  $("piece-tags").value = (project?.tags || []).join(", ");
  renderFiles();
  $("detail").close();
  $("admin").close();
  $("editor").showModal();
}

function renderCategoryEditor() {
  $("category-list").innerHTML = categoryDraft.map((cat, index) => {
    const removable = cat.id !== "decoracion";
    return '<div class="category-row"><input aria-label="Nombre de categoría ' + (index + 1)
      + '" data-name="' + index + '" value="' + esc(cat.name) + '" maxlength="60" required>'
      + (removable ? '<button type="button" class="text-button danger" data-remove-category="' + index
      + '" aria-label="Quitar ' + esc(cat.name) + '">Quitar</button>' : "") + '</div>';
  }).join("");
}

function setStatus(id, message) {
  $(id).textContent = message;
}

$("categories").addEventListener("click", event => {
  const link = event.target.closest("[data-category]");
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  onlyFavorites = false;
  showHidden = false;
  $("search").value = "";
  setCategory(link.dataset.category);
  $("collection-title").focus({ preventScroll: true });
  $("coleccion").scrollIntoView();
});
window.addEventListener("popstate", () => {
  showHidden = false;
  onlyFavorites = false;
  setCategory(new URLSearchParams(location.search).get("categoria") || "all", false);
});
$("search").addEventListener("input", () => { limit = pageSize; renderGallery(); });
$("sort").addEventListener("change", () => { limit = pageSize; renderGallery(); });
$("clear-filters").addEventListener("click", () => {
  $("search").value = "";
  onlyFavorites = false;
  setCategory("all");
  $("search").focus();
});
$("show-favorites").addEventListener("click", () => {
  onlyFavorites = !onlyFavorites;
  showHidden = false;
  $("search").value = "";
  setCategory("all");
  $("coleccion").scrollIntoView();
});
$("close-hidden").addEventListener("click", () => {
  showHidden = false;
  $("search").value = "";
  setCategory("all", false);
  $("collection-title").focus({ preventScroll: true });
});
$("more").addEventListener("click", () => {
  const prior = limit;
  limit += pageSize;
  renderGallery();
  $("gallery").children[prior]?.querySelector("button")?.focus({ preventScroll: true });
});
function moveFromGallery(button) {
  if (!canReorderGallery() || busy) return;
  const id = button.closest("[data-card]").dataset.card;
  const direction = Number(button.dataset.cardMove);
  const query = fold($("search").value.trim());
  const category = activeCategory;
  const favoritesOnly = onlyFavorites;
  const ids = matchingProjects(query).map(piece => String(piece.idKey));
  const move = moveVisibleProject(workshop.projects, ids, id, direction);
  if (!move) return;

  runAction(button, "gallery-order-status", async () => {
    if (publicRevision !== revision) throw new Error("La colección ha cambiado. Recarga la página antes de ordenar.");
    await save({ ...workshop, projects: move.projects }, revision);
    const sameView = canReorderGallery() && activeCategory === category && onlyFavorites === favoritesOnly
      && fold($("search").value.trim()) === query;
    if (sameView) {
      if (move.index >= limit) {
        limit = move.index + 1;
        renderGallery();
      }
      if (document.activeElement === document.body || document.activeElement === button) {
        const card = Array.from($("gallery").children).find(item => item.dataset.card === id);
        const next = card?.querySelector('[data-card-move="' + direction + '"]:enabled')
          || card?.querySelector("[data-card-move]:enabled");
        next?.focus({ preventScroll: true });
      }
    }
    return "Orden guardado.";
  });
}

$("gallery").addEventListener("click", event => {
  const move = event.target.closest("[data-card-move]");
  if (move) return moveFromGallery(move);
  const step = event.target.closest("[data-media-step]");
  if (step) {
    const card = step.closest("[data-card]");
    const project = projectById(card.dataset.card);
    if (!project || project.media.length < 2) return;
    const length = project.media.length;
    const next = (cardMediaIndex(project) + Number(step.dataset.mediaStep) + length) % length;
    cardMediaIndexes.set(String(project.idKey), next);
    card.querySelector(".card-photo").innerHTML = cardPreview(project);
    card.querySelector(".card-media-position").textContent = cardMediaCount(project);
    return;
  }
  const open = event.target.closest("[data-piece]");
  const favorite = event.target.closest("[data-favorite]");
  if (open) openDetail(open.dataset.piece);
  if (favorite) toggleFavorite(favorite.dataset.favorite, favorite);
});
$("thumbs").addEventListener("click", event => {
  const thumb = event.target.closest("[data-index]");
  if (!thumb) return;
  mediaIndex = Number(thumb.dataset.index);
  renderDetailMedia();
  $("thumbs").children[mediaIndex]?.focus();
});
$("detail").addEventListener("close", () => $("detail-media").replaceChildren());
$("detail-favorite").addEventListener("click", event => toggleFavorite(detailId, event.currentTarget));
$("notes-form").addEventListener("submit", event => {
  event.preventDefault();
  const note = $("note").value.trim();
  if (!note) return;
  const notes = [...(privateNotes[detailId] || []), note];
  if (!saveLocal(notesKey, { ...privateNotes, [detailId]: notes })) {
    setStatus("note-status", "El navegador no ha podido guardar la nota.");
    return;
  }
  privateNotes[detailId] = notes;
  $("notes-form").reset();
  setStatus("note-status", "");
  renderNotes();
});

document.querySelectorAll("dialog").forEach(dialog => {
  dialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); });
  dialog.querySelector("[data-close]").addEventListener("click", () => { if (!busy) dialog.close(); });
});
$("open-admin").addEventListener("click", () => {
  if (!client) setStatus("admin-status", "El acceso privado está pendiente de configurar.");
  $("admin").showModal();
});
$("login").addEventListener("submit", event => {
  event.preventDefault();
  runAction(event.submitter, "admin-status", async () => {
    const { error } = await client.auth.signInWithPassword({
      email: $("email").value.trim(), password: $("password").value
    });
    $("password").value = "";
    if (error) throw new Error("No se pudo iniciar sesión. Revisa el correo y la contraseña.");
    await checkSession();
  });
});
$("logout").addEventListener("click", event => {
  runAction(event.currentTarget, "admin-status", async () => {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw new Error("No se pudo cerrar la sesión. Vuelve a intentarlo.");
    clearWorkshop();
    return "Sesión cerrada.";
  });
});
$("view-hidden").addEventListener("click", () => {
  if (!admin || !workshop) return;
  showHidden = true;
  onlyFavorites = false;
  $("search").value = "";
  setCategory("all");
  $("admin").close();
  $("collection-title").focus({ preventScroll: true });
  $("coleccion").scrollIntoView();
});
$("new-piece").addEventListener("click", () => openEditor());

function updateCoverPreview() {
  for (const slot of coverSlots) {
    const preview = $(slot + "-preview");
    const src = coverPhoto(projectById($(slot).value));
    preview.hidden = !src;
    if (src) preview.src = src;
    else preview.removeAttribute("src");
  }
}

$("open-cover").addEventListener("click", () => {
  if (!admin || !workshop) return;
  editorRevision = revision;
  const selected = coverProjects(workshop);
  const choices = workshop.projects.filter(coverPhoto).sort((a, b) => a.title.localeCompare(b.title, "es"));
  const options = choices.map(piece => '<option value="' + esc(piece.idKey) + '">' + esc(piece.title) + '</option>').join("");
  coverSlots.forEach((slot, index) => {
    const select = $(slot);
    select.innerHTML = '<option value="">' + (index === 0 ? "Elige una pieza" : "Sin pieza") + '</option>' + options;
    select.value = selected[index]?.idKey ?? "";
    select.disabled = !choices.length;
  });
  $("save-cover").disabled = !choices.length;
  setStatus("cover-status", choices.length ? "" : "Publica una pieza con foto para poder elegirla.");
  updateCoverPreview();
  $("admin").close();
  $("cover-editor").showModal();
});
$("cover-form").addEventListener("change", event => {
  if (coverSlots.includes(event.target.id)) updateCoverPreview();
});
$("cover-form").addEventListener("submit", event => {
  event.preventDefault();
  runAction(event.submitter, "cover-status", async () => {
    if (!admin || !workshop) throw new Error("Inicia sesión con la cuenta del taller.");
    const coverIds = coverSlots.map(slot => $(slot).value).filter(Boolean);
    if (!$("cover-first").value || coverIds.some(id => !coverPhoto(projectById(id)))) {
      throw new Error("Elige una pieza principal y usa solo piezas visibles con foto.");
    }
    if (new Set(coverIds).size !== coverIds.length) throw new Error("Elige una pieza distinta en cada posición.");
    await save({ ...workshop, coverIds }, editorRevision);
    $("cover-editor").close();
    $("admin").showModal();
    setStatus("admin-status", "Portada actualizada.");
  });
});

const orderList = $("order-list");
enableReordering(orderList, message => setStatus("order-status", message));

$("open-order").addEventListener("click", () => {
  if (!admin || !workshop) return;
  editorRevision = revision;
  const visible = workshop.projects.filter(project => project.hidden !== true);
  orderList.innerHTML = visible.map(project =>
    '<li data-project-id="' + esc(project.idKey) + '"><div class="order-row">'
    + '<span class="order-handle" aria-hidden="true" data-order-handle>⠿</span>'
    + '<span class="order-photo">' + mediaHtml(project.media.find(media => media.type === "image"), "") + '</span>'
    + '<span class="order-name">' + esc(project.title) + '</span>'
    + '<div class="order-buttons">'
    + '<button type="button" data-order-move="first" aria-label="Poner al principio: ' + esc(project.title) + '">Inicio</button>'
    + '<button type="button" data-order-move="up" aria-label="Subir ' + esc(project.title) + '">↑</button>'
    + '<button type="button" data-order-move="down" aria-label="Bajar ' + esc(project.title) + '">↓</button>'
    + '</div></div></li>'
  ).join("");
  $("save-order").disabled = visible.length < 2;
  setStatus("order-status", visible.length ? "" : "Todavía no hay piezas visibles para ordenar.");
  $("admin").close();
  $("order-editor").showModal();
  orderList.scrollTop = 0;
});

$("order-form").addEventListener("submit", event => {
  event.preventDefault();
  runAction(event.submitter, "order-status", async () => {
    if (!admin || !workshop) throw new Error("Inicia sesión con la cuenta del taller.");
    const ids = Array.from(orderList.children, row => row.dataset.projectId);
    const projects = reorderVisibleProjects(workshop.projects, ids);
    orderList.inert = true;
    try {
      if (projects.some((piece, index) => piece !== workshop.projects[index])) {
        await save({ ...workshop, projects }, editorRevision);
      }
    } finally {
      orderList.inert = false;
    }
    $("sort").value = "collection";
    renderGallery();
    $("order-editor").close();
    $("admin").showModal();
    setStatus("admin-status", "El orden de colección está guardado.");
  });
});
$("edit-piece").addEventListener("click", () => openEditor(projectById(detailId)));
$("toggle-visibility").addEventListener("click", event => {
  const project = projectById(detailId);
  if (!admin || !project) return;
  const hidden = project.hidden !== true;
  runAction(event.currentTarget, "detail-status", async () => {
    const updated = { ...project, hidden };
    const projects = workshop.projects.map(item => item === project ? updated : item);
    await save({ ...workshop, projects }, revision);
    refreshVisibility(updated);
    return hidden ? "Pieza oculta en el catálogo público." : "Pieza visible en el catálogo público.";
  });
});
$("delete-piece").addEventListener("click", event => {
  const project = projectById(detailId);
  if (!admin || !project || !confirm("¿Quitar «" + project.title + "» del catálogo público?")) return;
  runAction(event.currentTarget, "detail-status", async () => {
    await save({ ...workshop, projects: workshop.projects.filter(item => item !== project) }, revision);
    $("detail").close();
  });
});
function addSelectedFiles(event) {
  const errors = [];
  for (const file of event.target.files) {
    try {
      validateFile(file);
      files.push({ file, name: file.name });
    } catch (error) { errors.push(file.name + " · " + error.message); }
  }
  event.target.value = "";
  setStatus("editor-status", errors.join(" "));
  renderFiles();
}
$("files").addEventListener("change", addSelectedFiles);
$("camera").addEventListener("change", addSelectedFiles);
$("file-list").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-file]");
  if (!button || busy) return;
  files.splice(Number(button.dataset.removeFile), 1);
  renderFiles();
  $("files").focus();
});
$("piece-form").addEventListener("submit", event => {
  event.preventDefault();
  runAction(event.submitter, "editor-status", async () => {
    if (!admin) throw new Error("Inicia sesión con la cuenta del taller.");
    const title = $("piece-name").value.trim();
    if (!title || !files.length) throw new Error("Escribe un nombre y añade al menos una foto o un vídeo.");
    const piece = {
      ...projectById(editId), idKey: editId || crypto.randomUUID(), title,
      cat: $("piece-category").value, desc: $("piece-description").value.trim(),
      tags: $("piece-tags").value.split(",").map(tag => tag.trim()).filter(Boolean)
    };
    piece.date ||= new Date().toISOString().slice(0, 10);
    piece.media = [];
    const pendingFiles = [...files];
    $("files").disabled = true;
    $("camera").disabled = true;
    try {
      for (const [index, item] of pendingFiles.entries()) {
        setStatus("editor-status", "Preparando archivo " + (index + 1) + " de " + pendingFiles.length + "…");
        const uploaded = await uploadMedia(item);
        files[index] = uploaded;
        piece.media.push(uploaded);
      }
    } finally {
      $("files").disabled = false;
      $("camera").disabled = false;
    }
    const projects = editId ? workshop.projects.map(item => item.idKey === editId ? piece : item) : [piece, ...workshop.projects];
    await save({ ...workshop, projects }, editorRevision);
    $("editor").close();
    setStatus("admin-status", piece.hidden ? "Cambios guardados. La pieza sigue oculta." : "Pieza publicada.");
    $("admin").showModal();
  });
});
$("edit-categories").addEventListener("click", () => {
  if (!admin) return;
  editorRevision = revision;
  categoryDraft = catalog.categories.filter(cat => cat.id !== "all").map(cat => ({ ...cat }));
  renderCategoryEditor();
  setStatus("category-status", "");
  $("admin").close();
  $("category-editor").showModal();
});
$("category-list").addEventListener("input", event => {
  const input = event.target.closest("[data-name]");
  if (input) categoryDraft[Number(input.dataset.name)].name = input.value;
});
$("category-list").addEventListener("click", event => {
  const button = event.target.closest("[data-remove-category]");
  if (!button || busy) return;
  const index = Number(button.dataset.removeCategory);
  if (!confirm("¿Quitar esta categoría? Sus piezas pasarán a Decoración al guardar.")) return;
  categoryDraft.splice(index, 1);
  renderCategoryEditor();
  $("add-category").focus();
});
$("add-category").addEventListener("click", () => {
  if (busy) return;
  categoryDraft.push({ id: crypto.randomUUID(), name: "" });
  renderCategoryEditor();
  $("category-list").lastElementChild.querySelector("input").focus();
});
$("category-form").addEventListener("submit", event => {
  event.preventDefault();
  runAction(event.submitter, "category-status", async () => {
    const categories = [{ id: "all", name: "Todo" }, ...categoryDraft.map(cat => ({ ...cat, name: cat.name.trim() }))];
    const names = categories.map(cat => fold(cat.name));
    if (names.includes("") || new Set(names).size !== names.length) throw new Error("Escribe un nombre distinto para cada categoría.");
    const ids = new Set(categories.map(cat => cat.id));
    const projects = workshop.projects.map(item => ids.has(item.cat) ? item : { ...item, cat: "decoracion" });
    await save({ ...workshop, categories, projects }, editorRevision);
    $("category-editor").close();
    setStatus("admin-status", "Categorías publicadas.");
    $("admin").showModal();
  });
});
$("import-local").addEventListener("click", event => {
  const legacy = legacyCatalog();
  if (!admin || revision !== 0 || !legacy) return;
  if (!confirm("¿Publicar la versión guardada en este navegador (" + legacy.projects.length
    + " piezas)? Se aplicarán sus altas, ediciones y eliminaciones. Las notas personales seguirán en el dispositivo.")) return;
  runAction(event.currentTarget, "admin-status", async () => {
    for (const [index, project] of legacy.projects.entries()) {
      setStatus("admin-status", "Importando pieza " + (index + 1) + " de " + legacy.projects.length + "…");
      const media = [];
      for (const item of project.media) media.push(await uploadMedia(item));
      project.media = media;
    }
    await save(legacy, 0);
    return "Se han publicado los cambios de este navegador.";
  });
});

updateGallery();
refreshAdmin();
loadPublished();
checkSession().catch(error => setStatus("admin-status", error.message));
client?.auth.onAuthStateChange(event => {
  if (event === "SIGNED_OUT") clearWorkshop();
});
