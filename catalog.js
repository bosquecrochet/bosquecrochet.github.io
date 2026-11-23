import { CATEGORIES, builtInProjects } from "./collection.js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./config.js";

export const initialCatalog = { categories: CATEGORIES, projects: builtInProjects() };
export const fileLimit = 50 * 1024 * 1024;
const formats = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif",
  "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov"
};
const bucket = "bosque-media";
const mediaPrefix = SUPABASE_URL.trim().replace(/\/$/, "") + "/storage/v1/object/public/" + bucket + "/";
const originalAssets = new Set(initialCatalog.projects.flatMap(project => project.media.map(file => file.src)));

export const client = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

export function safeMediaUrl(src) {
  if (typeof src !== "string") return "";
  if (originalAssets.has(src)) return encodeURIComponent(src);
  if (SUPABASE_URL && src.startsWith(mediaPrefix) && /^[\w-]+\.[a-z]+$/.test(src.slice(mediaPrefix.length))) return src;
  return "";
}

export function validateFile(file) {
  if (!Object.hasOwn(formats, file.type)) throw new Error("Usa una imagen JPEG, PNG, WebP o GIF, o un vídeo MP4, WebM o MOV.");
  if (!file.size || file.size > fileLimit) throw new Error("Cada archivo debe tener contenido y ocupar hasta 50 MB.");
}

export async function uploadMedia(item) {
  if (!item.file && safeMediaUrl(item.src)) return { src: item.src, name: item.name, type: item.type };
  let file = item.file;
  if (!file && /^data:(image|video)\//.test(item.src || "")) file = await (await fetch(item.src)).blob();
  if (!file) throw new Error("Un archivo antiguo ya no se encuentra en este navegador.");
  validateFile(file);
  const path = crypto.randomUUID() + "." + formats[file.type];
  const { error } = await client.storage.from(bucket).upload(path, file, { contentType: file.type });
  if (error) throw new Error("No se pudo subir " + (item.name || "el archivo") + ". Comprueba el formato, el tamaño y la conexión.");
  return { src: mediaPrefix + path, name: item.name, type: file.type.startsWith("video/") ? "video" : "image" };
}

export async function readCatalog() {
  const { data, error } = await client.from("bosque_catalog").select("state,revision").eq("id", 1).single();
  if (error) throw new Error("No se pudo cargar el catálogo publicado.");
  return { catalog: data.state || initialCatalog, revision: data.revision };
}

export async function writeCatalog(catalog, revision) {
  const { data, error } = await client.from("bosque_catalog")
    .update({ state: catalog, revision: revision + 1 })
    .eq("id", 1).eq("revision", revision).select("revision").maybeSingle();
  if (error) throw new Error("No se pudo guardar. Comprueba la conexión y tu sesión antes de volver a intentarlo.");
  if (!data) throw new Error("El catálogo ha cambiado o tu sesión ya no tiene acceso. Recarga la página antes de volver a editar.");
  return data.revision;
}

export function readLocal(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

export function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch { return false; }
}

export function legacyCatalog() {
  const local = readLocal("bosqueCrochetUserProjects.v2", []);
  const meta = readLocal("bosqueCrochetProjectMeta.v2", {});
  const hidden = new Set(readLocal("bosqueCrochetHiddenProjects.v2", []).map(String));
  const stored = readLocal("bosqueCrochetCategories.v2", []);
  const edits = ["title", "cat", "desc", "tags", "media"];
  if (!local.length && !hidden.size && !stored.length && !Object.values(meta).some(item => edits.some(key => key in item))) return null;

  const known = new Map(CATEGORIES.map(cat => [cat.id, cat]));
  for (const cat of stored) known.set(cat.id, cat);
  const categories = [...known.values()].map(({ id, name }) => ({ id, name }));
  const projects = [...local, ...initialCatalog.projects].map(item => {
    const idKey = String(item.idKey || item.id);
    const changes = meta[idKey] || {};
    const piece = { ...item, idKey };
    for (const key of edits) if (key in changes) piece[key] = changes[key];
    const media = (piece.media?.length ? piece.media : [{
      src: piece.photo || piece.file, name: piece.file || piece.title, type: piece.video ? "video" : "image"
    }]).filter(file => file.src);
    return {
      idKey, media, title: piece.title, desc: piece.desc || "", tags: piece.tags || [],
      cat: known.has(piece.cat) ? piece.cat : "decoracion", date: piece.date || ""
    };
  }).filter(item => !hidden.has(item.idKey));
  return { categories, projects };
}
