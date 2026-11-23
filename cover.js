export const coverPositions = ["Principal", "Segunda", "Tercera"];

export function nextCoverIds(ids, id, target) {
  const current = ids.indexOf(id);
  if (target === -1) {
    return current >= 0 && ids.length > 1 ? ids.filter(item => item !== id) : null;
  }
  if (!Number.isInteger(target) || target < 0 || target >= coverPositions.length || current === target) {
    return null;
  }
  const next = [...ids];
  if (current < 0 && target <= next.length) {
    next[target] = id;
    return next;
  }
  if (current >= 0 && target < next.length) {
    [next[current], next[target]] = [next[target], next[current]];
    return next;
  }
  return null;
}
