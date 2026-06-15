import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OutcomesForm } from "./Form.component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock services
vi.mock("@/services/outcomes.service", () => ({
  outcomesService: { 
    getAll: vi.fn().mockResolvedValue([{ id: 1, name: "Procedente", description: "Vencemos", is_active: true }]),
    create: vi.fn().mockResolvedValue({ id: 2, name: "Acordo" }),
    update: vi.fn(),
    delete: vi.fn()
  }
}));
vi.mock("@/services/status.service", () => ({
  statusService: { getAll: vi.fn().mockResolvedValue([{ id: 10, name: "Concluído" }]) }
}));

const queryClient = new QueryClient();

const renderForm = () => render(
  <QueryClientProvider client={queryClient}>
    <OutcomesForm />
  </QueryClientProvider>
);

describe("Outcomes Form Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show validation error when name is empty", async () => {
    renderForm();
    
    const submitBtn = screen.getByRole("button", { name: /Salvar/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Este campo é obrigatório/i)).toBeInTheDocument();
  });

  it("should list existing outcomes", async () => {
    renderForm();
    
    expect(await screen.findByText("Procedente")).toBeInTheDocument();
    expect(screen.getByText("Vencemos")).toBeInTheDocument();
  });
});
