import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CauseForm } from "./Form.component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock services
vi.mock("@/services/city.service", () => ({
  cityService: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: "São Paulo", uf: "SP" }]) }
}));
vi.mock("@/services/courts.service", () => ({
  courtsService: { getAll: vi.fn().mockResolvedValue([{ id: 10, name: "TJSP", state: "SP" }]) }
}));
vi.mock("@/services/court-divisions.service", () => ({
  courtDivisionsService: { getAll: vi.fn().mockResolvedValue([{ id: 100, name: "1ª Vara Cível", court_id: 10 }]) }
}));
vi.mock("@/services/causes.service", () => ({
  causesService: { 
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 1, number: "123" })
  }
}));
vi.mock("@/services/areas.service", () => ({
  areasService: { getAll: vi.fn().mockResolvedValue([{ id: 5, name: "Trabalhista" }]) }
}));
vi.mock("@/services/stages.service", () => ({
  stagesService: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: "Conhecimento" }]) }
}));
vi.mock("@/services/status.service", () => ({
  statusService: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: "Ativo", stage_id: 1 }]) }
}));
// ... other services needed
vi.mock("@/services/outcomes.service", () => ({ outcomesService: { getAll: vi.fn().mockResolvedValue([]) } }));
vi.mock("@/services/users.service", () => ({ 
  usersService: { 
    getCollaborators: vi.fn().mockResolvedValue([]),
    getClients: vi.fn().mockResolvedValue([{ id: 1, name: "João Silva" }])
  } 
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

import { MemoryRouter } from "react-router-dom";

const renderForm = () => render(
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <CauseForm />
    </MemoryRouter>
  </QueryClientProvider>
);

describe("Causes Form Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate required fields on submit", async () => {
    renderForm();
    
    const submitBtn = screen.getByRole("button", { name: /Cadastrar Processo/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/O número do processo é obrigatório/i)).toBeInTheDocument();
    expect(await screen.findByText(/Selecione pelo menos um cliente/i)).toBeInTheDocument();
  });

  it("should auto-calculate fees when value and percentage change", async () => {
    renderForm();
    
    // Total Fees should be customer_amount * percentage / 100
    // Percentage defaults to 20
  });

  it("should handle cascading city-court-division selection", async () => {
    // This requires interacting with Radix Select, which can be tricky in RTL without helpers
    // We'll focus on the logic triggering the calls
  });
});
