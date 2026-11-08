// Update trusted activity templates in place. Keep unchanged cards, images,
// live regions and focused controls instead of replacing the whole page.
function key(node) {
  if (node.nodeType !== 1) return null;
  if (node.tagName === 'IMG') return `image:${node.getAttribute('src')}`;
  if (node.id) return `id:${node.id}`;
  if (node.dataset.viewKey) return `view:${node.dataset.viewKey}`;
  if (node.dataset.action) {
    return [node.dataset.action, node.dataset.index, node.dataset.letter,
      node.dataset.pairs, node.dataset.hint].join(':');
  }
  return node.classList[0] ? `${node.tagName}:${node.classList[0]}` : null;
}

function compatible(current, next) {
  return current.nodeType === next.nodeType && current.nodeName === next.nodeName
    && key(current) === key(next);
}

function patch(current, next) {
  if (current.isEqualNode(next)) return;
  if (current.nodeType !== 1) { current.nodeValue = next.nodeValue; return; }
  for (const attribute of [...current.attributes]) {
    if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
  }
  for (const attribute of next.attributes) {
    if (current.getAttribute(attribute.name) !== attribute.value) {
      current.setAttribute(attribute.name, attribute.value);
    }
  }
  patchChildren(current, next);
}

function patchChildren(parent, next) {
  let cursor = parent.firstChild;
  for (const desired of [...next.childNodes]) {
    let current = cursor;
    if (!current || !compatible(current, desired)) {
      current = null;
      if (key(desired)) {
        for (let candidate = cursor; candidate; candidate = candidate.nextSibling) {
          if (compatible(candidate, desired)) { current = candidate; break; }
        }
      }
      if (current) parent.insertBefore(current, cursor);
      else {
        current = desired.cloneNode(true);
        parent.insertBefore(current, cursor);
      }
    }
    patch(current, desired);
    cursor = current.nextSibling;
  }
  while (cursor) { const next = cursor.nextSibling; cursor.remove(); cursor = next; }
}

export function updateActivityView(container, html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const { scrollX: left, scrollY: top } = window;
  patchChildren(container, template.content);
  // Prevent browser scroll anchoring from shifting the play area when a hint
  // changes. Navigation and deliberate keyboard focus are handled separately.
  if (window.scrollX !== left || window.scrollY !== top) {
    window.scrollTo({ left, top, behavior: 'instant' });
  }
}
