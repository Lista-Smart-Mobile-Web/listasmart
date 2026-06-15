"use client";

import { useState } from "react";

type FormState = {
  storeName: string;
  city: string;
  contactName: string;
  phone: string;
  email: string;
  storeCount: string;
  message: string;
};

type Status = "idle" | "loading" | "success" | "error";

const INITIAL: FormState = {
  storeName: "",
  city: "",
  contactName: "",
  phone: "",
  email: "",
  storeCount: "",
  message: "",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    // Basic client-side validation
    if (!form.storeName || !form.city || !form.contactName || !form.phone || !form.email || !form.storeCount) {
      setErrorMsg("Preencha todos os campos obrigatórios.");
      setStatus("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrorMsg("E-mail inválido.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Erro ${res.status}`);
      }

      setStatus("success");
      setForm(INITIAL);
    } catch (err: any) {
      setErrorMsg(
        err.message === "Failed to fetch"
          ? "Não foi possível conectar ao servidor. Tente novamente mais tarde."
          : err.message ?? "Erro inesperado. Tente novamente."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="contact-form reveal" id="contact">
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ fontSize: "3rem" }}>✅</div>
          <div className="cf-title" style={{ color: "var(--green-lt, #4ade80)" }}>
            Mensagem enviada!
          </div>
          <p style={{ color: "var(--text-secondary, #9ca3af)", maxWidth: 420 }}>
            Obrigado pelo interesse. Nossa equipe entrará em contato em até{" "}
            <strong>1 dia útil</strong>.
          </p>
          <button
            className="cf-submit"
            style={{ marginTop: "1rem", width: "auto", padding: "0.75rem 2rem" }}
            onClick={() => setStatus("idle")}
          >
            Enviar outra mensagem
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-form reveal" id="contact" style={{ transitionDelay: ".1s" }}>
      <div className="cf-title">Seja um supermercado parceiro</div>
      <div className="cf-sub">
        Preencha o formulário e nossa equipe entrará em contato em até 1 dia útil.
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="cf-grid">
          <div className="cf-field">
            <label className="cf-label">
              Nome do estabelecimento <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="cf-input"
              type="text"
              placeholder="Ex: Supermercado Bom Preço"
              value={form.storeName}
              onChange={(e) => update("storeName", e.target.value)}
              required
            />
          </div>

          <div className="cf-field">
            <label className="cf-label">
              Cidade / Estado <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="cf-input"
              type="text"
              placeholder="Ex: São Paulo, SP"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              required
            />
          </div>

          <div className="cf-field">
            <label className="cf-label">
              Nome do responsável <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="cf-input"
              type="text"
              placeholder="Seu nome completo"
              value={form.contactName}
              onChange={(e) => update("contactName", e.target.value)}
              required
            />
          </div>

          <div className="cf-field">
            <label className="cf-label">
              Telefone / WhatsApp <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="cf-input"
              type="tel"
              placeholder="(11) 99999-9999"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
          </div>

          <div className="cf-field full">
            <label className="cf-label">
              E-mail corporativo <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="cf-input"
              type="email"
              placeholder="contato@supermercado.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>

          <div className="cf-field full">
            <label className="cf-label">
              Número de lojas <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              className="cf-select"
              value={form.storeCount}
              onChange={(e) => update("storeCount", e.target.value)}
              required
            >
              <option value="" disabled>
                Selecione
              </option>
              <option>1 loja</option>
              <option>2 a 5 lojas</option>
              <option>6 a 20 lojas</option>
              <option>Mais de 20 lojas</option>
            </select>
          </div>

          <div className="cf-field full">
            <label className="cf-label">Mensagem (opcional)</label>
            <textarea
              className="cf-textarea"
              placeholder="Conte um pouco sobre o seu negócio ou suas principais dúvidas..."
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
            />
          </div>
        </div>

        {status === "error" && errorMsg && (
          <p
            style={{
              color: "#ef4444",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          className="cf-submit"
          disabled={status === "loading"}
        >
          {status === "loading"
            ? "Enviando..."
            : "Enviar mensagem — Quero ser parceiro"}
        </button>
      </form>
    </div>
  );
}
