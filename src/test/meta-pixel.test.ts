import { describe, expect, it, vi, beforeEach } from "vitest";
import { trackPixelEvent, trackPixelCustom, PIXEL_ID } from "@/lib/meta-pixel";

describe("Meta Pixel integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete window.fbq;
  });

  it("deve conter o Pixel ID correto", () => {
    expect(PIXEL_ID).toBe("1187108507173609");
  });

  it("não deve lançar erro se window.fbq não estiver definido (SSR safe)", () => {
    expect(() => trackPixelEvent("PageView")).not.toThrow();
    expect(() => trackPixelCustom("QuizStart")).not.toThrow();
  });

  it("deve invocar fbq track para eventos padrão", () => {
    const fbqMock = vi.fn();
    window.fbq = fbqMock;

    trackPixelEvent("Lead", { content_name: "Diagnóstico Digital Stratto" });

    expect(fbqMock).toHaveBeenCalledWith("track", "Lead", {
      content_name: "Diagnóstico Digital Stratto",
    });

    trackPixelEvent("Contact");
    expect(fbqMock).toHaveBeenCalledWith("track", "Contact");
  });

  it("deve invocar fbq trackCustom para eventos personalizados", () => {
    const fbqMock = vi.fn();
    window.fbq = fbqMock;

    trackPixelCustom("QuizStart");
    expect(fbqMock).toHaveBeenCalledWith("trackCustom", "QuizStart");

    trackPixelCustom("QuizComplete");
    expect(fbqMock).toHaveBeenCalledWith("trackCustom", "QuizComplete");
  });
});
