/// <reference lib="dom" />
import { describe, test, expect,afterEach,mock } from "bun:test";
import React from "react";
import { render, screen ,cleanup,fireEvent} from "@testing-library/react";
import SearchBar from "./SearchBar";


afterEach(() => {
    cleanup();
  });


  describe("SearchBar", () => {
    test("renders correctly with placeholder", () => {
      render(<SearchBar />);
      const inputElement = screen.getByPlaceholderText("Search...");
      expect(inputElement).toBeTruthy();
    });
  
    test("updates search query on input change", () => {
        render(<SearchBar />);
        const inputElement = screen.getByPlaceholderText("Search...") as HTMLInputElement;
        fireEvent.change(inputElement, { target: { value: "test query" } });
        expect(inputElement.value).toBe("test query");
      });
    
      test("calls handleSearch on input click", () => {
        const originalLog = console.log;
        const consoleSpy = mock(() => {});
        console.log = consoleSpy;
    
        render(<SearchBar />);
        const inputElement = screen.getByPlaceholderText("Search...") as HTMLInputElement;
        fireEvent.click(inputElement);
        expect(consoleSpy).toHaveBeenCalledWith("Search query:", "");
    
        fireEvent.change(inputElement, { target: { value: "test query" } });
        fireEvent.click(inputElement);
        expect(consoleSpy).toHaveBeenCalledWith("Search query:", "test query");
    
        console.log = originalLog;
      });
    });