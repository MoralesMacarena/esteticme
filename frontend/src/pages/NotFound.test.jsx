import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NotFound from "./components/NotFound";

describe("Componente NotFound 404", () => {
  test("renderiza correctamente el mensaje de error y el enlace de vuelta", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>,
    );

    // Buscamos el texto principal del error
    const titulo = screen.getByText(/Página fuera de cobertura/i);
    expect(titulo).toBeInTheDocument();

    // Buscamos que el botón de volver exista
    const botonVolver = screen.getByRole("link", { name: /volver al inicio/i });
    expect(botonVolver).toBeInTheDocument();
    expect(botonVolver).toHaveAttribute("href", "/");
  });
});
