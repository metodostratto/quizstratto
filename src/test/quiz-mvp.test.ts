import { describe, expect, it } from "vitest";

const POINTS = [0, 6, 14, 20] as const;

function calculateScore(answers: (number | null)[]): number {
  return answers.reduce<number>((acc, v) => acc + (v === null ? 0 : POINTS[v] ?? 0), 0);
}

function classify(score: number) {
  if (score <= 30) return "PRESENÇA DIGITAL INICIAL";
  if (score <= 55) return "ESTRUTURA EM CONSTRUÇÃO";
  if (score <= 75) return "OPERAÇÃO EM CRESCIMENTO";
  return "OPERAÇÃO ESTRUTURADA";
}

describe("Diagnóstico Digital Stratto - MVP 5 Perguntas", () => {
  it("deve calcular pontuação mínima 0 quando todas forem A (0)", () => {
    const answers = [0, 0, 0, 0, 0];
    const score = calculateScore(answers);
    expect(score).toBe(0);
    expect(classify(score)).toBe("PRESENÇA DIGITAL INICIAL");
  });

  it("deve calcular pontuação máxima 100 quando todas forem D (20)", () => {
    const answers = [3, 3, 3, 3, 3];
    const score = calculateScore(answers);
    expect(score).toBe(100);
    expect(classify(score)).toBe("OPERAÇÃO ESTRUTURADA");
  });

  it("deve calcular pontuações intermediárias corretamente", () => {
    // B=6, C=14, D=20, A=0, B=6 -> 6 + 14 + 20 + 0 + 6 = 46
    const answers = [1, 2, 3, 0, 1];
    const score = calculateScore(answers);
    expect(score).toBe(46);
    expect(classify(score)).toBe("ESTRUTURA EM CONSTRUÇÃO");
  });

  it("deve classificar OPERAÇÃO EM CRESCIMENTO para score 68", () => {
    // 14 * 4 + 6 = 62 -> OPERAÇÃO EM CRESCIMENTO
    const answers = [2, 2, 2, 2, 1];
    const score = calculateScore(answers);
    expect(score).toBe(62);
    expect(classify(score)).toBe("OPERAÇÃO EM CRESCIMENTO");
  });
});
