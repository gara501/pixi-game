export function cheapColi(a, b) {
  const ab = a.getBounds();
  const bb = b.getBounds();

  const hasColi = (
    ab.x + ab.width > bb.x &&
    ab.x < bb.x + bb.width &&
    ab.y + ab.height > bb.y &&
    ab.y < bb.y + bb.height
  )

  if (hasColi) {
    return ab.x < bb.x ? 'right' : 'left';
  }

  return false;
}
