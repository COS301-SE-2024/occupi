import { test, expect ,afterEach} from "bun:test";
import { render,cleanup } from "@testing-library/react";
import FeedBackModal from "./FeedBackModal"

afterEach(() => {
    cleanup();
  });


test("FeedBackModal renders correctly", () => {
    const { getByText } = render(
      <FeedBackModal
        title="Test Title"
        message="Test Message"
        isOpen={true}
        onClose={() => {}}
      />
    );
    expect(getByText("Test Title")).toBeDefined();
    expect(getByText("Test Message")).toBeDefined();
  });

  test("FeedBackModal buttons render correctly", () => {
    const { getByText } = render(
      <FeedBackModal
        title="Test Title"
        message="Test Message"
        closeButtonLabel="Close"
        actionButtonLabel="Action"
        isOpen={true}
        onClose={() => {}}
        onAction={() => {}}
      />
    );
    expect(getByText("Close")).toBeDefined();
    expect(getByText("Action")).toBeDefined();
  });