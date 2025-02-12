const round = (num: number): number => Math.round(num * 100) / 100;

export function adjustVoiceWeights(
  selections: Record<string, number>,
  changedVoiceId: string,
  newWeight: number,
): Record<string, number> {
  const updated = { ...selections, [changedVoiceId]: round(newWeight) };
  const total = Object.values(updated).reduce((sum, w) => sum + w, 0);
  if (total <= 1) return updated;

  const excess = total - 1;
  const others = Object.keys(updated).filter(
    (key) => key !== changedVoiceId && updated[key] > 0,
  );
  const othersTotal = others.reduce((sum, key) => sum + updated[key], 0);

  // If no other active voices, force changed weight to 1
  if (othersTotal === 0) {
    updated[changedVoiceId] = 1;
    return updated;
  }

  others.forEach((key) => {
    const reduction = (updated[key] / othersTotal) * excess;
    updated[key] = round(Math.max(0, updated[key] - reduction));
  });
  return updated;
}
